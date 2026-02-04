@tool
extends EditorScript

# Configuration: Output path for collision.json
# Update this path to match your server repo location
const OUTPUT_PATH := "C:/Users/derri/Documents/sn-mmo/sn-browser-mmo-server/sn-server/spacetimedb/src/data/collision.json"

# Alternative: Export to project directory (you can manually copy later)
# const OUTPUT_PATH := "res://export/collision.json"

# Zones directory to scan (relative to project root)
const ZONES_DIR := "res://assets/zones/"

# Fallback: Also check mapdata directory if zones/ doesn't exist
const MAPDATA_DIR := "res://scenes/mapdata/"

# Prefix for transition layer names: "Transition_<targetZoneId>_<targetSpawnId>"
const TRANSITION_LAYER_PREFIX := "Transition_"

# Prefix for spawn layer names: "Spawn_<spawnId>"
const SPAWN_LAYER_PREFIX := "Spawn_"

func _run() -> void:
	print("[COLLISION EXPORTER] Starting collision export...")
	
	# Find zone scenes
	var zone_scenes := _find_zone_scenes()
	
	if zone_scenes.is_empty():
		push_error("[COLLISION EXPORTER] No zone scenes found in %s or %s" % [ZONES_DIR, MAPDATA_DIR])
		return
	
	# Extract collision data from each zone
	var zones_data := []
	var seen_zone_ids := {}  # Track zone IDs to detect duplicates
	
	for scene_path in zone_scenes:
		var zone_data := _extract_zone_collision(scene_path)
		if zone_data != null and zone_data.has("id"):
			var zone_id := zone_data.id as int
			
			# Check for duplicate zone IDs
			if seen_zone_ids.has(zone_id):
				var existing_file := seen_zone_ids[zone_id] as String
				push_warning("[COLLISION EXPORTER] Duplicate zone_id=%d detected! Skipping %s (already processed %s)" % [zone_id, scene_path.get_file(), existing_file])
				continue
			
			# Track this zone ID and file
			seen_zone_ids[zone_id] = scene_path.get_file()
			zones_data.append(zone_data)
	
	# Sort by zone_id for consistent output
	zones_data.sort_custom(func(a, b): return a.id < b.id)
	
	# Build final JSON structure
	var json_data := {
		"zones": zones_data
	}
	
	# Write JSON file
	_write_json(json_data, OUTPUT_PATH)
	
	print("[COLLISION EXPORTER] Export complete: %d zones exported" % zones_data.size())

# Find all .tscn files in zones directories
func _find_zone_scenes() -> Array[String]:
	var scenes: Array[String] = []
	
	# Try primary zones directory
	if DirAccess.dir_exists_absolute(ZONES_DIR):
		scenes.append_array(_scan_directory_for_scenes(ZONES_DIR))
	
	# Try fallback mapdata directory
	if DirAccess.dir_exists_absolute(MAPDATA_DIR):
		scenes.append_array(_scan_directory_for_scenes(MAPDATA_DIR))
	
	return scenes

# Recursively scan directory for .tscn files
func _scan_directory_for_scenes(dir_path: String) -> Array[String]:
	var scenes: Array[String] = []
	
	var dir := DirAccess.open(dir_path)
	if dir == null:
		push_warning("[COLLISION EXPORTER] Could not open directory: %s" % dir_path)
		return scenes
	
	dir.list_dir_begin()
	var file_name := dir.get_next()
	
	while file_name != "":
		var full_path := dir_path.path_join(file_name)
		
		if dir.current_is_dir():
			# Recursively scan subdirectories
			scenes.append_array(_scan_directory_for_scenes(full_path + "/"))
		elif file_name.ends_with(".tscn"):
			scenes.append(full_path)
		
		file_name = dir.get_next()
	
	return scenes

# Extract zone ID from filename
# Patterns: "zone_0001.tscn" -> 1, "Z_0001.tscn" -> 1, "z_0001_spawn.tscn" -> 1, "zone_1.tscn" -> 1
func _parse_zone_id(filename: String) -> int:
	# Remove extension
	var base_name := filename.get_basename()
	
	# Try pattern: zone_0001, Z_0001, or z_0001
	var regex := RegEx.new()
	regex.compile("(?:zone_|[Zz]_)(\\d+)")  # Matches zone_, Z_, or z_ followed by digits
	var result := regex.search(base_name)
	
	if result != null:
		return int(result.get_string(1))
	
	# Fallback: try to extract any number from filename
	regex.compile("(\\d+)")
	result = regex.search(base_name)
	
	if result != null:
		return int(result.get_string(1))
	
	# Default: use hash as fallback (not ideal, but prevents crash)
	push_warning("[COLLISION EXPORTER] Could not parse zone ID from filename: %s, using hash" % filename)
	return base_name.hash() % 10000

# Extract collision data from a zone scene
func _extract_zone_collision(scene_path: String) -> Dictionary:
	var filename := scene_path.get_file()
	var zone_id := _parse_zone_id(filename)
	
	print("[COLLISION EXPORTER] Processing zone scene: %s (id=%d)" % [filename, zone_id])
	
	# Load scene
	var packed := load(scene_path) as PackedScene
	if packed == null:
		push_error("[COLLISION EXPORTER] Failed to load scene: %s" % scene_path)
		return {}
	
	# Instantiate scene
	var inst := packed.instantiate()
	if inst == null:
		push_error("[COLLISION EXPORTER] Failed to instantiate scene: %s" % scene_path)
		return {}
	
	# Find "Walls" TileMapLayer
	var walls_layer := _find_walls_layer(inst)
	
	var blocked_cells: Array[Array] = []
	var min_x: int = 0
	var max_x: int = 0
	var min_y: int = 0
	var max_y: int = 0
	var has_bounds := false
	
	if walls_layer != null:
		# Get used cells from TileMapLayer
		var used_cells := walls_layer.get_used_cells()
		
		if not used_cells.is_empty():
			# Initialize bounds from first cell
			min_x = used_cells[0].x
			max_x = used_cells[0].x
			min_y = used_cells[0].y
			max_y = used_cells[0].y
			has_bounds = true
			
			# Convert Vector2i to [x, y] arrays and compute bounds
			for cell in used_cells:
				blocked_cells.append([cell.x, cell.y])
				
				# Update bounds
				min_x = min(min_x, cell.x)
				max_x = max(max_x, cell.x)
				min_y = min(min_y, cell.y)
				max_y = max(max_y, cell.y)
		
		print("[COLLISION EXPORTER] Zone %d: Found %d blocked tiles" % [zone_id, blocked_cells.size()])
		if has_bounds:
			print("[COLLISION EXPORTER] Zone %d: Bounds: x=[%d, %d], y=[%d, %d]" % [zone_id, min_x, max_x, min_y, max_y])
	else:
		print("[COLLISION EXPORTER] Zone %d: No 'Walls' TileMapLayer found, exporting empty blocked array" % zone_id)
	
	# Collect transitions from all TileMapLayers named "Transition_*"
	var transitions: Array[Dictionary] = []
	var transition_layers := _find_transition_layers(inst)

	if transition_layers.is_empty():
		print("[COLLISION EXPORTER] Zone %d: No transition layers found" % zone_id)
	else:
		print("[COLLISION EXPORTER] Zone %d: Found %d transition layer(s)" % [zone_id, transition_layers.size()])

	for layer_data in transition_layers:
		var layer := layer_data["layer"] as TileMapLayer
		var target_zone_id := layer_data["target_zone_id"] as int
		var target_spawn_id := layer_data["target_spawn_id"] as String

		var used_cells := layer.get_used_cells()
		var tile_count := used_cells.size()
		
		for cell in used_cells:
			transitions.append({
				"x": cell.x,
				"y": cell.y,
				"target_zone_id": target_zone_id,
				"target_spawn_id": target_spawn_id,
			})
		
		print("[COLLISION EXPORTER] Zone %d: Transition layer '%s' -> Zone %d spawn '%s': %d tiles exported" % [zone_id, layer.name, target_zone_id, target_spawn_id, tile_count])
	
	if not transitions.is_empty():
		print("[COLLISION EXPORTER] Zone %d: Total %d transition tiles exported across all layers" % [zone_id, transitions.size()])
	
	# Collect spawns from all TileMapLayers named "Spawn_*"
	var spawns: Array[Dictionary] = []
	var spawn_layers := _find_spawn_layers(inst)

	if spawn_layers.is_empty():
		print("[COLLISION EXPORTER] Zone %d: No spawn layers found" % zone_id)
	else:
		print("[COLLISION EXPORTER] Zone %d: Found %d spawn layer(s)" % [zone_id, spawn_layers.size()])

	for layer_data in spawn_layers:
		var layer := layer_data["layer"] as TileMapLayer
		var spawn_id := layer_data["spawn_id"] as String

		var used_cells := layer.get_used_cells()
		var tile_count := used_cells.size()
		
		for cell in used_cells:
			spawns.append({
				"x": cell.x,
				"y": cell.y,
				"spawn_id": spawn_id,
			})
		
		print("[COLLISION EXPORTER] Zone %d: Spawn layer '%s' -> spawn '%s': %d tiles exported" % [zone_id, layer.name, spawn_id, tile_count])
	
	if not spawns.is_empty():
		print("[COLLISION EXPORTER] Zone %d: Total %d spawn tiles exported across all layers" % [zone_id, spawns.size()])
	
	# Clean up instance
	inst.queue_free()
	
	# Generate collision version (timestamp-based)
	var now := Time.get_datetime_dict_from_system()
	var collision_version := "%04d-%02d-%02d-%02d%02d" % [now.year, now.month, now.day, now.hour, now.minute]
	
	# Build zone data dictionary
	var zone_data := {
		"id": zone_id,
		"collision_version": collision_version,
		"blocked": blocked_cells
	}
	
	# Add bounds if we have them
	if has_bounds:
		zone_data["bounds"] = {
			"min_x": min_x,
			"max_x": max_x,
			"min_y": min_y,
			"max_y": max_y
		}
	
	# Add transitions array (even if empty)
	zone_data["transitions"] = transitions
	
	# Add spawns array (even if empty)
	zone_data["spawns"] = spawns
	
	return zone_data

# Recursively find TileMapLayer named "Walls"
func _find_walls_layer(node: Node) -> TileMapLayer:
	if node == null:
		return null
	
	# Check if this node is a TileMapLayer named "Walls"
	if node is TileMapLayer and node.name == "Walls":
		return node as TileMapLayer
	
	# Recursively search children
	for child in node.get_children():
		var found := _find_walls_layer(child)
		if found != null:
			return found
	
	return null

# Recursively find all TileMapLayers whose name starts with TRANSITION_LAYER_PREFIX
# Returns Array[Dictionary] with entries: { "layer": TileMapLayer, "target_zone_id": int, "target_spawn_id": String }
func _find_transition_layers(root: Node) -> Array[Dictionary]:
	var result: Array[Dictionary] = []

	if root == null:
		return result

	# We will scan all descendants and collect TileMapLayers whose name starts with TRANSITION_LAYER_PREFIX.
	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var node: Node = stack.pop_back()
		for child in node.get_children():
			stack.append(child)

			if child is TileMapLayer:
				var layer := child as TileMapLayer
				var name_str := String(layer.name)

				if not name_str.begins_with(TRANSITION_LAYER_PREFIX):
					continue

				# Name format: "Transition_<zone>_<spawnId...>"
				var parts := name_str.split("_", false)
				if parts.size() < 3:
					push_warning("[COLLISION EXPORTER] Transition layer '%s' does not match pattern 'Transition_<zone>_<spawnId>'" % name_str)
					continue

				var target_zone_id := int(parts[1])
				var target_spawn_id := ""
				# Re-join the rest for spawn id, so "spawn_west_entrance" works.
				for i in range(2, parts.size()):
					if i == 2:
						target_spawn_id += parts[i]
					else:
						target_spawn_id += "_" + parts[i]

				result.append({
					"layer": layer,
					"target_zone_id": target_zone_id,
					"target_spawn_id": target_spawn_id,
				})

	if result.is_empty():
		# Not an error, just informative
		# print("[COLLISION EXPORTER] No transition layers found under this scene")
		pass

	return result

# Recursively find all TileMapLayers whose name starts with SPAWN_LAYER_PREFIX
# Returns Array[Dictionary] with entries: { "layer": TileMapLayer, "spawn_id": String }
func _find_spawn_layers(root: Node) -> Array[Dictionary]:
	var result: Array[Dictionary] = []

	if root == null:
		return result

	# We will scan all descendants and collect TileMapLayers whose name starts with SPAWN_LAYER_PREFIX.
	var stack: Array[Node] = [root]
	while not stack.is_empty():
		var node: Node = stack.pop_back()
		for child in node.get_children():
			stack.append(child)

			if child is TileMapLayer:
				var layer := child as TileMapLayer
				var name_str := String(layer.name)

				if not name_str.begins_with(SPAWN_LAYER_PREFIX):
					continue

				# Name format: "Spawn_<spawnId>"
				# Everything after "Spawn_" is the spawn ID
				var spawn_id := name_str.substr(SPAWN_LAYER_PREFIX.length())

				if spawn_id.is_empty():
					push_warning("[COLLISION EXPORTER] Spawn layer '%s' has no spawn ID after 'Spawn_'" % name_str)
					continue

				result.append({
					"layer": layer,
					"spawn_id": spawn_id,
				})

	if result.is_empty():
		# Not an error, just informative
		# print("[COLLISION EXPORTER] No spawn layers found under this scene")
		pass

	return result

# Write JSON data to file
func _write_json(data: Dictionary, output_path: String) -> void:
	# Create output string
	var json_string := JSON.stringify(data, "\t")
	
	# Handle res:// paths vs absolute paths
	var is_res_path := output_path.begins_with("res://")
	var file := FileAccess.open(output_path, FileAccess.WRITE)
	
	if file == null:
		# Try creating directory first for absolute paths
		if not is_res_path:
			var dir := output_path.get_base_dir()
			# Create directories recursively
			var err := DirAccess.make_dir_recursive_absolute(dir)
			if err != OK:
				push_warning("[COLLISION EXPORTER] Could not create directory: %s (error: %d)" % [dir, err])
			
			# Try opening file again after creating directory
			file = FileAccess.open(output_path, FileAccess.WRITE)
		
		if file == null:
			push_error("[COLLISION EXPORTER] Failed to open file for writing: %s" % output_path)
			return
	
	file.store_string(json_string)
	file.close()
	
	print("[COLLISION EXPORTER] JSON written to: %s" % output_path)
	print("[COLLISION EXPORTER] File size: %d bytes" % json_string.length())
	
	# Print summary
	print("[COLLISION EXPORTER] ===== EXPORT SUMMARY =====")
	if data.has("zones"):
		var zones := data.zones as Array
		for zone in zones:
			var zone_dict := zone as Dictionary
			var zone_id := zone_dict.get("id", -1) as int
			var blocked := zone_dict.get("blocked", []) as Array
			var transitions := zone_dict.get("transitions", []) as Array
			var spawns := zone_dict.get("spawns", []) as Array
			print("[COLLISION EXPORTER] Zone %d: %d blocked tiles, %d transition tiles, %d spawn tiles" % [zone_id, blocked.size(), transitions.size(), spawns.size()])
	print("[COLLISION EXPORTER] =========================")
