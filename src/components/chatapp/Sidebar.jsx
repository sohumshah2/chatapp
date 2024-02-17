import React, { useState } from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";

const Sidebar = ({
  currentUserId,
  setCurrentUserId,
  setCurrentUsername,
  securityLog,
  chats,
}) => {
  return (
    <div className="sidebar">
      <ChatNavbar />
      <Chats
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        setCurrentUsername={setCurrentUsername}
        chats={chats}
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
