import socketio

sio = socketio.Client(reconnection=False)

@sio.event
def connect():
    print("Connected to the server")

@sio.on("broadcastMessage")
def receive_message(message):
    print(f"Received message from server: {message}")
    if not message['handshake']:
        sio.emit("sendMessage", message)

sio.connect("https://chatappserver-ucb7.onrender.com")

