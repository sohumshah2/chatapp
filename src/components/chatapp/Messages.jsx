import React from "react";
import Message from "./Message";
import "./Messages.css";

const Messages = ({ currentUserId, messages }) => {
  console.log("current user id", currentUserId);
  return (
    <div className="messages">
      {messages[currentUserId] &&
        messages[currentUserId].map(({ message, time, mine }) => (
          <Message message={message} time={time} mine={mine} />
        ))}
    </div>
  );
};

export default Messages;
