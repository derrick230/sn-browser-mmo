extends Node2D

# World is now managed by ZoneManager, not a direct child
var world: Node = null
var local_player: Player = null  # Will be set in _ready()

var remote_players: Dictionary = {}  # player_id -> Player node
var network_client: Node = null
var zone_manager: Node = null
var local_player_id: String = ""
var current_zone_id: int = -1  # Track current zone for filtering
var last_zone_id: int = -1  # Track last zone_id to detect transitions
var player_scene = preload("res://scenes/player.tscn")

# Camera smoothing
var _camera_ref: Camera2D = null
const CAMERA_SMOOTH_SPEED := 4.0  # Higher = faster follow, lower = smoother (4-12 is a good range)

# Loading gate UI
var _loading_ui: CanvasLayer = null
var _loading_label: Label = null

func _ready():
	print("[MAIN] _ready() called - Godot is initializing!")
	print("[MAIN] OS.has_feature('web'): ", OS.has_feature("web"))
	
	# Debug: Verify scene file
	var scene_file = get_tree().current_scene.scene_file_path if get_tree().current_scene else "unknown"
	print("[MAIN] Current scene file: %s" % scene_file)
	print("[MAIN] Main node path: %s" % get_path())
	
	# Wait one frame to ensure scene tree is fully built (especially important for web builds)
	await get_tree().process_frame
	
	# Debug: List all children to see what's actually in the scene tree
	print("[MAIN] Scene tree children (count: %d):" % get_child_count())
	for child in get_children():
		print("[MAIN]   - Child: %s (type: %s, path: %s)" % [child.name, child.get_class(), child.get_path()])
	
	# Find LocalPlayer node (must be in scene tree)
	# The LocalPlayer should be an instance of player.tscn which uses player.gd (class_name Player)
	local_player = get_node_or_null("LocalPlayer") as Player
	if local_player == null:
		# Try using $ syntax (but catch error if it fails)
		var node_path = NodePath("LocalPlayer")
		if has_node(node_path):
			local_player = get_node(node_path) as Player
	if local_player == null:
		# Try find_child as fallback
		local_player = find_child("LocalPlayer", true, false) as Player
	
	if local_player == null:
		push_warning("[MAIN] LocalPlayer node not found in scene tree - attempting to instantiate from player.tscn")
		# Also check if maybe the node exists but isn't a Player type
		var any_local_player = get_node_or_null("LocalPlayer")
		if any_local_player != null:
			print("[MAIN] Found node named 'LocalPlayer' but it's not a Player type!")
			print("[MAIN] Node type: %s, script: %s" % [any_local_player.get_class(), any_local_player.get_script()])
			return
		
		# Fallback: Manually instantiate LocalPlayer from player.tscn (which uses player.gd)
		var player_scene_path = "res://scenes/player.tscn"
		var player_packed = load(player_scene_path) as PackedScene
		if player_packed == null:
			push_error("[MAIN] Failed to load player.tscn - cannot create LocalPlayer")
			return
		
		var player_instance = player_packed.instantiate() as Player
		if player_instance == null:
			push_error("[MAIN] Failed to instantiate Player from player.tscn - check that player.tscn root uses player.gd")
			return
		
		player_instance.name = "LocalPlayer"
		add_child(player_instance)
		local_player = player_instance
		print("[MAIN] Successfully created LocalPlayer from player.tscn (player.gd)")
	
	# Verify it's actually a Player instance (from player.gd)
	if not local_player is Player:
		push_error("[MAIN] LocalPlayer node found but is not a Player instance! Script: %s" % local_player.get_script())
		return
	
	print("[MAIN] LocalPlayer found: %s (Player instance from player.gd)" % local_player.get_path())
	
	# Get ZoneManager (should be autoload)
	zone_manager = get_node_or_null("/root/ZoneManager")
	if zone_manager == null:
		push_error("[MAIN] ZoneManager autoload not found! Please add it in Project Settings -> Autoload")
		return
	
	# World will be set when zone loads (via ZoneManager)
	local_player.set_is_local(true)
	
	# Set up camera to follow player with smoothing
	# Camera is placed as a sibling to player (not child) so we can smooth its position
	var camera = Camera2D.new()
	camera.name = "Camera2D"
	camera.zoom = Vector2(3, 3)  # 3x zoom
	
	# Add camera as child of Main (sibling to player) for independent smoothing
	add_child(camera)
	camera.enabled = true
	
	# Initial camera position matches player position
	camera.global_position = local_player.global_position
	
	# Store camera reference for smooth following in _process
	_camera_ref = camera
	
	# Connect to network (Phase 3: WebSocket subscription proof)
	network_client = get_node_or_null("/root/network_client")
	if network_client:
		print("[MAIN] Found network_client autoload")
		# Register local player reference with network_client so it can apply server state
		network_client.local_player = local_player
		
		# Connect signals for player state updates
		network_client.player_state_inserted.connect(_on_player_inserted)
		network_client.player_state_updated.connect(_on_player_updated)
		network_client.player_state_deleted.connect(_on_player_deleted)
		# Connect signal for local player state changes (from polling) - legacy, polling now calls apply_server_state directly
		network_client.local_player_state_changed.connect(_on_local_player_state_changed)
		# Connect world_ready signal for loading gate
		network_client.world_ready_changed.connect(_on_world_ready_changed)
		# Connect zone_changed signal to handle zone switches
		network_client.zone_changed.connect(_on_zone_changed)
		# Connect signal to clear remote players on zone change
		network_client.clear_remote_players_requested.connect(_clear_remote_players)
		# Connect chat signals
		network_client.chat_message_received.connect(_on_chat_message_received)
		network_client.player_display_name_updated.connect(_on_player_display_name_updated)
		
		# Connect ZoneManager signals
		if zone_manager:
			zone_manager.zone_loaded.connect(_on_zone_loaded)
			zone_manager.zone_unloaded.connect(_on_zone_unloaded)
			zone_manager.zone_world_changed.connect(_on_zone_world_changed)
		
		# Get local player identity (will be set after connection)
		# For now, we'll identify local player by checking if it's already in the scene
		
		# Create loading screen UI
		_setup_loading_screen()
		
		# Connect to server
		network_client.connect_to_server()
	else:
		print("[MAIN] WARNING: network_client autoload not found!")

func _get_local_player_id() -> String:
	# Try to get identity from network client
	if network_client and network_client.js_bridge:
		var identity = network_client.js_bridge.getIdentity()
		if identity:
			return identity
	# Fallback: we'll identify local player by being the first one
	return local_player_id

# Bridge functions called from JavaScript for ALL players (local and remote)
# These are called directly from the SpacetimeDB bridge for all player updates

# Called from JS for ANY player state update (local or remote)
# Now includes zone_id for zone filtering
func bridge_on_player_state_update(identity: String, tile_x: int, tile_y: int, facing_x: int, facing_y: int, zone_id: int = 1) -> void:
	var tile_pos = Vector2i(tile_x, tile_y)
	var facing = Vector2i(facing_x, facing_y)
	var local_id = _get_local_player_id()
	
	# If this is the first update and we don't know local_id yet, assume this is it
	if local_id == "":
		local_player_id = identity
		local_id = identity
	
	# Update current_zone_id from local player's zone_id (authoritative source)
	# This MUST happen even if local_id was just set, to initialize current_zone_id from -1
	if identity == local_id:
		var zone_changed = false
		if current_zone_id == -1:
			# First time initialization
			print("[WORLD] Initializing current_zone_id=%d" % zone_id)
			last_zone_id = -1
			current_zone_id = zone_id
			zone_changed = true
		elif zone_id != current_zone_id:
			# Zone transition detected
			print("[WORLD] Zone transition detected: %d -> %d" % [current_zone_id, zone_id])
			last_zone_id = current_zone_id
			current_zone_id = zone_id
			zone_changed = true
		
		# Handle zone transition (server-authoritative)
		if zone_changed and zone_manager != null:
			# Set active world reference if needed
			if zone_manager.has_method("set_active_world"):
				zone_manager.set_active_world(self)
			
			# Find ActiveZone container (Node2D child of Main)
			var active_zone = get_node_or_null("ActiveZone")
			if active_zone == null:
				# Create ActiveZone if it doesn't exist
				active_zone = Node2D.new()
				active_zone.name = "ActiveZone"
				add_child(active_zone)
				print("[WORLD] Created ActiveZone container")
			
			# Load the zone into ActiveZone container
			if zone_manager.has_method("load_zone"):
				print("[WORLD] Loading zone %d via ZoneManager (transition from %d)" % [zone_id, last_zone_id])
				zone_manager.load_zone(zone_id, active_zone, last_zone_id)
			
			# Clear any local movement prediction (clear queued moves in PlayerInput)
			if local_player != null and local_player.player_input != null:
				var player_input_node = local_player.player_input
				# Clear queued moves - the player_input will be rebound when zone loads
				if "_queued_directions" in player_input_node:
					player_input_node._queued_directions.clear()
				if "_pending_click_target" in player_input_node:
					# Use (-1, -1) to indicate no pending click (matches player_input.gd convention)
					player_input_node._pending_click_target = Vector2i(-1, -1)
				print("[WORLD] Cleared local movement prediction for zone transition")
			
			# Apply authoritative state AFTER zone is loaded (deferred to next frame)
			# This ensures zone is loaded before position is applied
			if zone_changed:
				call_deferred("_apply_player_state_after_zone_load", tile_pos, facing)
				return  # Exit early, position will be applied deferred
		
		# Mark that we've received local player state (required for world_ready)
		# This ensures the 'local' flag in READY state is set to true
		if network_client:
			network_client._local_player_state_received = true
			network_client._recompute_world_ready()
			print("[WORLD] Local player state received flag set to TRUE")
		
		# Always apply authoritative tile_pos/facing to LocalPlayer
		# (For non-zone-changes, apply immediately)
		var is_moving = (tile_pos != local_player.tile_pos)
		print("[WORLD] Applying authoritative state to LocalPlayer: tile_pos=%s, facing=%s (zone_id=%d)" % [tile_pos, facing, zone_id])
		local_player.apply_state(tile_pos, facing, is_moving)
	else:
		# This is a remote player - filter by zone_id
		# Only show players in the same zone as local player
		# Don't filter if current_zone_id is not initialized yet (-1)
		# Note: Excessive logging removed to prevent performance issues
		
		if current_zone_id != -1 and zone_id != current_zone_id:
			# Player is in a different zone - despawn if exists
			if identity in remote_players:
				var player = remote_players[identity]
				remote_players.erase(identity)
				player.queue_free()
				print("[REMOTE] despawn (zone mismatch) id=", identity, " row_zone=", zone_id, " current_zone=", current_zone_id)
			else:
				print("[REMOTE] filtering out (zone mismatch) id=", identity, " row_zone=", zone_id, " current_zone=", current_zone_id)
			return
		
		# Player is in same zone - spawn or update
		if identity in remote_players:
			var player = remote_players[identity] as Player
			var is_moving = (tile_pos != player.tile_pos)
			player.apply_state(tile_pos, facing, is_moving)
		else:
			# Spawn new remote player - get parent node from ZoneManager or fallback
			var parent_node = null
			
			# Try to get entities root from ZoneManager first (use class variable)
			if zone_manager and zone_manager.has_method("get_entities_root"):
				parent_node = zone_manager.get_entities_root()
			
			# Fallback to world if available
			if parent_node == null:
				parent_node = world
			
			# Final fallback to current scene
			if parent_node == null:
				parent_node = get_tree().current_scene
			
			if parent_node == null:
				push_warning("[MAIN] Cannot spawn remote player: no parent node available (world and zone not loaded yet)")
				return
			
			var p := player_scene.instantiate() as Player
			p.player_id = identity.hash()  # Convert string to int hash for player_id
			p.set_is_local(false)
			
			# CRITICAL: Set world BEFORE apply_server_state, otherwise position won't be set
			var world_to_use = world
			if world_to_use == null:
				# Try to get world from ZoneManager as fallback
				if zone_manager and zone_manager.has_method("get_current_world"):
					world_to_use = zone_manager.get_current_world()
			
			if world_to_use != null:
				p.set_world(world_to_use)
				# Now apply server state - position will be set correctly
				p.apply_server_state(tile_pos, facing)
			else:
				# World not available yet - set position manually using tile coordinates
				# This is a fallback for when zone hasn't loaded yet
				p.tile_pos = tile_pos
				p.facing = facing
				# Position will be set properly when world is assigned later
				push_warning("[MAIN] Spawning remote player without world - position may be wrong until world loads")
			remote_players[identity] = p
			parent_node.add_child(p)
			var world_ref = p.world
			print("[MAIN] Bridge: Added remote player: ", identity, " at ", tile_pos, " (zone ", zone_id, ") under ", parent_node.name, " world=", world_ref.name if world_ref else "null", " global_pos=", p.global_position)

# Called from JS when a player is removed (disconnected)
func bridge_on_player_state_remove(identity: String) -> void:
	# Don't remove the local player (shouldn't happen, but guard anyway)
	var local_id = _get_local_player_id()
	if identity == local_id:
		print("[MAIN] Bridge: Warning - attempted to remove local player, ignoring")
		return
	
	# Remove remote player
	if identity in remote_players:
		var player = remote_players[identity]
		remote_players.erase(identity)
		player.queue_free()
		print("[MAIN] Bridge: Removed remote player: ", identity)
	else:
		print("[MAIN] Bridge: Attempted to remove unknown player: ", identity)

func _on_player_inserted(player_id: String, tile_pos: Vector2i, facing: Vector2i) -> void:
	# Check if this is the local player
	var local_id = _get_local_player_id()
	if local_id == "":
		# First insert - assume this is local player
		local_player_id = player_id
		local_id = player_id
	
	if player_id == local_id:
		# This is the local player - update directly
		local_player.apply_state(tile_pos, facing, false)
		return
	
	# Note: Zone filtering should happen in bridge_on_player_state_update which has zone_id
	# This signal handler may not have zone_id, so we rely on the bridge callback for filtering
	# But if world is not loaded yet, skip
	if world == null:
		return
	
	# Create a new remote player
	if player_id in remote_players:
		# Player already exists, just update
		remote_players[player_id].apply_server_state(tile_pos, facing)
		return
	
	# Create remote player using unified player scene
	var p := player_scene.instantiate() as Player
	p.player_id = player_id.hash()  # Convert string to int hash for player_id
	p.set_world(world)
	p.set_is_local(false)
	# Use apply_server_state for consistency - it will handle interpolation
	# Initial position will be set by set_world(), then interpolate to true position
	p.apply_server_state(tile_pos, facing)
	remote_players[player_id] = p
	add_child(p)
	print("[MAIN] Added remote player: ", player_id, " at ", tile_pos)

func _on_player_updated(player_id: String, tile_pos: Vector2i, facing: Vector2i) -> void:
	# Check if this is the local player
	var local_id = _get_local_player_id()
	if local_id == "":
		# First update - assume this is local player
		local_player_id = player_id
		local_id = player_id
	
	if player_id == local_id:
		# This is the local player - update directly
		local_player.apply_state(tile_pos, facing, false)
	else:
		# This is a remote player
		# Note: Zone filtering happens in bridge_on_player_state_update
		# If player is not in remote_players, they're likely in a different zone
		if player_id in remote_players:
			remote_players[player_id].apply_server_state(tile_pos, facing)
		# Don't auto-create here - let bridge callback handle it with zone filtering

func _on_player_deleted(player_id: String) -> void:
	# Remove remote player
	if player_id in remote_players:
		var player = remote_players[player_id]
		remote_players.erase(player_id)
		player.queue_free()
		print("[MAIN] Removed remote player: ", player_id)

func _on_local_player_state_changed(tile_x: int, tile_y: int, facing_x: int, facing_y: int) -> void:
	# Apply authoritative server state to local player
	var tile_pos = Vector2i(tile_x, tile_y)
	var facing = Vector2i(facing_x, facing_y)
	var is_moving = (tile_pos != local_player.tile_pos)
	local_player.apply_state(tile_pos, facing, is_moving)

# Setup loading screen UI
func _setup_loading_screen() -> void:
	# Create CanvasLayer for UI (renders above game)
	_loading_ui = CanvasLayer.new()
	_loading_ui.name = "LoadingUI"
	add_child(_loading_ui)
	
	# Create background panel (simple colored rect)
	var panel = ColorRect.new()
	panel.color = Color(0.1, 0.1, 0.1, 0.9)  # Dark semi-transparent background
	panel.anchors_preset = Control.PRESET_FULL_RECT
	_loading_ui.add_child(panel)
	
	# Create loading label
	_loading_label = Label.new()
	_loading_label.name = "LoadingLabel"
	_loading_label.text = "Loading world..."
	_loading_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_loading_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	_loading_label.anchors_preset = Control.PRESET_FULL_RECT
	_loading_label.add_theme_font_size_override("font_size", 24)
	_loading_ui.add_child(_loading_label)
	
	# Initially visible (world not ready yet)
	_loading_ui.visible = true
	print("[MAIN] Loading screen created and visible")

# Called when world_ready state changes
func _on_world_ready_changed(is_ready: bool) -> void:
	# Loading screen visibility: hide when world_ready is true (all three flags checked in network_client)
	if _loading_ui:
		_loading_ui.visible = not is_ready
		if is_ready:
			print("[MAIN] World is ready - loading screen hidden")
		else:
			print("[MAIN] World not ready - loading screen visible")

# Called when zone changes (from network_client)
func _on_zone_changed(zone_id: int) -> void:
	print("[MAIN] Zone change requested: %d" % zone_id)
	current_zone_id = zone_id
	
	# ZoneManager will handle scene loading
	# We just need to wait for it to load and update world reference

# Called when zone is loaded (from ZoneManager)
func _on_zone_loaded(zone_id: int) -> void:
	print("[MAIN] Zone %d loaded" % zone_id)
	
	# Zone root should already be added to ActiveZone via load_zone() in bridge_on_player_state_update
	# This function is just for logging - world rebinding is handled by _on_zone_world_changed signal

# Called when zone world changes (from ZoneManager)
# This is the single source of truth for world rebinding
func _on_zone_world_changed(new_world: Node) -> void:
	var world_path: String = "null"
	if new_world != null:
		world_path = _safe_get_node_path(new_world)
	print("[MAIN] Zone world changed signal received: world=%s" % world_path)
	
	# Update main's world reference
	world = new_world
	
	# Rebind all world references to the new active world
	if new_world != null:
		print("[MAIN] Rebinding world references for zone world: %s" % world_path)
		# Rebind local player world reference
		print("[MAIN] Checking local_player: exists=", local_player != null, ", is_valid=", is_instance_valid(local_player) if local_player != null else false, ", has_set_world=", local_player.has_method("set_world") if local_player != null else false)
		if local_player and local_player.has_method("set_world"):
			print("[MAIN] About to call local_player.set_world(new_world) for local player")
			local_player.set_world(new_world)
			print("[MAIN] Local player world reference rebound - set_world() call completed")
		
		# Rebind player_input world reference
		# IMPORTANT: Player.set_world() now also binds player_input automatically
		# So we only need to handle edge cases here (when player_input reference isn't set yet)
		if local_player == null:
			push_warning("[MAIN] Cannot rebind player_input: local_player is null")
		elif not is_instance_valid(local_player):
			push_warning("[MAIN] Cannot rebind player_input: local_player is not valid")
		else:
			# Player.set_world() should have already bound player_input, but double-check
			var player_input_node = local_player.player_input
			if player_input_node == null:
				# Fallback: try to find it manually if the reference isn't set yet
				player_input_node = local_player.get_node_or_null("PlayerInput")
				if player_input_node == null:
					player_input_node = local_player.find_child("PlayerInput", true, false)
			
			if player_input_node == null:
				push_warning("[MAIN] Cannot rebind player_input: PlayerInput node not found")
				print("[MAIN] LocalPlayer children: ", local_player.get_children())
			elif not is_instance_valid(player_input_node):
				push_warning("[MAIN] Cannot rebind player_input: PlayerInput node is not valid")
			else:
				# Verify world was bound (Player.set_world should have done this)
				# But if not, bind it now
				var has_world = false
				if "_world" in player_input_node:
					var bound_world = player_input_node._world
					has_world = (bound_world != null and is_instance_valid(bound_world))
				
				if not has_world:
					# World not bound yet - try to bind it
					if player_input_node.has_method("set_world"):
						player_input_node.set_world(new_world)
						world_path = _safe_get_node_path(new_world)
						print("[MAIN] PlayerInput world reference rebound to active zone world: %s" % world_path)
					elif "_world" in player_input_node:
						# Direct property access as fallback
						player_input_node._world = new_world
						world_path = _safe_get_node_path(new_world)
						print("[MAIN] PlayerInput world reference set via property: %s" % world_path)
					else:
						# Script might not be loaded yet - defer as last resort
						print("[MAIN] PlayerInput script not ready yet, deferring set_world() call")
						call_deferred("_deferred_set_player_input_world", player_input_node, new_world)
				else:
					# World already bound by Player.set_world() - just log for confirmation
					world_path = _safe_get_node_path(new_world)
					print("[MAIN] PlayerInput world reference already bound (by Player.set_world()): %s" % world_path)
				
				# Ensure network_client is also bound
				# VERIFICATION LOG: Track network_client injection
				if network_client != null and player_input_node.has_method("set_network_client"):
					var client_id := ""
					player_input_node.set_network_client(network_client)
					print("[MAIN] PlayerInput network_client reference bound")
		
		# Rebind all remote players' world references
		for identity in remote_players.keys():
			var remote_player = remote_players[identity] as Player
			if remote_player and remote_player.has_method("set_world"):
				remote_player.set_world(new_world)
				print("[MAIN] Remote player %s world reference rebound" % identity)
		
		# Set world_scene_ready flag in network_client ONLY if world is valid
		# This ensures we don't set it to false unnecessarily during zone transitions
		if network_client and is_instance_valid(new_world):
			network_client._world_scene_ready = true
			network_client._recompute_world_ready()
			print("[MAIN] World scene ready flag set to TRUE - pathfinding enabled")
	else:
		# World is being unloaded - clear references
		# Only set to false if we're actually unloading (not during a zone transition)
		print("[MAIN] Zone world unloaded - clearing world references")
		# Note: During zone transitions, we don't need to set_world(null) here
		# because the new zone will call set_world(new_world) immediately after.
		# Only clear if this is a final unload (no active zone).
		var is_final_unload = false
		if zone_manager and zone_manager.has_method("get_current_zone_id"):
			var current_zone_id = zone_manager.get_current_zone_id()
			is_final_unload = (current_zone_id == -1)
		
		if is_final_unload:
			# Final unload - clear world references
			if local_player and local_player.has_method("set_world"):
				local_player.set_world(null)
			if local_player and local_player.player_input != null:
				var player_input_node = local_player.player_input
				if player_input_node.has_method("set_world"):
					player_input_node.set_world(null)
		
		# Only clear world_scene_ready flag if we're truly unloading (no active zone)
		# During zone transitions, the old zone unloads (null world), but new zone loads immediately after
		# Don't set to false if there's still an active zone being loaded
		# IMPORTANT: During zone transitions, _current_zone_id is already set to the new zone
		# before _unload_zone() emits zone_world_changed(null), so we can check for active zone
		if network_client:
			# Check if there's an active zone - if not, this is a true unload
			# Reuse is_final_unload from above to avoid duplicate variable
			if is_final_unload:
				# This is a true unload (no zone loading), set to false
				network_client._world_scene_ready = false
				network_client._recompute_world_ready()
				print("[MAIN] World scene ready flag set to FALSE (final unload, no active zone)")
			else:
				# Zone transition in progress - keep world_scene_ready as true (don't reset it)
				# The new zone's load will emit zone_world_changed with new_world and set it to true
				var active_zone_id = zone_manager.get_current_zone_id() if zone_manager and zone_manager.has_method("get_current_zone_id") else -1
				print("[MAIN] World scene ready flag kept as-is (zone transition in progress, active zone=%d, new zone will set it to true)" % active_zone_id)

# Called when zone is unloaded (from ZoneManager)
func _on_zone_unloaded(zone_id: int) -> void:
	print("[MAIN] Zone %d unloaded" % zone_id)
	
	# Clear remote players when zone unloads (they'll be repopulated in new zone)
	_clear_remote_players()
	
	# Clear PathPreview when zone changes (paths are zone-specific)
	var path_preview = get_node_or_null("PathPreview")
	if path_preview and path_preview.has_method("clear_path"):
		path_preview.clear_path()
		print("[MAIN] Cleared PathPreview on zone unload")
	
	# Clear world reference
	# Note: Don't call set_world(null) here during zone transitions
	# The new zone will set the world reference when it loads.
	# Only clear the local reference.
	world = null
	# set_world(null) is handled in _on_zone_world_changed when world becomes null

# Deferred call to set world on PlayerInput (called when script isn't ready yet)
func _deferred_set_player_input_world(player_input_node: Node, new_world: Node) -> void:
	if player_input_node == null or not is_instance_valid(player_input_node):
		push_warning("[MAIN] Deferred set_world failed: PlayerInput node is invalid")
		return
	
	# Check script path to verify it's player_input.gd
	var script = player_input_node.get_script()
	var script_path = ""
	if script != null:
		if script is GDScript:
			script_path = script.resource_path
		else:
			script_path = str(script)
	
	# Verify it's the correct script
	if script_path != "" and not script_path.ends_with("player_input.gd"):
		push_warning("[MAIN] Deferred set_world: PlayerInput has wrong script: %s" % script_path)
		return
	
	# Try multiple approaches to set the world
	# 1. Try has_method() first
	if player_input_node.has_method("set_world"):
		player_input_node.set_world(new_world)
		var world_path = _safe_get_node_path(new_world)
		print("[MAIN] PlayerInput world reference rebound (deferred): %s" % world_path)
		return
	
	# 2. Try setting _world property directly if it exists
	if "_world" in player_input_node:
		player_input_node._world = new_world
		var world_path = _safe_get_node_path(new_world)
		print("[MAIN] PlayerInput _world property set directly (deferred): %s" % world_path)
		return
	
	# 3. If still not ready, check if node is in tree and wait if needed
	if not player_input_node.is_inside_tree():
		print("[MAIN] PlayerInput node not in scene tree yet, waiting...")
		await get_tree().process_frame
	
	# Wait a frame for script to fully initialize
	print("[MAIN] PlayerInput script still not ready, waiting another frame...")
	await get_tree().process_frame
	
	# Try again after waiting
	if player_input_node.has_method("set_world"):
		player_input_node.set_world(new_world)
		var world_path = _safe_get_node_path(new_world)
		print("[MAIN] PlayerInput world reference rebound (deferred after wait): %s" % world_path)
		return
	
	# Try setting _world property directly (bypass method call)
	if "_world" in player_input_node:
		player_input_node._world = new_world
		var world_path = _safe_get_node_path(new_world)
		print("[MAIN] PlayerInput _world property set directly (deferred after wait): %s" % world_path)
		return
	
	# Last resort: try using set() to set the property
	# set() returns void, so we can't check its return value
	# Just try to set it and assume it worked if no error occurs
	if "_world" in player_input_node:
		player_input_node.set("_world", new_world)
		var world_path = _safe_get_node_path(new_world)
		print("[MAIN] PlayerInput _world property set via set() (deferred): %s" % world_path)
		return
	
	# If all else fails, this is likely not critical - the world will be set when PlayerInput's _ready() runs
	# or when it checks ZoneManager on first click. Just log it as info, not a warning.
	print("[MAIN] PlayerInput world binding deferred - will be set when script is ready")
	print("[MAIN] PlayerInput node type: %s, script: %s, script_path: %s, in_tree: %s" % [player_input_node.get_class(), script, script_path, player_input_node.is_inside_tree()])

# Deferred function to apply player state after zone load completes
func _apply_player_state_after_zone_load(tile_pos: Vector2i, facing: Vector2i) -> void:
	# Wait one frame to ensure zone is fully loaded
	await get_tree().process_frame
	
	# Wait for spawn positioning to complete (spawn positioning is also deferred)
	# Give it a moment to ensure ZoneManager has positioned the player at spawn
	await get_tree().process_frame
	await get_tree().process_frame
	
	# Mark that we've received local player state (required for world_ready)
	# This ensures the 'local' flag in READY state is set to true
	if network_client:
		network_client._local_player_state_received = true
		network_client._recompute_world_ready()
		print("[WORLD] Local player state received flag set to TRUE (after zone load)")
	
# Helper function to safely get node path (handles nodes not in scene tree)
func _safe_get_node_path(node: Node) -> String:
	if node == null:
		return "null"
	if not is_instance_valid(node):
		return "<invalid>"
	# Check if node is in scene tree
	if node.is_inside_tree():
		return str(node.get_path())
	else:
		# Node not in tree yet - use name and type instead
		return "<%s:%s> (not in tree)" % [node.get_class(), node.name]

# Clear all remote players (called on zone change)
func _clear_remote_players() -> void:
	print("[MAIN] Clearing %d remote players" % remote_players.size())
	for identity in remote_players.keys():
		var player = remote_players[identity]
		remote_players.erase(identity)
		if is_instance_valid(player):
			player.queue_free()
	print("[MAIN] Remote players cleared")

# Smooth camera following in _process
func _process(delta: float) -> void:
	if _camera_ref and local_player:
		# Smoothly interpolate camera position towards player position
		var target_pos: Vector2 = local_player.global_position
		var current_pos: Vector2 = _camera_ref.global_position
		
		# Use lerp with delta-based smoothing for frame-rate independent interpolation
		var smooth_factor = 1.0 - exp(-CAMERA_SMOOTH_SPEED * delta)
		_camera_ref.global_position = current_pos.lerp(target_pos, smooth_factor)

# Called when a chat message is received
func _on_chat_message_received(id: String, sender_id: String, sender_name: String, text: String, zone_id: int, timestamp: String) -> void:
	print("[CHAT] Message from %s (%s): %s (zone %d)", sender_name, sender_id, text, zone_id)
	# For MVP: just log the message. In future, this would display in a chat UI or overlay
	# Zone filtering logic: could filter messages based on current_zone_id if needed

# Called when a player's display name is updated
func _on_player_display_name_updated(identity: String, display_name: String, is_local: bool) -> void:
	print("[PLAYER] Display name update: %s -> %s (local=%s)", identity, display_name, is_local)

	# Update local player's display name
	if is_local and local_player != null:
		print("[PLAYER] Updating local player display name to: %s", display_name)

	# Update remote player's display name
	if not is_local and identity in remote_players:
		var player = remote_players[identity]
		if player != null and is_instance_valid(player):
			if player.has_method("set_display_name"):
				player.set_display_name(display_name)

# Send a chat message (public API for input handling)
func send_chat_message(text: String) -> void:
	if network_client == null:
		push_error("[MAIN] Cannot send chat: network_client not available")
		return

	network_client.send_chat_message(text)
	print("[MAIN] Sending chat message: %s" % text)

# Set display name (public API for username changes)
func set_display_name(display_name: String) -> void:
	if network_client == null:
		push_error("[MAIN] Cannot set display name: network_client not available")
		return

	network_client.set_display_name(display_name)
	print("[MAIN] Setting display name to: %s" % display_name)
