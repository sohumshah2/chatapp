import React, { useState } from "react";
import "./Chats.css";

const Chats = ({
  currentUserId,
  setCurrentUserId,
  setCurrentUsername,
  chats,
  setChats,
}) => {
  const [editingChatName, setEditingChatName] = useState(null);
  const [newChatName, setNewChatName] = useState("");

  const handleChatClick = (chatId, chatName) => {
    console.log(chatId);
    setCurrentUserId(chatId);
    setCurrentUsername(chatName);
  };

  const handleChatNameEdit = (chatId) => {
    // Close the input box

    setChats((prevChats) => {
      return prevChats.map((chat) => {
        if (chat.id === chatId) {
          return {
            ...chat,
            name: newChatName,
          };
        } else {
          return chat;
        }
      });
    });

    setEditingChatName(null);
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
          {/* <img src={chat.imgSrc} /> */}
          <div className="userChatInfo">
            {editingChatName === chat.rsa_e + " " + chat.rsa_n ? (
              <input
                className="editChatNameInput"
                type="text"
                value={newChatName}
                onChange={(e) => setNewChatName(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter")
                    handleChatNameEdit(chat.rsa_e + " " + chat.rsa_n);
                }}
                onBlur={() => handleChatNameEdit(chat.rsa_e + " " + chat.rsa_n)}
                autoFocus
              />
            ) : (
              <span
                onDoubleClick={() => {
                  setEditingChatName(chat.rsa_e + " " + chat.rsa_n);
                  setNewChatName(chat.name);
                }}
              >
                {chat.name}
              </span>
            )}
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
