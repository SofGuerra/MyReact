import React, { useState } from 'react';
import "./Login.css"

const Login: React.FC = () => {
    return (
      <div>
        <div className = "container">
          <img src=".\images\Жоски кот.jpg" alt="Profile Photo" />
          |<h3>varible de nombre</h3>
          <hr></hr>
        </div>

      <div className="infoSection">
        <h3>Profile Info</h3>
        <p>Nombre:</p>
        <p>Fecha de nacimiento: </p>
        <p>Clients: </p>
        <p>Money earned:  </p>

      </div>

      <div className="chartSection">
       
      </div>
      <div className="rightChartSection">
        <h3>Additional Info</h3>
        <p>This space can be used for another chart or any other info.</p>
      </div>



      </div>
    );
};

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