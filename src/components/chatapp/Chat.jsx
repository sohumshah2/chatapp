import React from "react";
import "./Chat.css";
import Messages from "./Messages";
import Input from "./Input";

const Chat = ({ currentUserId, currentUsername, messages }) => {
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
      <Input />
    </div>
  );
};

export default Chat;
