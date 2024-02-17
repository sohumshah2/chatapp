import React, { useState } from "react";
import ChatAppOld from "./ChatAppOld";
import Setup from "./Setup";
import "./ChatApp.css";
import LandingPage from "./LandingPage";

const ChatApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="chatapp-container">
      {!isLoggedIn && <Setup onLogin={handleLogin} />}
      <div className={isLoggedIn ? "content" : "content blur"}>
        {/* <ChatAppOld /> Temporary */}
        <LandingPage /> {/* Temporary */}
      </div>
    </div>
  );
};

export default ChatApp;
