import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("localhost:5050"); // Replace with your server's URL
// const socket = io("http://server.sharedwithexpose.com/", {
//   transports: ["websocket"],
// });

function App() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.on("broadcastMessage", (msg) => {
      console.log("received a new msg", msg);
      if (msg.sender === sender || msg.receiver === sender) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });

    return () => {
      socket.off("broadcastMessage")
    };
  }, [sender]);

  useEffect(() => {
    console.log(JSON.stringify(messages))
  }, [messages])

  const handleSendMessage = () => {
    console.log("Send button clicked");
    console.log(message);
    socket.emit("sendMessage", {
      'sender': sender,
      'receiver': receiver,
      'message': message,
    });
    // setMessage("");
  };

  return (
    <div className="App">
      <h1>Chat App</h1>
      <p>
        for debugging - sender: {sender}, receiver: {receiver}
      </p>
      <div className="message-container">
        <p style={{ fontWeight: "bold" }}>Messages:</p>
        {messages
          // .filter((msg) => msg.sender == sender || msg.receiver == sender)
          .map((msg, index) => (
            <div key={index}>
              {msg.sender} -&gt; {msg.receiver}: {msg.message}
            </div>
          ))}
      </div>
      <div className="input-container">
        <p style={{ fontWeight: "bold" }}>Enter your username:</p>
        <input onChange={(e) => setSender(e.target.value)}></input>
        {/* <span
          contentEditable="true"
          value={message}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setSender(e.target.textContent)}
        ></span> */}
        <p style={{ fontWeight: "bold" }}>Enter receiver username:</p>
        <span
          contentEditable="true"
          value={message}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setReceiver(e.target.textContent)}
        ></span>

        <p style={{ fontWeight: "bold" }}>Enter Message:</p>
        <span
          contentEditable="true"
          value={message}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "200px",
            maxWidth: "200px",
          }}
          onInput={(e) => setMessage(e.target.textContent)}
        ></span>
        <div>
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
