@tool
extends EditorScript

# Path relative to repo root (parent of client project); resolved at runtime so it works from any machine
const OUTPUT_PATH_RELATIVE := "sn-browser-mmo-server/sn-server/spacetimedb/src/data/npc.json"
const ZONES_DIR := "res://scenes/mapdata/"
const TILE_SIZE := 16  # match your existing collision exporter

func _run() -> void:
	print("[NPC EXPORTER] Starting NPC export...")
	var data := {
		"npcs": []
	}

	var dir := DirAccess.open(ZONES_DIR)
	if dir == null:
		push_error("[NPC EXPORTER] Could not open zones directory: %s" % ZONES_DIR)
		return

	dir.list_dir_begin()
	var file_name := dir.get_next()
	while file_name != "":
		if not dir.current_is_dir() and file_name.ends_with(".tscn"):
			var scene_path := ZONES_DIR + file_name
			_process_zone_scene(scene_path, data)
		file_name = dir.get_next()
	dir.list_dir_end()

	_write_json(data)


func _process_zone_scene(scene_path: String, data: Dictionary) -> void:
	var scene := load(scene_path)
	if scene == null:
		push_warning("[NPC EXPORTER] Failed to load scene: %s" % scene_path)
		return

	var root: Node = scene.instantiate()
	if root == null:
		push_warning("[NPC EXPORTER] Failed to instantiate scene: %s" % scene_path)
		return

	var zone_id := _infer_zone_id(scene_path)
	_collect_npcs(root, zone_id, data)


func _collect_npcs(node: Node, zone_id: int, data: Dictionary) -> void:
	if node is NPC:
		var npc_key_str: String = node.npc_key if node.get("npc_key") != null else ""
		if npc_key_str == "":
			push_warning("NPC at (%s, %s) in zone %s has no npc_key (npc_def_id=%s)" % [
				int(round(node.global_position.x / TILE_SIZE)),
				int(round(node.global_position.y / TILE_SIZE)),
				zone_id,
				str(node.npc_def_id),
			])
		var npc_dict := {
			"zone_id": node.npc_zone_id,
			"npc_id": node.npc_def_id,
			"npc_key": npc_key_str,
			"display_name": node.npc_name,
			"sprite_id": node.sprite_id,
			"behavior_key": node.behavior_key,
			"default_dialogue_key": node.default_dialogue_key,
			"x": int(round(node.global_position.x / TILE_SIZE)),
			"y": int(round(node.global_position.y / TILE_SIZE)),
		}
		data["npcs"].append(npc_dict)

	for child in node.get_children():
		_collect_npcs(child, zone_id, data)


func _infer_zone_id(scene_path: String) -> int:
	# Reuse the same logic you already use in collision_exporter.gd:
	# grab the filename and extract digits / zone_XXX pattern.
	var regex := RegEx.new()
	var base_name := scene_path.get_file().get_basename()
	regex.compile("(?:zone_|[Zz]_)(\\d+)")
	var result := regex.search(base_name)
	if result != null:
		return int(result.get_string(1))
	# Fallback: any number in filename
	regex.compile("(\\d+)")
	result = regex.search(base_name)
	if result != null:
		return int(result.get_string(1))
	return -1


func _get_server_output_path() -> String:
	# Walk up from project root; use the HIGHEST (repo root) directory that contains the
	# server data path. Cap iterations to avoid infinite loop on Windows (e.g. at "C:").
	var data_dir_relative := "sn-browser-mmo-server/sn-server/spacetimedb/src/data"
	var current := ProjectSettings.globalize_path("res://")
	var last_found := ""
	var max_steps := 20
	while max_steps > 0 and current != "" and current != "/":
		max_steps -= 1
		var data_dir := current.path_join(data_dir_relative)
		if DirAccess.dir_exists_absolute(data_dir):
			last_found = data_dir.path_join("npc.json")
		var parent := current.get_base_dir()
		if parent == current:
			break
		current = parent
	return last_found


func _write_json(data: Dictionary) -> void:
	var json := JSON.new()
	var json_string := json.stringify(data, "\t")  # pretty print

	# 1) Always write to project first (res://) so a file is guaranteed to appear
	var project_path := ProjectSettings.globalize_path("res://tools/npc_export.json")
	print("[NPC EXPORTER] Project root: ", ProjectSettings.globalize_path("res://"))
	print("[NPC EXPORTER] Writing to project file: ", project_path)

	var file := FileAccess.open("res://tools/npc_export.json", FileAccess.WRITE)
	if file == null:
		push_error("[NPC EXPORTER] Failed to open res://tools/npc_export.json (error: %d)" % FileAccess.get_open_error())
		return
	file.store_string(json_string)
	file.close()
	print("[NPC EXPORTER] OK: Wrote %d NPC entries to project: %s" % [data["npcs"].size(), project_path])

	# 2) If server data dir exists, also write npc.json there
	var server_path := _get_server_output_path()
	if server_path != "":
		var dir_path := server_path.get_base_dir()
		if not DirAccess.dir_exists_absolute(dir_path):
			var err := DirAccess.make_dir_recursive_absolute(dir_path)
			if err != OK:
				print("[NPC EXPORTER] Could not create server dir: ", dir_path, " (code ", err, ")")
		if DirAccess.dir_exists_absolute(server_path.get_base_dir()):
			var server_file := FileAccess.open(server_path, FileAccess.WRITE)
			if server_file == null:
				print("[NPC EXPORTER] Could not write to server path (error %d): %s" % [FileAccess.get_open_error(), server_path])
			else:
				server_file.store_string(json_string)
				server_file.close()
				print("[NPC EXPORTER] OK: Also wrote to server: ", server_path)
	else:
		print("[NPC EXPORTER] Server data dir not found (walked up from project root). Copy npc_export.json from tools/ to server if needed.")

	print("[NPC EXPORTER] Done.")
