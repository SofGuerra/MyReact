import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import Validations from "../validations";
import Cookies from "js-cookie";

interface LoginProps {
  setUsersCount: React.Dispatch<React.SetStateAction<number | null>>; // Adjust type if count is not a number
}

const FirstRegister: React.FC<LoginProps> = ({ setUsersCount }) => {
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

    let errorMessage = "";
    errorMessage = Validations.validateUsername(username);
    if (errorMessage != "") {
      setErrorMessage(errorMessage);
      return;
    }

    errorMessage = Validations.validatePassword(password);
    if (errorMessage != "") {
      setErrorMessage(errorMessage);
      return;
    }

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
          setUsersCount(1);
          Cookies.set("token", body.token, { expires: 7 });
        } else {
          setErrorMessage(body.message || "Failed to register");
        }
      })
    );
  };

  return (
    <div
      style={{
        backgroundColor: "#f3edf2",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      <div className="popup" style={{ borderRadius: "10px" }}>
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
    </div>
  );
};

export default FirstRegister;
