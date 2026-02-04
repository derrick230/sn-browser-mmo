extends Node2D

# PathPreview is a dumb renderer:
# it draws exactly the tiles it is given, in order, and does not compute or trim paths.
# The server (via the network bridge) is authoritative over which tiles remain.

@export var tile_size: int = 16
# Path tiles in tile coordinates (Vector2i), ordered from next step → destination
var _tiles: Array[Vector2i] = []

func _ready() -> void:
	# Draw above world but below players
	z_index = 5
	# Ensure the node is visible
	visible = true
	print("[PATH_PREVIEW] _ready() called, z_index = ", z_index, " visible = ", visible)

# Called with full remaining path from server:
# [ next_step_from_player, ..., destination ]
func set_path(tiles: Array[Vector2i]) -> void:
	_tiles = tiles.duplicate()
	print("[PATH_PREVIEW] set_path called with ", _tiles.size(), " tiles: ", _tiles)
	queue_redraw()

func clear_path() -> void:
	_tiles.clear()
	print("[PATH_PREVIEW] clear_path called")
	queue_redraw()

func _draw() -> void:
	if _tiles.is_empty():
		return

	var color := Color(1.0, 0.0, 0.0, 0.4)

	for tile in _tiles:
		var world_pos := Vector2(tile.x * tile_size, tile.y * tile_size)
		var rect := Rect2(world_pos, Vector2(tile_size, tile_size))
		draw_rect(rect, color, true)
	
	# Debug: log when drawing happens
	if _tiles.size() > 0:
		print("[PATH_PREVIEW] _draw() called, drawing ", _tiles.size(), " tiles")
