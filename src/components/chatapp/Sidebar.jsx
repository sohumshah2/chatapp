import React from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";

const Sidebar = ({ currentUserId, setCurrentUserId, setCurrentUsername }) => {
  return (
    <div className="sidebar">
      <ChatNavbar />
      <Chats
        currentUserId={currentUserId}
        setCurrentUserId={setCurrentUserId}
        setCurrentUsername={setCurrentUsername}
      />
    </div>
  );
};

export default Sidebar;
