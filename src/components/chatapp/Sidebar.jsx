import React from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";

const Sidebar = ({ currentUserId, setCurrentUserId }) => {
  return (
    <div className="sidebar">
      <ChatNavbar />
      <Chats
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
      />
    </div>
  );
};

export default Sidebar;
