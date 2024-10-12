import React, { useState } from 'react';
import './Header.css';

const Login: React.FC = () => {
    return (
        <div>Hello from login page</div>
    )
}

export default Login;

/*
<div className="popup">
          <h3>Login</h3>
          <form onSubmit={handleLoginSubmit} className="login-form">
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
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="submit" className="submit-button">Login</button>
          </form>
          <button className="close-button" onClick={() => {}}>Close</button>
        </div>
*/