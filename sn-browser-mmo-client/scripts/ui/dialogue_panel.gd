# DialoguePanel — Step 1 of the NPC/quest system.
# Displays a dialogue box with speaker name, text, and option buttons.
# No Spacetime/TypeScript integration yet; call show_dialogue() from GDScript to test.

extends VBoxContainer

@onready var name_label: Label = $Name
@onready var dialogue_text: RichTextLabel = $DialogueText
@onready var options_container: VBoxContainer = $OptionsContainer

var current_event_id: int = -1

func _ready() -> void:
	hide()

func show_dialogue(event_id: int, npc_name: String, text: String, options: Array) -> void:
	current_event_id = event_id
	name_label.text = npc_name
	dialogue_text.text = text

	# Clear existing option buttons
	for child in options_container.get_children():
		child.queue_free()

	# Build one button per option: { "id": int, "label": String }
	for opt in options:
		var btn := Button.new()
		btn.text = str(opt["label"])
		btn.pressed.connect(_on_option_pressed.bind(opt["id"]))
		options_container.add_child(btn)

	show()

func _on_option_pressed(option_id: int) -> void:
	print("Dialogue choice:", current_event_id, option_id)
	# Send choice to Spacetime reducer (TSBridge native or SNBridge on web)
	if current_event_id >= 0:
		if Engine.has_singleton("TSBridge"):
			var bridge = Engine.get_singleton("TSBridge")
			if bridge != null and bridge.has_method("send_dialogue_choice"):
				bridge.send_dialogue_choice(current_event_id, option_id)
		elif OS.has_feature("web"):
			var ok = JavaScriptBridge.eval("typeof window.SNBridge?.send_dialogue_choice === 'function'", true)
			if ok:
				JavaScriptBridge.eval("window.SNBridge.send_dialogue_choice(%d, %d);" % [current_event_id, option_id])
		_request_debug_refresh_if_visible()
	close_dialogue()

func _request_debug_refresh_if_visible() -> void:
	var hud = get_node_or_null("/root/GameHud")
	if hud == null:
		return
	var panel = hud.get_node_or_null("UIRoot/QuestDebugPanel")
	if panel == null or not panel.visible:
		return
	var nc = get_node_or_null("/root/network_client")
	if nc == null or not nc.has_method("request_quest_debug_snapshot"):
		return
	# Slight delay so server-side quest updates land before snapshot.
	await get_tree().create_timer(0.3).timeout
	nc.request_quest_debug_snapshot()

func close_dialogue() -> void:
	hide()
	current_event_id = -1
	for child in options_container.get_children():
		child.queue_free()
