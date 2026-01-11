extends Node2D

@export var ground_layer_path: NodePath = NodePath("Ground")
@export var walls_layer_path: NodePath = NodePath("Walls")

@onready var ground: TileMapLayer = get_node_or_null(ground_layer_path) as TileMapLayer
@onready var walls: TileMapLayer = get_node_or_null(walls_layer_path) as TileMapLayer

func _enter_tree() -> void:
	# Runs earlier than _ready(), so we can fail fast before Player._ready() calls world_to_tile()
	ground = get_node_or_null(ground_layer_path) as TileMapLayer
	walls = get_node_or_null(walls_layer_path) as TileMapLayer
	assert(ground != null, "ground_layer_path must point to a TileMapLayer (e.g. 'Ground').")
	assert(walls != null, "walls_layer_path must point to a TileMapLayer (e.g. 'Walls').")

func _ready() -> void:
	assert(ground != null, "ground_layer_path must point to a TileMapLayer.")
	assert(walls != null, "walls_layer_path must point to a TileMapLayer.")


# --- Coordinate helpers ---
# Use ONE layer for coordinate conversions (ground is fine).
func tile_to_world(t: Vector2i) -> Vector2:
	return ground.map_to_local(t)

func world_to_tile(p: Vector2) -> Vector2i:
	assert(ground != null, "Ground layer is null. Check ground_layer_path on the runtime World instance.")
	return ground.local_to_map(p)

# --- Collision ---
func is_blocked(tile: Vector2i) -> bool:
	# On TileMapLayer, you don't pass a layer index.
	# If there's a tile placed here, it's blocked.
	return walls.get_cell_source_id(tile) != -1

func can_step(from_tile: Vector2i, dir: Vector2i) -> bool:
	if dir == Vector2i.ZERO:
		return false

	var to_tile := from_tile + dir

	# destination must be open
	if is_blocked(to_tile):
		return false

	# If diagonal, prevent corner cutting:
	if dir.x != 0 and dir.y != 0:
		var side_a := from_tile + Vector2i(dir.x, 0)
		var side_b := from_tile + Vector2i(0, dir.y)

		# STRICT rule: both adjacent cardinals must be open
		if is_blocked(side_a) or is_blocked(side_b):
			return false

	return true


func get_path_tiles(from_tile: Vector2i, to_tile: Vector2i) -> Array[Vector2i]:
	if from_tile == to_tile:
		return []
	if is_blocked(to_tile):
		return []

	var dirs := [
		Vector2i(-1, 0), Vector2i(1, 0), Vector2i(0, -1), Vector2i(0, 1),
		Vector2i(-1, -1), Vector2i(1, -1), Vector2i(-1, 1), Vector2i(1, 1),
	]

	var open: Array[Vector2i] = [from_tile]
	var came_from := {}
	var g_score := { from_tile: 0 }

	while open.size() > 0:
		var current := open[0]
		var current_f: int = g_score[current] + _heuristic_octile(current, to_tile)
		for t in open:
			var f: int = g_score[t] + _heuristic_octile(t, to_tile)
			if f < current_f:
				current = t
				current_f = f

		if current == to_tile:
			return _reconstruct_path(came_from, current, from_tile)

		open.erase(current)

		var current_g: int = g_score[current]

		for d in dirs:
			if not can_step(current, d):
				continue

			var neighbor: Vector2i = current + d
			var step_cost := 14 if (d.x != 0 and d.y != 0) else 10
			var tentative_g := current_g + step_cost

			if not g_score.has(neighbor) or tentative_g < g_score[neighbor]:
				came_from[neighbor] = current
				g_score[neighbor] = tentative_g
				if not open.has(neighbor):
					open.append(neighbor)

	return []


func _heuristic_octile(a: Vector2i, b: Vector2i) -> int:
	var dx: int = abs(a.x - b.x)
	var dy: int = abs(a.y - b.y)
	var min_d: int = min(dx, dy)
	var max_d: int = max(dx, dy)
	return 14 * min_d + 10 * (max_d - min_d)


func _reconstruct_path(came_from: Dictionary, current: Vector2i, start: Vector2i) -> Array[Vector2i]:
	var path: Array[Vector2i] = []
	while current != start:
		path.append(current)
		current = came_from[current]
	path.reverse()
	return path
