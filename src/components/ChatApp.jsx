import React, { useState } from "react";
import ChatAppOld from "./ChatAppOld";
import Setup from "./Setup";
import "./ChatApp.css";
import LandingPage from "./LandingPage";

const ChatApp = () => {
  const [isSetupCompleted, setIsSetupCompleted] = useState(false);
  const [rsaKeys, setRSAKeys] = useState({ d: "", e: "", n: "" });

  const handleSubmit = (keys) => {
    setRSAKeys(keys);
    setIsSetupCompleted(true);
  };

  return (
    <div className="chatapp-container">
      {!isSetupCompleted && <Setup onSubmit={handleSubmit} />}
      <div className={isSetupCompleted ? "content" : "content blur"}>
        {/* <ChatAppOld /> Temporary */}
        <LandingPage /> {/* Temporary */}
      </div>
    </div>
  );
};

export default ChatApp;
