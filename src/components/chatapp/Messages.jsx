import React from "react";
import Message from "./Message";
import "./Messages.css";

const messages = {
  "123 123": [
    { message: "hello", time: "just now", mine: false },
    { message: "hey", time: "just now", mine: true },
  ],
};

const Messages = ({ currentUserId }) => {
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
