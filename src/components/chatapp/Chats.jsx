import React, { useState } from "react";
import "./Chats.css";

const Chats = ({
  currentUserId,
  setCurrentUserId,
  setCurrentUsername,
  chats,
}) => {
  const handleChatClick = (chatId, chatName) => {
    console.log(chatId);
    setCurrentUserId(chatId);
    setCurrentUsername(chatName);
  };

  return (
    <div className="chats">
      {chats.map((chat) => (
        <div
          className={`userChat ${
            chat.rsa_e + " " + chat.rsa_n === currentUserId ? "selected" : ""
          }`}
          key={chat.rsa_e + " " + chat.rsa_n}
          onClick={() =>
            handleChatClick(chat.rsa_e + " " + chat.rsa_n, chat.name)
          }
        >
          <img src={chat.imgSrc} />
          <div className="userChatInfo">
            <span>{chat.name}</span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
