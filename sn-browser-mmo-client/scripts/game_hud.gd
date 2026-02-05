extends CanvasLayer

# NOTE: Ensure an InputMap action "debug_toggle_quests" exists (e.g. bound to F9).
# GameHUD script - wires UI nodes to ChatManager for username and chat functionality
# Scene tree structure:
# GameHud (CanvasLayer) - this script
# └─ UIRoot (Control)
#    ├─ UsernamePanel (HBoxContainer)
#    │  ├─ UsernameLabel (Label)
#    │  ├─ UsernameInput (LineEdit)
#    │  └─ UsernameConfirmButton (Button)
#    └─ ChatPanel (VBoxContainer)
#       ├─ ChatScroll (ScrollContainer)
#       │   └─ ChatLog (RichTextLabel)
#       └─ ChatInputRow (HBoxContainer)
#          ├─ ChatInput (LineEdit)
#          └─ ChatSendButton (Button)

@onready var ui_root: Control = %UIRoot
@onready var quest_debug_panel: Control = $UIRoot/QuestDebugPanel
@onready var dialogue_panel: Control = $UIRoot/Panel/DialoguePanel
@onready var username_input: LineEdit = %UsernameInput
@onready var username_button: Button = %UsernameConfirmButton
@onready var chat_scroll: ScrollContainer = %ChatScroll
@onready var chat_log: RichTextLabel = %ChatLog
@onready var chat_input: LineEdit = %ChatInput
@onready var chat_button: Button = %ChatSendButton

func _ready() -> void:
	# Basic debug so we know HUD is alive
	print("[GAMEHUD] Ready, path:", get_path())
	
	# Debug: Verify nodes are found
	print("[GAMEHUD] Node references:")
	print("  chat_scroll: ", chat_scroll != null)
	print("  chat_log: ", chat_log != null)
	print("  chat_input: ", chat_input != null)
	if chat_log:
		print("  chat_log path: ", chat_log.get_path())
		print("  chat_log visible: ", chat_log.visible)
		print("  chat_log size: ", chat_log.size)

	# Connect signals in code to avoid losing them when the scene changes
	if not username_button.pressed.is_connected(_on_username_confirm_pressed):
		username_button.pressed.connect(_on_username_confirm_pressed)
		print("[GAMEHUD] Connected UsernameConfirmButton.pressed")
	
	if not chat_button.pressed.is_connected(_on_chat_send_pressed):
		chat_button.pressed.connect(_on_chat_send_pressed)
		print("[GAMEHUD] Connected ChatSendButton.pressed")
	
	if not chat_input.text_submitted.is_connected(_on_chat_input_submitted):
		chat_input.text_submitted.connect(_on_chat_input_submitted)
		print("[GAMEHUD] Connected ChatInput.text_submitted")

	# Connect QuestDebugPanel refresh signal (calls SpacetimeDB via network_client)
	if quest_debug_panel:
		if not quest_debug_panel.request_refresh_debug.is_connected(_on_quest_debug_refresh_requested):
			quest_debug_panel.request_refresh_debug.connect(_on_quest_debug_refresh_requested)
		print("[GAMEHUD] Connected to QuestDebugPanel.request_refresh_debug")
	else:
		print("[GAMEHUD] QuestDebugPanel not found under UIRoot")
	# Connect network_client for quest debug snapshot (real data from SpacetimeDB)
	var nc = get_node_or_null("/root/network_client")
	if nc and nc.has_signal("quest_debug_snapshot_received"):
		if not nc.quest_debug_snapshot_received.is_connected(_on_quest_debug_snapshot_received):
			nc.quest_debug_snapshot_received.connect(_on_quest_debug_snapshot_received)
		print("[GAMEHUD] Connected to network_client.quest_debug_snapshot_received")

	# Connect to ChatManager signal for incoming messages
	var cm = get_node_or_null("/root/ChatManager")
	if cm == null:
		push_error("[GAMEHUD] ChatManager not found at /root/ChatManager")
	else:
		if not cm.chat_message_received.is_connected(_on_chat_message_received):
			cm.chat_message_received.connect(_on_chat_message_received)
		print("[GAMEHUD] Connected to ChatManager.chat_message_received")
		
		# Connect to ChatManager display name changed signal
		if not cm.display_name_changed.is_connected(_on_display_name_changed):
			cm.display_name_changed.connect(_on_display_name_changed)
		print("[GAMEHUD] Connected to ChatManager.display_name_changed")
	
	# Auto-fill username field from TS bridge
	# Wait for SpacetimeDB connection to be established
	await get_tree().process_frame
	_load_current_display_name_with_retry()

## Handle ui_interact (F/Space) here so it is consumed before focused HUD controls (e.g. buttons).
## Notify local player's PlayerInput via group so Space doesn't activate a focused button.
func _input(event: InputEvent) -> void:
	if event.is_action_pressed("ui_interact"):
		get_viewport().set_input_as_handled()
		var tree := get_tree()
		var group_nodes := tree.get_nodes_in_group("local_player_input")
		print("[INTERACT_DEBUG] GameHUD: ui_interact pressed, local_player_input group size=%d" % group_nodes.size())
		if group_nodes.size() > 0:
			tree.call_group("local_player_input", "request_interact")
			print("[INTERACT_DEBUG] GameHUD: called request_interact on group")
		else:
			# Fallback: group empty (set_is_local may run after we're ready, or different scene tree).
			var scene = tree.current_scene
			var pi = scene.get_node_or_null("LocalPlayer/PlayerInput") if scene != null else null
			if pi != null and pi.has_method("request_interact"):
				var player = pi.get_parent()
				if player != null and "_local_player" in pi:
					pi._local_player = player
				pi.request_interact()
				print("[INTERACT_DEBUG] GameHUD: fallback request_interact on LocalPlayer/PlayerInput")
			else:
				print("[INTERACT_DEBUG] GameHUD: no local_player_input and fallback pi=null or no request_interact")

## Public API for TS bridge or other scripts: show dialogue from DB event.
func show_dialogue_from_db(event_id: int, npc_name: String, text: String, options: Array) -> void:
	print("[INTERACT_DEBUG] GameHUD.show_dialogue_from_db called: event_id=%d npc_name=%s options_count=%d" % [event_id, npc_name, options.size()])
	if dialogue_panel and dialogue_panel.is_inside_tree():
		dialogue_panel.show_dialogue(event_id, npc_name, text, options)
	else:
		print("[INTERACT_DEBUG] GameHUD.show_dialogue_from_db: dialogue_panel null or not in tree")
	
	# Auto-refresh quest debug panel if visible (quest may have started/progressed)
	_on_dialogue_shown()

## Public API: close dialogue (e.g. when event is cleared or cancelled).
func close_dialogue_from_db() -> void:
	if dialogue_panel and dialogue_panel.is_inside_tree():
		dialogue_panel.close_dialogue()

## Test helper: show fake dialogue (F3 or call from Remote inspector).
func _on_test_show_dialogue() -> void:
	var options = [
		{ "id": 1, "label": "Yes" },
		{ "id": 2, "label": "No" },
	]
	show_dialogue_from_db(123, "Professor", "Welcome to the tutorial!", options)

func _on_username_confirm_pressed() -> void:
	var name := username_input.text.strip_edges()
	if name == "":
		return
	var cm = get_node_or_null("/root/ChatManager")
	if cm == null:
		push_error("[GAMEHUD] ChatManager not available for username")
		return
	print("[GAMEHUD] Setting username:", name)
	cm.set_username(name)

func _on_chat_send_pressed() -> void:
	_send_chat()

func _on_chat_input_submitted(_text: String) -> void:
	_send_chat()

func _send_chat() -> void:
	var msg := chat_input.text.strip_edges()
	if msg == "":
		return
	var cm = get_node_or_null("/root/ChatManager")
	if cm == null:
		push_error("[GAMEHUD] ChatManager not available for chat send")
		return
	print("[GAMEHUD] Sending chat:", msg)
	cm.send_chat(msg)
	chat_input.text = ""

func _on_chat_message_received(sender_name: String, text: String, zone_id: int, created_at: String) -> void:
	# Called by ChatManager when new messages are polled from JS
	var line := "[%s] %s: %s\n" % [str(zone_id), sender_name, text]
	chat_log.append_text(line)
	
	# Force the scroll to bottom after UI updates
	await get_tree().process_frame
	chat_scroll.scroll_vertical = chat_scroll.get_v_scroll_bar().max_value

func _load_current_display_name_with_retry() -> void:
	# Auto-fill username field from TS bridge
	# Retry until SpacetimeDB connection is established
	if not OS.has_feature("web"):
		print("[GAMEHUD] Not running in web export, skipping display name load")
		return
	
	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api == null:
		print("[GAMEHUD] network_client not available, will retry...")
		# Retry after a delay
		await get_tree().create_timer(0.5).timeout
		_load_current_display_name_with_retry()
		return
	
	# Check if SpacetimeDB is connected
	var is_connected = false
	# Use JavaScriptBridge.eval to safely call the JavaScript function
	var has_is_connected = JavaScriptBridge.eval("typeof network_client?.is_connected === 'function'", true)
	if has_is_connected:
		var result = JavaScriptBridge.eval("network_client.is_connected()", true)
		is_connected = bool(result) if result != null else false
	
	if not is_connected:
		print("[GAMEHUD] SpacetimeDB not connected yet, will retry...")
		# Retry after a delay
		await get_tree().create_timer(0.5).timeout
		_load_current_display_name_with_retry()
		return
	
	# Connection is established, try to get display name
	var has_get_name = JavaScriptBridge.eval("typeof network_client?.get_current_display_name === 'function'", true)
	if has_get_name:
		var current_name = js_api.get_current_display_name()
		if current_name != "":
			username_input.text = current_name
			print("[GAMEHUD] Loaded current display name:", current_name)
		else:
			print("[GAMEHUD] No existing display name found (will be updated when available)")
	else:
		print("[GAMEHUD] network_client.get_current_display_name() not available")

func _load_current_display_name() -> void:
	# Simple version for direct calls (used by signal handler)
	if not OS.has_feature("web"):
		return
	
	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api != null and typeof(js_api) != TYPE_NIL:
		var has_get_name = JavaScriptBridge.eval("typeof network_client?.get_current_display_name === 'function'", true)
		if has_get_name:
			var current_name = js_api.get_current_display_name()
			if current_name != "":
				username_input.text = current_name
				print("[GAMEHUD] Loaded current display name:", current_name)

func _on_display_name_changed(new_name: String) -> void:
	# Called by ChatManager when display name changes
	if new_name != "":
		username_input.text = new_name
		print("[GAMEHUD] Display name updated from ChatManager:", new_name)

func _unhandled_input(event: InputEvent) -> void:
	# Debug: F9 = toggle quest/flags debug panel
	if event.is_action_pressed("debug_toggle_quests"):
		if quest_debug_panel:
			quest_debug_panel.toggle_visible()
			if quest_debug_panel.visible and quest_debug_panel.is_auto_refresh_enabled():
				quest_debug_panel.request_refresh_debug.emit()
		get_viewport().set_input_as_handled()
		return
	# Debug: F3 = test dialogue, F4 = spawn test NPC, F5 = spawn test Interactable
	if event is InputEventKey and event.pressed and not event.echo:
		if event.keycode == KEY_F3:
			_on_test_show_dialogue()
			get_viewport().set_input_as_handled()
		elif event.keycode == KEY_F4:
			var zm = get_node_or_null("/root/ZoneManager")
			var world = zm.get_current_world() if zm else null
			if world != null and world.has_method("debug_spawn_test_npc"):
				world.debug_spawn_test_npc()
				get_viewport().set_input_as_handled()
		elif event.keycode == KEY_F5:
			var zm = get_node_or_null("/root/ZoneManager")
			var world = zm.get_current_world() if zm else null
			if world != null and world.has_method("debug_spawn_test_interactable"):
				world.debug_spawn_test_interactable()
				get_viewport().set_input_as_handled()


func _on_quest_debug_refresh_requested() -> void:
	# Request real quest/flag data from SpacetimeDB via network_client.
	# Result arrives asynchronously via _on_quest_debug_snapshot_received.
	var nc = get_node_or_null("/root/network_client")
	if nc and nc.has_method("request_quest_debug_snapshot"):
		nc.request_quest_debug_snapshot()
	elif quest_debug_panel:
		# Non-web platform: show empty state
		quest_debug_panel.set_quest_debug({})
		quest_debug_panel.set_flag_debug([])


func _on_quest_debug_snapshot_received(quest: Dictionary, flags: Array) -> void:
	print("[GAMEHUD] _on_quest_debug_snapshot_received quest_keys=", quest.keys(), " flags=", flags.size(), " panel=", quest_debug_panel)
	if quest_debug_panel:
		quest_debug_panel.set_quest_debug(quest)
		quest_debug_panel.set_flag_debug(flags)
	else:
		print("[GAMEHUD] QuestDebugPanel is null; cannot render quest/flags")

## Called when player interacts with NPC/interactable (dialogue shown).
## If quest debug panel is visible, auto-refresh after a short delay (quest may have started/progressed).
func _on_dialogue_shown() -> void:
	if quest_debug_panel and quest_debug_panel.visible:
		# Delay refresh slightly so server has time to process quest start
		await get_tree().create_timer(0.3).timeout
		if quest_debug_panel.visible:
			_on_quest_debug_refresh_requested()
