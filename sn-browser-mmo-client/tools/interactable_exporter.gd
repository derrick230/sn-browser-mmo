@tool
extends EditorScript

# Path relative to repo; resolved at runtime. Writes to server data dir when found.
const ZONES_DIR := "res://scenes/mapdata/"
const TILE_SIZE := 16  # match collision + NPC exporter

func _run() -> void:
	print("[INTERACTABLE EXPORTER] Starting interactable export...")
	var data := {
		"interactables": []
	}

	var dir := DirAccess.open(ZONES_DIR)
	if dir == null:
		push_error("[INTERACTABLE EXPORTER] Could not open zones directory: %s" % ZONES_DIR)
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
	print("[INTERACTABLE EXPORTER] Done.")


func _process_zone_scene(scene_path: String, data: Dictionary) -> void:
	var scene := load(scene_path)
	if scene == null:
		push_warning("[INTERACTABLE EXPORTER] Failed to load scene: %s" % scene_path)
		return

	var root: Node = scene.instantiate()
	if root == null:
		push_warning("[INTERACTABLE EXPORTER] Failed to instantiate scene: %s" % scene_path)
		return

	var zone_id := _infer_zone_id(scene_path)
	_collect_interactables(root, zone_id, data)


func _collect_interactables(node: Node, zone_id: int, data: Dictionary) -> void:
	if node is Interactable:
		var inter_key: String = node.interactable_key if node.get("interactable_key") != null else ""
		if inter_key == "":
			push_warning("Interactable at (%s, %s) in zone %s has no interactable_key (interactable_def_id=%s)" % [
				int(round(node.global_position.x / TILE_SIZE)),
				int(round(node.global_position.y / TILE_SIZE)),
				zone_id,
				str(node.interactable_def_id),
			])
		var inter_dict := {
			"zone_id": node.interactable_zone_id if node.interactable_zone_id != 0 else zone_id,
			"interactable_id": node.interactable_def_id,
			"interactable_key": inter_key,
			"display_name": node.interactable_name,
			"sprite_id": node.sprite_id,
			"behavior_key": node.behavior_key,
			"default_dialogue_key": node.default_dialogue_key,
			"x": int(round(node.global_position.x / TILE_SIZE)),
			"y": int(round(node.global_position.y / TILE_SIZE)),
		}
		data["interactables"].append(inter_dict)

	for child in node.get_children():
		_collect_interactables(child, zone_id, data)


func _infer_zone_id(scene_path: String) -> int:
	var regex := RegEx.new()
	var base_name := scene_path.get_file().get_basename()
	regex.compile("(?:zone_|[Zz]_)(\\d+)")
	var result := regex.search(base_name)
	if result != null:
		return int(result.get_string(1))
	regex.compile("(\\d+)")
	result = regex.search(base_name)
	if result != null:
		return int(result.get_string(1))
	return -1


func _get_server_output_path() -> String:
	var data_dir_relative := "sn-browser-mmo-server/sn-server/spacetimedb/src/data"
	var current := ProjectSettings.globalize_path("res://")
	var last_found := ""
	var max_steps := 20
	while max_steps > 0 and current != "" and current != "/":
		max_steps -= 1
		var data_dir := current.path_join(data_dir_relative)
		if DirAccess.dir_exists_absolute(data_dir):
			last_found = data_dir.path_join("interactable.json")
		var parent := current.get_base_dir()
		if parent == current:
			break
		current = parent
	return last_found


func _write_json(data: Dictionary) -> void:
	var json_string := JSON.stringify(data, "\t")

	# 1) Always write to project first
	var project_path := ProjectSettings.globalize_path("res://tools/interactable_export.json")
	print("[INTERACTABLE EXPORTER] Project root: ", ProjectSettings.globalize_path("res://"))
	print("[INTERACTABLE EXPORTER] Writing to project file: ", project_path)

	var file := FileAccess.open("res://tools/interactable_export.json", FileAccess.WRITE)
	if file == null:
		push_error("[INTERACTABLE EXPORTER] Failed to open res://tools/interactable_export.json (error: %d)" % FileAccess.get_open_error())
		return
	file.store_string(json_string)
	file.close()
	print("[INTERACTABLE EXPORTER] OK: Wrote %d interactable entries to project: %s" % [data["interactables"].size(), project_path])

	# 2) If server data dir exists, also write interactable.json there
	var server_path := _get_server_output_path()
	if server_path != "":
		var dir_path := server_path.get_base_dir()
		if not DirAccess.dir_exists_absolute(dir_path):
			var err := DirAccess.make_dir_recursive_absolute(dir_path)
			if err != OK:
				print("[INTERACTABLE EXPORTER] Could not create server dir: ", dir_path, " (code ", err, ")")
		if DirAccess.dir_exists_absolute(server_path.get_base_dir()):
			var server_file := FileAccess.open(server_path, FileAccess.WRITE)
			if server_file == null:
				print("[INTERACTABLE EXPORTER] Could not write to server path (error %d): %s" % [FileAccess.get_open_error(), server_path])
			else:
				server_file.store_string(json_string)
				server_file.close()
				print("[INTERACTABLE EXPORTER] OK: Also wrote to server: ", server_path)
	else:
		print("[INTERACTABLE EXPORTER] Server data dir not found. Copy interactable_export.json from tools/ to server if needed.")

	print("[INTERACTABLE EXPORTER] Done.")
