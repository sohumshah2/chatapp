import React, { useEffect, useRef } from "react";
// import ChatAppOld from "./ChatAppOld";
import Setup from "./Setup";
import "./ChatApp.css";
import LandingPage from "./LandingPage";
import Sidebar from "./chatapp/Sidebar";
import Chat from "./chatapp/Chat";

import crypto from "crypto";
import io from "socket.io-client";
import aes256 from "aes256";
import useState from "react-usestateref";
import { Buffer } from "buffer";
import { generateKeyToSend, computeSymmetricKey } from "../diffieHellman";
import { generateKeys, hashAndEncrypt, confirmWhetherMatch } from "../rsa";

/* global BigInt */

const ChatApp = () => {
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [rsaKeys, setRSAKeys, rsaKeysRef] = useState({ d: "", e: "", n: "" });
  const [currentUserId, setCurrentUserId] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [securityLog, setSecurityLog] = useState([]);
  const [aesKey, setAesKey, aesKeyRef] = useState("");

  const updateSecurityLog = (event) => {
    setSecurityLog((prevLog) => [...prevLog, event]);
  };

  const [messages, setMessages, messagesRef] = useState({});

  const [chats, setChats, chatsRef] = useState([]);

  global.Buffer = global.Buffer || require("buffer").Buffer;

  const socket = io("https://chatappserver-ucb7.onrender.com");

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
        if (
          msg.receiverPublicRSA === rsaKeysRef.current.e &&
          msg.receiverN === rsaKeysRef.current.n
        ) {
          updateSecurityLog(
            "Ignored a fraudulent message from an unauthenticated sender"
          );
        }
        return;
      }

      // If we are the message's sender or recipient and the message is not a handshake message
      if (
        !msg.handshake &&
        ((msg.publicRSA === rsaKeysRef.current.e &&
          msg.n === rsaKeysRef.current.n) ||
          (msg.receiverPublicRSA === rsaKeysRef.current.e &&
            msg.receiverN === rsaKeysRef.current.n))
      ) {
        // If we are the message's recipient
        if (
          msg.receiverPublicRSA === rsaKeysRef.current.e &&
          msg.receiverN === rsaKeysRef.current.n
        ) {
          updateSecurityLog("Received a message");

          // Decrypt the message
          let decryptedMessage = aes256.decrypt(aesKeyRef.current, msg.message);
          updateSecurityLog("Decrypted the message");

          if (!decryptedMessage.startsWith("seashells_")) {
            updateSecurityLog("Ignored fradulent spam message");
          } else {
            updateSecurityLog("Confirmed the message is genuine");
            decryptedMessage = decryptedMessage.slice(10);
            msg.message = decryptedMessage;

            // Store the time the message was received
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");
            const formattedTime = `${hours}:${minutes}:${seconds}`;
            msg.time = formattedTime;

            // Store the message so it can be displayed
            const senderId = msg.publicRSA + " " + msg.n;
            if (!messagesRef.current[senderId]) {
              setMessages((prevMessages) => {
                prevMessages[senderId] = [];
                return prevMessages;
              });

              setChats((prevChats) => {
                return prevChats.concat({
                  name: senderId,
                  lastMessage: msg.message,
                  rsa_e: msg.publicRSA,
                  rsa_n: msg.n,
                  imgSrc: "",
                });
              });
            }

            setMessages((prevMessages) => {
              prevMessages[senderId].push({
                message: msg.message,
                time: msg.time,
                mine: false,
              });
              return prevMessages;
            });

            setChats((prevChats) => {
              prevChats.find((chat) => chat.name === senderId).lastMessage =
                msg.message.length > 20
                  ? msg.message.slice(0, 20) + "..."
                  : msg.message;

              return prevChats;
            });
          }
        }

        // Else if we are the message's recipient and the message is a handshake message
      } else if (
        msg.handshake &&
        msg.receiverPublicRSA === rsaKeysRef.current.e &&
        msg.receiverN === rsaKeysRef.current.n
      ) {
        updateSecurityLog(
          `Received a handshake message from (${msg.publicRSA},${msg.n}) containing Diffie-Hellman public key ${msg.message}`
        ); // TODO: Show the sender's username if known

        // We need to receive and reciprocate the handshake message

        // Generate DH key pair
        const dh = generateKeyToSend();
        updateSecurityLog(
          `Generated a Diffie-Hellman key pair (${dh.aBigInt},${dh.A})`
        );

        // Create a handshake message with our DH public key
        const message = {
          receiverN: msg.n,
          receiverPublicRSA: msg.publicRSA,
          message: dh.A.toString(),
          handshake: true,
        };

        // Hash and encrypt the message
        const sign = hashAndEncrypt(
          message,
          BigInt(rsaKeysRef.current.n),
          BigInt(rsaKeysRef.current.d)
        );
        message.sign = sign.toString();
        message.publicRSA = rsaKeysRef.current.e;
        message.n = rsaKeysRef.current.n;

        // Compute the symmetric key with our DH private key and recipient's DH public key and store this key
        computeSymmetricKey(dh.aBigInt, msg.message).then((aesKey) => {
          setAesKey(aesKey);
          console.log("aesKey returned", aesKey);
          updateSecurityLog(
            `Used our DH private key and the received DH public key to compute the symmetric key ${aesKey}`
          );

          // Send the handshake reply message
          socket.emit("sendMessage", message);
          updateSecurityLog(
            "Sent a handshake reply message with the generated DH public key"
          );
        });
      }
    });

    return () => {
      // socket.off("broadcastMessage")
    };
  }, []);

  const handleSubmit = (keys) => {
    setRSAKeys(keys);
    setIsSetupCompleted(true);
  };

  console.log(currentUsername);

  return (
    <div className="container">
      {!isSetupCompleted && <Setup onSubmit={handleSubmit} />}
      <div className={isSetupCompleted ? "content" : "content blur"}>
        {/* <LandingPage /> */}
        <Sidebar
          className="sidebar"
          currentUserId={currentUserId}
          setCurrentUserId={setCurrentUserId}
          setCurrentUsername={setCurrentUsername}
          securityLog={securityLog}
          chats={chats}
        />
        <Chat
          className="chat"
          currentUserId={currentUserId}
          currentUsername={currentUsername}
          messages={messages}
        />
      </div>
    </div>
  );
};

export default ChatApp;
