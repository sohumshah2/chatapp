import React from "react";
import "./Message.css";

const Message = ({ message, time, mine }) => {
  return (
    <div className={`message ${mine ? "owner" : ""}`}>
      <div className="messageInfo">
        <span>{time}</span>
      </div>
      <div className="messageContent">
        <p>{message}</p>
      </div>
    </div>
  );
};

export default Message;
