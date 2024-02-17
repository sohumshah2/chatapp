import React from "react";
import "./Chat.css";
import Messages from "./Messages";
import Input from "./Input";

const Chat = ({ currentUserId }) => {
  return (
    <div className="chat">
      <div className="chatInfo">
        <span>Jane</span>
      </div>
      <Messages currentUserId={currentUserId} />
      <Input />
    </div>
  );
};

export default Chat;
