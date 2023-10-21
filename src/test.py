import socketio

# Initialize a Socket.io client
sio = socketio.Client(reconnection=False)

# Define an event handler for when the client connects
@sio.event
def connect():
    print("Connected to the server")

# Define an event handler for when the client receives a "receiveMessage" event
@sio.on("broadcastMessage")
def receive_message(message):
    print(f"Received message from server: {message}")

# Connect to the Socket.io server
sio.connect("https://chatappserver-ucb7.onrender.com")

# Send a "sendMessage" event to the server
message = "keyboard"
sio.emit("sendMessage", message)
# exit(1)
while True:
    for i in range(500):
        sio.emit("sendMessage", message)
        # sio.emit("sendMessage", 'THE SECRET MESSAGE IS PINEAPPLE' * i)
        sio.sleep(0.1)
    # message = input()

# Wait for a few seconds before disconnecting (you can modify this)
sio.sleep(5)

# Disconnect from the server
sio.disconnect()
