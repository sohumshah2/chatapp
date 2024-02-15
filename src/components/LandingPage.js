import React from "react";
import "./LandingPage.css"; // Import CSS for styling
import NavBar from "./NavBar";

function LandingPage({ scrollToChatApp }) {
  return (
    <div className="container">
      <NavBar />
      <div className="hero-section">
        <div className="hero-content">
          <h1>End-to-end encryption implemented from scratch.</h1>
          <p>Chat securely today. No sign in required.</p>
          <button onClick={scrollToChatApp}>Get Started</button>
        </div>
        <div className="hero-image">
          <img
            src="https://kinsta.com/wp-content/uploads/2023/07/what-is-encryption.jpg"
            alt="Chat App"
          />
        </div>
      </div>
      <div className="feature-section">
        <div className="image-container">
          <img src="config.png" alt="config" />
          <img src="public.png" alt="Feature" />
          <img src="send.png" alt="Feature 1" />
        </div>
        <div className="content-container">
          <div className="feature-box">
            <h2>Step 1</h2>
            <p>Set your public and private RSA keys.</p>
          </div>
          <div className="feature-box">
            <h2>Step 2</h2>
            <p>Enter your intended recipient's public RSA key.</p>
          </div>
          <div className="feature-box">
            <h2>Step 3</h2>
            <p>
              Type a message and hit send. E2Elevate will ensure your messages
              are sent securely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
