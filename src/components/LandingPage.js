import React from "react";
import "./LandingPage.css"; // Import CSS for styling

function LandingPage({ scrollToChatApp }) {
  return (
    <div className="landing-page">
      <h1>Welcome to My Chat App</h1>
      <p>This is a sample landing page for the chat app.</p>
      <button onClick={scrollToChatApp}>Get Started</button>
    </div>
  );
}

export default LandingPage;
