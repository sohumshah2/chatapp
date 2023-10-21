import socketio

targetA = 'Magnus'
targetB = 'Elia'

sio = socketio.Client(reconnection=False)

@sio.event
def connect():
    print("Connected to the server")

@sio.on("broadcastMessage")
def receive_message(message):
    print(f"Received message from server: {message}")

sio.connect("https://chatappserver-ucb7.onrender.com")

count = 1
while True:
    count += 1
    sio.emit("sendMessage", {
        'sender': targetA,
        'receiver': targetB,
        'message': 'qwertyuiopasdfghjklzxcvbnm' * count,
        'handshake': False
    })
    sio.sleep(1)
