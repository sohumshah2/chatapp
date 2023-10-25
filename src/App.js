import React, {useEffect, useRef } from "react";
import crypto from 'crypto'
import io from "socket.io-client";
import aes256 from "aes256";
import useState from 'react-usestateref'
import { Buffer } from 'buffer';
import {generateKeyToSend, computeSymmetricKey} from './diffieHellman'
import {generateKeys, hashAndEncrypt, confirmWhetherMatch}  from './rsa'


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
  const [diffieHellmanPublic, setDiffieHellmanPublic] = useState("")
  const [diffieHellmanReceiverPublic, setDiffieHellmanReceiverPublic] = useState(BigInt(0))


  const [message, setMessage, messageRef] = useState("");
  const [connectionEstablishedWith, setConnectionEstablishedWith, connectionEstablishedWithRef] = useState("")
  const [diffieHellmanPrivate, setDiffieHellmanPrivate, diffieHellmanPrivateRef] = useState("")
  const [sender, setSender, senderRef] = useState("");
  const [receiver, setReceiver, receiverRef] = useState("");
  const [aesKey, setAesKey, aesKeyRef] = useState("")
  const [waitingForHandshakeResponse, setWaitingForHandshakeResponse, waitingForHandshakeResponseRef] = useState(false)
  const [publicRSAKey, setPublicRSAKey, publicRSAKeyRef] = useState("")
  const [privateRSAKey, setPrivateRSAKey, privateRSAKeyRef] = useState("")
  const [n, setN, nRef] = useState("")




  useEffect(() => {
    console.log('setup listener again')
    socket.on("broadcastMessage", (msg) => {
      console.log("received a new msg", msg);

      // Check whether the message really is sent by the supposed sender (the given public key, n)
      const receivedHash = msg.sign
      delete msg['sign']
      if (confirmWhetherMatch(msg, BigInt(receivedHash), BigInt(msg.publicRSA), BigInt(msg.n))) {
        console.log('message authenticated', msg)
        msg.sign = receivedHash
      }
      else {
        msg.sign = receivedHash
        console.log('message not genuine')
        return

      }


      if (!msg.handshake && (msg.sender === senderRef.current || msg.receiver === senderRef.current)) {
        let decryptedMessage = aes256.decrypt(aesKeyRef.current, msg.message)
        if (decryptedMessage.startsWith("seashells_")) {
          decryptedMessage = decryptedMessage.slice(10)
          console.log('decryptedmsg', decryptedMessage, 'msg message', msg.message)
          msg.message = decryptedMessage
          setMessages((prevMessages) => [...prevMessages, msg]);  
        }
        else {
          console.log('wa wa wa wa wa wa wa wa wa wa wa wa aw')
        }
      } else if (msg.handshake && msg.receiver === senderRef.current) {
        // receive handshake

        if (aesKeyRef.current !== '' && aes256.decrypt(aesKeyRef.current, msg.message) === 'end') {
          setConnectionEstablishedWith('')
        }

        else if (waitingForHandshakeResponseRef.current) {
        } else {

          // handshake request from current client, we update their public key and recalculate the shared aeskey
          if (msg.sender === connectionEstablishedWithRef.current) {
            setDiffieHellmanReceiverPublic(msg.message)
            computeSymmetricKey(diffieHellmanPrivateRef.current, msg.message).then((aesKey) => {
              setAesKey(aesKey)
            })
            return
          }

          // handshake request from a new client, tell the old client that connection has closed
          else if (connectionEstablishedWithRef.current !== '') {
            const message = {sender: senderRef.current, receiver: connectionEstablishedWithRef.current, message: aes256.encrypt(aesKeyRef.current, 'seashells_end'), handshake: true}
            const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
            message.sign = sign.toString()
            message.publicRSA = publicRSAKeyRef.current.toString()
            message.n = nRef.current.toString()
            socket.emit("sendMessage", message);
          }

          console.log('h24', senderRef.current)
          // setConnectionEstablishedWith(msg.sender) // commented out so handshake is done on every message
          setReceiver(msg.sender)
          setDiffieHellmanReceiverPublic(msg.message)
          const dh = generateKeyToSend()
          setDiffieHellmanPrivate(dh.aBigInt)
          setDiffieHellmanPublic(dh.A)
          const message = {
            'sender': senderRef.current,
            'receiver': msg.sender,
            'message': dh.A.toString(),
            'handshake': true,
            'flagrmv': 0
          }
          const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
          message.sign = sign.toString()
          message.publicRSA = publicRSAKeyRef.current.toString()
          message.n = nRef.current.toString()
          socket.emit("sendMessage", message)
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
    console.log((messages))
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

        const message = {sender: senderRef.current, receiver: connectionEstablishedWithRef.current, message: aes256.encrypt(aesKeyRef.current, 'seashells_end'), handshake: true}
        const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
        message.sign = sign.toString()
        message.publicRSA = publicRSAKeyRef.current.toString()
        message.n = nRef.current.toString()
        socket.emit("sendMessage", message)

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
      const sign = hashAndEncrypt(handshakeMessage, nRef.current, privateRSAKeyRef.current)
      handshakeMessage.publicRSA = publicRSAKeyRef.current.toString()
      handshakeMessage.n = nRef.current.toString()
      handshakeMessage.sign = sign.toString()

      establishConnection2(handshakeMessage).then((handshakeReply) => {
        console.log('received handshake reply', handshakeReply)
          // setConnectionEstablishedWith(handshakeReply.sender) // commented out so handshake is done on every message
          setWaitingForHandshakeResponse(false)
          setDiffieHellmanReceiverPublic(BigInt(handshakeReply.message))
          console.log('aeskey is computed with parameteeeers', diffieHellmanPrivateRef.current, 'and', BigInt(handshakeReply.message))
          computeSymmetricKey(diffieHellmanPrivateRef.current, BigInt(handshakeReply.message)).then((aesKey) => {
            setAesKey(aesKey)
      
            console.log('aeskey is', aesKeyRef.current)
            const encryptedMessage = aes256.encrypt(aesKeyRef.current, `seashells_${messageRef.current}`)
            console.log('encryptedmessage', encryptedMessage)

            const message = {sender: senderRef.current, receiver: receiverRef.current, message: encryptedMessage, handshake: false, flagrmv: 1}
            const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
            message.sign = sign.toString()
            message.publicRSA = publicRSAKeyRef.current.toString()
            message.n = nRef.current.toString()
            socket.emit("sendMessage", message)   
          })
      }).catch((error) => {
        console.log('handshake error', error)
      })
      return
    }

    console.log('aeskey is', aesKeyRef.current)
    const encryptedMessage = aes256.encrypt(aesKeyRef.current, `seashells_${messageRef.current}`)
    console.log('encryptedmessage', encryptedMessage)

    const message = {sender: senderRef.current, receiver: receiverRef.current, message: encryptedMessage, handshake: false, flagrmv: 1}
    const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
    message.sign = sign.toString()
    message.publicRSA = publicRSAKeyRef.current.toString()
    message.n = nRef.current.toString()
    socket.emit("sendMessage", message)
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
        console.log('jajaja we received a message inside here:',JSON.stringify(message))
        console.log(message.receiver, senderRef.current, message.handshake)
        if (message.receiver === senderRef.current && message.handshake) {
          // Check whether the message really is sent by the supposed sender (the given public key, n)
          const receivedHash = message.sign
          console.log('received hash', JSON.stringify(receivedHash))
          delete message['sign']
          console.log('data', message, receivedHash, message.publicRSA, message.n)
          if (confirmWhetherMatch(message, BigInt(receivedHash), BigInt(message.publicRSA), BigInt(message.n))) {
            console.log('message authenticated', message)
            console.log('we will resolve')
            message.sign = receivedHash
            resolve(message);
            socket.off('broadcastMessage', broadcastListener);
          }
          else {
            message.sign = receivedHash
            console.log('message not genuine ye', message)
          }
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
        public RSA key: {publicRSAKeyRef.current.toString()}<br/><br/>
        private RSA key: {privateRSAKeyRef.current.toString()}<br/><br/>
        n: {nRef.current.toString()}<br/><br/>
        dhRecPub: {diffieHellmanReceiverPublic.toString()}<br/><br/>
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
      <p style={{ fontWeight: "bold" }}>Enter public RSA key:</p>
        <span
          contentEditable="true"
          value={receiver}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setPublicRSAKey(BigInt(e.target.textContent))}
        ></span>
        <p style={{ fontWeight: "bold" }}>Enter private RSA key:</p>
        <span
          contentEditable="true"
          value={receiver}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setPrivateRSAKey(BigInt(e.target.textContent))}
        ></span>
        <p style={{ fontWeight: "bold" }}>Enter n:</p>
        <span
          contentEditable="true"
          value={receiver}
          style={{
            display: "inline-block",
            border: "1px solid black",
            minWidth: "100px",
            maxWidth: "200px",
          }}
          onInput={(e) => setN(BigInt(e.target.textContent))}
        ></span>
        <div>
          <button onClick={() => {
            // generateKeys.

            generateKeys()
            .then(keys => {
              setN(keys.n)
              setPrivateRSAKey(keys.d)
              setPublicRSAKey(keys.e)
            })


          }}>Generate RSA keys</button>
        </div>
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
