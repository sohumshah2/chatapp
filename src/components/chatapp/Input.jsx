import React from "react";
import "./Input.css";

const Input = () => {
  return (
    <div className="input">
      <input type="text" placeholder="Type a message" />
      <div className="send">
        <button>Send</button>
      </div>
    </div>
  );
};

export default Input;
