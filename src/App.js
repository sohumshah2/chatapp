import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import aes256 from "aes256";
import { Buffer } from 'buffer';


/* global BigInt */
// const { BigInt } = globalThis;

// import crypto from 'crypto';
// import hkdf from 'js-crypto-hkdf'
// const hkdf = require('js-crypto-hkdf')

import {generateKeyToSend, computeSymmetricKey} from './diffieHellman'
global.Buffer = global.Buffer || require('buffer').Buffer


const socket = io("https://chatappserver-ucb7.onrender.com"); // Replace with your server's URL
// const socket = io("http://server.sharedwithexpose.com/", {
//   transports: ["websocket"],
// });

function App() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [diffieHellmanPrivate, setDiffieHellmanPrivate] = useState("")
  const [diffieHellmanPublic, setDiffieHellmanPublic] = useState("")
  const [diffieHellmanReceiverPublic, setDiffieHellmanReceiverPublic] = useState(BigInt(0))
  const [waitingForHandshakeResponse, setWaitingForHandshakeResponse] = useState(false)
  const [aesKey, setAesKey] = useState("")

  useEffect(() => {
    console.log('setup listener again')
    socket.on("broadcastMessage", (msg) => {
      console.log("received a new msg", msg);
      if (!msg.handshake && (msg.sender === sender || msg.receiver === sender)) {
        const decryptedMessage = aes256.decrypt(aesKey, msg.message)    
        console.log('decryptedmsg', decryptedMessage, 'msg message', msg.message)
        msg.message = decryptedMessage
        setMessages((prevMessages) => [...prevMessages, msg]);
      } else if (msg.handshake && msg.receiver === sender) {
        // receive handshake
        if (waitingForHandshakeResponse) {
          setWaitingForHandshakeResponse(false)
          setDiffieHellmanReceiverPublic(BigInt(msg.message))
          computeSymmetricKey(diffieHellmanPrivate, BigInt(msg.message)).then((aesKey) => {
            setAesKey(aesKey)
          })
        } else {
          console.log('h24')
          setReceiver(msg.sender)
          setDiffieHellmanReceiverPublic(msg.message)
          const dh = generateKeyToSend()
          setDiffieHellmanPrivate(dh.aBigInt)
          setDiffieHellmanPublic(dh.A)
          socket.emit("sendMessage", {
            'sender': sender,
            'receiver': msg.sender,
            'message': dh.A.toString(),
            'handshake': true
          })
          computeSymmetricKey(dh.aBigInt, msg.message).then((aesKey) => {
            setAesKey(aesKey)
          })
        }
      }
    });

    
    return () => {
      socket.off("broadcastMessage")
    };
  }, [sender, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, receiver, waitingForHandshakeResponse, aesKey]);

  useEffect(() => {
    console.log(JSON.stringify(messages))
  }, [messages])

  // useEffect(() => {
  //   console.log(diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic)
  // }, [sender, receiver, message, messages, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, waitingForHandshakeResponse, aesKey])


  const handleSendMessage = () => {
    console.log("Send button clicked");
    console.log(message);
    const obj = generateKeyToSend()
    console.log(obj);
    const obj2 = generateKeyToSend()
    console.log(computeSymmetricKey(obj.aBigInt, obj2.A))
    console.log(computeSymmetricKey(obj2.aBigInt, obj.A))
    const encryptedMessage = aes256.encrypt(aesKey, message)
    console.log('encryptedmessage', encryptedMessage)
    socket.emit("sendMessage", {sender, receiver, message: encryptedMessage, handshake: false});
    // setMessage("");
  };

  const establishConnection = () => {
    const dh = generateKeyToSend()
    setDiffieHellmanPrivate(dh.aBigInt)
    setDiffieHellmanPublic(dh.A)

    socket.emit("sendMessage", {
      'sender': sender,
      'receiver': receiver,
      'message': dh.A.toString(),
      'handshake': true
    })
    setWaitingForHandshakeResponse(true)
    
  }


  return (
    <div className="App">
      <h1>Chat App</h1>
      <p>
        sender: {sender}, receiver: {receiver}, aesKey: {aesKey} <br/>
        dhPriv: {diffieHellmanPrivate.toString()}<br/>
        dhPub: {diffieHellmanPublic.toString()}<br/>
        dhRecPub: {diffieHellmanReceiverPublic.toString()}<br/>
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
          value={receiver}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setReceiver(e.target.textContent)}
        ></span>
        <div>
          <button onClick={establishConnection}>Establish connection</button>
          <p>{waitingForHandshakeResponse ? 'true' : 'false'}</p>
        </div>

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
