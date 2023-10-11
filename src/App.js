import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://server.sharedwithexpose.com"); // Replace with your server's URL
// const socket = io("http://server.sharedwithexpose.com/", {
//   transports: ["websocket"],
// });

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("broadcastMessage", (msg) => {
      setMessages([...messages, msg]);
    });

    return () => {
      // socket.disconnect();
    };
  }, [messages]);

  const handleSendMessage = () => {
    console.log("Send button clicked");
    console.log(message);
    socket.emit("sendMessage", message);
    setMessage("");
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
}

export default App;
