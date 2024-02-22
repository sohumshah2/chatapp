import React, { useState } from "react";
import { generateKeyToSend, computeSymmetricKey } from "../../diffieHellman";
import { generateKeys, hashAndEncrypt, confirmWhetherMatch } from "../../rsa";
import aes256 from "aes256";

import "./Input.css";

/* global BigInt */
// const { BigInt } = globalThis;

const Input = ({
  messageInput,
  setMessageInput,
  updateSecurityLog,
  rsaKeysRef,
  socket,
  currentUserId,
  setWaitingForHandshakeReply,
  setAesKey,
  aesKeyRef,
}) => {
  const handleInputChange = (event) => {
    setMessageInput(event.target.value);
  };

  const handleSendMessage = () => {
    updateSecurityLog("Initiating message send to " + currentUserId);

    // Generate DH key pair
    const dh = generateKeyToSend();
    updateSecurityLog(
      `Generated a Diffie-Hellman key pair (${dh.aBigInt},${dh.A})`
    );

    // Create a handshake message with our DH public key
    const handshakeMessage = {
      receiverN: currentUserId.split(" ")[1],
      receiverPublicRSA: currentUserId.split(" ")[0],
      message: dh.A.toString(),
      handshake: true,
    };

    // Hash and encrypt the message
    const sign = hashAndEncrypt(
      handshakeMessage,
      BigInt(rsaKeysRef.current.n),
      BigInt(rsaKeysRef.current.d)
    );
    handshakeMessage.publicRSA = rsaKeysRef.current.e.toString();
    handshakeMessage.n = rsaKeysRef.current.n.toString();
    handshakeMessage.sign = sign.toString();

    // Send handshake message and wait for a reply
    establishConnection(handshakeMessage).then((handshakeReply) => {
      // When we receive the handshake reply, compute the shared key
      computeSymmetricKey(dh.aBigInt, BigInt(handshakeReply.message)).then(
        (aesKey) => {
          setAesKey(aesKey);
          updateSecurityLog(
            `Used our DH private key and the received DH public key to compute the symmetric key ${aesKey}`
          );

          // Encrypt the message with the shared key
          const encryptedMessage = aes256.encrypt(
            aesKeyRef.current,
            `seashells_${messageInput}`
          );

          const message = {
            receiverN: currentUserId.split(" ")[1],
            receiverPublicRSA: currentUserId.split(" ")[0],
            message: encryptedMessage,
            handshake: false,
          };

          // Hash and encrypt the message
          const sign = hashAndEncrypt(
            message,
            BigInt(rsaKeysRef.current.n),
            BigInt(rsaKeysRef.current.d)
          );
          message.sign = sign.toString();
          message.publicRSA = rsaKeysRef.current.e.toString();
          message.n = rsaKeysRef.current.n.toString();

          // Send the encrypted message
          socket.emit("sendMessage", message);
          updateSecurityLog("Sending encrypted message");
          setWaitingForHandshakeReply(false);
        }
      );
    });

    setMessageInput("");
  };

  // Establishes a connection with a recipient
  // using a handshake mechanism.

  // Returns a promise that resolves with the
  // received handshake reply message.

  const establishConnection = (handshakeMessage) => {
    return new Promise((resolve, reject) => {
      // Helper function handles incoming broadcast messages and
      // resolves the promise when a valid handshake reply
      // message is received for the specified sender.
      const broadcastListener = (message) => {
        if (
          message.receiverN === rsaKeysRef.current.n &&
          message.receiverPublicRSA === rsaKeysRef.current.e.toString() &&
          message.handshake
        ) {
          // Check whether the message really is sent by the supposed sender (the given public key, n)
          updateSecurityLog("Received a handshake reply message");
          const receivedHash = message.sign;
          delete message["sign"];

          if (
            confirmWhetherMatch(
              message,
              BigInt(receivedHash),
              BigInt(message.publicRSA),
              BigInt(message.n)
            )
          ) {
            updateSecurityLog(
              "Confirmed the handshake reply message is genuine"
            );
            message.sign = receivedHash;

            // Unregister the broadcast listener and resolve the promise
            socket.off("broadcastMessage", broadcastListener);
            resolve(message);
          } else {
            // If the message is not genuine, continue waiting
            updateSecurityLog("Received an invalid handshake reply");
            message.sign = receivedHash;
          }
        }
      };
      setWaitingForHandshakeReply(true);

      // Register the broadcast listener for 'broadcastMessage' events
      socket.on("broadcastMessage", broadcastListener);

      // Send the handshake message to initiate the connection
      socket.emit("sendMessage", handshakeMessage);
      updateSecurityLog("Sent handshake message containing DH public key");
    });
  };

  return (
    <div className="input">
      <input
        type="text"
        placeholder="Type a message"
        value={messageInput}
        onChange={handleInputChange}
      />
      <div className="send">
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Input;
