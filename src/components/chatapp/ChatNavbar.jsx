import React from "react";
import "./ChatNavbar.css";

const Navbar = () => {
  return (
    <div className="chatNavbar">
      <span className="logo">E2Elevate</span>
      <div className="user">
        <button className="button">Reset</button>
      </div>
    </div>
  );
};

export default Navbar;
