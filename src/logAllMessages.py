import socketio

sio = socketio.Client(reconnection=False)

@sio.event
def connect():
    print("HAHAHHA Monitoring all traffic")

@sio.on("broadcastMessage")
def receive_message(message):
    print(f"{message['sender']} -> {message['receiver']}: {message['message']}")

# Connect to the Socket.io server
sio.connect("https://chatappserver-ucb7.onrender.com")
