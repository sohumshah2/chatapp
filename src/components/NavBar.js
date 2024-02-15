// NavBar.js

import React from "react";
import "./NavBar.css"; // Import CSS file for styling

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="website-name">E2Elevate</span>
      </div>
      <div className="navbar-right">
        <a
          href="https://github.com/sohumshah2/chatapp"
          className="nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>

        <a
          href="https://sohumsblog.vercel.app/blogs/chat-app-sec-analysis-1"
          className="nav-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn More
        </a>
      </div>
    </nav>
  );
};

export default NavBar;
