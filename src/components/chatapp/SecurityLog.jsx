import React from "react";
import "./SecurityLog.css";

const SecurityLog = ({ securityLog }) => {
  return (
    <div className="security-log-container">
      <h3>Security Log</h3>
      <div className="security-log">
        <ul>
          {securityLog.map((event, index) => (
            <li key={index}>{event}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SecurityLog;
