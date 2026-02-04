extends Node

## player_input.gd
## Local player controller for click-to-move and WASD movement.
## Uses client-side pathfinding for preview, but all movement is server-authoritative.

# External dependencies (injected via set_world/set_network_client)
var _world: Node = null
var _network_client: Node = null
# Local player node (set by Player when is_local); used for interact and facing
var _local_player: Node = null

# Authoritative state (only updated via apply_server_state)
var _current_tile: Vector2i = Vector2i.ZERO
var _has_current_tile: bool = false

# Client-side preview path (computed locally, shown visually, reconciled to server state)
var _path_preview: Array[Vector2i] = []

# Single-slot click buffer: used when click input cannot be applied immediately
# (e.g., world/network not ready, path in progress, or path replacement).
# Only the latest click is retained (overwrite behavior).
# Value of (-1, -1) indicates no pending click.
var _pending_click_target: Vector2i = Vector2i(-1, -1)

# ============================================================================
# WASD / Arrow Hold State
# ============================================================================

# Current held direction from keyboard actions (ui_up/down/left/right)
var _held_move_direction: Vector2i = Vector2i.ZERO

# Time until the next auto-step while the key is held
var _held_move_timer: float = 0.0

# Tuning constants: initial delay before auto-repeat and repeat interval.
# Interval should roughly match the 0.4s server tick or slightly faster.
const HELD_MOVE_INITIAL_DELAY := 0.22
const HELD_MOVE_REPEAT_INTERVAL := 0.40

# ============================================================================
# Keyboard movement lock (Pokémon-style: one step at a time)
# ============================================================================

# True while we are waiting for the previous keyboard step to complete.
var _kbd_step_locked: bool = false

# Last direction sent via keyboard, for optional debugging / behavior tweaks.
var _last_kbd_direction: Vector2i = Vector2i.ZERO

# Timestamp when the lock was set (for timeout detection)
var _kbd_lock_timestamp: float = 0.0

# Timeout duration: if lock is held longer than this, auto-unlock (safety for blocked moves)
# Should be slightly longer than server tick (0.4s) + network latency buffer
const KBD_LOCK_TIMEOUT := 0.8

# ============================================================================
# Dependency Injection
# ============================================================================

## Set the world node (provides pathfinding and tile queries)
## Validates that world has required methods: world_to_tile, is_tile_blocked, find_path
func set_world(world: Node) -> void:
	if world == null:
		_world = null
		push_error("[PlayerInput] set_world(null)")
		return
	
	# Validate world has required methods
	var has_world_to_tile: bool = world.has_method("world_to_tile")
	var has_is_tile_blocked: bool = world.has_method("is_tile_blocked")
	var has_find_path: bool = world.has_method("find_path")
	
	if not has_world_to_tile or not has_is_tile_blocked or not has_find_path:
		var node_name: String = str(world.name) if world != null else "null"
		var node_class: String = str(world.get_class()) if world != null else "null"
		var node_path: String = ""
		if world != null and world.is_inside_tree():
			node_path = str(world.get_path())
		else:
			node_path = "<not in tree>"
		
		push_error("[PlayerInput] set_world received WRONG node. name=%s class=%s path=%s (has world_to_tile=%s, is_tile_blocked=%s, find_path=%s)" % [
			node_name, node_class, node_path, has_world_to_tile, has_is_tile_blocked, has_find_path
		])
		_world = null
		return
	
	_world = world
	print("[PlayerInput] World bound: ", str(world.get_path()) if world.is_inside_tree() else "<not in tree>")

## Set the network client (handles sending movement intents to server)
func set_network_client(client: Node) -> void:
	_network_client = client

# ============================================================================
# Readiness Gate
# ============================================================================

## Check if we can currently accept click-to-move input.
## All click-to-move logic must use this gate.
func _can_accept_click() -> bool:
	# VERIFICATION LOG: Track exactly which condition fails
	var check_world_valid: bool = (_world != null and is_instance_valid(_world))
	var check_world_initialized: bool = false
	var check_network_client_valid: bool = (_network_client != null and is_instance_valid(_network_client))
	var check_world_ready: bool = false
	var check_has_current_tile: bool = _has_current_tile
	
	if check_world_valid:
		check_world_initialized = _world.is_initialized
	if check_network_client_valid:
		check_world_ready = _network_client.world_ready
	
	var all_checks_pass: bool = (
		check_world_valid and
		check_world_initialized and
		check_network_client_valid and
		check_world_ready and
		check_has_current_tile
	)
	
	
	# Actual checks (short-circuit for performance)
	if not check_world_valid:
		return false
	if not check_world_initialized:
		return false
	if not check_network_client_valid:
		return false
	if not check_world_ready:
		return false
	if not check_has_current_tile:
		return false
	return true

## Check if we have a buffered click waiting to be processed
## Returns true if _pending_click_target contains a valid click destination
func _has_pending_click() -> bool:
	return _pending_click_target.x != -1

# ============================================================================
# Server State Application (Authoritative)
# ============================================================================

## Apply authoritative server state update.
## This is the ONLY place where _current_tile is updated.
## Called by external code when server updates player position.
func apply_server_state(tile: Vector2i, _facing: Vector2i) -> void:
	var tile_changed := (_current_tile != tile)
	
	# Server owns the truth for position
	_current_tile = tile
	_has_current_tile = true

	# Warn if we receive authoritative tile before world_ready becomes true
	# This is informational only - should not block gameplay
	if not has_meta("_warned_early_tile"):
		if _network_client != null and is_instance_valid(_network_client) and not _network_client.world_ready:
			push_warning("[PLAYER_INPUT][WARN] Received authoritative tile before world_ready became true")
			set_meta("_warned_early_tile", true)

	# Path preview is now managed by server MoveQueue updates via network_client.
	# No need to reconcile local path preview anymore.

	# If tile actually changed, unlock keyboard movement (Pokémon-style: step completed)
	if tile_changed:
		on_local_step_completed()

	# Process buffered click if ready (single-slot buffer ensures only latest click is retained)
	if _has_pending_click() and _can_accept_click():
		var dest := _pending_click_target
		_pending_click_target = Vector2i(-1, -1)  # Clear buffer after processing
		_start_click_move(dest)

## Called when a local player step completes (server confirmed tile change)
## Unlocks keyboard movement to allow the next step
func on_local_step_completed() -> void:
	# Unlock keyboard movement
	_kbd_step_locked = false
	_kbd_lock_timestamp = 0.0  # Reset timestamp

	# If the player is *still holding* a movement key in the same direction,
	# the existing hold logic can trigger another step, but it still must go
	# through _send_step_intent(..., true), which will re-lock.
	# No extra logic here unless you want to auto-trigger the next step immediately.

# ============================================================================
# Input Handling
# ============================================================================

## Called by GameHUD when ui_interact is pressed (so HUD consumes it before focused buttons).
## Only the local player's PlayerInput is in group "local_player_input".
func request_interact() -> void:
	if _local_player != null:
		_request_interaction_in_front()

## Handle unhandled input events (UI actions and mouse clicks)
func _unhandled_input(event: InputEvent) -> void:
	# ----------------------------------------------------------------------
	# Keyboard movement (ui_up, ui_down, ui_left, ui_right)
	# One physical press = one step. No duplicates on release/echo.
	# ----------------------------------------------------------------------
	if event is InputEventKey:
		var key_event := event as InputEventKey

		# Only handle the initial, non-echo press
		if not key_event.pressed or key_event.echo:
			# We still want mouse handling below, so do NOT `return` yet.
			pass
		else:
			var direction := Vector2i.ZERO

			if key_event.is_action_pressed("ui_up"):
				direction = Vector2i(0, -1)
			elif key_event.is_action_pressed("ui_down"):
				direction = Vector2i(0, 1)
			elif key_event.is_action_pressed("ui_left"):
				direction = Vector2i(-1, 0)
			elif key_event.is_action_pressed("ui_right"):
				direction = Vector2i(1, 0)

			if direction != Vector2i.ZERO:
				# One tile step for this press
				_send_step_intent(direction, true)

				# Start / update held movement state for auto-repeat
				_held_move_direction = direction
				_held_move_timer = HELD_MOVE_INITIAL_DELAY

		# When the relevant movement key is released, stop held movement
		if not key_event.pressed:
			if key_event.is_action_released("ui_up") and _held_move_direction == Vector2i(0, -1):
				_held_move_direction = Vector2i.ZERO
			elif key_event.is_action_released("ui_down") and _held_move_direction == Vector2i(0, 1):
				_held_move_direction = Vector2i.ZERO
			elif key_event.is_action_released("ui_left") and _held_move_direction == Vector2i(-1, 0):
				_held_move_direction = Vector2i.ZERO
			elif key_event.is_action_released("ui_right") and _held_move_direction == Vector2i(1, 0):
				_held_move_direction = Vector2i.ZERO

	# ----------------------------------------------------------------------
	# Mouse left button click (existing click-to-move logic)
	# ----------------------------------------------------------------------
	if event is InputEventMouseButton:
		if event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
			var clicked_tile := _mouse_to_tile(event)
			if clicked_tile != Vector2i(-1, -1):
				_on_click_world(clicked_tile)

# ============================================================================
# Auto-Repeat for Held Movement Keys
# ============================================================================

## Process auto-repeat movement while movement keys are held
func _process(delta: float) -> void:
	# Auto-repeat movement while a movement key is held
	if _held_move_direction != Vector2i.ZERO:
		_held_move_timer -= delta
		if _held_move_timer <= 0.0:
			# Reset timer for next repeat
			_held_move_timer += HELD_MOVE_REPEAT_INTERVAL

			# Note: WASD movement clears the server's MoveQueue automatically (server-side logic).
			# Path preview will be updated when the server clears the queue.

			_send_step_intent(_held_move_direction, true)
	
	# Timeout safety: auto-unlock if lock has been held too long (blocked move fallback)
	if _kbd_step_locked and _kbd_lock_timestamp > 0.0:
		var current_time = Time.get_ticks_msec() / 1000.0
		var lock_duration = current_time - _kbd_lock_timestamp
		if lock_duration >= KBD_LOCK_TIMEOUT:
			# Lock has been held too long - likely a blocked move or network issue
			# Unlock to prevent permanent stuck state
			_kbd_step_locked = false
			_kbd_lock_timestamp = 0.0

# ============================================================================
# Interact (ui_interact) — front-tile stub for NPC/quest
# ============================================================================

## Stub: compute tile in front of player and optionally notify TS bridge.
## Uses _current_tile when set (server state), else _local_player.tile_pos; facing from Player.
## Will be wired to Spacetime reducer later.
func _request_interaction_in_front() -> void:
	var player = get_parent()
	if not "facing" in player:
		print("[INTERACT_DEBUG] PlayerInput: no 'facing' on player, abort")
		return
	# Use authoritative tile when we have server state, else fall back to Player's tile_pos
	var tile: Vector2i = _current_tile if _has_current_tile else _local_player.tile_pos
	var facing: Vector2i = player.facing
	var front_tile: Vector2i = tile + facing
	print("[INTERACT_DEBUG] PlayerInput: tile=%s facing=%s front_tile=%s (has_current_tile=%s)" % [tile, facing, front_tile, _has_current_tile])
	# Call reducer via TS bridge: native TSBridge singleton (desktop) or SNBridge (web)
	if Engine.has_singleton("TSBridge"):
		var bridge = Engine.get_singleton("TSBridge")
		if bridge != null and bridge.has_method("request_interaction"):
			bridge.request_interaction(front_tile.x, front_tile.y)
			print("[INTERACT_DEBUG] PlayerInput: called TSBridge.request_interaction(%d, %d)" % [front_tile.x, front_tile.y])
		else:
			print("[INTERACT_DEBUG] PlayerInput: TSBridge exists but request_interaction missing")
	elif OS.has_feature("web"):
		var ok = JavaScriptBridge.eval("typeof window.SNBridge?.request_interaction === 'function'", true)
		print("[INTERACT_DEBUG] PlayerInput: web export, SNBridge.request_interaction exists=%s" % ok)
		if ok:
			JavaScriptBridge.eval("window.SNBridge.request_interaction(%d, %d);" % [front_tile.x, front_tile.y])
			print("[INTERACT_DEBUG] PlayerInput: called SNBridge.request_interaction(%d, %d)" % [front_tile.x, front_tile.y])
		else:
			print("[INTERACT_DEBUG] PlayerInput: SNBridge.request_interaction not available")
	else:
		print("[INTERACT_DEBUG] PlayerInput: no TSBridge and not web, cannot call reducer")

# ============================================================================
# Mouse-to-World/Tile Conversion
# ============================================================================

## Convert mouse event screen position to world coordinates
func _mouse_to_world(_event: InputEventMouseButton) -> Vector2:
	var camera := get_viewport().get_camera_2d()
	if camera == null:
		push_warning("[PLAYER_INPUT][ERROR] _mouse_to_world: Camera2D is null! Returning Vector2.ZERO (this will convert to tile 0,0)")
		return Vector2.ZERO

	var world_pos := camera.get_global_mouse_position()
	return world_pos

## Convert mouse event to tile coordinates
func _mouse_to_tile(event: InputEventMouseButton) -> Vector2i:
	if _world == null or not is_instance_valid(_world):
		return Vector2i(-1, -1)

	var world_pos := _mouse_to_world(event)
	var tile: Vector2i = _world.world_to_tile(world_pos)
	return tile

# ============================================================================
# Click-to-Move Logic
# ============================================================================

## If the clicked tile is blocked, try to adjust it to the nearest reachable
## neighboring tile based on local collision data. This is a *hint* to reduce
## server pathfinding work; the server remains authoritative and still runs
## full pathfinding. Not a security boundary.
func _adjust_click_destination_for_blockers(dest_tile: Vector2i) -> Vector2i:
	if _world == null:
		return dest_tile

	if not _world.is_in_bounds(dest_tile):
		return dest_tile

	if not _world.is_tile_blocked(dest_tile):
		return dest_tile

	if not _has_current_tile:
		return dest_tile

	var origin := _current_tile
	var best_tile := dest_tile
	var best_dist2 := INF

	var offsets := [
		Vector2i(0, -1),
		Vector2i(0, 1),
		Vector2i(-1, 0),
		Vector2i(1, 0),
		Vector2i(-1, -1),
		Vector2i(1, -1),
		Vector2i(-1, 1),
		Vector2i(1, 1),
	]

	for off in offsets:
		var candidate: Vector2i = dest_tile + off
		if not _world.is_in_bounds(candidate):
			continue
		if _world.is_tile_blocked(candidate):
			continue

		var delta: Vector2i = candidate - origin
		var dist2: int = delta.x * delta.x + delta.y * delta.y
		if dist2 < best_dist2:
			best_dist2 = dist2
			best_tile = candidate

	if best_dist2 == INF:
		return dest_tile

	print("[INPUT] Adjusted blocked click ", dest_tile, " -> nearest neighbor ", best_tile)
	return best_tile

## Entry point for click-to-move: validates tile and either starts move or buffers it.
## Buffers click in _pending_click_target if it cannot be applied immediately
## (world/network not ready, etc.). Only the latest click is retained.
## Blocked clicks are locally adjusted to a nearby reachable tile when possible
## to lighten server pathfinding; server stays authoritative.
func _on_click_world(dest_tile: Vector2i) -> void:
	if dest_tile == Vector2i.ZERO:
		push_warning("[PLAYER_INPUT][WARN] _on_click_world received dest_tile=(0,0)! This might indicate a camera or mouse conversion issue.")

	if _world == null:
		return

	if not _world.is_in_bounds(dest_tile):
		return

	var adjusted_dest := _adjust_click_destination_for_blockers(dest_tile)

	if not _can_accept_click():
		_pending_click_target = adjusted_dest
		print("[INPUT] Buffered click-to-move until ready: ", adjusted_dest)
		return

	_start_click_move(adjusted_dest)

## Compute path preview and send move intent to server
## Click-to-move is server-authoritative with nearest-reachable fallback:
## The client always sends the requested destination tile to the server, even if blocked.
## The server's pathfinding will automatically path to the nearest reachable tile
## if the requested destination is blocked or otherwise unreachable (OSRS-style behavior).
func _start_click_move(dest_tile: Vector2i) -> void:
	if _world == null:
		return
	
	# Validate destination tile - reject invalid coordinates
	# Check for sentinel values like (-1, -1) or extreme values like (-999999, -999999)
	if dest_tile.x == -1 and dest_tile.y == -1:
		print("[INPUT] Ignoring invalid pending click target: (-1, -1)")
		return
	
	# Check for extreme values that indicate invalid/uninitialized coordinates
	# Use a reasonable threshold (e.g., 10000 tiles in any direction)
	const MAX_VALID_TILE = 10000
	if abs(dest_tile.x) > MAX_VALID_TILE or abs(dest_tile.y) > MAX_VALID_TILE:
		push_warning("[INPUT] Rejecting invalid click destination: %s (extreme coordinate)" % dest_tile)
		return

	# Send destination to server. Server will compute path and store in MoveQueue.
	# If destination is blocked, server will path to nearest reachable tile instead.
	# Path preview will be updated automatically when server's MoveQueue changes.
	if _network_client != null:
		_network_client.send_move_to_tile(dest_tile)
		print("[INPUT] Sent move-to-tile intent: ", dest_tile)

## Reconcile path preview with authoritative server state
## NOTE: No longer needed - path preview is now managed by server MoveQueue updates.
## This method is kept for potential future use but is not called.
# func _reconcile_path_preview() -> void:
#	pass

# ============================================================================
# WASD Step Movement
# ============================================================================

## Send a single-step movement intent to server (WASD/arrow keys)
func _send_step_intent(direction: Vector2i, from_keyboard: bool = false) -> void:
	if _network_client == null:
		return
	if not _network_client.world_ready:
		return
	if direction == Vector2i.ZERO:
		return

	# If this was requested by keyboard and a previous keyboard step is still in flight,
	# do NOT enqueue another. Pokémon-style: one step at a time.
	if from_keyboard and _kbd_step_locked:
		return

	_network_client.send_move_step(direction)

	if from_keyboard:
		_kbd_step_locked = true
		_last_kbd_direction = direction
		_kbd_lock_timestamp = Time.get_ticks_msec() / 1000.0  # Current time in seconds
