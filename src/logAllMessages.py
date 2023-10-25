import socketio
import pprint


sio = socketio.Client(reconnection=False)

@sio.event
def connect():
    print("HAHAHHA Monitoring all traffic")

@sio.on("broadcastMessage")
def receive_message(message):
    # print(f"{message['sender']} -> {message['receiver']}: {message['message']}")
    pprint.pprint(message, indent = 4)
    print('')

# Connect to the Socket.io server
sio.connect("https://chatappserver-ucb7.onrender.com")
