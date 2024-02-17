import React from "react";
import "./Message.css";

const Message = () => {
  return (
    <div className="message owner">
      <div className="messageInfo">
        <span>just now</span>
      </div>
      <div className="messageContent">
        <p>hello</p>
      </div>
    </div>
  );
};

export default Message;
