

import socketio
import eventlet

io = socketio.Server(cors_allowed_origins='*')


@io.event
def connect(socket_id: str, *_) -> None:
    print("Client connected: ", socket_id)


@io.event
def disconnect(socket_id: str) -> None:
    print("Client disconnected: ", socket_id)


@io.event
def sendMessage(socket_id: str, message: str) -> None:
    print("Received message", socket_id, message)
    io.emit("broadcastMessage", message)



print("Starting server...")
app = socketio.WSGIApp(io)
eventlet.wsgi.server(eventlet.listen(("", 5050)), app)
