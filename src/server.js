const express = require("express");
const app = express();
const PORT = 5050;

//New imports
const http = require("http").Server(app);
const cors = require("cors");

app.use(cors());

const socketIO = require("socket.io")(http, {
  cors: {
    origin: "http://localhost:3023",
  },
});

//Add this before the app.get() block
socketIO.on("connection", (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);
  socket.on("disconnect", () => {
    console.log("🔥: A user disconnected");
  });
});

socketIO.on("sendMessage", (message) => {
  console.log(`Received message: ${message}`);
  socketIO.emit("sendMessage", message); // Broadcast the message to all connected clients
});

// app.get("/api", (req, res) => {
//   res.json({
//     message: "Hello world",
//   });
// });

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
