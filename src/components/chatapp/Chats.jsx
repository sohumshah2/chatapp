import React, { useState } from "react";
import "./Chats.css";

const Chats = ({ currentUserId, setCurrentUserId }) => {
  const handleChatClick = (chatId) => {
    console.log(chatId);
    setCurrentUserId(chatId);
  };

  // temporary data
  const chats = [
    {
      name: "12323",
      lastMessage: "hey",
      rsa_e: "123",
      rsa_n: "123",
      imgSrc: "",
    },
    {
      name: "Jane",
      lastMessage: "hello",
      rsa_e: "1234",
      rsa_n: "123",
      imgSrc: "",
    },
    {
      name: "4343",
      lastMessage: "hello",
      rsa_e: "12345",
      rsa_n: "123",
      imgSrc: "",
    },
  ];

  return (
    <div className="chats">
      {chats.map((chat) => (
        <div
          className={`userChat ${
            chat.rsa_e + " " + chat.rsa_n === currentUserId ? "selected" : ""
          }`}
          key={chat.rsa_e + " " + chat.rsa_n}
          onClick={() => handleChatClick(chat.rsa_e + " " + chat.rsa_n)}
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
