import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import "./PopUp.css";

interface PopUpProps {
  children: React.ReactNode;
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ children, onClose }) => {
    

  return (
    <div className="popup" style={{ borderRadius: "10px" }}>
      <div className="button-container">
        <button className="popup-close-button" onClick={onClose}>
          <img src="close-button-icon.webp" alt="Close x" style={{ width: "100%", height: "100%",  objectFit: "contain", }}
          />
          </button>
      </div>

      {children}
    </div>
  );
};

export default PopUp;
