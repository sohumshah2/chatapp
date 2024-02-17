// import ChatAppOld from "./components/ChatAppOld";
import ChatApp from "./components/ChatApp";
import LandingPage from "./components/LandingPage";
import React, { useRef } from "react";

function App() {
  const chatAppRef = useRef(null);

  const scrollToChatApp = () => {
    chatAppRef.current.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <div className="App">
      <LandingPage scrollToChatApp={scrollToChatApp} />
      <div ref={chatAppRef}>
        <ChatApp />
        {/* <ChatAppOld /> */}
      </div>
    </div>
  );
}

export default App;
