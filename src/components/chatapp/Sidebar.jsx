import React from "react";
import "./Sidebar.css";
import ChatNavbar from "./ChatNavbar";
import Chats from "./Chats";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ChatNavbar />
      <Chats />
    </div>
  );
};

export default Sidebar;
