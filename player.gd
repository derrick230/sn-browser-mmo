extends CharacterBody2D

@export var move_cooldown := 0.30
@onready var sprite: AnimatedSprite2D = $Sprite
var cooldown_left := 0.0
var _stepped_this_frame := false

# movement and facing variables
var tile_pos: Vector2i
var facing: Vector2i = Vector2i.DOWN
var walk_target: Vector2i

# movement smoothing variables
var is_moving := false
var move_t: float = 0.0
var start_world := Vector2.ZERO
var target_world := Vector2.ZERO


# click-to-move queue (each element is a tile to step to)
var walk_queue: Array[Vector2i] = []

@onready var world := get_parent()

func _ready() -> void:
	tile_pos = world.world_to_tile(global_position)
	global_position = world.tile_to_world(tile_pos)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT and event.pressed:
		var target_tile: Vector2i = world.world_to_tile(get_global_mouse_position())
		walk_target = target_tile
		walk_queue = world.get_path_tiles(tile_pos, walk_target)

func _process(delta: float) -> void:
	_stepped_this_frame = false
	# Smooth movement in progress
	if is_moving:
		_update_move(delta)
		return
	# Read input once
	var manual_dir := _read_dir8()

	# Manual has priority: cancel auto-walk and attempt step
	if manual_dir != Vector2i.ZERO:
		walk_queue.clear()
		_try_step(delta, manual_dir)
	else:
		# Otherwise follow auto-walk queue
		if walk_queue.size() > 0:
			var next_tile := walk_queue[0]
			var dir := next_tile - tile_pos
			dir.x = clampi(dir.x, -1, 1)
			dir.y = clampi(dir.y, -1, 1)
			_try_step(delta, dir)

	# If we did NOT step this frame, and there is no input/queue, go idle.
	if not _stepped_this_frame and manual_dir == Vector2i.ZERO and walk_queue.size() == 0:
		_play_anim(false)


func _try_step(delta: float, dir: Vector2i) -> void:
	if cooldown_left > 0.0:
		cooldown_left -= delta
		return
	if dir == Vector2i.ZERO:
		return

	facing = dir

	# 1) Intended step
	if _do_step(dir):
		return

	# 2) Slide fallback for diagonals
	if dir.x != 0 and dir.y != 0:
		if _slide_step(dir):
			return

	# 3) If auto-walking and stuck, repath once
	if walk_queue.size() > 0:
		walk_queue = world.get_path_tiles(tile_pos, walk_target)
		if walk_queue.size() == 0:
			walk_queue.clear()

func _do_step(step_dir: Vector2i) -> bool:
	if step_dir == Vector2i.ZERO:
		return false

	if world.can_step(tile_pos, step_dir):
		tile_pos += step_dir

		# Start smooth movement
		is_moving = true
		move_t = 0.0
		start_world = global_position
		target_world = world.tile_to_world(tile_pos)

		cooldown_left = move_cooldown

		_stepped_this_frame = true
		_play_anim(true)

		# If we're auto-walking:
		if walk_queue.size() > 0:
			# Normal case: reached the next planned tile
			if tile_pos == walk_queue[0]:
				walk_queue.pop_front()
			else:
				# We "slid" off the planned path -> re-path to the target
				walk_queue = world.get_path_tiles(tile_pos, walk_target)

		return true

	return false

func _slide_step(dir: Vector2i) -> bool:
	# Only makes sense for diagonals
	if dir.x == 0 or dir.y == 0:
		return false

	# Prefer the axis that gets us closer to our target (if auto-walking)
	var try_x_first := true
	if walk_queue.size() > 0:
		# If we have a target, decide which axis reduces distance more
		var dx := walk_target.x - tile_pos.x
		var dy := walk_target.y - tile_pos.y
		# Prefer the axis with bigger remaining distance
		try_x_first = abs(dx) >= abs(dy)

	if try_x_first:
		if _do_step(Vector2i(dir.x, 0)): return true
		if _do_step(Vector2i(0, dir.y)): return true
	else:
		if _do_step(Vector2i(0, dir.y)): return true
		if _do_step(Vector2i(dir.x, 0)): return true

	return false

func _read_dir8() -> Vector2i:
	var x := int(Input.is_action_pressed("move_right")) - int(Input.is_action_pressed("move_left"))
	var y := int(Input.is_action_pressed("move_down")) - int(Input.is_action_pressed("move_up"))
	return Vector2i(clampi(x, -1, 1), clampi(y, -1, 1))

func _anim_from_dir(dir: Vector2i) -> Dictionary:
	# Returns { "anim": String, "flip_h": bool }

	if dir == Vector2i.ZERO:
		dir = facing

	# Normalize direction
	var x: int = sign(dir.x)
	var y: int = sign(dir.y)

	# Vertical only
	if x == 0 and y < 0:
		return { "anim": "up", "flip_h": false }
	if x == 0 and y > 0:
		return { "anim": "down", "flip_h": false }

	# Horizontal only
	if x > 0 and y == 0:
		return { "anim": "right", "flip_h": false }
	if x < 0 and y == 0:
		return { "anim": "right", "flip_h": true }

	# Diagonals
	if x > 0 and y < 0:
		return { "anim": "upright", "flip_h": false }
	if x < 0 and y < 0:
		return { "anim": "upright", "flip_h": true }

	if x > 0 and y > 0:
		return { "anim": "downright", "flip_h": false }
	if x < 0 and y > 0:
		return { "anim": "downright", "flip_h": true }

	# Fallback
	return { "anim": "down", "flip_h": false }

func _play_anim(moving: bool) -> void:
	if sprite == null:
		return

	var data := _anim_from_dir(facing)
	var anim: String = ("walk_" if moving else "idle_") + data.anim
	sprite.flip_h = data.flip_h

	if sprite.animation != anim:
		sprite.play(anim)

func _update_move(delta: float) -> void:
	move_t += delta / move_cooldown
	var t: float = clampf(move_t, 0.0, 1.0) 
	_play_anim(true)
	global_position = start_world.lerp(target_world, t)

	if t >= 1.0:
		global_position = target_world # snap exact
		is_moving = false
