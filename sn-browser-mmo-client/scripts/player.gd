class_name Player
extends Node2D

# Unified player script for both local and remote players
# Behavior is controlled by is_local flag

var player_id: int = -1
var is_local: bool = false
var tile_pos: Vector2i = Vector2i.ZERO
var facing: Vector2i = Vector2i.DOWN
var world: Node = null
var display_name: String = "Player"  # Display name for chat and UI

# Sprite visual offset (adjusts sprite position relative to tile center)
const SPRITE_OFFSET: Vector2 = Vector2(8, 8)  # Offset: 8px right, 8px down

# Movement smoothing/interpolation
# MOVE_DURATION: Time in seconds for a single tile move (OSRS-style smoothing)
const MOVE_DURATION := 0.4  # seconds

var previous_tile_pos: Vector2i = Vector2i.ZERO
var from_world_pos: Vector2 = Vector2.ZERO
var to_world_pos: Vector2 = Vector2.ZERO
var move_elapsed: float = 0.0
var is_moving: bool = false

# Has this player ever been placed in the world yet?
var _has_world_position: bool = false

# Distance threshold to treat as a teleport instead of a smooth step
# 32 pixels = 2 tiles if TILE_SIZE=16
@export var TELEPORT_THRESHOLD_PIXELS: float = 32.0

# Note: Removed _pending_move_count - animation is now driven only by actual movement
# and queued moves, not by pending server acknowledgments. This prevents stuck animation
# when movement is blocked (server rejects move but _pending_move_count never decrements).

# Client-side prediction (optional for MVP, only for local player)
var enable_prediction: bool = true
var predicted_tile_pos: Vector2i = Vector2i.ZERO

# References
var network_client: Node = null
var player_input: Node = null
var animated_sprite: AnimatedSprite2D = null

func _ready():
	# Get reference to AnimatedSprite2D
	animated_sprite = $AnimatedSprite2D
	if animated_sprite == null:
		push_error("AnimatedSprite2D not found in Player scene!")
	
	# Initialize previous position for movement detection
	previous_tile_pos = tile_pos
	predicted_tile_pos = tile_pos
	
	# Get reference to player input node (exists for both local and remote)
	player_input = $PlayerInput
	
	# CRITICAL: If world was already set before _ready() completed, bind it now
	# This ensures player_input gets world reference even if set_world() was called early
	if world != null and player_input != null:
		if player_input.has_method("set_world"):
			print("[PLAYER] _ready() - Binding existing world to player_input (world was set before _ready)")
			player_input.set_world(world)
		elif "_world" in player_input:
			player_input._world = world
			print("[PLAYER] _ready() - Bound existing world to player_input via direct property")
	
	# Get references to network client (only for local player)
	if is_local:
		network_client = get_node_or_null("/root/network_client")
		
		# Inject network_client into player_input
		# VERIFICATION LOG: Track network_client injection in player._ready()
		if player_input != null and network_client != null:
			if player_input.has_method("set_network_client"):
				var client_id := ""
				var client_world_ready: bool = false
				if network_client.get_instance_id() != 0:
					client_id = str(network_client.get_instance_id())
				if "world_ready" in network_client:
					client_world_ready = network_client.world_ready
				
				player_input.set_network_client(network_client)
		
		# Connect input signals (only for local player)
		if player_input:
			player_input.move_intent.connect(_on_move_intent)
	
	# Initialize movement interpolation state
	is_moving = false
	move_elapsed = 0.0
	from_world_pos = Vector2.ZERO
	to_world_pos = Vector2.ZERO
	
	# Initialize animation
	_play_anim(false)

func set_world(_world: Node) -> void:
	print("[PLAYER] set_world() ENTRY - is_local: ", is_local, ", world node: ", _world != null)
	world = _world
	# Update position immediately when world is set
	# Use ZoneManager for tile_to_world conversion
	var zone_manager = get_node_or_null("/root/ZoneManager")
	if zone_manager != null and zone_manager.has_method("tile_to_world"):
		global_position = zone_manager.tile_to_world(tile_pos) + SPRITE_OFFSET
	elif world != null and world.has_method("tile_to_world"):
		# Fallback to world's tile_to_world if ZoneManager not available
		global_position = world.tile_to_world(tile_pos) + SPRITE_OFFSET
	
	# CRITICAL: Also bind world to player_input child (for click-to-move pathfinding)
	# This ensures player_input has world reference immediately, not deferred
	if player_input != null:
		if player_input.has_method("set_world"):
			player_input.set_world(_world)
		else:
			# Script might not be ready yet - try direct property access as fallback
			if "_world" in player_input:
				player_input._world = _world
			# If still not ready, the deferred mechanism in main.gd will handle it
	elif is_local:
		# PlayerInput not found - try to find it and bind
		var input_node = get_node_or_null("PlayerInput")
		if input_node != null and input_node.has_method("set_world"):
			input_node.set_world(_world)

## Deferred helper to apply server state to player_input when script is ready
func _deferred_apply_server_state_to_input(tile: Vector2i, facing: Vector2i) -> void:
	if not is_local:
		return
	
	if player_input == null or not is_instance_valid(player_input):
		push_warning("[PLAYER] player_input is null or invalid in deferred call")
		return
	
	var script = player_input.get_script()
	if script == null:
		push_error("[PLAYER] player_input node has NO script attached! Node path: %s" % player_input.get_path())
		return
	
	# Try has_method check first
	if player_input.has_method("apply_server_state"):
		player_input.apply_server_state(tile, facing)
		return
	
	# has_method returned false - try calling directly anyway
	# Sometimes has_method() can return false even if the method exists
	# (e.g., if script is still parsing or has just loaded)
	# Directly call the method - if script is loaded, this will work
	player_input.apply_server_state(tile, facing)

func set_is_local(value: bool) -> void:
	is_local = value
	# Ensure player (and its blue outline) renders above PathPreview (z_index 5)
	if is_local:
		z_index = 100  # Local player above everything
		# Setup input handling for local player
		if network_client == null:
			network_client = get_node_or_null("/root/network_client")
		# Inject network_client into player_input
		# VERIFICATION LOG: Track network_client injection in player.set_is_local()
		if player_input != null and network_client != null:
			if player_input.has_method("set_network_client"):
				var client_id := ""
				var client_world_ready: bool = false
				if network_client.get_instance_id() != 0:
					client_id = str(network_client.get_instance_id())
				if "world_ready" in network_client:
					client_world_ready = network_client.world_ready
				
				player_input.set_network_client(network_client)
		# Connect input signals if not already connected
		if player_input and not player_input.move_intent.is_connected(_on_move_intent):
			player_input.move_intent.connect(_on_move_intent)
		# Set local player reference in player_input for buffered-click logic
		if player_input != null:
			player_input._local_player = self
			player_input.add_to_group("local_player_input")
	else:
		z_index = 10  # Remote players also above PathPreview
		if player_input != null:
			player_input.remove_from_group("local_player_input")

# Get current tile position (used by player_input for pathfinding)
func get_tile_pos() -> Vector2i:
	return tile_pos

# Set the display name for this player (used in chat and UI)
func set_display_name(name: String) -> void:
	display_name = name
	print("[PLAYER] Display name set to: %s", display_name)

# Called when player sends movement intent (local player only)
func _on_move_intent(direction: Vector2i) -> void:
	if not is_local:
		return
	
	# Rule: Client sends only intents, never final positions
	# DO NOT update position here - wait for server confirmation
	# Server is authoritative - all position updates come from apply_state()
	if network_client:
		network_client.send_move_step(direction)
	# That's it - no visual updates, no prediction, no movement

# Apply state from server (works for both local and remote players)
# THIS IS THE ONLY PLACE THAT UPDATES tile_pos AND global_position
func apply_state(new_tile: Vector2i, new_facing: Vector2i, _moving: bool = false) -> void:
	var position_changed = (tile_pos != new_tile)
	
	# Update authoritative state
	previous_tile_pos = tile_pos
	tile_pos = new_tile
	facing = new_facing
	
	# Clear any prediction state (local player only)
	if is_local and enable_prediction:
		predicted_tile_pos = tile_pos
	
	# Update visual position - ONLY HERE
	# Use ZoneManager for tile_to_world conversion (removes direct TileMap dependency)
	var zone_manager = get_node_or_null("/root/ZoneManager")
	var new_world_pos: Vector2
	if zone_manager != null and zone_manager.has_method("tile_to_world"):
		new_world_pos = zone_manager.tile_to_world(tile_pos) + SPRITE_OFFSET
	elif world != null and world.has_method("tile_to_world"):
		# Fallback to world's tile_to_world if ZoneManager not available
		new_world_pos = world.tile_to_world(tile_pos) + SPRITE_OFFSET
	else:
		# Final fallback: use default tile size
		new_world_pos = Vector2(tile_pos.x * 16, tile_pos.y * 16) + SPRITE_OFFSET
		push_warning("[PLAYER] apply_state: No ZoneManager or World available for tile_to_world conversion")
	
	if zone_manager != null or world != null:
		
		if position_changed:
			# Position changed - start time-based interpolation over MOVE_DURATION
			# This ensures a single tile move visually takes ~0.4s to match server tick
			from_world_pos = global_position
			to_world_pos = new_world_pos
			move_elapsed = 0.0
			is_moving = true
		else:
			# Tile did not change. This can happen for:
			# - facing-only updates
			# - duplicate polls / repeated state
			# - a blocked move attempt (tile remains same)
			#
			# IMPORTANT: Do NOT snap or cancel interpolation here.
			# If we are currently interpolating, let it finish.
			#
			# If we are NOT moving, ensure our target positions are aligned to the tile.
			if not is_moving:
				global_position = new_world_pos
				from_world_pos = new_world_pos
				to_world_pos = new_world_pos
				move_elapsed = 0.0
			# If is_moving == true, do nothing to position/interp state.
	
	# Note: Animation is now driven by _process() based on is_moving and queued moves
	# This ensures animation stops correctly when movement is blocked

# Apply server state from network_client (unified for local and remote players)
# This ensures both local and remote players use identical interpolation logic
func apply_server_state(new_tile: Vector2i, new_facing: Vector2i) -> void:
	var position_changed := (tile_pos != new_tile)

	tile_pos = new_tile
	facing = new_facing

	# Use ZoneManager for tile_to_world conversion (removes direct TileMap dependency)
	var zone_manager = get_node_or_null("/root/ZoneManager")
	var target_world_pos: Vector2
	if zone_manager != null and zone_manager.has_method("tile_to_world"):
		target_world_pos = zone_manager.tile_to_world(tile_pos) + SPRITE_OFFSET
	elif world != null and world.has_method("tile_to_world"):
		# Fallback to world's tile_to_world if ZoneManager not available
		target_world_pos = world.tile_to_world(tile_pos) + SPRITE_OFFSET
	else:
		# Final fallback: use default tile size
		target_world_pos = Vector2(tile_pos.x * 16, tile_pos.y * 16) + SPRITE_OFFSET
		push_warning("[PLAYER] apply_server_state: No ZoneManager or World available for tile_to_world conversion")
		return
	
	if zone_manager == null and world == null:
		return

	# 1) FIRST UPDATE: snap directly to the true tile (no interpolation)
	if not _has_world_position:
		global_position = target_world_pos
		from_world_pos = target_world_pos
		to_world_pos = target_world_pos
		move_elapsed = 0.0
		is_moving = false
		_has_world_position = true
		
		# Update player_input with authoritative state (local player only)
		# Use call_deferred to ensure script is fully loaded
		if is_local and player_input != null and is_instance_valid(player_input):
			# Check if method exists (script might not be loaded yet)
			if player_input.has_method("apply_server_state"):
				player_input.apply_server_state(tile_pos, facing)
			else:
				# Script not ready yet - defer the call
				var tile_copy := tile_pos
				var facing_copy := facing
				call_deferred("_deferred_apply_server_state_to_input", tile_copy, facing_copy)
		
		# Animation decision happens in _process() based on is_moving and queued moves
		return

	# 2) Determine how far we are from the new true tile in pixels
	var current_pos: Vector2 = global_position
	var distance_to_target: float = current_pos.distance_to(target_world_pos)

	# 3) If the distance is huge (teleport, login at far-away tile), snap instead of interpolating
	if distance_to_target > TELEPORT_THRESHOLD_PIXELS:
		global_position = target_world_pos
		from_world_pos = target_world_pos
		to_world_pos = target_world_pos
		move_elapsed = 0.0
		is_moving = false
	else:
		# 4) Normal step logic
		if position_changed:
			# Start a new interpolation from current render position to the new tile
			from_world_pos = current_pos
			to_world_pos = target_world_pos
			move_elapsed = 0.0
			is_moving = true
		else:
			# Tile did not change (facing-only or duplicate update)
			# Do NOT interrupt a move in progress; only snap if we aren't moving.
			if not is_moving:
				global_position = target_world_pos
				from_world_pos = target_world_pos
				to_world_pos = target_world_pos
				move_elapsed = 0.0
			# If is_moving == true, do nothing to position/interp state.

	# Update player_input with authoritative state (local player only)
	# This ensures pathfinding uses the correct current tile
	# Use call_deferred if script not ready yet
	if is_local and player_input != null and is_instance_valid(player_input):
		if player_input.has_method("apply_server_state"):
			player_input.apply_server_state(tile_pos, facing)
		else:
			# Script not ready yet - defer the call
			var tile_copy := tile_pos
			var facing_copy := facing
			call_deferred("_deferred_apply_server_state_to_input", tile_copy, facing_copy)

	# Animation decision happens in _process() based on is_moving and queued moves

# Helper: Check if movement keys are pressed (local player only)
func _is_move_key_pressed() -> bool:
	# Only relevant for the local player
	if not is_local:
		return false
	
	return Input.is_action_pressed("ui_up") \
		or Input.is_action_pressed("ui_down") \
		or Input.is_action_pressed("ui_left") \
		or Input.is_action_pressed("ui_right")

# Time-based movement interpolation in _process(delta)
# Movement is driven by server ticks, and visual smoothing happens over MOVE_DURATION
# This ensures the walk animation has enough time to play through frames at OSRS-like pacing
func _process(delta: float) -> void:
	# 1) Check if there are queued moves (for local player only)
	# If moves are queued, keep walk animation playing even between server updates
	var has_queued_moves: bool = false
	if is_local and player_input != null:
		if player_input.has_method("has_queued_moves"):
			has_queued_moves = player_input.has_queued_moves()
	
	# 2) Interpolation
	if is_moving:
		move_elapsed += delta
		var t := move_elapsed / MOVE_DURATION
		
		if t >= 1.0:
			# Movement complete - snap to final position
			t = 1.0
			is_moving = false
			global_position = to_world_pos
		else:
			# Interpolate between from and to positions over MOVE_DURATION
			global_position = from_world_pos.lerp(to_world_pos, t)
	else:
		# When not moving, ensure we sit exactly on the tile's world position
		# Use ZoneManager for tile_to_world conversion
		var zone_manager = get_node_or_null("/root/ZoneManager")
		if zone_manager != null and zone_manager.has_method("tile_to_world"):
			global_position = zone_manager.tile_to_world(tile_pos) + SPRITE_OFFSET
		elif world != null and world.has_method("tile_to_world"):
			# Fallback to world's tile_to_world if ZoneManager not available
			global_position = world.tile_to_world(tile_pos) + SPRITE_OFFSET
	
	# 3) Decide whether to play walking or idle animation
	# Walk if: actively moving, queued moves pending, OR movement keys held (local player)
	var local_move_key_pressed := _is_move_key_pressed()
	var should_walk := is_moving or has_queued_moves or local_move_key_pressed
	_play_anim(should_walk)

# Convert Vector2i facing direction to string direction name
func _facing_to_direction(facing_vec: Vector2i) -> String:
	var x = facing_vec.x
	var y = facing_vec.y
	
	# Handle 8 directions
	if y < 0:  # Up
		if x < 0:
			return "up_left"
		elif x > 0:
			return "up_right"
		else:
			return "up"
	elif y > 0:  # Down
		if x < 0:
			return "down_left"
		elif x > 0:
			return "down_right"
		else:
			return "down"
	else:  # Horizontal only
		if x < 0:
			return "left"
		elif x > 0:
			return "right"
		else:
			# Default to down if no facing
			return "down"

# Update animation based on movement state and facing direction
func _play_anim(moving: bool) -> void:
	if animated_sprite == null:
		return
	
	# Get direction string from facing
	var direction = _facing_to_direction(facing)
	
	# Build animation name: "walk_<direction>" or "idle_<direction>"
	var anim_name = ("walk_" if moving else "idle_") + direction
	
	# Check if animation exists before playing
	if animated_sprite.sprite_frames.has_animation(anim_name):
		animated_sprite.play(anim_name)
	else:
		# Fallback to default if animation missing
		push_warning("Animation not found: " + anim_name + ", using idle_down")
		animated_sprite.play("idle_down")
	
	# Handle sprite flipping for left-facing directions
	# Left, up_left, and down_left should be flipped horizontally
	if direction in ["left", "up_left", "down_left"]:
		animated_sprite.flip_h = true
	else:
		animated_sprite.flip_h = false

# Handle input (local player only)
func _unhandled_input(_event: InputEvent) -> void:
	if not is_local:
		return
	# Input is handled by PlayerInput node via signals
	# This method exists to catch any unhandled input if needed
