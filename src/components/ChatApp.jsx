import React, { useState } from "react";
import ChatAppOld from "./ChatAppOld";
import Login from "./Login";
import "./ChatApp.css";
import LandingPage from "./LandingPage";

const ChatApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="chatapp-container">
      {!isLoggedIn && <Login onLogin={handleLogin} />}
      <div className="content blur">
        {/* <div className={isLoggedIn ? "content" : "content blur"}> */}
        {/* <ChatAppOld /> Temporary */}
        <LandingPage />
      </div>
    </div>
  );
};

export default ChatApp;
