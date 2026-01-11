extends Node

var ws := WebSocketPeer.new()
var sent_hello := false

func _ready() -> void:
	var err := ws.connect_to_url("ws://localhost:8080")
	if err != OK:
		print("WebSocket connect error:", err)
	else:
		print("WebSocket connecting...")

func _process(_delta: float) -> void:
	ws.poll()

	var state := ws.get_ready_state()

	if state == WebSocketPeer.STATE_OPEN:
		if not sent_hello:
			sent_hello = true
			ws.send_text("hello from godot browser client")

		while ws.get_available_packet_count() > 0:
			var msg := ws.get_packet().get_string_from_utf8()
			print("Received:", msg)

	elif state == WebSocketPeer.STATE_CLOSED:
		if ws.get_close_code() != -1:
			print(
				"WebSocket closed:",
				ws.get_close_code(),
				ws.get_close_reason()
			)
