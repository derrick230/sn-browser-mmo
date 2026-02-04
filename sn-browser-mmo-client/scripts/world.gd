extends Node2D

signal initialized(world)

# Tile size in pixels (adjust as needed for your tileset)
const TILE_SIZE = 16

# Zone identifier for this world/map. For now, default to 0.
# This lets us scale to multi-zone worlds later.
@export var zone_id: int = 0

@onready var npc_container: Node2D = $NPCContainer
@onready var interactable_container: Node2D = $InteractableContainer

var npc_scene: PackedScene = preload("res://scenes/npc.tscn")
var interactable_scene: PackedScene = preload("res://scenes/interactable.tscn")

var npcs_by_spawn_id: Dictionary = {}
var interactables_by_spawn_id: Dictionary = {}

# Readiness flag: true when World has finished initialization (Walls found, collision cached, bounds computed)
var is_initialized: bool = false

# Cached blocked tiles for this zone, in tile coordinates.
# Keys are Vector2i (tile_x, tile_y), values are 'true'.
var _blocked_tiles: Dictionary = {}

# Map bounds computed from walls layer (walkable area)
var _bounds: Rect2i = Rect2i(Vector2i.ZERO, Vector2i.ZERO)
var _has_bounds := false

# Optional reference to the collision TileMapLayer named "Walls".
@onready var _walls_layer: TileMapLayer = find_child("Walls", true, false) as TileMapLayer

func _ready():
	var scene_file := ""
	if get_tree().current_scene != null:
		scene_file = get_tree().current_scene.scene_file_path
	print("[WORLD] _ready() fired: zone_id=%d, node_path=%s, scene_file=%s" % [zone_id, get_path(), scene_file])
	
	# CRITICAL: Reset initialization flag (in case World node was saved with is_initialized=true in scene file)
	is_initialized = false
	
	# Defer heavy initialization to ensure node is fully in tree and TileMap children exist
	call_deferred("_initialize")

func _initialize() -> void:
	print("[WORLD] _initialize() started: zone_id=%d" % zone_id)
	
	# Wait one frame to ensure TileMap and children are fully ready
	await get_tree().process_frame
	
	# NOTE: With the new standardized zone structure, TileSets are assigned directly in scene files
	# _setup_zone_tilesets() is no longer needed but kept for backwards compatibility
	# _setup_zone_tilesets()
	
	# Find TileMapLayer named "Walls" - use recursive search to find nested layers
	# @onready handles the initial find, but we still need fallback for backwards compatibility
	if _walls_layer == null:
		# Fallback: try direct children for backwards compatibility
		var all_layers: Array[String] = []
		for child in get_children():
			if child is TileMapLayer:
				all_layers.append(child.name)
				if child.name == "Walls":  # EXACT match required
					_walls_layer = child
					break
	
	# If still not found, search from parent (zone root) - handles case where World and Walls are siblings
	if _walls_layer == null and get_parent() != null:
		_walls_layer = get_parent().find_child("Walls", true, false) as TileMapLayer
		if _walls_layer != null:
			print("[WORLD] Found Walls layer in parent (zone root) - World and Walls are siblings")
	
	var walls_found := false
	if _walls_layer == null:
		# Collect available node names for debugging
		var all_layers: Array[String] = []
		# Check children
		for child in get_children():
			if child is TileMapLayer:
				all_layers.append(child.name)
		# Check parent's children if parent exists
		if get_parent() != null:
			for child in get_parent().get_children():
				if child is TileMapLayer:
					all_layers.append(child.name)
		
		push_error("[WORLD] No TileMapLayer named 'Walls' found (recursive search). Collision will be empty for this zone.")
		print("[WORLD] Available TileMapLayer names: ", all_layers)
		print("[WORLD] Please ensure a TileMapLayer is named exactly 'Walls' (case-sensitive)")
		# Still mark initialized with safe defaults to avoid deadlock
		_compute_bounds_from_walls()  # Will use fallback bounds
		is_initialized = true
		initialized.emit(self)
		print("[WORLD] _initialize() completed (Walls NOT found, using safe defaults): zone_id=%d" % zone_id)
		return
	
	# Validate it's actually a TileMapLayer (should never fail, but defensive check)
	if not _walls_layer is TileMapLayer:
		push_error("[WORLD] 'Walls' node found but is not a TileMapLayer! Type: ", _walls_layer.get_class())
		# Still mark initialized with safe defaults
		_compute_bounds_from_walls()
		is_initialized = true
		initialized.emit(self)
		print("[WORLD] _initialize() completed (Walls invalid type, using safe defaults): zone_id=%d" % zone_id)
		return
	
	walls_found = true
	
	# Basic debug info
	print("[WORLD] Found collision layer 'Walls' (zone_id=%d)" % zone_id)
	print("  - Enabled: ", _walls_layer.enabled)
	print("  - Visible: ", _walls_layer.visible)
	print("  - Type confirmed: TileMapLayer")
	
	# Populate blocked tile cache from the 'Walls' layer
	_blocked_tiles.clear()
	var used_cells = _walls_layer.get_used_cells()
	var cell_count = used_cells.size()
	print("  - Walls tile count: ", cell_count)
	
	# Validation: warn if collision count is suspiciously low
	if cell_count == 0:
		push_warning("[WORLD] WARNING: zone_id=%d has 0 blocked tiles! Collision may be missing or layer is empty." % zone_id)
	elif cell_count < 5:
		push_warning("[WORLD] WARNING: zone_id=%d has only %d blocked tiles - this seems suspiciously low for a collision layer." % [zone_id, cell_count])
	
	for cell in used_cells:
		# cell is already in tile coordinates (Vector2i)
		_blocked_tiles[cell] = true
	
	print("[WORLD] Cached %d blocked tiles for zone_id=%d" % [_blocked_tiles.size(), zone_id])
	
	# Compute map bounds from walls layer
	_compute_bounds_from_walls()
	
	# Optional: In debug builds, validate collision against exported JSON
	# This helps catch mismatches between TileMap and exported collision data
	if OS.is_debug_build():
		_validate_collision_against_json()
	
	# Mark as initialized and emit signal
	is_initialized = true
	initialized.emit(self)
	print("[WORLD] _initialize() completed (Walls found=%s): zone_id=%d, blocked_tiles=%d, bounds=%s" % [walls_found, zone_id, _blocked_tiles.size(), _bounds])
	
	# Collision upload DISABLED: Server is now authoritative for collision.
	# Collision is loaded from data/collision.json at server startup.
	# Client uses local collision only for A* pathfinding and QoL.
	# call_deferred("_export_collision_to_server")

# Converts tile coordinates to world positions.
# Server is authoritative over tile positions.
# Returns the top-left corner of the tile in world space
func tile_to_world(tile: Vector2i) -> Vector2:
	# Convert tile coordinates to world position (top-left corner of tile)
	return Vector2(tile.x * TILE_SIZE, tile.y * TILE_SIZE)

# Convert world position to tile coordinates
# Uses floor division to match tile_to_world which places tiles at (tile * TILE_SIZE)
func world_to_tile(world_pos: Vector2) -> Vector2i:
	# Floor division to ensure consistent conversion
	# Positive coordinates: floor division works correctly
	# Negative coordinates: floor division handles correctly in Godot
	var tile_x = int(floor(world_pos.x / TILE_SIZE))
	var tile_y = int(floor(world_pos.y / TILE_SIZE))
	return Vector2i(tile_x, tile_y)

# Compute map bounds from walls layer (walkable area with padding)
func _compute_bounds_from_walls() -> void:
	if _walls_layer == null:
		# Fallback bounds if no walls layer
		_bounds = Rect2i(Vector2i(-32, -32), Vector2i(64, 64))
		_has_bounds = true
		return
	
	var used := _walls_layer.get_used_cells()
	if used.is_empty():
		# Fallback bounds if walls layer is empty
		_bounds = Rect2i(Vector2i(-32, -32), Vector2i(64, 64))
		_has_bounds = true
		return
	
	# Find min/max coordinates from used cells
	var minx: int = used[0].x
	var maxx: int = used[0].x
	var miny: int = used[0].y
	var maxy: int = used[0].y
	
	for c in used:
		minx = min(minx, c.x)
		maxx = max(maxx, c.x)
		miny = min(miny, c.y)
		maxy = max(maxy, c.y)
	
	# Add generous padding so bounds cover playable area, not just walls
	var pad: int = 32
	minx -= pad
	miny -= pad
	maxx += pad
	maxy += pad
	
	_bounds = Rect2i(Vector2i(minx, miny), Vector2i(maxx - minx + 1, maxy - miny + 1))
	_has_bounds = true
	print("[WORLD] Bounds computed: ", _bounds, " (zone_id=%d)" % zone_id)

# Check if a tile is within map bounds
func is_in_bounds(tile: Vector2i) -> bool:
	if not _has_bounds:
		return true  # If bounds not computed, allow all (backwards compatibility)
	return _bounds.has_point(tile)

# Check if a tile is blocked (for client-side pathfinding/debugging)
# Out-of-bounds tiles are treated as blocked to prevent infinite exploration
func is_tile_blocked(tile: Vector2i) -> bool:
	# Out-of-bounds tiles are blocked
	if _has_bounds and not _bounds.has_point(tile):
		return true
	return _blocked_tiles.has(tile)

# Find path from start to destination using A* algorithm
# Returns Array[Vector2i] containing path tiles (including start and dest), or empty array if no path
func find_path(start: Vector2i, dest: Vector2i) -> Array[Vector2i]:
	# Validate input
	if not is_in_bounds(start) or not is_in_bounds(dest):
		return []
	
	if is_tile_blocked(start) or is_tile_blocked(dest):
		return []
	
	if start == dest:
		return [start]
	
	# A* pathfinding implementation
	const INF := 999999.0  # Large number for "infinity"
	var open_set: Array[Vector2i] = []  # Simple array - we'll search for min each time
	var closed_set: Dictionary = {}  # tile -> bool
	var g_score: Dictionary = {}  # tile -> cost from start
	var f_score: Dictionary = {}  # tile -> estimated total cost
	var came_from: Dictionary = {}  # tile -> previous tile
	
	# Initialize starting node
	g_score[start] = 0.0
	f_score[start] = _heuristic(start, dest)
	open_set.append(start)
	
	# 8-directional movement (including diagonals)
	var directions := [
		Vector2i(0, -1),   # Up
		Vector2i(0, 1),    # Down
		Vector2i(-1, 0),   # Left
		Vector2i(1, 0),    # Right
		Vector2i(-1, -1),  # Up-Left
		Vector2i(1, -1),   # Up-Right
		Vector2i(-1, 1),   # Down-Left
		Vector2i(1, 1),    # Down-Right
	]
	
	# Main A* loop
	while not open_set.is_empty():
		# Find node in open_set with lowest f_score
		var current_idx := 0
		var current_tile: Vector2i = open_set[0]
		var current_f: float = f_score.get(current_tile, INF) as float
		
		for i in range(1, open_set.size()):
			var tile: Vector2i = open_set[i]
			var f: float = f_score.get(tile, INF) as float
			if f < current_f:
				current_f = f
				current_tile = tile
				current_idx = i
		
		# Remove current from open_set and add to closed_set
		open_set.remove_at(current_idx)
		closed_set[current_tile] = true
		
		# Check if we reached the destination
		if current_tile == dest:
			# Reconstruct path backwards
			var path: Array[Vector2i] = [dest]
			var path_tile := dest
			while path_tile in came_from:
				path_tile = came_from[path_tile]
				path.insert(0, path_tile)
			return path
		
		# Explore neighbors
		for dir in directions:
			var neighbor: Vector2i = current_tile + dir
			
			# Skip if already in closed set
			if neighbor in closed_set:
				continue
			
			# Skip if blocked or out of bounds
			if is_tile_blocked(neighbor):
				continue
			
			# Skip diagonal moves that would cut through blocked tiles
			if dir.x != 0 and dir.y != 0:
				# Diagonal move - check adjacent tiles aren't both blocked
				var adj1 := Vector2i(current_tile.x + dir.x, current_tile.y)
				var adj2 := Vector2i(current_tile.x, current_tile.y + dir.y)
				if is_tile_blocked(adj1) and is_tile_blocked(adj2):
					continue
			
			# Calculate tentative g_score (diagonal moves cost more)
			var move_cost: float = 1.0 if (dir.x == 0 or dir.y == 0) else 1.414  # sqrt(2) for diagonal
			var current_g: float = g_score.get(current_tile, INF) as float
			var tentative_g: float = current_g + move_cost
			
			# Check if this is a better path to neighbor
			var neighbor_g: float = g_score.get(neighbor, INF) as float
			if tentative_g < neighbor_g:
				# This path to neighbor is better
				came_from[neighbor] = current_tile
				g_score[neighbor] = tentative_g
				f_score[neighbor] = tentative_g + _heuristic(neighbor, dest)
				
				# Add to open_set if not already there
				if neighbor not in open_set:
					open_set.append(neighbor)
	
	# No path found
	return []

# Heuristic function for A* (Manhattan distance with diagonal support)
func _heuristic(a: Vector2i, b: Vector2i) -> float:
	var dx: int = abs(a.x - b.x)
	var dy: int = abs(a.y - b.y)
	# Use diagonal distance heuristic (more accurate for 8-directional movement)
	return float(max(dx, dy)) + (1.414 - 1.0) * float(min(dx, dy))

# Debug function: print first 10 blocked tiles to verify they were detected
func debug_draw_blocked_tiles() -> void:
	if _blocked_tiles.is_empty():
		print("[WORLD DEBUG] No blocked tiles cached for zone_id=%d" % zone_id)
		return
	
	var tiles: Array[Vector2i] = []
	tiles.resize(_blocked_tiles.size())
	var i := 0
	for key in _blocked_tiles.keys():
		tiles[i] = key
		i += 1
	
	var sample_size = min(10, tiles.size())
	print("[WORLD DEBUG] First %d blocked tiles for zone_id=%d:" % [sample_size, zone_id])
	for j in range(sample_size):
		print("  - Tile (%d, %d)" % [tiles[j].x, tiles[j].y])

# Returns a copy of currently cached blocked tiles for this world/zone
# Future-proof hook for exporting collision to the server
func get_blocked_tiles() -> Array[Vector2i]:
	var result: Array[Vector2i] = []
	result.resize(_blocked_tiles.size())
	
	var i := 0
	for key in _blocked_tiles.keys():
		result[i] = key
		i += 1
	return result

# ---------------------------------------------------------------------------
# NPC / Interactable spawn (Dictionary from TS later)
# ---------------------------------------------------------------------------
# Helper: read tile coords from data (supports snake_case and camelCase from JS).
func _data_tile(data: Dictionary) -> Vector2i:
	var x = data.get("tile_x", null)
	if x == null:
		x = data.get("tileX", 0)
	var y = data.get("tile_y", null)
	if y == null:
		y = data.get("tileY", 0)
	return Vector2i(int(x), int(y))

func spawn_npc_from_db(data: Dictionary) -> void:
	# Expected keys: npc_spawn_id, npc_def_id, zone_id, tile_x/tileX, tile_y/tileY, facing, name, sprite_id, default_dialogue_key
	var spawn_id: int = data.get("npc_spawn_id", data.get("npcSpawnId", -1))
	if spawn_id == -1:
		push_warning("spawn_npc_from_db: missing npc_spawn_id")
		return

	var tile_pos: Vector2i = _data_tile(data)
	var world_pos: Vector2 = tile_to_world(tile_pos)

	var npc: Node2D
	if npcs_by_spawn_id.has(spawn_id):
		npc = npcs_by_spawn_id[spawn_id]
	else:
		npc = npc_scene.instantiate()
		npcs_by_spawn_id[spawn_id] = npc
		# Assign identity/metadata before adding to scene
		npc.npc_spawn_id = spawn_id
		npc.npc_zone_id = data.get("zone_id", data.get("zoneId", 0))
		npc.npc_def_id = data.get("npc_def_id", data.get("npcDefId", 0))
		npc.npc_name = data.get("name", data.get("display_name", ""))
		npc.facing = data.get("facing", 0)
		npc.sprite_id = data.get("sprite_id", "")
		npc.behavior_key = data.get("behavior_key", "")
		npc.default_dialogue_key = data.get("default_dialogue_key", "")
		if npc.has_method("set_sprite_from_id"):
			npc.set_sprite_from_id(npc.sprite_id)
		npc_container.add_child(npc)

	# CRITICAL: always position the visual node explicitly (reuse or new)
	npc.global_position = world_pos
	# Safety: catch missing tile→world assignment (sprite stuck at origin when tile was non-zero)
	assert(
		tile_pos == Vector2i.ZERO || npc.global_position != Vector2.ZERO,
		"NPC visual at (0,0) — missing tile→world assignment for spawn_id=%d tile=%s" % [spawn_id, tile_pos]
	)


func despawn_npc_by_spawn_id(spawn_id: int) -> void:
	if not npcs_by_spawn_id.has(spawn_id):
		return
	var node: Node = npcs_by_spawn_id[spawn_id]
	npcs_by_spawn_id.erase(spawn_id)
	if is_instance_valid(node):
		node.queue_free()


func spawn_interactable_from_db(data: Dictionary) -> void:
	# Expected keys: interactable_spawn_id, interactable_def_id, zone_id, tile_x/tileX, tile_y/tileY, display_name, sprite_id, default_dialogue_key, behavior_key
	var spawn_id: int = data.get("interactable_spawn_id", data.get("interactableSpawnId", -1))
	if spawn_id == -1:
		push_warning("spawn_interactable_from_db: missing interactable_spawn_id")
		return

	var tile_pos: Vector2i = _data_tile(data)
	var world_pos: Vector2 = tile_to_world(tile_pos)

	var node: Node2D
	if interactables_by_spawn_id.has(spawn_id):
		node = interactables_by_spawn_id[spawn_id]
	else:
		node = interactable_scene.instantiate()
		interactables_by_spawn_id[spawn_id] = node
		# Assign metadata before adding to scene
		node.interactable_spawn_id = spawn_id
		node.interactable_zone_id = data.get("zone_id", data.get("zoneId", 0))
		node.interactable_def_id = data.get("interactable_def_id", data.get("interactableDefId", 0))
		node.interactable_name = data.get("display_name", data.get("name", ""))
		node.sprite_id = data.get("sprite_id", "")
		node.behavior_key = data.get("behavior_key", "")
		node.default_dialogue_key = data.get("default_dialogue_key", "")
		if node.has_method("setup_from_def"):
			node.setup_from_def(node.interactable_name, node.sprite_id)
		interactable_container.add_child(node)

	# CRITICAL: always position the visual node explicitly (reuse or new)
	node.global_position = world_pos
	assert(
		tile_pos == Vector2i.ZERO || node.global_position != Vector2.ZERO,
		"Interactable visual at (0,0) — missing tile→world assignment for spawn_id=%d tile=%s" % [spawn_id, tile_pos]
	)


func despawn_interactable_by_spawn_id(spawn_id: int) -> void:
	if not interactables_by_spawn_id.has(spawn_id):
		return
	var node: Node = interactables_by_spawn_id[spawn_id]
	interactables_by_spawn_id.erase(spawn_id)
	if is_instance_valid(node):
		node.queue_free()


func debug_spawn_test_npc() -> void:
	var data := {
		"npc_spawn_id": 1,
		"npc_def_id": 1,
		"zone_id": 1,
		"tile_x": 5,
		"tile_y": 5,
		"facing": 2,
		"name": "Test NPC",
		"sprite_id": "npc_placeholder"
	}
	spawn_npc_from_db(data)


func debug_spawn_test_interactable() -> void:
	var data := {
		"interactable_spawn_id": 1,
		"interactable_def_id": 1,
		"zone_id": 1,
		"tile_x": 7,
		"tile_y": 5,
		"display_name": "Test Sign",
		"sprite_id": "sign_placeholder",
		"default_dialogue_key": "tut_sign_1"
	}
	spawn_interactable_from_db(data)

# Optional validation: Compare TileMap collision with exported JSON
# Only runs in debug builds to catch collision data mismatches
# Copy TileSets from World instance's TileMapLayer children to zone's TileMapLayer nodes
# Zone scenes have a World instance with TileMapLayer children that have the correct TileSets
# The zone's own TileMapLayer nodes need to reference those same TileSets
func _setup_zone_tilesets() -> void:
	# In zone scenes, the root is a World (Node2D) node with world.gd script
	# Zone scenes have standardized structure: World -> TileContainer, TransitionContainer, etc.
	# This function is called from the World node itself, so we need to find sibling containers
	# For now, we'll look for containers as siblings (they should be direct children of World)
	var world_instance: Node2D = get_parent() if get_parent() != null and get_parent().name == "World" else self
	
	if world_instance == null:
		print("[WORLD] World instance not found - skipping TileSet setup (may not be a zone scene)")
		return
	
	# Get all TileMapLayer children from the World instance
	var world_layers: Dictionary = {}  # layer_name -> TileSet
	for child in world_instance.get_children():
		if child is TileMapLayer:
			var layer = child as TileMapLayer
			if layer.tile_set != null:
				world_layers[layer.name] = layer.tile_set
				print("[WORLD] Found World TileMapLayer: %s with TileSet" % layer.name)
	
	if world_layers.is_empty():
		print("[WORLD] No TileMapLayer children found in World instance")
		return
	
	# Copy TileSets to zone's TileMapLayer nodes (direct children of root/self)
	# Match by layer name: Ground -> Ground, Walls -> Walls, etc.
	for child in get_children():
		if child is TileMapLayer and child != world_instance:
			var zone_layer = child as TileMapLayer
			var layer_name = zone_layer.name
			
			# Try to find matching World layer by name
			if layer_name in world_layers:
				var world_tileset = world_layers[layer_name] as TileSet
				if world_tileset != null:
					zone_layer.tile_set = world_tileset
			else:
				# For layers without exact match (Transition_*, Spawn_*), use Ground's TileSet as fallback
				if "Ground" in world_layers:
					var ground_tileset = world_layers["Ground"] as TileSet
					if ground_tileset != null:
						zone_layer.tile_set = ground_tileset
				else:
					push_warning("[WORLD] No matching World layer for zone.%s and no Ground fallback" % layer_name)

func _validate_collision_against_json() -> void:
	# Try to load the exported collision JSON
	var json_path := "res://../sn-browser-mmo-server/sn-server/spacetimedb/src/data/collision.json"
	if not FileAccess.file_exists(json_path):
		# Also try absolute path as fallback
		json_path = "C:/Users/derri/Documents/sn-mmo/sn-browser-mmo-server/sn-server/spacetimedb/src/data/collision.json"
		if not FileAccess.file_exists(json_path):
			print("[WORLD] Collision validation skipped: JSON file not found at %s" % json_path)
			return
	
	var file := FileAccess.open(json_path, FileAccess.READ)
	if file == null:
		print("[WORLD] Collision validation skipped: Could not open JSON file")
		return
	
	var json_text := file.get_as_text()
	file.close()
	
	var json := JSON.new()
	var parse_error := json.parse(json_text)
	if parse_error != OK:
		print("[WORLD] Collision validation skipped: JSON parse error")
		return
	
	var json_data := json.data as Dictionary
	if not json_data.has("zones"):
		print("[WORLD] Collision validation skipped: No zones in JSON")
		return
	
	# Find our zone in the JSON
	var zones := json_data.zones as Array
	var zone_data: Dictionary = {}
	for zone_variant in zones:
		var zone_dict: Dictionary = zone_variant as Dictionary
		if zone_dict.get("id", -1) == zone_id:
			zone_data = zone_dict
			break
	
	if zone_data.is_empty():
		print("[WORLD] Collision validation skipped: Zone %d not found in JSON" % zone_id)
		return
	
	# Extract blocked tiles from JSON
	var json_blocked: Dictionary = {}
	var json_blocked_array := zone_data.get("blocked", []) as Array
	for tile_array in json_blocked_array:
		if tile_array.size() >= 2:
			var tile := Vector2i(tile_array[0], tile_array[1])
			json_blocked[tile] = true
	
	# Compare TileMap vs JSON for a sample of tiles
	# Check all tiles that are in either set
	var all_tiles: Dictionary = {}
	for tile in _blocked_tiles.keys():
		all_tiles[tile] = true
	for tile in json_blocked.keys():
		all_tiles[tile] = true
	
	var mismatches := 0
	var sample_size: int = min(50, all_tiles.size())  # Check up to 50 tiles
	var checked := 0
	
	for tile in all_tiles.keys():
		if checked >= sample_size:
			break
		checked += 1
		
		var tilemap_says_blocked := _blocked_tiles.has(tile)
		var json_says_blocked := json_blocked.has(tile)
		
		if tilemap_says_blocked != json_says_blocked:
			mismatches += 1
			if mismatches <= 5:  # Only print first 5 mismatches
				push_error("[WORLD] COLLISION MISMATCH: Tile %s - TileMap says %s, JSON says %s (zone_id=%d)" % [tile, "BLOCKED" if tilemap_says_blocked else "OPEN", "BLOCKED" if json_says_blocked else "OPEN", zone_id])
	
	if mismatches > 0:
		push_error("[WORLD] Found %d collision mismatches out of %d checked tiles for zone_id=%d. This indicates the TileMap and exported JSON are out of sync!" % [mismatches, checked, zone_id])
	else:
		print("[WORLD] Collision validation passed: TileMap matches JSON for %d checked tiles (zone_id=%d)" % [checked, zone_id])

# Export collision tiles to the server
func _export_collision_to_server() -> void:
	if _blocked_tiles.is_empty():
		print("[WORLD] No blocked tiles to export")
		return
	
	# Check if SNBridge is available AND connection is ready
	# Critical: Do not export collision until WebSocket is fully connected (not in CONNECTING state)
	var bridge_ready = JavaScriptBridge.eval("typeof window.SNBridge !== 'undefined' && typeof window.SNBridge.clearBlockedTilesForZone === 'function'", true)
	if not bridge_ready:
		print("[WORLD] SNBridge not ready yet, retrying in 1 second...")
		await get_tree().create_timer(1.0).timeout
		_export_collision_to_server()
		return
	
	# Additional check: ensure connection is actually established (not just in CONNECTING state)
	# Wait for connection to be fully ready before sending collision data
	var connection_check_js = """
		(function() {
			// Check if we have a connection and it's ready
			// The connection should be established before we try to export collision
			if (typeof window.SNBridge !== 'undefined') {
				// Try to get identity - if it exists, connection is likely ready
				var identity = window.SNBridge.getIdentity ? window.SNBridge.getIdentity() : null;
				return identity !== null;
			}
			return false;
		})();
	"""
	var connection_ready = JavaScriptBridge.eval(connection_check_js, true)
	
	if not connection_ready:
		print("[WORLD] SpacetimeDB connection not ready yet (waiting for identity), retrying in 1 second...")
		await get_tree().create_timer(1.0).timeout
		_export_collision_to_server()
		return
	
	print("[WORLD] Exporting %d blocked tiles to server for zone_id=%d" % [_blocked_tiles.size(), zone_id])
	
	# Clear existing tiles for this zone first
	var clear_js = """
		(async function() {
			try {
				var result = await window.SNBridge.clearBlockedTilesForZone(%d);
				if (result) {
					console.log('[WORLD] Cleared blocked tiles for zone %d');
				} else {
					console.warn('[WORLD] Failed to clear blocked tiles - reducer may not be available');
				}
			} catch(e) {
				console.error('[WORLD] Error clearing blocked tiles:', e);
			}
		})();
	""" % [zone_id, zone_id]
	JavaScriptBridge.eval(clear_js)
	
	# Wait for the clear to complete
	await get_tree().create_timer(0.3).timeout
	
	# Export each blocked tile
	var exported_count := 0
	var failed_count := 0
	for tile in _blocked_tiles.keys():
		var upsert_js = """
			(async function() {
				try {
					var result = await window.SNBridge.upsertBlockedTile(%d, %d, %d);
					if (!result) {
						console.warn('[WORLD] Failed to upsert tile (%d, %d) - reducer may not be available');
					}
				} catch(e) {
					console.error('[WORLD] Error upserting tile (%d, %d):', e);
				}
			})();
		""" % [zone_id, tile.x, tile.y, tile.x, tile.y, tile.x, tile.y]
		JavaScriptBridge.eval(upsert_js)
		exported_count += 1
		
		# Small delay every 10 tiles to avoid overwhelming the server
		if exported_count % 10 == 0:
			await get_tree().create_timer(0.1).timeout
	
	# Final wait to ensure all requests are sent
	await get_tree().create_timer(0.5).timeout
	
	if failed_count > 0:
		push_warning("[WORLD] Failed to export %d blocked tiles. Reducers may not be available - check server bindings." % failed_count)
	else:
		print("[WORLD] Exported %d blocked tiles to server" % exported_count)
	
	# Finalize zone collision: mark zone as ready for movement
	# This must be called AFTER all tiles are loaded (clear + upserts complete)
	var finalize_js = """
		(async function() {
			try {
				var result = await window.SNBridge.finalizeZoneCollision(%d);
				if (result) {
					console.log('[WORLD] Finalized collision for zone %d - zone is now READY for movement');
				} else {
					console.warn('[WORLD] Failed to finalize collision for zone %d - reducer may not be available');
				}
			} catch(e) {
				console.error('[WORLD] Error finalizing collision for zone %d:', e);
			}
		})();
	""" % [zone_id, zone_id, zone_id, zone_id]
	JavaScriptBridge.eval(finalize_js)
	print("[WORLD] Called finalize_zone_collision for zone_id=%d" % zone_id)
