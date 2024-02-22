import React, { useState } from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";
import AddUser from "./AddUser";
import SecurityLog from "./SecurityLog";

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
      <SecurityLog securityLog={securityLog} />
    </div>
  );
};

export default Sidebar;
