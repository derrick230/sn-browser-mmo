extends Node

# ZoneManager - Manages zone scene loading/unloading based on PlayerState.zone_id
# This should be added as an autoload singleton in project settings

signal zone_loaded(zone_id: int)
signal zone_unloaded(zone_id: int)
signal zone_world_changed(world: Node)  # Emitted when active World node changes

var _current_zone_id: int = -1
var _current_zone_scene: Node = null
var _current_zone_root: Node = null
var _active_world: Node = null  # Single source of truth for active World node
var _current_tilemap: TileMap = null  # Cached TileMap from current zone scene
var _pending_from_zone_id: int = -1  # Store from_zone_id for spawn positioning after zone loads

# Zone scene path convention: zone_id=1 -> res://scenes/mapdata/Z_0001.tscn
# NOTE: Zone scenes are located in res://scenes/mapdata/ (not res://scenes/zones/)
# NOTE: File names use capital Z (Z_XXXX.tscn) - case-sensitive in Godot
# Supports existing naming pattern: Z_XXXX.tscn
# All zone scenes must follow the standardized structure:
#   World (Node2D, root)
#     TileContainer (Node2D)
#       Ground (TileMapLayer)
#       Walls (TileMapLayer)
#     TransitionContainer (Node2D)
#       Transition_* (TileMapLayer)
#       Spawn_* (TileMapLayer)
#     NPCContainer (Node2D)
#     InteractableContainer (Node2D)
func _zone_scene_path(zone_id: int) -> String:
	return "res://scenes/mapdata/Z_%04d.tscn" % zone_id

# Set the current zone (called when PlayerState.zone_id changes)
func set_zone(zone_id: int) -> void:
	if zone_id == _current_zone_id:
		return
	
	var _old_zone_id = _current_zone_id
	if _current_zone_id != -1:
		_unload_zone(_current_zone_id)
	
	# Set new zone_id BEFORE loading new zone
	# This ensures that during zone transition, has_active_zone checks see the new zone_id
	_current_zone_id = zone_id
	_load_zone(zone_id)

# Public method to load a zone into a specific parent container
# Called by Main.gd when zone_id changes
# from_zone_id: The zone the player is coming from (used to find correct spawn point)
func load_zone(zone_id: int, parent: Node, from_zone_id: int = -1) -> void:
	# Set active world if parent has the method
	if parent != null and parent.has_method("get_active_world") or parent.has_method("set_active_world"):
		# Parent is likely the Main scene coordinator
		set_active_world(parent)
	
	# Load the zone (this will find and cache TileMap)
	set_zone(zone_id)
	
	# Store from_zone_id for spawn positioning (will be used after zone loads)
	_pending_from_zone_id = from_zone_id
	
	# Add zone root to parent if not already added
	if _current_zone_root != null and parent != null:
		if _current_zone_root.get_parent() != parent:
			if _current_zone_root.get_parent() != null:
				_current_zone_root.get_parent().remove_child(_current_zone_root)
			parent.add_child(_current_zone_root)
	
	# Note: Spawn positioning and container wiring will happen in _load_zone after World is initialized

# Set the active world reference (called by World.gd coordinator)
func set_active_world(world_node: Node) -> void:
	if world_node != _active_world:
		# Note: _active_world is set by _load_zone() when zone loads
		# This method is mainly for coordination purposes
		pass

# Get the current zone ID
func get_current_zone_id() -> int:
	return _current_zone_id

# Get the current zone's World node (for player world reference)
# This is the single source of truth for the active World
func get_current_world() -> Node:
	return _active_world

# Get the active world (alias for get_current_world for consistency)
func get_active_world() -> Node:
	return _active_world

# Unload the current zone scene
func _unload_zone(zone_id: int) -> void:
	# Clear TileMap cache
	_current_tilemap = null
	
	# Clear active world reference before freeing scene
	if _active_world != null:
		_active_world = null
		zone_world_changed.emit(null)  # Notify that world is being unloaded
	
	if _current_zone_scene:
		_current_zone_scene.queue_free()
		_current_zone_scene = null
		_current_zone_root = null
	
	zone_unloaded.emit(zone_id)

# Load a zone scene
func _load_zone(zone_id: int) -> void:
	var scene_path := _zone_scene_path(zone_id)
	
	# Load the scene
	var packed := load(scene_path) as PackedScene
	if packed == null:
		push_error("[ZONE MANAGER] Failed to load zone scene: %s" % scene_path)
		return
	
	# Instantiate the scene
	var inst := packed.instantiate()
	if inst == null:
		push_error("[ZONE MANAGER] Failed to instantiate zone scene: %s" % scene_path)
		return
	
	# Add to scene tree (add to Main or root, depending on your scene structure)
	# The caller (Main) will need to add this to the appropriate parent
	_current_zone_scene = inst
	_current_zone_root = inst
	
	# Find World node in the zone scene (depth starts at 0)
	var world := _find_world_node(inst, 0)
	if world == null:
		# Collect available node names for debugging
		var node_paths: Array[String] = []
		_collect_node_names(inst, node_paths, "")
		var node_list := ", ".join(node_paths)
		push_warning("[ZONE MANAGER] Zone %d scene does not contain a World node. Available nodes: %s" % [zone_id, node_list])
		
		# Try to create a World node automatically as a child of the zone root
		# This allows the zone to work even if the scene doesn't have a World node yet
		# Note: The World node will search for Walls layer recursively, so it can find
		# TileMapLayers that are siblings (children of the same zone root)
		var world_script := load("res://scripts/world.gd") as Script
		if world_script != null:
			var world_node := Node2D.new()
			world_node.name = "World"
			world_node.set_script(world_script)
			# Set zone_id property if it exists
			if "zone_id" in world_node:
				world_node.zone_id = zone_id
			# Add World as a child of the zone root
			# Since world.gd uses find_child("Walls", true, false), it will search
			# from the World node, but we need it to search from the zone root.
			# The @onready in world.gd will search from World's parent if needed.
			inst.add_child(world_node)
			world = world_node
		else:
			push_error("[ZONE MANAGER] Failed to load world.gd script - cannot auto-create World node")
			push_warning("[ZONE MANAGER] Zone scene must contain a Node2D with world.gd script (named 'World' or any name with world_to_tile method)")
			push_warning("[ZONE MANAGER] Suggested fix: Add a Node2D child named 'World' with world.gd script attached to the zone scene root")
	else:
		# World node found in scene - ensure zone_id is set correctly
		# Scene files might not have zone_id set, so it defaults to 0
		if "zone_id" in world:
			if world.zone_id != zone_id:
				world.zone_id = zone_id
		else:
			push_warning("[ZONE MANAGER] World node found but doesn't have zone_id property")
	
	# Set active world
	_active_world = world
	if _active_world != null:
		# Double-check zone_id is set correctly
		if "zone_id" in _active_world:
			if _active_world.zone_id != zone_id:
				_active_world.zone_id = zone_id
	else:
		push_error("[ZONE MANAGER] Zone %d loaded but no World node available!" % zone_id)
	
	# Wait one frame so TileMap is ready
	await get_tree().process_frame
	
	# Find and cache TileMap node from the zone scene
	# Search by TYPE (TileMap), not just by name, since zone scenes may name it differently
	if _current_zone_root != null:
		# First try to find by name "TileMap" (preferred)
		var tilemap_node = _current_zone_root.find_child("TileMap", true, false)
		
		# If not found by name, search by type
		if tilemap_node == null or not tilemap_node is TileMap:
			tilemap_node = _find_tilemap_by_type(_current_zone_root)
		
		if tilemap_node != null and tilemap_node is TileMap:
			_current_tilemap = tilemap_node as TileMap
		else:
			_current_tilemap = null
	else:
		_current_tilemap = null
	
	# Bind PlayerInput world reference (ZoneManager owns binding responsibility)
	# CRITICAL: Wait for World to be fully initialized before binding
	if _active_world != null:
		# Ensure World is in the scene tree (should be, but verify)
		if not _active_world.is_inside_tree():
			await get_tree().process_frame
		
		# Wait for World initialization if not already initialized
		# Also verify World is actually ready by checking if _ready() has run (is_initialized might be stale from scene file)
		var world_actually_ready = false
		if "is_initialized" in _active_world:
			world_actually_ready = _active_world.is_initialized
			# Double-check: if is_initialized is true, verify World has actually initialized (has bounds or blocked tiles)
			if world_actually_ready:
				if "_has_bounds" in _active_world:
					world_actually_ready = _active_world._has_bounds
				elif "_blocked_tiles" in _active_world:
					world_actually_ready = not _active_world._blocked_tiles.is_empty()
		
		if not world_actually_ready:
			await _active_world.initialized
		
		# Now bind PlayerInput (World is guaranteed to be initialized)
		var player_input := get_node_or_null("/root/Main/LocalPlayer/PlayerInput")
		if player_input != null:
			# Bind world reference
			if player_input.has_method("set_world"):
				player_input.set_world(_active_world)
			else:
				push_warning("[ZONE MANAGER] PlayerInput found but missing set_world() method")
			
			# Bind network_client reference (if available and not already set)
			var network_client := get_node_or_null("/root/network_client")
			if network_client != null and player_input.has_method("set_network_client"):
				player_input.set_network_client(network_client)
	
	# Emit zone_world_changed signal AFTER waiting for TileMap to be ready
	# This ensures the World node is fully initialized before rebinding
	if _active_world != null:
		zone_world_changed.emit(_active_world)
	else:
		zone_world_changed.emit(null)
	
	zone_loaded.emit(zone_id)
	
	# Wire up zone containers
	_wire_zone_containers(_current_zone_root)
	
	# Position player at spawn point (after World is initialized and zone_loaded signal emitted)
	# Wait one frame to ensure everything is in scene tree, then position player
	await get_tree().process_frame
	_position_player_at_spawn(_current_zone_root, _pending_from_zone_id)
	
	# Clear pending from_zone_id
	_pending_from_zone_id = -1


# Recursively find TileMap node by type in scene tree
func _find_tilemap_by_type(node: Node, depth: int = 0) -> Node:
	if node == null:
		return null
	
	# Safety: prevent infinite recursion
	const MAX_DEPTH := 20
	if depth > MAX_DEPTH:
		return null
	
	# Check if current node is a TileMap
	if node is TileMap:
		return node as TileMap
	
	# Recursively search children
	for child in node.get_children():
		var found := _find_tilemap_by_type(child, depth + 1)
		if found != null:
			return found
	
	return null

# Recursively find World node in scene tree
# Prefers nodes with find_path method (required by player_input), or named "World"
# Excludes TileMap and TileMapLayer nodes to avoid selecting collision layers
func _find_world_node(node: Node, depth: int = 0) -> Node:
	if node == null:
		return null
	
	# Safety: prevent infinite recursion (scene trees shouldn't be deeper than 20 levels)
	const MAX_DEPTH := 20
	if depth > MAX_DEPTH:
		push_error("[ZONE MANAGER] _find_world_node hit max depth %d - scene tree may be corrupted" % MAX_DEPTH)
		return null
	
	# Exclude TileMap and TileMapLayer nodes - these are NOT the World node
	if node is TileMap or node is TileMapLayer:
		# Don't search inside TileMap/TileMapLayer - skip to children
		pass
	else:
		# Check if this node is the World:
		# 1. Must have find_path method (primary check - required by player_input)
		# 2. OR named "World" AND has world_to_tile method
		var has_find_path := node.has_method("find_path")
		var is_named_world := (node.name == "World")
		var has_world_to_tile := node.has_method("world_to_tile")
		
		if has_find_path:
			# Primary check: has find_path method (required by player_input)
			return node
		elif is_named_world and has_world_to_tile:
			# Secondary check: named "World" and has world_to_tile
			return node
	
	# Recursively search children
	for child in node.get_children():
		var found := _find_world_node(child, depth + 1)
		if found != null:
			return found
	
	# Return null if not found (warning is handled at call site)
	return null

# Helper to collect node names for debugging
func _collect_node_names(node: Node, paths: Array[String], prefix: String) -> void:
	if node == null:
		return
	
	var full_path: String
	if prefix != "":
		full_path = prefix + "/" + node.name
	else:
		full_path = node.name
	paths.append(full_path)
	
	for child in node.get_children():
		_collect_node_names(child, paths, full_path)

# Get the zone scene root node (for adding to Main)
func get_zone_root() -> Node:
	return _current_zone_root

# Get entities root for spawning remote players
# Returns the World node if available, otherwise the zone root
func get_entities_root() -> Node:
	var world_node = get_current_world()
	if world_node != null:
		return world_node
	return _current_zone_root

# Get the cached TileMap from current zone
func get_tilemap() -> TileMap:
	return _current_tilemap

# Convert tile coordinates to world position
# Uses the cached TileMap if available, otherwise falls back to World node's tile_to_world
func tile_to_world(tile: Vector2i) -> Vector2:
	# Check if TileMap is available and has a valid TileSet
	if _current_tilemap != null and is_instance_valid(_current_tilemap):
		# CRITICAL: Check if TileMap has a TileSet before using map_to_local
		# map_to_local requires a TileSet and will error if it's null
		var tileset = _current_tilemap.tile_set
		if tileset != null:
			return _current_tilemap.map_to_local(tile)
		else:
			# TileMap exists but has no TileSet - fall through to World node fallback
			pass
	
	# Fallback to World node if TileMap is not available or has no TileSet
	if _active_world != null and is_instance_valid(_active_world) and _active_world.has_method("tile_to_world"):
		return _active_world.tile_to_world(tile)
	
	# Final fallback: use default tile size (16px per tile)
	# Only log warning if we've tried everything else (avoid spam)
	if _current_tilemap != null:
		# TileMap exists but has no TileSet
		if _current_tilemap.tile_set == null:
			# This is a one-time warning, not spam
			if not has_meta("_warned_no_tileset"):
				push_warning("[ZONE MANAGER] tile_to_world: TileMap has no TileSet, using default TILE_SIZE=16")
				set_meta("_warned_no_tileset", true)
	else:
		# No TileMap at all - this is expected during zone loading
		pass
	
	return Vector2(tile.x * 16, tile.y * 16)

# Convert world position to tile coordinates
# Uses the cached TileMap if available, otherwise falls back to World node's world_to_tile
func world_to_tile(pos: Vector2) -> Vector2i:
	# Check if TileMap is available and has a valid TileSet
	if _current_tilemap != null and is_instance_valid(_current_tilemap):
		# CRITICAL: Check if TileMap has a TileSet before using local_to_map
		# local_to_map requires a TileSet and will error if it's null
		var tileset = _current_tilemap.tile_set
		if tileset != null:
			return _current_tilemap.local_to_map(pos)
		else:
			# TileMap exists but has no TileSet - fall through to World node fallback
			pass
	
	# Fallback to World node if TileMap is not available or has no TileSet
	if _active_world != null and is_instance_valid(_active_world) and _active_world.has_method("world_to_tile"):
		return _active_world.world_to_tile(pos)
	
	# Final fallback: use default tile size (16px per tile)
	# Only log warning if we've tried everything else (avoid spam)
	if _current_tilemap != null:
		# TileMap exists but has no TileSet
		if _current_tilemap.tile_set == null:
			# This is a one-time warning, not spam
			if not has_meta("_warned_no_tileset_wto"):
				push_warning("[ZONE MANAGER] world_to_tile: TileMap has no TileSet, using default TILE_SIZE=16")
				set_meta("_warned_no_tileset_wto", true)
	
	var tile_x = int(floor(pos.x / 16))
	var tile_y = int(floor(pos.y / 16))
	return Vector2i(tile_x, tile_y)

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

# Position the local player at the correct spawn point in the zone
# Uses TransitionContainer/Spawn_* layers to find the spawn point
# This is an async function to allow waiting for player initialization
func _position_player_at_spawn(zone_root: Node, from_zone_id: int) -> void:
	if zone_root == null:
		return
	
	# Locate TransitionContainer
	var transition_container := zone_root.get_node_or_null("TransitionContainer")
	if transition_container == null:
		return
	
	# Choose the spawn layer:
	# 1. Prefer a layer named "Spawn_<from_zone_id>_*" if from_zone_id >= 0
	# 2. Otherwise, use the first layer whose name starts with "Spawn_"
	var spawn_layer: TileMapLayer = null
	if from_zone_id >= 0:
		for child in transition_container.get_children():
			if child is TileMapLayer and child.name.begins_with("Spawn_%d_" % from_zone_id):
				spawn_layer = child
				break
	
	if spawn_layer == null:
		for child in transition_container.get_children():
			if child is TileMapLayer and child.name.begins_with("Spawn_"):
				spawn_layer = child
				break
	
	if spawn_layer == null:
		push_warning("[ZONE MANAGER] No spawn layer found in TransitionContainer")
		return
	
	# Get any used cell in the spawn layer as the player spawn tile
	var used_cells := spawn_layer.get_used_cells()
	if used_cells.is_empty():
		push_warning("[ZONE MANAGER] Spawn layer '%s' has no tiles" % spawn_layer.name)
		return
	
	# Use the first used cell as the spawn point
	var tile_coords = used_cells[0]
	
	# Convert tile coordinates to world position using ZoneManager's tile_to_world
	# This ensures consistent coordinate conversion with the rest of the system
	var world_pos: Vector2 = tile_to_world(tile_coords)
	
	# Find the local player - try multiple paths
	var local_player: Node = null
	var current_scene = get_tree().get_current_scene()
	if current_scene != null:
		# Try direct child of Main
		local_player = current_scene.get_node_or_null("LocalPlayer")
		if local_player == null:
			# Try Main/LocalPlayer
			local_player = current_scene.get_node_or_null("Main/LocalPlayer")
		if local_player == null:
			# Try finding by searching
			local_player = current_scene.find_child("LocalPlayer", true, false)
	
	if local_player == null:
		push_warning("[ZONE MANAGER] LocalPlayer not found - could not position at spawn")
		return
	
	# Set both tile_pos and global_position to ensure player is positioned correctly
	# The player's apply_state will handle the sprite offset, but we need to set tile_pos
	# so that future apply_state calls use the correct tile
	if "tile_pos" in local_player:
		local_player.tile_pos = tile_coords
	
	# Wait for player to be fully ready (especially if it was just instantiated)
	# Ensure player's _ready() has been called and animated_sprite is initialized
	if not local_player.is_inside_tree():
		await get_tree().process_frame
		await get_tree().process_frame  # Give it extra time to initialize
	
	# Set global position (player's apply_state will add SPRITE_OFFSET, but this ensures immediate positioning)
	# If player has apply_state method, use it instead for consistency
	var tile_vec: Vector2i = Vector2i(tile_coords.x, tile_coords.y)
	if local_player.has_method("apply_state"):
		# Get current facing or use default
		var facing = local_player.facing if "facing" in local_player else Vector2i.DOWN
		local_player.apply_state(tile_vec, facing, false)
		
		# CRITICAL: Also update player_input's current tile state so it knows where the player is
		# This prevents invalid movement intents from being sent after spawn positioning
		if local_player.get("player_input") != null and local_player.player_input.has_method("apply_server_state"):
			local_player.player_input.apply_server_state(tile_vec, facing)
			print("[ZONE MANAGER] Updated player_input current tile to spawn position: %s" % tile_vec)
	else:
		# Fallback: set global_position directly (player will add offset in _process)
		local_player.global_position = world_pos
	
	# Verify player is visible and ensure sprite is shown
	if local_player.has_method("is_visible") and not local_player.is_visible():
		local_player.show()
	if "modulate" in local_player and local_player.modulate.a < 1.0:
		local_player.modulate = Color(1, 1, 1, 1)
	
	# Ensure player sprite/animation is playing - comprehensive check
	var sprite: AnimatedSprite2D = null
	if "animated_sprite" in local_player:
		sprite = local_player.animated_sprite
	elif local_player.has_node("AnimatedSprite2D"):
		sprite = local_player.get_node("AnimatedSprite2D") as AnimatedSprite2D
	
	if sprite != null:
		# Verify sprite frames are loaded
		var has_frames = sprite.sprite_frames != null
		
		if not has_frames:
			push_error("[ZONE MANAGER] CRITICAL: Player sprite has no SpriteFrames resource! Sprite will not render!")
			return
		
		# Force sprite to be visible and playing
		sprite.show()
		if not sprite.is_playing():
			sprite.play()
		# Ensure animation is set (fallback to idle_down if not set)
		var current_anim: String = sprite.animation
		if current_anim.is_empty() or not sprite.sprite_frames.has_animation(current_anim):
			if sprite.sprite_frames.has_animation("idle_down"):
				sprite.animation = "idle_down"
				sprite.play()
		
		# Check sprite modulate and z-index
		if sprite.modulate.a < 1.0:
			sprite.modulate = Color(1, 1, 1, 1)
		if sprite.z_index < 1:
			sprite.z_index = 1
		
		# Force play animation if player has _play_anim method
		if local_player.has_method("_play_anim"):
			local_player._play_anim(false)  # false = idle animation
		
		# Double-check sprite is actually playing after all setup
		await get_tree().process_frame
		if not sprite.is_playing():
			push_warning("[ZONE MANAGER] Sprite still not playing after setup - forcing play()")
			if sprite.sprite_frames.has_animation(sprite.animation):
				sprite.play(sprite.animation)
			elif sprite.sprite_frames.has_animation("idle_down"):
				sprite.animation = "idle_down"
				sprite.play()
	else:
		push_warning("[ZONE MANAGER] Could not find AnimatedSprite2D node in player!")
		# Try to find it by searching
		var found_sprite = local_player.find_child("AnimatedSprite2D", true, false)
		if found_sprite != null:
			found_sprite.show()
			if found_sprite.has_method("play"):
				found_sprite.play()
	
	# Ensure player is in scene tree and properly parented
	if not local_player.is_inside_tree():
		push_warning("[ZONE MANAGER] Player is not in scene tree! Attempting to add to Main scene...")
		var main_scene = get_tree().get_current_scene()
		if main_scene != null:
			main_scene.add_child(local_player)
	
	# Force update player visual state
	if local_player.has_method("_process") or local_player.has_method("_ready"):
		# Ensure player processes this frame
		local_player.set_process(true)
		local_player.set_physics_process(true)
	
	# Ensure camera follows player (if camera exists)
	var camera = get_tree().get_first_node_in_group("camera") if get_tree() != null else null
	if camera == null:
		# Try to find camera in Main scene
		var main_scene = get_tree().get_current_scene() if get_tree() != null else null
		if main_scene != null:
			camera = main_scene.find_child("Camera2D", true, false)
	
	if camera != null:
		camera.global_position = local_player.global_position
	else:
		push_warning("[ZONE MANAGER] Camera not found - player might be off-screen")
	
	# Ensure player z-index is correct (should be above tiles)
	if "z_index" in local_player and local_player.z_index < 1:
		local_player.z_index = 1

# Wire up zone containers to expose references to other systems if needed
func _wire_zone_containers(zone_root: Node) -> void:
	if zone_root == null:
		return
	
	var tile_container := zone_root.get_node_or_null("TileContainer")
	var transition_container := zone_root.get_node_or_null("TransitionContainer")
	var npc_container := zone_root.get_node_or_null("NPCContainer")
	var interactable_container := zone_root.get_node_or_null("InteractableContainer")
	
	# Example: if World.gd has fields for these, assign them
	# For now, we'll just log - systems can access containers via ZoneManager if needed
	if _active_world != null:
		if _active_world.has_method("set_zone_containers"):
			_active_world.call(
				"set_zone_containers",
				tile_container,
				transition_container,
				npc_container,
				interactable_container
			)
