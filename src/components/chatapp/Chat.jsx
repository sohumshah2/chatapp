import React from "react";
import "./Chat.css";
import Messages from "./Messages";
import Input from "./Input";

const Chat = ({
  currentUserId,
  currentUsername,
  messages,
  messageInput,
  setMessageInput,
  updateSecurityLog,
  rsaKeysRef,
  socket,
  setWaitingForHandshakeReply,
  setAesKey,
  aesKeyRef,
}) => {
  return (
    <div className="chat">
      <div className="chatInfo">
        <span>
          {currentUsername.length > 30
            ? currentUsername.slice(0, 30) + "..."
            : currentUsername}
        </span>
      </div>
      <Messages currentUserId={currentUserId} messages={messages} />
      <Input
        messageInput={messageInput}
        setMessageInput={setMessageInput}
        updateSecurityLog={updateSecurityLog}
        rsaKeysRef={rsaKeysRef}
        socket={socket}
        currentUserId={currentUserId}
        setWaitingForHandshakeReply={setWaitingForHandshakeReply}
        setAesKey={setAesKey}
        aesKeyRef={aesKeyRef}
      />
    </div>
  );
};

export default Chat;
