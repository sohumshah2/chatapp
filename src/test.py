import socketio

# Initialize a Socket.io client
sio = socketio.Client()

# Define an event handler for when the client connects
@sio.event
def connect():
    print("Connected to the server")

# Define an event handler for when the client receives a "receiveMessage" event
@sio.on("receiveMessage")
def receive_message(message):
    print(f"Received message from server: {message}")

# Connect to the Socket.io server
sio.connect("http://localhost:5050")

# Send a "sendMessage" event to the server
while True:
    message = "Hello, Server!"
    sio.emit("sendMessage", message)
    input()

# Wait for a few seconds before disconnecting (you can modify this)
sio.sleep(5)

# Disconnect from the server
sio.disconnect()
