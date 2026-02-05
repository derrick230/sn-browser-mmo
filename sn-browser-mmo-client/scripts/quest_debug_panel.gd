extends PanelContainer

## Dev-only quest/flags debug UI. Toggle with debug_toggle_quests (e.g. F9).

# Emitted when Refresh is pressed; GameHUD (or manager) can fetch new data.
signal request_refresh_debug()

# quest:
# {
#   "quest_id": String,              # e.g. "tut_001"
#   "name": String,                  # "First Steps"
#   "state": String,                 # "NotStarted" | "Active" | "Completed"
#   "current_step_index": int,       # 1-based or 0-based; we'll just display it
#   "current_step_type": String,     # "INTERACT" | "TALK_TO_NPC" | ...
#   "current_step_target": String,   # key like "tutorial_sign_1"
#   "current_step_description": String,
#   "steps": Array[Dictionary]       # full list of steps in order
# }
#
# each step in quest["steps"]:
# {
#   "index": int,
#   "step_type": String,
#   "target_id": String,
#   "description": String
# }
#
# flags:
# [
#   {
#     "key": String,
#     "value": String,
#     "flag_type": String,  # "bool" | "int" | ...
#     "category": String    # "tutorial" | "choice" | "story_progress" | ...
#   },
#   ...
# ]

var auto_refresh := true

@onready var _active_quest_label: Label = $Margin/VBox/BodyTabs/QuestsTab/QuestsVBox/ActiveQuestLabel
@onready var _current_step_label: Label = $Margin/VBox/BodyTabs/QuestsTab/QuestsVBox/CurrentStepLabel
@onready var _quest_steps_vbox: VBoxContainer = $Margin/VBox/BodyTabs/QuestsTab/QuestsVBox/QuestStepsScroll/QuestStepsVBox
@onready var _flags_vbox: VBoxContainer = $Margin/VBox/BodyTabs/FlagsTab/FlagsScroll/FlagsVBox
@onready var _close_button: Button = $Margin/VBox/Header/CloseButton
@onready var _refresh_button: Button = $Margin/VBox/Footer/RefreshButton
@onready var _auto_refresh_check: CheckBox = $Margin/VBox/Footer/AutoRefreshCheck
@onready var _body_tabs: TabContainer = $Margin/VBox/BodyTabs


func _ready() -> void:
	visible = false
	_body_tabs.set_tab_title(0, "Quests")
	_body_tabs.set_tab_title(1, "Flags")
	auto_refresh = _auto_refresh_check.button_pressed

	if not _close_button.pressed.is_connected(_on_close_pressed):
		_close_button.pressed.connect(_on_close_pressed)
	if not _refresh_button.pressed.is_connected(_on_refresh_pressed):
		_refresh_button.pressed.connect(_on_refresh_pressed)
	if not _auto_refresh_check.toggled.is_connected(_on_auto_refresh_toggled):
		_auto_refresh_check.toggled.connect(_on_auto_refresh_toggled)


func _on_close_pressed() -> void:
	visible = false


func _on_refresh_pressed() -> void:
	request_refresh_debug.emit()


func _on_auto_refresh_toggled(button_pressed: bool) -> void:
	auto_refresh = button_pressed


func is_auto_refresh_enabled() -> bool:
	return auto_refresh


func toggle_visible() -> void:
	visible = not visible


func show_and_refresh() -> void:
	visible = true
	if auto_refresh:
		request_refresh_debug.emit()


func set_quest_debug(quest: Dictionary) -> void:
	if quest.is_empty():
		_active_quest_label.text = "Active quest: (none)"
		_current_step_label.text = ""
		_clear_children(_quest_steps_vbox)
		return

	var quest_id: String = quest.get("quest_id", "")
	var name_str: String = quest.get("name", "")
	var state: String = quest.get("state", "")
	_active_quest_label.text = "Active quest: %s - %s (%s)" % [quest_id, name_str, state]

	var cur_idx: int = quest.get("current_step_index", 0)
	var cur_type: String = quest.get("current_step_type", "")
	var cur_target: String = quest.get("current_step_target", "")
	var cur_desc: String = quest.get("current_step_description", "")
	_current_step_label.text = "Step %s: %s → %s\n%s" % [cur_idx, cur_type, cur_target, cur_desc]

	_clear_children(_quest_steps_vbox)
	var steps: Array = quest.get("steps", [])
	for step in steps:
		var hbox := HBoxContainer.new()
		var idx: int = step.get("index", 0)
		var step_type: String = step.get("step_type", "")
		var target_id: String = step.get("target_id", "")
		var desc: String = step.get("description", "")
		var summary := "[%d] %s %s" % [idx, step_type, target_id]
		var prefix := "> " if idx == cur_idx else "  "
		var lbl_summary := Label.new()
		lbl_summary.text = prefix + summary
		lbl_summary.custom_minimum_size.x = 180
		var lbl_desc := Label.new()
		lbl_desc.text = desc
		lbl_desc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		lbl_desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		hbox.add_child(lbl_summary)
		hbox.add_child(lbl_desc)
		_quest_steps_vbox.add_child(hbox)


func set_flag_debug(flags: Array) -> void:
	print("[QUEST_DEBUG_UI] set_flag_debug flags=", flags.size(), " vbox_children_before=", _flags_vbox.get_child_count(), " vbox_size=", _flags_vbox.size, " vbox_visible=", _flags_vbox.visible)
	_clear_children(_flags_vbox)
	# Sort by category then key
	var sorted := flags.duplicate()
	sorted.sort_custom(func(a, b): return _flag_sort_key(a) < _flag_sort_key(b))
	for flag in sorted:
		var hbox := HBoxContainer.new()
		var key: String = flag.get("key", "")
		var value: String = str(flag.get("value", ""))
		var flag_type: String = flag.get("flag_type", "")
		var category: String = flag.get("category", "")
		var key_label := Label.new()
		key_label.text = "%s (%s/%s)" % [key, category, flag_type]
		key_label.custom_minimum_size.x = 200
		var val_label := Label.new()
		val_label.text = value
		val_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		hbox.add_child(key_label)
		hbox.add_child(val_label)
		_flags_vbox.add_child(hbox)
	print("[QUEST_DEBUG_UI] set_flag_debug done children=", _flags_vbox.get_child_count(), " vbox_size=", _flags_vbox.size)


func _flag_sort_key(flag: Dictionary) -> String:
	return "%s|%s" % [flag.get("category", ""), flag.get("key", "")]


func _clear_children(container: Control) -> void:
	for c in container.get_children():
		container.remove_child(c)
		c.queue_free()
