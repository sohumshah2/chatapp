import React, { useState } from "react";
import "./Setup.css";
import { generateKeys } from "../rsa";

const Setup = ({ onSubmit }) => {
  const [privateExponent, setPrivateExponent] = useState("");
  const [publicExponent, setPublicExponent] = useState("");
  const [modulus, setModulus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ d: privateExponent, e: publicExponent, n: modulus });
  };

  const generateRSAKeys = () => {
    generateKeys().then((keys) => {
      setPrivateExponent(keys.d.toString());
      setPublicExponent(keys.e.toString());
      setModulus(keys.n.toString());
    });
  };

  return (
    <div className="formContainer">
      <div className="formWrapper">
        <span className="title">Please enter your RSA keys.</span>
        <button onClick={generateRSAKeys}>Generate RSA keys</button>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Private exponent (d)"
            value={privateExponent}
            onChange={(e) => setPrivateExponent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Public exponent (e)"
            value={publicExponent}
            onChange={(e) => setPublicExponent(e.target.value)}
          />
          <input
            type="text"
            placeholder="Modulus (n)"
            value={modulus}
            onChange={(e) => setModulus(e.target.value)}
          />
          <button>Submit</button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
