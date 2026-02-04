extends Node

# ChatManager autoload - handles username and chat communication with SpacetimeDB
# Connects TypeScript network_client API to Godot signals
# Located at: res://scripts/chat_manager.gd
# Autoload name: ChatManager (accessible at /root/ChatManager)

signal chat_message_received(sender_name: String, text: String, zone_id: int, created_at)
signal display_name_changed(new_name: String)

var js_network_client = null

func _ready() -> void:
	print("[ChatManager] Ready at ", get_path())
	# Wait a frame to ensure JavaScript bridge is loaded
	await get_tree().process_frame
	
	# Get the network_client JavaScript interface
	js_network_client = JavaScriptBridge.get_interface("network_client")
	
	if js_network_client == null:
		push_error("[ChatManager] network_client JavaScript interface not found!")
		print("[ChatManager] Make sure spacetime-bridge.bundle.js is loaded and network_client is exposed on globalThis")
		return
	
	print("[ChatManager] Connected to network_client JavaScript interface")
	
	# Register chat listener callback (callback-based approach)
	_setup_chat_listener_callback()
	
	# Expose a callback for TypeScript to trigger display name refresh
	_setup_display_name_refresh_callback()
	
	# Try to refresh display name after connection is established
	_refresh_display_name_when_ready()

# ============================================================================
# CHAT LISTENER SETUP (Callback-based)
# ============================================================================
func _setup_chat_listener_callback() -> void:
	# Check if register_chat_listener method exists
	var has_register = JavaScriptBridge.eval("typeof network_client?.register_chat_listener === 'function'", true)
	if not has_register:
		push_error("[ChatManager] network_client.register_chat_listener method not found!")
		return
	
	# Create a callback that JavaScript can call
	var chat_callback = JavaScriptBridge.create_callback(_on_chat_message)
	
	# Expose the callback on window so TypeScript can access it
	var window_obj = JavaScriptBridge.get_interface("window")
	if window_obj == null:
		push_error("[ChatManager] Could not access window object")
		return
	
	window_obj.godotChatCallback = chat_callback
	
	# Register wrapper function with TypeScript
	var eval_code = """
		(function() {
			if (typeof network_client !== 'undefined' && network_client.register_chat_listener) {
				network_client.register_chat_listener(function(msg) {
					// Call the Godot callback - it expects an array with one element (the message object)
					if (window.godotChatCallback) {
						try {
							window.godotChatCallback([msg]);
						} catch(e) {
							console.error('[ChatManager] Error calling Godot callback:', e);
						}
					}
				});
				return true;
			}
			console.error('[ChatManager] network_client.register_chat_listener not available');
			return false;
		})()
	"""
	var result = JavaScriptBridge.eval(eval_code, true)
	if result:
		print("[ChatManager] Registered chat listener with network_client")
	else:
		push_error("[ChatManager] Failed to register chat listener - check console for errors")

# ============================================================================
# DISPLAY NAME REFRESH CALLBACK SETUP
# ============================================================================
func _setup_display_name_refresh_callback() -> void:
	# Create a callback that JavaScript can call when Player data arrives
	var refresh_callback = JavaScriptBridge.create_callback(_on_display_name_refresh_requested)
	
	# Expose the callback on window so TypeScript can access it
	var window_obj = JavaScriptBridge.get_interface("window")
	if window_obj == null:
		push_error("[ChatManager] Could not access window object for display name refresh")
		return
	
	window_obj.godotDisplayNameRefreshCallback = refresh_callback
	print("[ChatManager] Exposed display name refresh callback to TypeScript")

# Called from JavaScript when Player data arrives and display name should be refreshed
func _on_display_name_refresh_requested(_args: Array) -> void:
	# Trigger a refresh when Player data arrives
	print("[ChatManager] Display name refresh requested from TypeScript")
	refresh_display_name()

# ============================================================================
# CHAT MESSAGE HANDLING
# ============================================================================

# Called from JavaScript when a chat message is received (callback-based)
# args is an Array with one element: [{ sender_name: string, text: string, zone_id: number, created_at: any }]
func _on_chat_message(args: Array) -> void:
	# Handle JavaScriptObject wrapper (JavaScriptBridge may wrap arrays)
	if args.size() == 1 and args[0] is JavaScriptObject:
		var js_obj = args[0]
		# Extract fields from JavaScript object
		var sender_name: String = str(js_obj.get("sender_name", "Unknown"))
		var text: String = str(js_obj.get("text", ""))
		var zone_id: int = int(js_obj.get("zone_id", 1))
		var created_at = js_obj.get("created_at", null)
		
		# Emit signal for UI to handle
		chat_message_received.emit(sender_name, text, zone_id, created_at)
		print("[ChatManager] Received chat: %s: %s (zone %d)" % [sender_name, text, zone_id])
	elif args.size() == 1 and args[0] is Dictionary:
		# Direct dictionary (if not wrapped)
		var msg = args[0] as Dictionary
		var sender_name: String = str(msg.get("sender_name", "Unknown"))
		var text: String = str(msg.get("text", ""))
		var zone_id: int = int(msg.get("zone_id", 1))
		var created_at = msg.get("created_at", null)
		
		# Emit signal for UI to handle
		chat_message_received.emit(sender_name, text, zone_id, created_at)
		print("[ChatManager] Received chat: %s: %s (zone %d)" % [sender_name, text, zone_id])
	else:
		push_error("[ChatManager] Invalid chat message format: args.size() = %d" % args.size())

# Polling disabled: we use register_chat_listener only. The bridge pushes to both
# the listener and the queue; using both caused every message to appear twice (once
# from the listener, once from the queue). Using only the listener fixes the duplicate.
func _process(_delta: float) -> void:
	pass  # No-op: chat is delivered via register_chat_listener callback only

# ============================================================================
# PUBLIC API
# ============================================================================

# Set username (display name)
func set_username(name: String) -> void:
	var trimmed := name.strip_edges()
	if trimmed == "":
		push_warning("[ChatManager] Ignoring empty username")
		return

	if not OS.has_feature("web"):
		push_warning("[ChatManager] Not running in web export (JavaScriptBridge not available)")
		return

	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api == null:
		push_error("[ChatManager] network_client JS interface not available")
		return

	print("[ChatManager] Setting username to:", trimmed)
	js_api.set_display_name(trimmed)

# Send chat message
func send_chat(text: String) -> void:
	var trimmed := text.strip_edges()
	if trimmed == "":
		push_warning("[ChatManager] Ignoring empty chat message")
		return

	if not OS.has_feature("web"):
		push_warning("[ChatManager] Not running in web export (JavaScriptBridge not available)")
		return

	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api == null:
		push_error("[ChatManager] network_client JS interface not available")
		return

	print("[ChatManager] Sending chat message:", trimmed)
	js_api.send_chat_message(trimmed)

# Refresh display name when SpacetimeDB connection is ready (with retry)
func _refresh_display_name_when_ready() -> void:
	if not OS.has_feature("web"):
		return
	
	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api == null:
		# Retry after a delay
		await get_tree().create_timer(0.5).timeout
		_refresh_display_name_when_ready()
		return
	
	# Check if SpacetimeDB is connected
	var is_connected = false
	# Use JavaScriptBridge.eval to safely call the JavaScript function
	var has_is_connected = JavaScriptBridge.eval("typeof network_client?.is_connected === 'function'", true)
	if has_is_connected:
		var result = JavaScriptBridge.eval("network_client.is_connected()", true)
		is_connected = bool(result) if result != null else false
	
	if not is_connected:
		# Retry after a delay
		await get_tree().create_timer(0.5).timeout
		_refresh_display_name_when_ready()
		return
	
	# Connection is established, refresh display name with retry
	refresh_display_name_with_retry(0)

# Refresh display name from TypeScript bridge and emit signal (with retry)
func refresh_display_name_with_retry(attempt: int = 0) -> void:
	if not OS.has_feature("web"):
		return
	
	# Limit retries to avoid infinite loops (try for up to 10 seconds = 20 attempts)
	if attempt >= 20:
		print("[ChatManager] Display name refresh timed out after 20 attempts")
		return
	
	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api == null:
		# Retry after a delay
		await get_tree().create_timer(0.5).timeout
		refresh_display_name_with_retry(attempt + 1)
		return
	
	var has_get_name = JavaScriptBridge.eval("typeof network_client?.get_current_display_name === 'function'", true)
	if not has_get_name:
		print("[ChatManager] network_client.get_current_display_name() not available, retrying...")
		await get_tree().create_timer(0.5).timeout
		refresh_display_name_with_retry(attempt + 1)
		return
	
	var n = js_api.get_current_display_name()
	if n != "":
		emit_signal("display_name_changed", n)
		print("[ChatManager] Refreshed display name:", n)
	else:
		# Display name not available yet, retry
		if attempt % 4 == 0:  # Log every 4 attempts (every 2 seconds)
			print("[ChatManager] Display name not available yet (attempt %d), retrying..." % (attempt + 1))
		await get_tree().create_timer(0.5).timeout
		refresh_display_name_with_retry(attempt + 1)

# Refresh display name from TypeScript bridge and emit signal (simple version, no retry)
func refresh_display_name() -> void:
	if not OS.has_feature("web"):
		return
	
	var js_api = JavaScriptBridge.get_interface("network_client")
	if js_api != null and typeof(js_api) != TYPE_NIL:
		var has_get_name = JavaScriptBridge.eval("typeof network_client?.get_current_display_name === 'function'", true)
		if has_get_name:
			var n = js_api.get_current_display_name()
			if n != "":
				emit_signal("display_name_changed", n)
				print("[ChatManager] Refreshed display name:", n)
			else:
				print("[ChatManager] Display name not available yet")
		else:
			print("[ChatManager] network_client.get_current_display_name() not available")
	else:
		print("[ChatManager] network_client JS interface not available")
