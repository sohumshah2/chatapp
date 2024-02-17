import React, { useState } from "react";
import "./Chats.css";

const Chats = ({ currentUserId, setCurrentUserId, setCurrentUsername }) => {
  const handleChatClick = (chatId, chatName) => {
    console.log(chatId);
    setCurrentUserId(chatId);
    setCurrentUsername(chatName);
  };

  // temporary data
  const chats = [
    {
      name: "123 123",
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
      name: "12345 123",
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
