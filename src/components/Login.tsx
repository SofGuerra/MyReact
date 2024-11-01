import React, { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.css";
import Validations from "../validations";
import Cookies from "js-cookie";

interface LoginProps {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
  setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
}

const Login: React.FC<LoginProps> = ({ setLoggedIn, setIsAdmin }) => {
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
      setErrorMessage("Invalid username or password");
      return;
    }

    errorMessage = Validations.validatePassword(password);
    if (errorMessage != "") {
      setErrorMessage("Invalid username or password");
      return;
    }

    fetch("/api/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password: password }),
    }).then((res) =>
      res.json().then((body) => {
        if (body.token) {
          setLoggedIn(true);
          Cookies.set("token", body.token, {
            expires: 7,
          });
          setIsAdmin(body.isAdmin);
        } else {
          setErrorMessage(body.message || "Invalid username or password");
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
        <h5>Login</h5>
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

          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
