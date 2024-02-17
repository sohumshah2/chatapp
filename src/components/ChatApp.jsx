import React, { useState } from "react";
// import ChatAppOld from "./ChatAppOld";
import Setup from "./Setup";
import "./ChatApp.css";
import LandingPage from "./LandingPage";
import Sidebar from "./chatapp/Sidebar";
import Chat from "./chatapp/Chat";

const ChatApp = () => {
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [rsaKeys, setRSAKeys] = useState({ d: "", e: "", n: "" });
  const [currentUserId, setCurrentUserId] = useState("");

  const handleSubmit = (keys) => {
    setRSAKeys(keys);
    setIsSetupCompleted(true);
  };

  return (
    <div className="container">
      {!isSetupCompleted && <Setup onSubmit={handleSubmit} />}
      <div className={isSetupCompleted ? "content" : "content blur"}>
        {/* <LandingPage /> */}
        <Sidebar
          className="sidebar"
          currentUserId={currentUserId}
          setCurrentUserId={setCurrentUserId}
        />
        <Chat className="chat" currentUserId={currentUserId} />
      </div>
    </div>
  );
};

export default ChatApp;
