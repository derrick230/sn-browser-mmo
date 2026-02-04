extends Node2D
class_name Interactable

@export var interactable_zone_id: int = 0
@export var interactable_spawn_id: int = 0
@export var interactable_def_id: int = 0
## Stable identity used by server-side quest data (e.g. "z1_sign_1").
@export var interactable_key: String = ""
@export var interactable_name: String = ""
@export var sprite_id: String = ""
@export var behavior_key: String = ""
@export var default_dialogue_key: String = ""

@onready var sprite: AnimatedSprite2D = $AnimatedSprite2D

func _ready() -> void:
	pass

func setup_from_def(display_name: String, p_sprite_id: String) -> void:
	interactable_name = display_name
	sprite_id = p_sprite_id
	# Later we can use sprite_id to load a texture; for now this is a stub.
