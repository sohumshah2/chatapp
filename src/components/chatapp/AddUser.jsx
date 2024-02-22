import React, { useState } from "react";
import "./AddUser.css";

const AddUser = ({ setChats, setCurrentUserId, setMessages }) => {
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("");
  const [publicExponent, setPublicExponent] = useState("");
  const [modulus, setModulus] = useState("");

  const handleInputChange = (e) => {
    setName(e.target.value);
    if (e.target.value.trim() !== "") {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  };

  const handlePublicExponentChange = (e) => {
    setPublicExponent(e.target.value);
  };

  const handleModulusChange = (e) => {
    setModulus(e.target.value);
  };

  const handleSubmit = () => {
    setChats((prevChats) => {
      return [
        ...prevChats,
        {
          name,
          id: publicExponent + " " + modulus,
          lastMessage: "",
          rsa_e: publicExponent,
          rsa_n: modulus,
          imgSrc: "",
        },
      ];
    });
    setMessages((prevMessages) => {
      return {
        ...prevMessages,
        [publicExponent + " " + modulus]: [],
      };
    });

    setCurrentUserId(publicExponent + " " + modulus);

    setExpanded(false);
    setName("");
    setPublicExponent("");
    setModulus("");
  };

  return (
    <div className={`addUser ${expanded ? "expanded" : ""}`}>
      <h3>Add a user</h3>
      <div className="inputs">
        <input
          className={`input-box ${expanded ? "expanded" : ""}`}
          type="text"
          placeholder="Name"
          value={name}
          onChange={handleInputChange}
        />
        {expanded && (
          <>
            <input
              type="text"
              className="input-box"
              placeholder="Public Exponent (e)"
              value={publicExponent}
              onChange={handlePublicExponentChange}
            />
            <input
              className="input-box"
              type="text"
              placeholder="Modulus (n)"
              value={modulus}
              onChange={handleModulusChange}
            />
            <button onClick={handleSubmit} className="sendButton">
              Add
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddUser;
