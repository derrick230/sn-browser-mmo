extends Node2D
class_name NPC

@export var npc_zone_id: int = 0
@export var npc_spawn_id: int = 0
@export var npc_def_id: int = 0
## Stable identity used by server-side quest and dialogue data.
## Must be unique per "logical NPC" (e.g. professor_1).
## This should not change once referenced by quests/flags.
@export var npc_key: String = ""
@export var npc_name: String = ""
@export var facing: int = 0  # 0-3 (or 0-7 later if we support diagonals)
@export var sprite_id: String = ""
@export var behavior_key: String = ""
@export var default_dialogue_key: String = ""

@onready var sprite: Node = $AnimatedSprite2D  # or $Sprite2D depending on what you used

func _ready() -> void:
	   # Add any initialisation you want; for now, nothing special.
	pass

func set_sprite_from_id(sprite_id: String) -> void:
	   # Placeholder: later we can map sprite_id to textures/animations.
	   # For now this can be left as a stub or set a placeholder texture.
	pass

func set_facing_dir(dir: int) -> void:
	facing = dir
	   # Later, we can update animations based on facing.
	   # For now, keep it as a simple assignment.
	pass
