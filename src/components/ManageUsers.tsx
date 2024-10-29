import React, { useEffect, useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import "./Header.css";

const ManageUsers: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };
  
    let submitForm = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
  
  
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match");
        return;
      }
  
      fetch("/api/firstReg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, password: password }),
      }).then((res) =>
        res.json().then((body) => {
          if (body.success) {
          } else {
            setErrorMessage(body.message || "Failed to register");
          }
        })
      );
    };
  
    return (
     
        <div className="popup" style={{ borderRadius: "10px" }}>
       <div style={{ position: "relative", width: "100%", height: "100%" }}>
  <div className="close-button">
    111111111
    {/* <img 
      src="kevin.jpg" 
      alt="Close x" 
      style={{
        width: "20px",        // Make the image smaller like a button
        height: "20px",       // Match height to width for square shape
        objectFit: "cover"    // Make sure the image fits without distortion
      }} 
    /> */}
  </div>
</div>
          <h5>First time register?</h5>
          <h6>Get started by register as an admin</h6>
          <h6>to begin using the DBMaster</h6>
          <form onSubmit={submitForm} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username:</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: "30px" }} // Ensure there's space for the icon
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                  }}
                >
                  {/* Change the icon based on the visibility state */}
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </span>
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Confirm password:</label>
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  id="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingRight: "30px" }} // Ensure there's space for the icon
                />
                <span
                  onClick={togglePasswordVisibility}
                  style={{
                    position: "absolute",
                    right: "10px",
                    cursor: "pointer",
                  }}
                >
                  {/* Change the icon based on the visibility state */}
                  <i
                    className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"}
                  ></i>
                </span>
              </div>
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit" className="submit-button">
              Register
            </button>
          </form>
        </div>
      
    );
  };

export default ManageUsers;
