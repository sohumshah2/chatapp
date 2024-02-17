import React from "react";
import "./Setup.css";

const Setup = () => {
  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="title">Please enter your RSA keys.</span>
        <button>Generate RSA keys</button>
        <form>
          <input type="text" placeholder="Private exponent (d)" />
          <input type="text" placeholder="Public exponent (e)" />
          <input type="text" placeholder="Modulus (n)" />
          <button>Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
