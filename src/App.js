import React, { useEffect, useRef } from "react";
import crypto from "crypto";
import io from "socket.io-client";
import aes256 from "aes256";
import useState from "react-usestateref";
import { Buffer } from "buffer";
import { generateKeyToSend, computeSymmetricKey } from "./diffieHellman";
import { generateKeys, hashAndEncrypt, confirmWhetherMatch } from "./rsa";
import "./App.css";

/* global BigInt */
// const { BigInt } = globalThis;

// import crypto from 'crypto';
// import hkdf from 'js-crypto-hkdf'
// const hkdf = require('js-crypto-hkdf')

global.Buffer = global.Buffer || require("buffer").Buffer;

const socket = io("https://chatappserver-ucb7.onrender.com"); // Replace with your server's URL
// const socket = io("http://server.sharedwithexpose.com/", {
//   transports: ["websocket"],
// });

function App() {
  const [messages, setMessages] = useState([]);
  const [diffieHellmanPublic, setDiffieHellmanPublic] = useState("");
  const [diffieHellmanReceiverPublic, setDiffieHellmanReceiverPublic] =
    useState(BigInt(0));

  const [message, setMessage, messageRef] = useState("");
  const [
    connectionEstablishedWith,
    setConnectionEstablishedWith,
    connectionEstablishedWithRef,
  ] = useState("");
  const [
    diffieHellmanPrivate,
    setDiffieHellmanPrivate,
    diffieHellmanPrivateRef,
  ] = useState("");
  const [sender, setSender, senderRef] = useState("");
  const [receiverN, setReceiverN, receiverNRef] = useState("");
  const [receiverRSAPub, setReceiverRSAPub, receiverRSAPubRef] = useState("");
  const [aesKey, setAesKey, aesKeyRef] = useState("");
  const [
    waitingForHandshakeResponse,
    setWaitingForHandshakeResponse,
    waitingForHandshakeResponseRef,
  ] = useState(false);
  const [publicRSAKey, setPublicRSAKey, publicRSAKeyRef] = useState("");
  const [privateRSAKey, setPrivateRSAKey, privateRSAKeyRef] = useState("");
  const [n, setN, nRef] = useState("");
  const [addressBook, setAddressBook, addressBookRef] = useState("");
  const [contacts, setContacts, contactsRef] = useState({});

  useEffect(() => {
    console.log("setup listener again");
    socket.on("broadcastMessage", (msg) => {
      console.log("received a new msg", msg);

      // Check whether the message really is sent by the supposed sender (the given public key, n)
      const receivedHash = msg.sign;
      delete msg["sign"];
      if (
        confirmWhetherMatch(
          msg,
          BigInt(receivedHash),
          BigInt(msg.publicRSA),
          BigInt(msg.n)
        )
      ) {
        console.log("message authenticated", msg);
        msg.sign = receivedHash;
      } else {
        msg.sign = receivedHash;
        console.log("message not genuine");
        return;
      }

      if (
        !msg.handshake &&
        ((msg.publicRSA === publicRSAKeyRef.current.toString() &&
          msg.n === nRef.current.toString()) ||
          (msg.receiverPublicRSA === publicRSAKeyRef.current.toString() &&
            msg.receiverN === nRef.current.toString()))
      ) {
        let decryptedMessage = aes256.decrypt(aesKeyRef.current, msg.message);
        if (decryptedMessage.startsWith("seashells_")) {
          decryptedMessage = decryptedMessage.slice(10);
          console.log(
            "decryptedmsg",
            decryptedMessage,
            "msg message",
            msg.message
          );
          msg.message = decryptedMessage;

          if (
            msg.publicRSA === publicRSAKeyRef.current.toString() &&
            msg.n === nRef.current.toString()
          ) {
            msg.publicRSA = senderRef.current;
            msg.n = "";
          }

          if (
            msg.receiverPublicRSA === publicRSAKeyRef.current.toString() &&
            msg.receiverN === nRef.current.toString()
          ) {
            msg.receiverPublicRSA = senderRef.current;
            msg.receiverN = "";
          }

          let record = `${msg.receiverPublicRSA}+${msg.receiverN}`;
          if (record in contactsRef.current) {
            msg.receiverPublicRSA = contactsRef.current[record];
            msg.receiverN = "";
          }

          record = `${msg.publicRSA}+${msg.n}`;
          if (record in contactsRef.current) {
            msg.publicRSA = contactsRef.current[record];
            msg.n = "";
          }

          const now = new Date();
          const hours = now.getHours().toString().padStart(2, '0');
          const minutes = now.getMinutes().toString().padStart(2, '0');
          const seconds = now.getSeconds().toString().padStart(2, '0');
          const formattedTime = `${hours}:${minutes}:${seconds}`;
          msg.time = formattedTime
          setMessages((prevMessages) => [...prevMessages, msg]);
          setAesKey(aesKeyRef.current + ' ')
        } else {
          console.log("wa wa wa wa wa wa wa wa wa wa wa wa wa");
        }
      } else if (
        msg.handshake &&
        msg.receiverPublicRSA === publicRSAKeyRef.current.toString() &&
        msg.receiverN === nRef.current.toString()
      ) {
        // receive handshake
        console.log("recieving handshake?");

        if (
          aesKeyRef.current !== "" &&
          aes256.decrypt(aesKeyRef.current, msg.message) === "end"
        ) {
          setConnectionEstablishedWith("");
        } else if (waitingForHandshakeResponseRef.current) {
        } else {
          // handshake request from current client, we update their public key and recalculate the shared aeskey
          // this section is not relevant anymore i think - because we compute a new DH key every message now
          if (msg.sender === connectionEstablishedWithRef.current) {
            // setDiffieHellmanReceiverPublic(msg.message)
            // computeSymmetricKey(diffieHellmanPrivateRef.current, msg.message).then((aesKey) => {
            //   setAesKey(aesKey)
            // })
            // return
          }

          // handshake request from a new client, tell the old client that connection has closed
          // this section is not relevant anymore i think - because we compute a new DH key every message now
          else if (connectionEstablishedWithRef.current !== "") {
            // const message = {sender: senderRef.current, receiver: connectionEstablishedWithRef.current, message: aes256.encrypt(aesKeyRef.current, 'seashells_end'), handshake: true}
            // const sign = hashAndEncrypt(message, nRef.current, privateRSAKeyRef.current)
            // message.sign = sign.toString()
            // message.publicRSA = publicRSAKeyRef.current.toString()
            // message.n = nRef.current.toString()
            // socket.emit("sendMessage", message);
          }

          console.log("h24", senderRef.current);
          // setConnectionEstablishedWith(msg.sender) // commented out so handshake is done on every message
          setReceiverRSAPub(msg.publicRSA);
          setReceiverN(msg.n);
          setDiffieHellmanReceiverPublic(msg.message);
          const dh = generateKeyToSend();
          setDiffieHellmanPrivate(dh.aBigInt);
          setDiffieHellmanPublic(dh.A);
          const message = {
            // sender: senderRef.current,
            receiverN: msg.n,
            receiverPublicRSA: msg.publicRSA,
            message: dh.A.toString(),
            handshake: true,
            flagrmv: 0,
          };
          const sign = hashAndEncrypt(
            message,
            nRef.current,
            privateRSAKeyRef.current
          );
          message.sign = sign.toString();
          message.publicRSA = publicRSAKeyRef.current.toString();
          message.n = nRef.current.toString();
          socket.emit("sendMessage", message);
          console.log(
            "aeskey is computed with parameters",
            dh.aBigInt,
            msg.message
          );
          computeSymmetricKey(dh.aBigInt, msg.message).then((aesKey) => {
            setAesKey(aesKey);
          });
        }
      }
    });

    return () => {
      // socket.off("broadcastMessage")
    };
  }, []); // [sender, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, receiver, waitingForHandshakeResponse, aesKey]);

  useEffect(() => {
    console.log(messages);
  }, [messages]);

  // useEffect(() => {
  //   console.log(diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic)
  // }, [sender, receiver, message, messages, diffieHellmanPrivate, diffieHellmanPublic, diffieHellmanReceiverPublic, waitingForHandshakeResponse, aesKey])

  // const handleAesKeyUpdate = () => {
  //   console.log("Using aesKey.....", aesKey, '.....');
  // };

  const handleSendMessage = () => {
    console.log("Send button clicked");
    console.log(
      "have we estblished a connection?",
      connectionEstablishedWithRef.current
    );

    if (connectionEstablishedWithRef.current === "") {
      if (connectionEstablishedWithRef.current !== "") {
        // btw sender field should no longer be used anywhere, we use publicRSA and n fields to represent the sender

        // this code isnt relevant anymore i think, since we do dh handshake every message (conectionEstablishedWIth will always be '' so this code will be no executed)
        const message = {
          // sender: senderRef.current,
          // receiver: connectionEstablishedWithRef.current,
          message: aes256.encrypt(aesKeyRef.current, "seashells_end"),
          handshake: true,
        };
        const sign = hashAndEncrypt(
          message,
          nRef.current,
          privateRSAKeyRef.current
        );
        message.sign = sign.toString();
        message.publicRSA = publicRSAKeyRef.current.toString();
        message.n = nRef.current.toString();
        socket.emit("sendMessage", message);
      }

      // establishConnection() // this changes the variable 'key' with setKey
      setWaitingForHandshakeResponse(true);

      const dh = generateKeyToSend();
      setDiffieHellmanPrivate(dh.aBigInt);
      setDiffieHellmanPublic(dh.A);

      const handshakeMessage = {
        // sender: senderRef.current,
        receiverN: receiverNRef.current,
        receiverPublicRSA: receiverRSAPubRef.current,
        message: dh.A.toString(),
        handshake: true,
        flagrmv: 1,
      };
      const sign = hashAndEncrypt(
        handshakeMessage,
        nRef.current,
        privateRSAKeyRef.current
      );
      handshakeMessage.publicRSA = publicRSAKeyRef.current.toString();
      handshakeMessage.n = nRef.current.toString();
      handshakeMessage.sign = sign.toString();

      establishConnection2(handshakeMessage)
        .then((handshakeReply) => {
          console.log("received handshake reply", handshakeReply);
          // setConnectionEstablishedWith(handshakeReply.sender) // commented out so handshake is done on every message
          setWaitingForHandshakeResponse(false);
          setDiffieHellmanReceiverPublic(BigInt(handshakeReply.message));
          console.log(
            "aeskey is computed with parameteeeers",
            diffieHellmanPrivateRef.current,
            "and",
            BigInt(handshakeReply.message)
          );
          computeSymmetricKey(
            diffieHellmanPrivateRef.current,
            BigInt(handshakeReply.message)
          ).then((aesKey) => {
            setAesKey(aesKey);

            console.log("aeskey is", aesKeyRef.current);
            const encryptedMessage = aes256.encrypt(
              aesKeyRef.current,
              `seashells_${messageRef.current}`
            );
            console.log("encryptedmessage", encryptedMessage);

            const message = {
              // sender: senderRef.current,
              receiverN: receiverNRef.current,
              receiverPublicRSA: receiverRSAPubRef.current,
              // receiver: receiverRef.current,
              message: encryptedMessage,
              handshake: false,
              flagrmv: 1,
            };
            const sign = hashAndEncrypt(
              message,
              nRef.current,
              privateRSAKeyRef.current
            );
            message.sign = sign.toString();
            message.publicRSA = publicRSAKeyRef.current.toString();
            message.n = nRef.current.toString();

            // let record = `${receiverRSAPubRef.current}+${rece}`;
            // if (rece)

            for (const record in contactsRef.current) {
              console.log("record", record);
              if (
                contactsRef.current[record] ===
                receiverRSAPubRef.current.toString()
              ) {
                console.log("found!");
                const parts = record.split("+");
                message.receiverPublicRSA = parts[0];
                message.receiverN = parts[1];
              }
            }

            socket.emit("sendMessage", message);
          });
        })
        .catch((error) => {
          console.log("handshake error", error);
        });
      return;
    }

    console.log("aeskey is", aesKeyRef.current);
    const encryptedMessage = aes256.encrypt(
      aesKeyRef.current,
      `seashells_${messageRef.current}`
    );
    console.log("encryptedmessage", encryptedMessage);

    const message = {
      // sender: senderRef.current,
      // receiver: receiverRef.current,
      receiverN: receiverNRef.current,
      receiverPublicRSA: receiverRSAPubRef.current,
      message: encryptedMessage,
      handshake: false,
      flagrmv: 1,
    };
    const sign = hashAndEncrypt(
      message,
      nRef.current,
      privateRSAKeyRef.current
    );
    message.sign = sign.toString();
    message.publicRSA = publicRSAKeyRef.current.toString();
    message.n = nRef.current.toString();
    for (const record in contactsRef.current) {
      console.log("record", record);
      if (
        contactsRef.current[record] === receiverRSAPubRef.current.toString()
      ) {
        console.log("found!");
        const parts = record.split("+");
        message.receiverPublicRSA = parts[0];
        message.receiverN = parts[1];
      }
    }
    socket.emit("sendMessage", message);
    return;

    /* 
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
  */
  };

  const establishConnection2 = (handshakeMessage) => {
    return new Promise((resolve, reject) => {
      const broadcastListener = (message) => {
        console.log(
          "jajaja we received a message inside here:",
          JSON.stringify(message)
        );
        console.log(message.receiver, senderRef.current, message.handshake);
        if (
          message.receiverN === nRef.current.toString() &&
          message.receiverPublicRSA === publicRSAKeyRef.current.toString() &&
          message.handshake
        ) {
          // Check whether the message really is sent by the supposed sender (the given public key, n)
          const receivedHash = message.sign;
          console.log("received hash", JSON.stringify(receivedHash));
          delete message["sign"];
          console.log(
            "data",
            message,
            receivedHash,
            message.publicRSA,
            message.n
          );
          if (
            confirmWhetherMatch(
              message,
              BigInt(receivedHash),
              BigInt(message.publicRSA),
              BigInt(message.n)
            )
          ) {
            console.log("message authenticated", message);
            console.log("we will resolve");
            message.sign = receivedHash;
            resolve(message);
            socket.off("broadcastMessage", broadcastListener);
          } else {
            message.sign = receivedHash;
            console.log("message not genuine ye", message);
          }
        }
      };
      socket.on("broadcastMessage", broadcastListener);

      for (const record in contactsRef.current) {
        console.log("record", record);
        if (
          contactsRef.current[record] === receiverRSAPubRef.current.toString()
        ) {
          console.log("found!");
          const parts = record.split("+");
          handshakeMessage.receiverPublicRSA = parts[0];
          handshakeMessage.receiverN = parts[1];
        }
      }

      socket.emit("sendMessage", handshakeMessage);
      console.log("we sent this message", handshakeMessage);
    });
  };

  const handleSubmitAddressBook = () => {
    const contactsFound = {};
    const fields = addressBookRef.current.split(" ");
    console.log(fields);

    for (let i = 0; i < fields.length; i += 3) {
      const contact = fields.slice(i, i + 3);
      const [publicRSA, n, name] = contact;
      const key = publicRSA + "+" + n;
      contactsFound[key] = name;
    }

    setContacts(contactsFound);
    console.log(contactsRef.current);
  };

  const messageTable = ({ messages }) => {
    return (
      <table className="messagesTable">
        <thead>
          <tr>
            <th>Sender</th>
            <th>Receiver Public RSA</th>
            <th>N</th>
            <th>Receiver N</th>
            <th>Message</th>
          </tr>
        </thead>
        <tbody>
          {messages.map((message, index) => (
            <tr key={index}>
              <td>{message.publicRSA}</td>
              <td>{message.n}</td>
              <td>{message.receiverPublicRSA}</td>
              <td>{message.receiverN}</td>
              <td>{message.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="App">
      <div className="head">
          <h1>E2Elevate: Elevate your conversations with end to end encryption</h1>
        </div>
      <div className="body">
      <div className="Messages">

<div className="message-container">
  <div>
    <h3>Messages</h3>
    <table className="messagesTable">
      <thead>
        <tr>
          <th className="messagesTableTh">Sender</th>
          <th className="messagesTableTh">Receiver</th>
          <th className="messagesTableTh">Time</th>
          {/* <th className="messagesTableTh">Public RSA</th>
    <th className="messagesTableTh">n</th> */}
          {/* <th className="messagesTableTh">Receiver Public RSA</th>
    <th className="messagesTableTh">Receiver N</th> */}
          <th className="messagesTableTh">Message</th>
        </tr>
      </thead>
      <tbody>
        {messages.map((message, index) => (
          <tr key={index}>
            <td className="messagesTableTd">
              <div className="tableElement">
                {message.publicRSA} {message.n}
              </div>
            </td>
            <td className="messagesTableTd">
              <div className="tableElement">
                {message.receiverPublicRSA} {message.receiverN}
              </div>
            </td>
            <td className="messagesTableTd">
              <div className="tableElement">
                {message.time}
              </div>
            </td>
            {/* <td className="messagesTableTd">
        <div className="tableElement">{message.publicRSA}</div>
      </td>
      <td className="messagesTableTd">
        <div className="tableElement">{message.n}</div>
      </td> */}
            {/* <td className="messagesTableTd">
        <div className="tableElement">{message.receiverPublicRSA}</div>
      </td>
      <td className="messagesTableTd">
        <div className="tableElement">{message.receiverN}</div>
      </td> */}
            <td className="messagesTableTd">
              <div className="tableElement">{message.message}</div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* <p style={{ fontWeight: "bold" }}>Messages:</p>
  {messages.map((msg, index) => (
    <div key={index}>
      {msg.publicRSA}-{msg.n} -&gt; {msg.receiverPublicRSA}-
      {msg.receiverN}: {msg.message}
      <br />
    </div>
  ))} */}
</div>
<div className="input-container">
  <p style={{ fontWeight: "bold" }}>Enter receiver RSA public key:</p>
  {/* <span
    className="editable-span"
    contentEditable="true"
    value={receiverRSAPub}
    onInput={(e) => setReceiverRSAPub(e.target.textContent)}
  ></span> */}
  <input
    className="input"
    onChange={(e) => setReceiverRSAPub(e.target.value)}
  ></input>
  <p style={{ fontWeight: "bold" }}>Enter receiver n:</p>
  <input
    className="input"
    onChange={(e) => setReceiverN(e.target.value)}
  ></input>
  <p style={{ fontWeight: "bold" }}>Enter Message:</p>
  <span
    contentEditable="true"
    className="editable-span"
    value={message}
    onInput={(e) => setMessage(e.target.textContent)}
    // className="input"
  ></span>
  <div>
    <button onClick={handleSendMessage} className="button">Send message</button>
  </div>
</div>
</div>
<div className="Config">
<h3>Configuration values</h3>
<table className="configTable">
  <tr>
    <th className="configTableTh">public RSA key</th>
    <td className="configTableTd">
      <div className="tableElement">
        {publicRSAKeyRef.current.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">n</th>
    <td className="configTableTd">
      <div className="tableElement">{nRef.current.toString()}</div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">private RSA key</th>
    <td className="configTableTd">
      <div className="tableElement">
        {privateRSAKeyRef.current.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">dhRecPub</th>
    <td className="configTableTd">
      <div className="tableElement">
        {diffieHellmanReceiverPublic.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">sender</th>
    <td className="configTableTd">
      <div className="tableElement">{sender}</div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">aesKey</th>
    <td className="configTableTd">
      <div className="tableElement">{aesKey}</div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">dhPriv</th>
    <td className="configTableTd">
      <div className="tableElement">
        {diffieHellmanPrivate.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">dhPub</th>
    <td className="configTableTd">
      <div className="tableElement">
        {diffieHellmanPublic.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">RecPub</th>
    <td className="configTableTd">
      <div className="tableElement">
        {diffieHellmanReceiverPublic.toString()}
      </div>
    </td>
  </tr>
  <tr>
    <th className="configTableTh">Awaiting handshake response?</th>
    <td className="configTableTd">
      {waitingForHandshakeResponse ? "yes" : "no"}
    </td>
  </tr>
</table>
<div style={{ display: "flex", alignItems: "center" }}>
  <p style={{ fontWeight: "bold" }}>Address book:</p>
  <input
    className="input"
    onChange={(e) => setAddressBook(e.target.value)}
  ></input>
  <button className="button" onClick={handleSubmitAddressBook}>Submit address book</button>
</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <p style={{ fontWeight: "bold" }}>Enter public RSA key:</p>
  <input
    className="input"
    onChange={(e) => setPublicRSAKey(BigInt(e.target.value))}
  ></input>
</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <p style={{ fontWeight: "bold" }}>Enter private RSA key:</p>
  <input
    className="input"
    onChange={(e) => setPrivateRSAKey(BigInt(e.target.value))}
  ></input>
</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <p style={{ fontWeight: "bold" }}>Enter n:</p>
  <input
    className="input"
    onChange={(e) => setN(BigInt(e.target.value))}
  ></input>
</div>
<div>
  <button className="button"
    onClick={() => {
      // generateKeys.

      generateKeys().then((keys) => {
        setN(keys.n);
        setPrivateRSAKey(keys.d);
        setPublicRSAKey(keys.e);
      });
    }}
  >
    Alternatively, click to generate new RSA keys
  </button>
</div>
<div style={{ display: "flex", alignItems: "center" }}>
  <p style={{ fontWeight: "bold" }}>Enter your username:</p>
  <input
    className="input"
    onChange={(e) => setSender(e.target.value)}
  ></input>
</div>
</div>
      </div>
      
    </div>
  );
}

export default App;
