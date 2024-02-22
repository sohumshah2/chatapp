import React, { useState } from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";
import AddUser from "./AddUser";

const Sidebar = ({
  currentUserId,
  setCurrentUserId,
  setCurrentUsername,
  securityLog,
  chats,
  setChats,
  setMessages,
}) => {
  return (
    <div className="sidebar">
      <ChatNavbar />
      <Chats
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        setCurrentUsername={setCurrentUsername}
        chats={chats}
        setChats={setChats}
      />
      <AddUser
        className="addUser"
        setChats={setChats}
        setCurrentUserId={setCurrentUserId}
        setMessages={setMessages}
      />
      <div className="security-log-container">
        <h3>Security Log</h3>
        <div className="security-log">
          <ul>
            {securityLog.map((event, index) => (
              <li key={index}>{event}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
