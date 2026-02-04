extends Node

# Responsible for:
# - Connecting to SpacetimeDB
# - Subscribing to Player table
# - Emitting signals on updates
#
# ============================================================================
# USAGE EXAMPLES - Username & Chat API
# ============================================================================
#
# Setting display name (username):
#   network_client.set_display_name("KnightRonin123")
#
# Sending a chat message:
#   network_client.send_chat_message("Hello, world!")
#
# Receiving chat messages:
#   Connect to the chat_message_received signal:
#   network_client.chat_message_received.connect(_on_chat_message_received)
#
#   func _on_chat_message_received(id: String, sender_id: String, sender_name: String, text: String, zone_id: int, timestamp: String):
#       print("[CHAT] %s: %s" % [sender_name, text])
#       # Display in UI, etc.
#
# Receiving display name updates:
#   Connect to the player_display_name_updated signal:
#   network_client.player_display_name_updated.connect(_on_player_display_name_updated)
#
#   func _on_player_display_name_updated(identity: String, display_name: String, is_local: bool):
#       if is_local:
#           print("Your display name is now: %s" % display_name)
#       else:
#           print("Player %s display name: %s" % [identity, display_name])
#
# ============================================================================

# Legacy signals (connected in main.gd but never emitted - player updates now via JS bridge callbacks)
signal player_state_updated(player_id, tile_pos, facing)
signal player_state_inserted(player_id, tile_pos, facing)
signal player_state_deleted(player_id)
signal local_player_state_changed(tile_x, tile_y, facing_x, facing_y)
signal world_ready_changed(is_ready: bool)
signal zone_changed(zone_id: int)
signal chat_message_received(id: String, sender_id: String, sender_name: String, text: String, zone_id: int, timestamp: String)
signal player_display_name_updated(identity: String, display_name: String, is_local: bool)
signal quest_debug_snapshot_received(quest: Dictionary, flags: Array)

var js_bridge = null
var is_connected = false
var poll_timer: Timer = null
var last_server_state: Dictionary = {}  # Cache last known state to detect changes
var local_player: Node = null  # Reference to local player node

# Cache previous state for local player to prevent over-frequent updates
var _last_local_tile: Vector2i = Vector2i(0, 0)
var _last_local_facing: Vector2i = Vector2i(0, 1)

# Loading gate: world is ready when PlayerState, ZoneCollision, and World scene are all ready
var world_ready: bool = false
var _local_player_state_received: bool = false  # Track if we've received local PlayerState
var _zone_collision_ready: bool = false  # Track if current zone collision is ready
var _world_scene_ready: bool = false  # Track if zone scene (World node) is loaded
var _current_zone_id: int = -1  # Current zone ID from PlayerState.zone_id

# JavaScript callbacks for bridge communication (keep references alive)
var _js_player_update_callback: JavaScriptObject = null
var _js_player_remove_callback: JavaScriptObject = null
var _js_zone_collision_callback: JavaScriptObject = null  # Keep reference alive!
var _js_move_queue_callback: JavaScriptObject = null  # Keep reference alive!
var _js_chat_message_callback: JavaScriptObject = null  # Keep reference alive!
var _js_player_metadata_callback: JavaScriptObject = null  # Keep reference alive!
# NPC/Interactable/Dialogue bridge callbacks (Step 5)
var _js_spawn_npc_callback: JavaScriptObject = null
var _js_despawn_npc_callback: JavaScriptObject = null
var _js_spawn_interactable_callback: JavaScriptObject = null
var _js_despawn_interactable_callback: JavaScriptObject = null
var _js_show_dialogue_callback: JavaScriptObject = null
var _js_close_dialogue_callback: JavaScriptObject = null
var _js_quest_debug_callback: JavaScriptObject = null
# Pending spawns when World wasn't ready (TS can fire before zone loads)
var _pending_npc_spawns: Array[Dictionary] = []
var _pending_interactable_spawns: Array[Dictionary] = []
var _flush_pending_timer_count: int = 0

func _ready():
	print("[NETWORK] network_client _ready() called")
	print("[NETWORK] OS.has_feature('web'): ", OS.has_feature("web"))
	
	# Try to get SNBridge from window (only available in web export)
	if OS.has_feature("web"):
		# Set up JavaScript callbacks for JS -> Godot communication
		_setup_js_callbacks()
		# Access window.SNBridge via JavaScriptBridge
		var window_obj = JavaScriptBridge.get_interface("window")
		if window_obj != null:
			js_bridge = window_obj.SNBridge
			if js_bridge == null:
				print("[NETWORK] window.SNBridge not found - make sure spacetime-bridge.bundle.js is loaded")
			else:
				print("[NETWORK] Found window.SNBridge")
				var keys = JavaScriptBridge.eval("Object.keys(window.SNBridge || {})", true)
				print("[NETWORK] Available bridge methods: ", keys)
		else:
			print("[NETWORK] Could not access window object")
	else:
		print("[NETWORK] Not in web export - using mock mode for testing")

func connect_to_server(host: String = "ws://localhost:3000", database: String = "sn-server", token: String = "") -> void:
	if js_bridge == null:
		push_error("[NETWORK] SpacetimeBridge not found on window - make sure spacetime-bridge.bundle.js is loaded")
		is_connected = false
		return
	
	# Verify functions exist using JavaScriptBridge.eval (NOT has_method)
	var has_init = JavaScriptBridge.eval("typeof window.SNBridge?.init === 'function'", true)
	var has_connect = JavaScriptBridge.eval("typeof window.SNBridge?.connectToSpacetimeDB === 'function'", true)
	
	if not has_init and not has_connect:
		push_error("[NETWORK] Bridge missing required methods (init and connectToSpacetimeDB)")
		is_connected = false
		return
	
	print("[NETWORK] Connecting to SpacetimeDB at ", host)
	
	# Use JavaScriptBridge.eval() to directly call JS functions instead of bridge.call()
	# This avoids issues with JavaScriptObject.call() not working reliably
	# Escape strings for JS (replace quotes and backslashes)
	var host_escaped = host.replace("\\", "\\\\").replace("'", "\\'")
	var db_escaped = database.replace("\\", "\\\\").replace("'", "\\'")
	var token_str = "null" if token == "" else ("'" + token.replace("\\", "\\\\").replace("'", "\\'") + "'")
	
	var result = null
	if has_init:
		# Call init via eval - init() now returns a boolean directly (not a Promise)
		var eval_code = "(function() { if (typeof window.SNBridge?.init !== 'function') { console.error('[BRIDGEDBG] init missing/not function', window.SNBridge?.init); return false; } else { return window.SNBridge.init('" + host_escaped + "', '" + db_escaped + "', " + token_str + "); } })()"
		result = JavaScriptBridge.eval(eval_code, true)
	elif has_connect:
		# Call connectToSpacetimeDB via eval (still returns Promise)
		var eval_code = "(function() { if (typeof window.SNBridge?.connectToSpacetimeDB !== 'function') { console.error('[BRIDGEDBG] connectToSpacetimeDB missing/not function', window.SNBridge?.connectToSpacetimeDB); return Promise.resolve({success: false, error: 'connectToSpacetimeDB is not a function'}); } else { var result = window.SNBridge.connectToSpacetimeDB('" + host_escaped + "', '" + db_escaped + "', " + token_str + "); return (result && typeof result.then === 'function') ? result : Promise.resolve(result); } })()"
		result = await JavaScriptBridge.eval(eval_code)
	else:
		push_error("[NETWORK] Bridge init/connect functions not found")
		is_connected = false
		return
	
	# Print result for debugging
	print("[NETWORK] init() returned: ", result)
	
	# Accept true or null as success (bridge.call may convert true to null)
	# Only treat explicit false as an error
	var is_error = false
	if result is bool:
		is_error = (result == false)
	elif result == null:
		# null from bridge.call likely means true (success)
		is_error = false
	elif result is Dictionary:
		# Handle Dictionary result from connectToSpacetimeDB (legacy path)
		var success = result.get("success", false)
		is_error = not success
		if is_error:
			var error_msg = result.get("error", "Unknown error")
			push_error("[NETWORK] Connection failed: %s" % error_msg)
			is_connected = false
			return
		is_connected = true
		print("[NETWORK] Connection successful - SpacetimeDB onConnect fired")
		_subscribe_to_player_state()
		return
	else:
		# Unexpected type - log but don't error
		print("[NETWORK] Unexpected result type: ", typeof(result))
		is_error = false
	
	if is_error:
		push_error("[NETWORK] Connection failed: init() returned false")
		is_connected = false
		return
	
	# Connection started successfully
	is_connected = true
	print("[NETWORK] Connection initiated successfully")
	# Subscribe after a short delay to allow connection to establish
	await get_tree().create_timer(0.5).timeout
	_subscribe_to_player_state()
	_start_polling_local_state()

func _subscribe_to_player_state() -> void:
	if js_bridge == null:
		push_error("[NETWORK] Cannot subscribe: SpacetimeBridge not found")
		return
	
	if not is_connected:
		push_error("[NETWORK] Cannot subscribe: Not connected to server")
		return
	
	if not OS.has_feature("web"):
		return
	
	# Call JS function using eval - subscribeToPlayerState() now takes no arguments
	JavaScriptBridge.eval("if (window.SNBridge && typeof window.SNBridge.subscribeToPlayerState === 'function') { window.SNBridge.subscribeToPlayerState(); }")
	print("[NETWORK] Subscription requested")

# Legacy player state handlers removed - now handled directly via JS bridge callbacks
# (_on_js_player_state_update forwards to main.bridge_on_player_state_update)

func get_local_identity() -> String:
	if js_bridge == null:
		print("[NETWORK] Cannot get identity: SpacetimeBridge not found")
		return ""
	
	# Verify function exists using JavaScriptBridge.eval (NOT has_method or .has)
	var has_get_identity = JavaScriptBridge.eval("typeof window.SNBridge?.getIdentity === 'function'", true)
	if not has_get_identity:
		print("[NETWORK] Bridge missing getIdentity method")
		return ""
	
	# Call JS function using bridge.call()
	var result = js_bridge.call("getIdentity")
	
	if result == null:
		return ""
	
	# Handle dictionary result format
	if result is Dictionary:
		if result.get("success", false):
			return result.get("identity", "")
		else:
			var error = result.get("error", "Unknown error")
			print("[NETWORK] Get identity failed: %s" % error)
			return ""
	
	# Handle string result (legacy format)
	if result is String:
		return result
	
	return ""

# Internal low-level function for sending movement to server
# Use send_move_step() for public API instead
func send_move_intent(dx: int, dy: int) -> void:
	if not is_connected:
		push_error("[NETWORK] Not connected - cannot send move intent")
		return
	
	if js_bridge == null:
		push_error("[NETWORK] Cannot send move intent: SpacetimeBridge not found")
		return
	
	# Defensive guard: ensure bridge exists
	JavaScriptBridge.eval("if (!window.SNBridge) { console.error('[NETWORK] SpacetimeBridge missing'); }")
	
	# Verify function exists using JavaScriptBridge.eval (NOT has_method or .has)
	var has_send_move = JavaScriptBridge.eval("typeof window.SNBridge?.sendMoveIntent === 'function'", true)
	if not has_send_move:
		push_error("[NETWORK] Bridge missing sendMoveIntent method")
		return
	
	# Call JS function using eval (direct invocation avoids bridge.call() issues)
	# Serialize arguments properly (dx and dy are integers)
	var eval_code = "(function() { try { if (!window.SNBridge || typeof window.SNBridge.sendMoveIntent !== 'function') { console.error('[NETWORK] sendMoveIntent not available'); return {success: false, error: 'sendMoveIntent not available'}; } var result = window.SNBridge.sendMoveIntent(%d, %d); return result || {success: true}; } catch(e) { console.error('[NETWORK] sendMoveIntent error:', e); return {success: false, error: e.message}; } })()" % [dx, dy]
	var result = JavaScriptBridge.eval(eval_code, true)
	
	if result == null:
		# null result might mean success (no return value)
		print("[NETWORK] Move intent sent: (", dx, ", ", dy, ")")
		return
	
	if result is Dictionary:
		if result.get("success", false):
			print("[NETWORK] Move intent sent: (", dx, ", ", dy, ")")
		else:
			var error = result.get("error", "Unknown error")
			push_error("[NETWORK] Failed to send move intent: %s" % error)
	else:
		# Non-dictionary result - assume success
		print("[NETWORK] Move intent sent: (", dx, ", ", dy, ")")

## Send a single-step movement intent (for WASD/arrow key input)
## This is the primary public API for movement. send_move_intent is the internal low-level function.
## direction: Vector2i representing the movement direction (e.g., Vector2i(0, -1) for up)
func send_move_step(direction: Vector2i) -> void:
	# Convert Vector2i direction to dx/dy and send
	var dx := clampi(direction.x, -1, 1)
	var dy := clampi(direction.y, -1, 1)
	
	if dx == 0 and dy == 0:
		return
	
	send_move_intent(dx, dy)

## Send a move-to-tile intent (for click-to-move)
## Sends destination tile to server. Server computes path and handles movement queue.
func send_move_to_tile(dest_tile: Vector2i) -> void:
	if not is_connected:
		push_error("[NETWORK] Not connected - cannot send move-to-tile intent")
		return
	
	if js_bridge == null:
		push_error("[NETWORK] Cannot send move-to-tile intent: SpacetimeBridge not found")
		return
	
	# Verify function exists using JavaScriptBridge.eval
	var has_move_to = JavaScriptBridge.eval("typeof window.SNBridge?.moveTo === 'function'", true)
	if not has_move_to:
		push_error("[NETWORK] Bridge missing moveTo method")
		return
	
	print("[NETWORK] Sending move-to-tile intent: dest=(%d, %d)" % [dest_tile.x, dest_tile.y])
	
	# Call JS function using eval (direct invocation avoids bridge.call() issues)
	var dest_x := dest_tile.x
	var dest_y := dest_tile.y
	
	# Verify values are valid integers before calling JS
	if dest_x == 0 and dest_y == 0:
		push_warning("[NETWORK][WARN] Sending move_to with dest=(0,0) - this might be unexpected!")
	
	var eval_code = "(function() { try { if (!window.SNBridge || typeof window.SNBridge.moveTo !== 'function') { console.error('[NETWORK] moveTo not available'); return {success: false, error: 'moveTo not available'}; } console.log('[NETWORK] Calling moveTo from Godot eval: destX=%d, destY=%d'); var result = window.SNBridge.moveTo(%d, %d); return result || {success: true}; } catch(e) { console.error('[NETWORK] moveTo error:', e); return {success: false, error: e.message}; } })()" % [dest_x, dest_y, dest_x, dest_y]
	var result = JavaScriptBridge.eval(eval_code, true)
	
	if result == null:
		# null result might mean success (no return value)
		print("[NETWORK] Move-to-tile intent sent: (%d, %d)" % [dest_tile.x, dest_tile.y])
		return
	
	if result is Dictionary:
		if result.get("success", false):
			print("[NETWORK] Move-to-tile intent sent: (%d, %d)" % [dest_tile.x, dest_tile.y])
		else:
			var error = result.get("error", "Unknown error")
			push_error("[NETWORK] Failed to send move-to-tile intent: %s" % error)
	else:
		# Non-dictionary result - assume success
		print("[NETWORK] Move-to-tile intent sent: (%d, %d)" % [dest_tile.x, dest_tile.y])

# Start polling for local player state updates (10-20 Hz = 50-100ms interval)
func _start_polling_local_state() -> void:
	if not OS.has_feature("web"):
		return
	
	if poll_timer != null:
		return
	
	# Create timer for polling at ~15 Hz (66ms interval)
	poll_timer = Timer.new()
	poll_timer.wait_time = 0.066  # ~15 Hz
	poll_timer.autostart = true
	poll_timer.one_shot = false
	add_child(poll_timer)
	poll_timer.timeout.connect(_poll_local_player_state)
	print("[NETWORK] Started polling local player state at ~15 Hz")

# Poll getLocalPlayerState() from JS bridge and apply state if changed
func _poll_local_player_state() -> void:
	if not OS.has_feature("web") or not is_connected:
		return
	
	# Use JavaScriptBridge.eval to call getLocalPlayerState synchronously
	# JavaScriptBridge.eval can return Nil if the call fails, so we type as Variant first
	var raw_json_result: Variant = JavaScriptBridge.eval("JSON.stringify(window.SpacetimeBridge && window.SpacetimeBridge.getLocalPlayerState && window.SpacetimeBridge.getLocalPlayerState())", true)
	
	# Check if eval returned nil/null
	if raw_json_result == null or typeof(raw_json_result) != TYPE_STRING:
		# Debug: log when state is not available yet
		if not OS.has_feature("web"):
			return
		return
	
	# Now we know it's a string, extract it
	var raw_json: String = raw_json_result as String
	
	# raw_json will be "null" or a JSON object string
	if raw_json == "" or raw_json == "null":
		# State not available yet from JS bridge
		return
	
	var parse_result: Variant = JSON.parse_string(raw_json)
	if parse_result == null:
		push_error("[NETWORK] Failed to parse local player state JSON")
		return
	
	var state: Dictionary = parse_result as Dictionary
	# state should have tile_x, tile_y, facing_x, facing_y
	_apply_local_player_state_from_server(state)

# Apply server state to local player
func _apply_local_player_state_from_server(state: Dictionary) -> void:
	# Get state values with defaults
	var tile_x: int = state.get("tile_x", 0)
	var tile_y: int = state.get("tile_y", 0)
	var facing_x: int = state.get("facing_x", 0)
	var facing_y: int = state.get("facing_y", 1)
	var zone_id: int = state.get("zone_id", 1)
	
	var new_tile := Vector2i(tile_x, tile_y)
	var new_facing := Vector2i(facing_x, facing_y)
	
	# Update _current_zone_id from local player's zone_id (authoritative)
	# IMPORTANT: Don't reload zone if it's already loaded via bridge_on_player_state_update
	# The bridge callback handles zone loading directly, polling should not reload
	if zone_id != _current_zone_id:
		var old_zone = _current_zone_id
		print("[ZONE] local zone change ", _current_zone_id, " -> ", zone_id)
		
		# Check if zone is already being loaded or loaded via bridge callback
		# If bridge_on_player_state_update already handled the zone load, don't reload it
		var zone_manager = get_node_or_null("/root/ZoneManager")
		var zone_already_loaded: bool = false
		if zone_manager and zone_manager.has_method("get_current_zone_id"):
			var already_loaded_zone = zone_manager.get_current_zone_id()
			if already_loaded_zone == zone_id:
				# Zone is already loaded via bridge callback - just update our tracking
				zone_already_loaded = true
				print("[ZONE] Zone %d already loaded via bridge callback, skipping reload in polling" % zone_id)
				_current_zone_id = zone_id
				# Reset last tile/facing to force first apply_server_state call for this zone
				# This ensures player_input._has_current_tile becomes true even if tile hasn't changed
				_last_local_tile = Vector2i(-9999, -9999)  # Invalid value to force first update
				_last_local_facing = Vector2i(-9999, -9999)  # Invalid value to force first update
				# Don't reload the zone - it's already loaded and world_scene_ready should be true
				# Just mark that we've received local player state
				_local_player_state_received = true
				_recompute_world_ready()
				# DON'T return early - we need to call apply_server_state below
				# Continue to the apply_server_state logic so player_input._has_current_tile becomes true
		
		# This is a genuine zone change (not initial load, and zone is NOT already loaded)
		if not zone_already_loaded:
			_current_zone_id = zone_id
			
			# Reset last tile/facing to force first apply_server_state call for new zone
			# This ensures player_input._has_current_tile becomes true even if tile hasn't changed
			_last_local_tile = Vector2i(-9999, -9999)  # Invalid value to force first update
			_last_local_facing = Vector2i(-9999, -9999)  # Invalid value to force first update
			
			# Only clear remote players if this is an actual zone change (not initial load from -1)
			# If initializing from -1, remote players may have been spawned early and need world references fixed instead
			if old_zone != -1:
				# Clear remote players when zone changes (filter by zone)
				_clear_remote_players()
			
			# Notify ZoneManager of zone change (if available)
			# CRITICAL: Zone must load BEFORE allowing click-to-move/pathfinding
			# The zone_world_changed signal will rebind world references
			if zone_manager and zone_manager.has_method("set_zone"):
				# Set world_scene_ready to false while zone is loading
				_world_scene_ready = false
				_recompute_world_ready()
				zone_manager.set_zone(zone_id)
				# world_scene_ready will be set to true when zone_world_changed signal fires
			else:
				# ZoneManager might not be autoload yet - emit signal or call Main directly
				_world_scene_ready = false
				_recompute_world_ready()
				zone_changed.emit(zone_id)
	
	# Only apply if something actually changed (tile or facing)
	# This ensures local player is updated at the same logical cadence as remote players
	# (on state change, typically once per tick), not every poll
	# EXCEPTION: Always apply on first update (when _local_player_state_received is false)
	# This ensures player_input._has_current_tile becomes true even if starting tile hasn't changed
	var is_first_update: bool = not _local_player_state_received
	var state_unchanged: bool = (new_tile == _last_local_tile and new_facing == _last_local_facing)
	
	if state_unchanged and not is_first_update:
		# Note: This early return means apply_server_state won't be called on player or player_input
		return
	
	# Update cached state
	_last_local_tile = new_tile
	_last_local_facing = new_facing
	
	# Mark that we've received local player state (required for world_ready)
	_local_player_state_received = true
	_recompute_world_ready()
	
	# Update last_server_state (for backward compatibility)
	last_server_state = state.duplicate()
	
	# Find local player node (try to get from main scene or use stored reference)
	if local_player == null or not is_instance_valid(local_player):
		# Try to find local player in the scene tree
		var main_scene = get_tree().current_scene
		if main_scene and main_scene.has_node("LocalPlayer"):
			local_player = main_scene.get_node("LocalPlayer")
		else:
			# Try to find via group or autoload reference
			var players = get_tree().get_nodes_in_group("local_player")
			if players.size() > 0:
				local_player = players[0]
	
	if local_player == null or not is_instance_valid(local_player):
		push_warning("[NETWORK] Local player node not found, cannot apply server state")
		return
	
	# Call apply_server_state on the local player (only when state actually changed)
	if local_player.has_method("apply_server_state"):
		# Minimal debug logging (gated) - only log first ~50 calls to verify it works
		if not has_meta("_apply_state_log_count"):
			set_meta("_apply_state_log_count", 0)
		var log_count = get_meta("_apply_state_log_count", 0)
		if log_count < 50:
			print("[LOCAL_STATE] apply_server_state: tile=", new_tile, " facing=", new_facing)
			set_meta("_apply_state_log_count", log_count + 1)
		
		local_player.apply_server_state(new_tile, new_facing)
		
		# Notify listeners about the latest local player state
		local_player_state_changed.emit(tile_x, tile_y, facing_x, facing_y)
	else:
		push_error("[NETWORK] local_player does not have apply_server_state method!")

# Signal emitted when remote players should be cleared (zone change)
signal clear_remote_players_requested

# Clear all remote players (called when zone changes)
func _clear_remote_players() -> void:
	# This will be called from Main to clear remote players when zone changes
	clear_remote_players_requested.emit()

# Get the latest authoritative tile for local player (used for click-to-move pathfinding)
func get_last_local_tile() -> Vector2i:
	return _last_local_tile

# Check if world is ready (local PlayerState received AND ZoneCollision ready AND World scene loaded)
# Sets world_ready and emits signal when conditions are met
func _recompute_world_ready() -> void:
	var ready := _local_player_state_received and _zone_collision_ready and _world_scene_ready
	
	print("[READY] local=", _local_player_state_received,
		" zone_collision=", _zone_collision_ready,
		" world_scene=", _world_scene_ready,
		" => ready=", ready)

	if ready != world_ready:
		world_ready = ready
		print("[READY] world_ready_changed -> ", world_ready)
		world_ready_changed.emit(world_ready)

# Called from JS bridge when ZoneCollision table is updated
# This allows us to track when collision is ready for the current zone
func bridge_on_zone_collision_update(zone_id: int, ready: bool, blocked_count: int) -> void:
	# For current zone, track ready status
	if zone_id == _current_zone_id:
		_zone_collision_ready = ready
		_recompute_world_ready()
		print("[NETWORK] ZoneCollision update: zone_id=%d ready=%s blocked_count=%d" % [zone_id, ready, blocked_count])
	elif _current_zone_id == -1 and zone_id == 1:
		# Fallback: if we haven't received zone_id yet, use zone 1
		_zone_collision_ready = ready
		_recompute_world_ready()

# Set up JavaScript callbacks that JS can call to update players
func _setup_js_callbacks() -> void:
	if not OS.has_feature("web"):
		return

	# Create callbacks that JS can call
	# IMPORTANT: Store callbacks in member variables to keep them alive!
	_js_player_update_callback = JavaScriptBridge.create_callback(_on_js_player_state_update)
	_js_player_remove_callback = JavaScriptBridge.create_callback(_on_js_player_state_remove)
	_js_zone_collision_callback = JavaScriptBridge.create_callback(_on_js_zone_collision_update)
	_js_move_queue_callback = JavaScriptBridge.create_callback(_on_js_move_queue_update)
	_js_chat_message_callback = JavaScriptBridge.create_callback(_on_js_chat_message_insert)
	_js_player_metadata_callback = JavaScriptBridge.create_callback(_on_js_player_update)
	_js_spawn_npc_callback = JavaScriptBridge.create_callback(_on_js_spawn_npc_from_db)
	_js_despawn_npc_callback = JavaScriptBridge.create_callback(_on_js_despawn_npc_by_spawn_id)
	_js_spawn_interactable_callback = JavaScriptBridge.create_callback(_on_js_spawn_interactable_from_db)
	_js_despawn_interactable_callback = JavaScriptBridge.create_callback(_on_js_despawn_interactable_by_spawn_id)
	_js_show_dialogue_callback = JavaScriptBridge.create_callback(_on_js_show_dialogue_from_db)
	_js_close_dialogue_callback = JavaScriptBridge.create_callback(_on_js_close_dialogue_from_db)
	_js_quest_debug_callback = JavaScriptBridge.create_callback(_on_js_quest_debug_snapshot)

	# Get the window object and expose callbacks
	var window_obj = JavaScriptBridge.get_interface("window")
	if window_obj != null:
		window_obj.bridgeOnPlayerStateUpdate = _js_player_update_callback
		window_obj.bridgeOnPlayerStateRemove = _js_player_remove_callback
		window_obj.bridgeOnZoneCollisionUpdate = _js_zone_collision_callback
		window_obj.bridgeOnMoveQueueUpdate = _js_move_queue_callback
		window_obj.bridgeOnChatMessageInsert = _js_chat_message_callback
		window_obj.bridgeOnPlayerUpdate = _js_player_metadata_callback
		window_obj.bridgeOnSpawnNpcFromDb = _js_spawn_npc_callback
		window_obj.bridgeOnDespawnNpcBySpawnId = _js_despawn_npc_callback
		window_obj.bridgeOnSpawnInteractableFromDb = _js_spawn_interactable_callback
		window_obj.bridgeOnDespawnInteractableBySpawnId = _js_despawn_interactable_callback
		window_obj.bridgeOnShowDialogueFromDb = _js_show_dialogue_callback
		window_obj.bridgeOnCloseDialogueFromDb = _js_close_dialogue_callback
		window_obj.bridgeOnQuestDebugSnapshot = _js_quest_debug_callback
		print("[NETWORK] Exposed JavaScript callbacks: bridgeOnPlayerStateUpdate, bridgeOnPlayerStateRemove, bridgeOnZoneCollisionUpdate, bridgeOnMoveQueueUpdate, bridgeOnChatMessageInsert, bridgeOnPlayerUpdate, bridgeOnSpawnNpcFromDb, bridgeOnDespawnNpcBySpawnId, bridgeOnSpawnInteractableFromDb, bridgeOnDespawnInteractableBySpawnId, bridgeOnShowDialogueFromDb, bridgeOnCloseDialogueFromDb, bridgeOnQuestDebugSnapshot")

		# Verify callbacks are registered on window object
		var check_callback = JavaScriptBridge.eval("typeof window.bridgeOnZoneCollisionUpdate", true)
		print("[NETWORK] Verified bridgeOnZoneCollisionUpdate is registered: ", check_callback)

		# Test the callback immediately to verify it works
		print("[NETWORK] Testing bridgeOnZoneCollisionUpdate callback...")
		JavaScriptBridge.eval("if (typeof window.bridgeOnZoneCollisionUpdate === 'function') { window.bridgeOnZoneCollisionUpdate([999, false, -1]); } else { console.error('[NETWORK] bridgeOnZoneCollisionUpdate is not a function!'); }")
	else:
		push_error("[NETWORK] Could not get window object to expose callbacks")

# Called from JavaScript when ZoneCollision table is updated
# args: [zone_id: int, ready: bool, blocked_count: int]
func _on_js_zone_collision_update(args: Array) -> void:
	# Handle JavaScriptObject wrapper FIRST (before size check)
	# JavaScriptBridge wraps arrays in a JavaScriptObject when passing from JS to Godot
	if args.size() == 1 and args[0] is JavaScriptObject:
		var js_obj = args[0]
		var extracted_args = []
		for i in range(3):
			var key_str = str(i)
			var value = js_obj[key_str]
			if value == null:
				value = js_obj.get(key_str, null)
			extracted_args.append(value)
		args = extracted_args
	
	if args.size() < 3:
		push_error("[NETWORK] _on_js_zone_collision_update: invalid args size, got " + str(args.size()) + " expected 3")
		return
	
	var zone_id: int = int(args[0])
	var ready: bool = bool(args[1])
	var blocked_count: int = int(args[2])
	
	bridge_on_zone_collision_update(zone_id, ready, blocked_count)

# Called from JavaScript when ANY player state is updated (local or remote)
# args: [identity: String, tile_x: int, tile_y: int, facing_x: int, facing_y: int, zone_id: int]
func _on_js_player_state_update(args: Array) -> void:
	# Handle case where JavaScriptBridge wraps the array in a JavaScriptObject
	# When JavaScript passes an array via create_callback, it might be wrapped
	if args.size() == 1:
		var first_arg = args[0]
		
		if first_arg is JavaScriptObject:
			var js_obj = first_arg
			
			# Check if js_obj is valid before accessing
			if js_obj == null:
				push_error("[NETWORK] JavaScriptObject is null, cannot extract array")
				return
			
			# Try to access array elements using bracket notation
			# JavaScriptObject supports bracket notation with string keys for array-like objects
			# Extract 6 args including zone_id
			var extracted_args = []
			var valid = true
			for i in range(6):
				var value = null
				var key_str = str(i)
				
				# Use bracket notation directly (JavaScriptObject supports this for arrays)
				value = js_obj[key_str]
				
				# If that fails, try with StringName
				if value == null:
					var key = StringName(key_str)
					value = js_obj[key]
				
				if value == null:
					valid = false
					break
				extracted_args.append(value)
			
			if valid and extracted_args.size() == 6:
				args = extracted_args
			else:
				push_error("[NETWORK] Failed to extract array from JavaScriptObject, got " + str(extracted_args.size()) + " elements")
				return
	
	if args.size() < 6:
		push_error("[NETWORK] _on_js_player_state_update: invalid args size, got " + str(args.size()) + " expected 6 (including zone_id)")
		return
	
	var identity: String = str(args[0])
	var tile_x: int = int(args[1])
	var tile_y: int = int(args[2])
	var facing_x: int = int(args[3])
	var facing_y: int = int(args[4])
	var zone_id: int = int(args[5]) if args.size() > 5 else 1
	
	# Log row data BEFORE filtering (for debugging) - only log first few or errors
	# Note: Excessive logging can cause performance issues with many players
	# Only log if there's a zone mismatch (filtering issue) or during initial connection
	var main_scene = get_tree().current_scene
	var main_current_zone = main_scene.get("current_zone_id") if main_scene else -1
	# Only log if zone mismatch detected (potential bug) or during initial zone setup
	if main_current_zone == -1 or (main_current_zone != -1 and zone_id != main_current_zone):
		print("[PS_ROW] id=", identity.substr(0, 8), "... zone=", zone_id, " current_zone=", main_current_zone)
	
	# Forward to main scene's bridge function with zone_id (reuse main_scene from above)
	if main_scene and main_scene.has_method("bridge_on_player_state_update"):
		main_scene.bridge_on_player_state_update(identity, tile_x, tile_y, facing_x, facing_y, zone_id)
	else:
		push_error("[NETWORK] Main scene not found or missing bridge_on_player_state_update method")

# Called from JavaScript when a player is removed (disconnected)
# args: [identity: String]
func _on_js_player_state_remove(args: Array) -> void:
	if args.size() < 1:
		push_error("[NETWORK] _on_js_player_state_remove: invalid args size")
		return
	
	var identity: String = str(args[0])
	
	# Forward to main scene's bridge function
	var main_scene = get_tree().current_scene
	if main_scene and main_scene.has_method("bridge_on_player_state_remove"):
		main_scene.bridge_on_player_state_remove(identity)
	else:
		push_error("[NETWORK] Main scene not found or missing bridge_on_player_state_remove method")

# --- NPC/Interactable/Dialogue bridge handlers (Step 5) ---
# args: [data: Dictionary/JavaScriptObject] with npc_spawn_id, npc_def_id, zone_id, tile_x, tile_y, facing, name, sprite_id
func _on_js_spawn_npc_from_db(args: Array) -> void:
	var data = _js_args_to_dict(args, ["npc_spawn_id", "npc_def_id", "zone_id", "tile_x", "tile_y", "facing", "name", "sprite_id", "default_dialogue_key"])
	if data.is_empty():
		return
	_flush_pending_spawns()
	var world = _get_current_world()
	if world and world.has_method("spawn_npc_from_db"):
		var wz: int = world.get("zone_id") if world.get("zone_id") != null else -999
		var dz: int = data.get("zone_id", -999)
		if wz == dz:
			world.spawn_npc_from_db(data)
		else:
			_pending_npc_spawns.append(data)
	else:
		_pending_npc_spawns.append(data)

# args: [spawn_id: int]
func _on_js_despawn_npc_by_spawn_id(args: Array) -> void:
	if args.size() < 1:
		return
	var spawn_id: int = int(args[0])
	var world = _get_current_world()
	if world and world.has_method("despawn_npc_by_spawn_id"):
		world.despawn_npc_by_spawn_id(spawn_id)

# args: [data: Dictionary/JavaScriptObject] with interactable_spawn_id, interactable_def_id, zone_id, tile_x, tile_y, display_name, sprite_id, default_dialogue_key, behavior_key
func _on_js_spawn_interactable_from_db(args: Array) -> void:
	var data = _js_args_to_dict(args, ["interactable_spawn_id", "interactable_def_id", "zone_id", "tile_x", "tile_y", "display_name", "sprite_id", "default_dialogue_key", "behavior_key"])
	if data.is_empty():
		return
	_flush_pending_spawns()
	var world = _get_current_world()
	if world and world.has_method("spawn_interactable_from_db"):
		var wz: int = world.get("zone_id") if world.get("zone_id") != null else -999
		var dz: int = data.get("zone_id", -999)
		if wz == dz:
			world.spawn_interactable_from_db(data)
		else:
			_pending_interactable_spawns.append(data)
	else:
		_pending_interactable_spawns.append(data)

# args: [spawn_id: int]
func _on_js_despawn_interactable_by_spawn_id(args: Array) -> void:
	if args.size() < 1:
		return
	var spawn_id: int = int(args[0])
	var world = _get_current_world()
	if world and world.has_method("despawn_interactable_by_spawn_id"):
		world.despawn_interactable_by_spawn_id(spawn_id)

# JS sets window.__dialoguePayload to a JSON string and calls this callback (no args).
# We read the payload via JavaScriptBridge.eval so we get the actual string; passing the
# string through the callback would arrive as JavaScriptObject and str() would be "<JavaScriptObject#...>".
func _on_js_show_dialogue_from_db(_args: Array) -> void:
	if not OS.has_feature("web"):
		return
	var json_str: String = JavaScriptBridge.eval("typeof window.__dialoguePayload === 'string' ? window.__dialoguePayload : '{}'")
	var json := JSON.new()
	var err := json.parse(json_str)
	if err != OK:
		push_error("[INTERACT] _on_js_show_dialogue_from_db: JSON parse error " + str(err) + " " + json.get_error_message() + " for: " + json_str.substr(0, 200))
		return
	var data = json.data
	if data == null:
		push_error("[INTERACT] _on_js_show_dialogue_from_db: JSON data null")
		return
	var event_id: int = int(data.get("eventId", 0))
	var npc_name: String = str(data.get("npcName", ""))
	var text: String = str(data.get("text", ""))
	var options_var = data.get("options", [])
	var options: Array = options_var if options_var is Array else []
	var opts: Array = []
	for o in options:
		if o is Dictionary:
			opts.append({ "id": int(o.get("id", 0)), "label": str(o.get("label", "")) })
		else:
			opts.append({ "id": 0, "label": str(o) })
	var hud = get_node_or_null("/root/GameHud")
	if hud and hud.has_method("show_dialogue_from_db"):
		hud.call_deferred("show_dialogue_from_db", event_id, npc_name, text, opts)
	else:
		push_error("[INTERACT] _on_js_show_dialogue_from_db: GameHud null or no show_dialogue_from_db")

# args: []
func _on_js_close_dialogue_from_db(_args: Array) -> void:
	var hud = get_node_or_null("/root/GameHud")
	if hud and hud.has_method("close_dialogue_from_db"):
		hud.close_dialogue_from_db()

# Called from JS when QuestDebugSnapshot table is updated for local player.
# JS stores JSON in window.__questDebugSnapshot; we read, parse, and emit signal.
func _on_js_quest_debug_snapshot(_args: Array) -> void:
	if not OS.has_feature("web"):
		return
	var json_str: String = JavaScriptBridge.eval("typeof window.__questDebugSnapshot === 'string' ? window.__questDebugSnapshot : '{}'")
	var json := JSON.new()
	var err := json.parse(json_str)
	if err != OK:
		push_error("[QUEST_DEBUG] JSON parse error: %s for: %s" % [json.get_error_message(), json_str.substr(0, 200)])
		return
	var data = json.data
	if data == null:
		quest_debug_snapshot_received.emit({}, [])
		return
	var quest_var = data.get("quest", null)
	var flags_var = data.get("flags", [])
	var quest_dict: Dictionary = quest_var if quest_var is Dictionary else {}
	var flags_arr: Array = flags_var if flags_var is Array else []
	quest_debug_snapshot_received.emit(quest_dict, flags_arr)

## Request quest/flags debug snapshot from SpacetimeDB (dev-only).
## Result arrives asynchronously via quest_debug_snapshot_received signal.
func request_quest_debug_snapshot() -> void:
	if not OS.has_feature("web"):
		push_warning("[QUEST_DEBUG] Quest debug not available on non-web platform")
		return
	JavaScriptBridge.eval("if (window.SNBridge && typeof window.SNBridge.fetchQuestDebugSnapshot === 'function') { window.SNBridge.fetchQuestDebugSnapshot(); } else { console.warn('[QUEST_DEBUG] fetchQuestDebugSnapshot not available'); }")

func _get_current_world() -> Node:
	var zm = get_node_or_null("/root/ZoneManager")
	if zm and zm.has_method("get_current_world"):
		return zm.get_current_world()
	return null

func _flush_pending_spawns() -> void:
	var world = _get_current_world()
	if world == null:
		return
	var wz: int = world.get("zone_id") if world.get("zone_id") != null else -999
	for i in range(_pending_npc_spawns.size() - 1, -1, -1):
		var data: Dictionary = _pending_npc_spawns[i]
		if data.get("zone_id", -999) == wz and world.has_method("spawn_npc_from_db"):
			world.spawn_npc_from_db(data)
			_pending_npc_spawns.remove_at(i)
	for i in range(_pending_interactable_spawns.size() - 1, -1, -1):
		var data: Dictionary = _pending_interactable_spawns[i]
		if data.get("zone_id", -999) == wz and world.has_method("spawn_interactable_from_db"):
			world.spawn_interactable_from_db(data)
			_pending_interactable_spawns.remove_at(i)

func _process(_delta: float) -> void:
	if not OS.has_feature("web"):
		return
	if _pending_npc_spawns.is_empty() and _pending_interactable_spawns.is_empty():
		return
	if _flush_pending_timer_count >= 20:
		return
	_flush_pending_timer_count += 1
	if _flush_pending_timer_count % 4 == 0:
		_flush_pending_spawns()

# Build a Dictionary from JS callback args; first arg can be a single object (Dictionary or JavaScriptObject),
# or a JS array [data] when the bridge passes one argument.
func _js_args_to_dict(args: Array, keys: Array) -> Dictionary:
	if args.is_empty():
		return {}
	var raw = args[0]
	# Unwrap: JS often sends [data] so the single arg is an array; take first element as the object
	if raw is JavaScriptObject:
		var first = raw[0]
		if first != null:
			raw = first
	if raw is Dictionary:
		return raw
	if raw is JavaScriptObject:
		var d: Dictionary = {}
		for key in keys:
			var v = raw[key]
			if v != null:
				d[key] = v
		return d
	return {}

# Unwrap JS callback args (handle single array wrapper and JavaScriptObject array-like).
func _unwrap_js_args(args: Array, expected_size: int) -> Array:
	if args.size() == 1 and args[0] is JavaScriptObject:
		var js_obj: JavaScriptObject = args[0]
		var out: Array = []
		for i in range(expected_size):
			var v = js_obj[str(i)]
			out.append(v)
		return out
	if args.size() >= expected_size:
		return args
	return []

# Called from JavaScript when MoveQueue is updated for the local player
# JS should call: bridgeOnMoveQueueUpdate(flatTiles)
# where flatTiles is either:
# - a single JS array [x1, y1, x2, y2, ...] (wrapped by callGodotBridge as [[x1, y1, ...]])
# - or multiple numeric arguments x1, y1, x2, y2, ... (wrapped by callGodotBridge as [x1, y1, ...])
# - or empty array [] (wrapped as [[]] or [[[]]] depending on nesting)
func _on_js_move_queue_update(args: Array) -> void:
	var flat_tiles: Array = []

	print("[NETWORK] _on_js_move_queue_update called with args.size() = ", args.size(), " args = ", args)

	if args.size() == 1:
		var first_arg = args[0]
		if first_arg is Array:
			# Single array argument: could be [[x1, y1, ...]] or [[[]]] for empty
			# Unwrap nested arrays until we get to the actual data
			var current: Variant = first_arg
			while current is Array:
				var arr: Array = current as Array
				if arr.is_empty():
					# Empty array - we're done
					flat_tiles = []
					break
				elif arr.size() == 1 and arr[0] is Array:
					# Still nested, unwrap one more level
					current = arr[0]
				else:
					# This is the actual data array
					flat_tiles = arr
					break
		elif first_arg is JavaScriptObject:
			# Try to treat it as an array-like JS object with numeric indices
			var js_obj: JavaScriptObject = first_arg
			var i := 0
			var max_iterations := 10000
			while i < max_iterations:
				var key_str := str(i)
				var elem = js_obj[key_str]
				if elem == null:
					break
				flat_tiles.append(elem)
				i += 1
		else:
			# Single non-array value – treat as empty
			flat_tiles = []
	elif args.size() > 1:
		# Multiple numeric args: [x1, y1, x2, y2, ...] (from spread array)
		for arg in args:
			flat_tiles.append(arg)
	# else: args.size() == 0 → flat_tiles stays empty

	bridge_on_move_queue_update(flat_tiles)

# Called when MoveQueue is updated for the local player
# flat_tiles: [x1, y1, x2, y2, ...] or empty array to clear
#
# Best practice:
# Server sends the full remaining path for the local player's MoveQueue
# as a flat list of absolute tile coordinates, in the order the player will walk them.
# The client reconstructs that into [Vector2i] and passes it directly to PathPreview,
# without re-anchoring to the player's current position or reordering.
func bridge_on_move_queue_update(flat_tiles: Array) -> void:
	var main_scene = get_tree().current_scene
	if main_scene == null:
		push_warning("[NETWORK] Main scene not found, cannot update path preview")
		return

	var path_preview = main_scene.get_node_or_null("PathPreview")
	if path_preview == null:
		push_warning("[NETWORK] PathPreview node not found in main scene")
		return

	print("[NETWORK] bridge_on_move_queue_update: flat_tiles.size() = ", flat_tiles.size(), " flat_tiles = ", flat_tiles)

	# Empty array means clear the path
	if flat_tiles.is_empty():
		if path_preview.has_method("clear_path"):
			path_preview.clear_path()
		else:
			push_warning("[NETWORK] PathPreview does not have clear_path method")
		return

	# Convert flat array [x1, y1, x2, y2, ...] to Array[Vector2i]
	# flat_tiles is assumed to be already in the correct order from server:
	# [next_step_x, next_step_y, ..., dest_x, dest_y].
	# We do not reverse, sort, or otherwise reorder tiles.
	# We do not infer anything from the local player's current tile position.
	var tiles: Array[Vector2i] = []

	for i in range(0, flat_tiles.size(), 2):
		if i + 1 < flat_tiles.size():
			var x := int(flat_tiles[i])
			var y := int(flat_tiles[i + 1])
			tiles.append(Vector2i(x, y))

	print("[NETWORK] Reconstructed ", tiles.size(), " path tiles from server: ", tiles)

	if path_preview.has_method("set_path"):
		path_preview.set_path(tiles)
	else:
		push_warning("[NETWORK] PathPreview does not have set_path method")

# Called from JavaScript when a chat message is inserted (legacy callback)
# args: [id: String, sender_id: String, sender_name: String, text: String, zone_id: int, timestamp: String]
# Note: ChatManager now handles chat messages via register_chat_listener, but this callback
# is kept for backward compatibility. It may receive arguments wrapped in JavaScriptObject.
func _on_js_chat_message_insert(args: Array) -> void:
	# If args is already a plain array with the right size, use it directly
	if args.size() >= 6:
		# Already a plain array - use it directly
		pass
	elif args.size() == 1 and args[0] is JavaScriptObject:
		# Handle JavaScriptObject wrapper (JavaScriptBridge may wrap arrays)
		var js_obj = args[0]
		# Check if js_obj is valid before accessing
		if js_obj == null:
			return
		
		# Try to extract array elements - use bracket notation which is safer
		var extracted_args = []
		for i in range(6):
			var value = null
			# Try bracket notation (safer than .get())
			var key_str = str(i)
			value = js_obj[key_str]
			# If bracket notation returns null, try .get() but only if js_obj is not null
			if value == null:
				value = js_obj.get(key_str, null) if js_obj != null else null
			extracted_args.append(value)
		args = extracted_args
	else:
		# Invalid args format - silently ignore (ChatManager handles this now)
		return
	
	# Final size check
	if args.size() < 6:
		# Silently ignore - ChatManager is handling chat messages now
		return

	var id: String = str(args[0])
	var sender_id: String = str(args[1])
	var sender_name: String = str(args[2])
	var text: String = str(args[3])
	var zone_id: int = int(args[4])
	var timestamp: String = str(args[5])

	# Forward as signal (legacy - ChatManager handles this now)
	chat_message_received.emit(id, sender_id, sender_name, text, zone_id, timestamp)
	print("[CHAT] Received message from %s: %s (legacy callback)", sender_name, text)

# Called from JavaScript when player metadata (display name) is updated (legacy callback)
# args: [identity: String, display_name: String, is_local: String]
# Note: ChatManager now handles display name updates, but this callback is kept for backward compatibility.
# It may receive arguments wrapped in JavaScriptObject.
func _on_js_player_update(args: Array) -> void:
	# If args is already a plain array with the right size, use it directly
	if args.size() >= 3:
		# Already a plain array - use it directly
		pass
	elif args.size() == 1 and args[0] is JavaScriptObject:
		# Handle JavaScriptObject wrapper (JavaScriptBridge may wrap arrays)
		var js_obj = args[0]
		# Check if js_obj is valid before accessing
		if js_obj == null:
			return
		
		# Try to extract array elements - use bracket notation which is safer
		var extracted_args = []
		for i in range(3):
			var value = null
			# Try bracket notation (safer than .get())
			var key_str = str(i)
			value = js_obj[key_str]
			# If bracket notation returns null, try .get() but only if js_obj is not null
			if value == null:
				value = js_obj.get(key_str, null) if js_obj != null else null
			extracted_args.append(value)
		args = extracted_args
	else:
		# Invalid args format - silently ignore (ChatManager handles this now)
		return
	
	# Final size check
	if args.size() < 3:
		# Silently ignore - ChatManager is handling display name updates now
		return

	var identity: String = str(args[0])
	var display_name: String = str(args[1])
	var is_local: bool = (str(args[2]) == '1')

	# Forward as signal (legacy - ChatManager handles this now)
	player_display_name_updated.emit(identity, display_name, is_local)
	print("[PLAYER] Display name updated: %s -> %s (local=%s) (legacy callback)", identity, display_name, is_local)

# Send a chat message
func send_chat_message(text: String) -> bool:
	if js_bridge == null:
		push_error("[NETWORK] Cannot send chat: SpacetimeBridge not found")
		return false

	var has_send_chat = JavaScriptBridge.eval("typeof window.SNBridge?.sendChat === 'function'", true)
	if not has_send_chat:
		push_error("[NETWORK] Bridge missing sendChat method")
		return false

	# Call async function and await the Promise result
	# sendChat returns Promise<{success: boolean, error?: string}>
	var text_escaped = text.replace("\\", "\\\\").replace("'", "\\'")
	var eval_code = "(async function() { try { if (!window.SNBridge || typeof window.SNBridge.sendChat !== 'function') { return {success: false, error: 'sendChat not available'}; } var result = await window.SNBridge.sendChat('%s'); return result || {success: true}; } catch(e) { return {success: false, error: e.message}; } })()" % text_escaped
	var result = await JavaScriptBridge.eval(eval_code, true)

	if result is Dictionary:
		if result.get("success", false):
			print("[NETWORK] Chat message sent successfully: ", text)
			return true
		else:
			var error = result.get("error", "Unknown error")
			push_error("[NETWORK] Failed to send chat message: %s" % error)
			return false
	else:
		# Non-dictionary result - assume success for backward compatibility
		return true

# Set display name
func set_display_name(display_name: String) -> bool:
	if js_bridge == null:
		push_error("[NETWORK] Cannot set display name: SpacetimeBridge not found")
		return false

	var has_set_display_name = JavaScriptBridge.eval("typeof window.SNBridge?.setDisplayName === 'function'", true)
	if not has_set_display_name:
		push_error("[NETWORK] Bridge missing setDisplayName method")
		return false

	# Call async function and await the Promise result
	# setDisplayName returns Promise<{success: boolean, error?: string}>
	var name_escaped = display_name.replace("\\", "\\\\").replace("'", "\\'")
	var eval_code = "(async function() { try { if (!window.SNBridge || typeof window.SNBridge.setDisplayName !== 'function') { return {success: false, error: 'setDisplayName not available'}; } var result = await window.SNBridge.setDisplayName('%s'); return result || {success: true}; } catch(e) { return {success: false, error: e.message}; } })()" % name_escaped
	var result = await JavaScriptBridge.eval(eval_code, true)

	if result is Dictionary:
		if result.get("success", false):
			print("[NETWORK] Display name set successfully: ", display_name)
			return true
		else:
			var error = result.get("error", "Unknown error")
			push_error("[NETWORK] Failed to set display name: %s" % error)
			return false
	else:
		# Non-dictionary result - assume success for backward compatibility
		return true
