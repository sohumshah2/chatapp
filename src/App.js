import React, {useEffect, useRef } from "react";
import io from "socket.io-client";
import aes256 from "aes256";
import useState from 'react-usestateref'
import { Buffer } from 'buffer';
import {generateKeyToSend, computeSymmetricKey} from './diffieHellman'


/* global BigInt */
// const { BigInt } = globalThis;

// import crypto from 'crypto';
// import hkdf from 'js-crypto-hkdf'
// const hkdf = require('js-crypto-hkdf')

global.Buffer = global.Buffer || require('buffer').Buffer


const socket = io("https://chatappserver-ucb7.onrender.com"); // Replace with your server's URL
// const socket = io("http://server.sharedwithexpose.com/", {
//   transports: ["websocket"],
// });

function App() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [diffieHellmanPublic, setDiffieHellmanPublic] = useState("")
  const [diffieHellmanReceiverPublic, setDiffieHellmanReceiverPublic] = useState(BigInt(0))

  const [connectionEstablishedWith, setConnectionEstablishedWith, connectionEstablishedWithRef] = useState("")
  const [diffieHellmanPrivate, setDiffieHellmanPrivate, diffieHellmanPrivateRef] = useState("")
  const [sender, setSender, senderRef] = useState("");
  const [receiver, setReceiver, receiverRef] = useState("");
  const [aesKey, setAesKey, aesKeyRef] = useState("")
  const [waitingForHandshakeResponse, setWaitingForHandshakeResponse, waitingForHandshakeResponseRef] = useState(false)

  // const test = useRef("")

  useEffect(() => {
    console.log('setup listener again')
    socket.on("broadcastMessage", (msg) => {
      console.log("received a new msg", msg);
      if (!msg.handshake && (msg.sender === senderRef.current || msg.receiver === senderRef.current)) {
        const decryptedMessage = aes256.decrypt(aesKeyRef.current, msg.message)    
        console.log('decryptedmsg', decryptedMessage, 'msg message', msg.message)
        msg.message = decryptedMessage
        setMessages((prevMessages) => [...prevMessages, msg]);
      } else if (msg.handshake && msg.receiver === senderRef.current) {
        // receive handshake

        if (aesKeyRef.current !== '' && aes256.decrypt(aesKeyRef.current, msg.message) === 'end') {
          setConnectionEstablishedWith('')
        }

        else if (waitingForHandshakeResponseRef.current) {
        } else {
          if (connectionEstablishedWithRef.current !== '') {
            socket.emit("sendMessage", {sender: senderRef.current, receiver: connectionEstablishedWithRef.current, message: aes256.encrypt(aesKeyRef.current, 'end'), handshake: true});
          }

          console.log('h24', senderRef.current)
          setConnectionEstablishedWith(msg.sender)
          setReceiver(msg.sender)
          setDiffieHellmanReceiverPublic(msg.message)
          const dh = generateKeyToSend()
          setDiffieHellmanPrivate(dh.aBigInt)
          setDiffieHellmanPublic(dh.A)
          socket.emit("sendMessage", {
            'sender': senderRef.current,
            'receiver': msg.sender,
            'message': dh.A.toString(),
            'handshake': true,
            'flagrmv': 0
          })
          console.log('aeskey is computed with parameters', dh.aBigInt, msg.message)
          computeSymmetricKey(dh.aBigInt, msg.message).then((aesKey) => {
            setAesKey(aesKey)
          })
        }
      }
    });

    
    return () => {
      // socket.off("broadcastMessage")
    };
  }, []); // [sender, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, receiver, waitingForHandshakeResponse, aesKey]);

  useEffect(() => {
    console.log(JSON.stringify(messages))
  }, [messages])

  // useEffect(() => {
  //   console.log(diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic)
  // }, [sender, receiver, message, messages, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, waitingForHandshakeResponse, aesKey])


  // const handleAesKeyUpdate = () => {
  //   console.log("Using aesKey.....", aesKey, '.....');
  // };
  
  

  const handleSendMessage = () => {
    console.log("Send button clicked");
    console.log("have we estblished a connection?", connectionEstablishedWithRef.current)

    if (connectionEstablishedWithRef.current !== receiverRef.current) {
      if (connectionEstablishedWithRef.current !== '') {
        socket.emit("sendMessage", {sender: senderRef.current, receiver: connectionEstablishedWithRef.current, message: aes256.encrypt(aesKeyRef.current, 'end'), handshake: true});
      }


      // establishConnection() // this changes the variable 'key' with setKey
      setWaitingForHandshakeResponse(true)

      const dh = generateKeyToSend()
      setDiffieHellmanPrivate(dh.aBigInt)
      setDiffieHellmanPublic(dh.A)
  
      const handshakeMessage = {
        'sender': senderRef.current,
        'receiver': receiverRef.current,
        'message': dh.A.toString(),
        'handshake': true,
        'flagrmv': 1
      }
      establishConnection2(handshakeMessage).then((handshakeReply) => {
        console.log('received handshake reply', handshakeReply)
          setConnectionEstablishedWith(handshakeReply.sender)
          setWaitingForHandshakeResponse(false)
          setDiffieHellmanReceiverPublic(BigInt(handshakeReply.message))
          console.log('aeskey is computed with parameteeeers', diffieHellmanPrivateRef.current, 'and', BigInt(handshakeReply.message))
          computeSymmetricKey(diffieHellmanPrivateRef.current, BigInt(handshakeReply.message)).then((aesKey) => {
            setAesKey(aesKey)
      
            console.log('aeskey is', aesKeyRef.current)
            const encryptedMessage = aes256.encrypt(aesKeyRef.current, message)
            console.log('encryptedmessage', encryptedMessage)
            socket.emit("sendMessage", {sender: senderRef.current, receiver: receiverRef.current, message: encryptedMessage, handshake: false, flagrmv: 1});
        
          })
      }).catch((error) => {
        console.log('handshake error', error)
      })
      return
    }

    console.log('aeskey is', aesKeyRef.current)
    const encryptedMessage = aes256.encrypt(aesKeyRef.current, message)
    console.log('encryptedmessage', encryptedMessage)
    socket.emit("sendMessage", {sender: senderRef.current, receiver: receiverRef.current, message: encryptedMessage, handshake: false, flagrmv: 1});

    return

    // i need the updated key here
    setAesKey('sdjasds')

    console.log(`the aeskey is: ${aesKeyRef.current}`)
    test.current = 'testvalue'
    console.log(`the test vakue is: ${test.current}`)


    // handleAesKeyUpdate()
    // console.log("Using aesKey.....", aesKey, '.....');

    
    console.log(message);
    const obj = generateKeyToSend()
    console.log(obj);
    const obj2 = generateKeyToSend()
    console.log(computeSymmetricKey(obj.aBigInt, obj2.A))
    console.log(computeSymmetricKey(obj2.aBigInt, obj.A))
    // const encryptedMessage = aes256.encrypt(aesKey, message)
    console.log('encryptedmessage', encryptedMessage)
    socket.emit("sendMessage", {sender, receiver, message: encryptedMessage, handshake: false, flagrmv: 1});
    // setMessage("");
  };

  const establishConnection = () => {
    // const dh = generateKeyToSend()
    // setDiffieHellmanPrivate(dh.aBigInt)
    // setDiffieHellmanPublic(dh.A)

    // socket.emit("sendMessage", {
    //   'sender': sender,
    //   'receiver': receiver,
    //   'message': dh.A.toString(),
    //   'handshake': true
    // })
    // setWaitingForHandshakeResponse(true)
    
  }


  const establishConnection2 = (handshakeMessage) => {
    return new Promise((resolve, reject) => {
      const broadcastListener = (message) => {
        console.log('jajaja we received a message inside here:', message)
        console.log(message.receiver, senderRef.current, message.handshake)
        if (message.receiver === senderRef.current && message.handshake) {
          console.log('we will resolve')
          resolve(message);
          socket.off('broadcastMessage', broadcastListener);
        }
      };
        socket.on('broadcastMessage', broadcastListener);
  
      socket.emit('sendMessage', handshakeMessage);
      console.log('we sent this message', handshakeMessage);
    });
  }
  


  // const establishConnection2 = (handshakeMessage) => {
  //   return new Promise((resolve, reject) => {
  //     socket.emit('sendMessage', handshakeMessage);
  //     console.log('we sent this message', handshakeMessage)
  //     socket.on('broadcastMessage', (message) => {
  //       console.log('jajaja we received a message inside here:', message)
  //       console.log(message.receiver, senderRef.current, message.handshake)
  //       if (message.receiver === senderRef.current && message.handshake) {
  //         console.log('we will resolve')
  //         resolve(message)
  //         socket.off("broadcastMessage")
  //       }
  //     })

  //   })
  // }


  return (
    <div className="App">
      <h1>Chat App</h1>
      <p>
        sender: {sender}<br/><br/>receiver: {receiver}<br/><br/>aesKey: {aesKey} <br/><br/>
        dhPriv: {diffieHellmanPrivate.toString()}<br/><br/>
        dhPub: {diffieHellmanPublic.toString()}<br/><br/>
        dhRecPub: {diffieHellmanReceiverPublic.toString()}<br/><br/>
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
          {/* <button onClick={establishConnection}>Establish connection</button> */}
          <p>Are we waiting for a Diffie Hellman handshake response?<br/> {waitingForHandshakeResponse ? 'yes' : 'no'}</p>
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
