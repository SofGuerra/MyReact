import React, { useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isFilesMenuVisible, setFilesMenuVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const toggleSettingsMenu = () => {
    setShowSettingsMenu((prev) => !prev);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setShowLoginPopup(false);
    setFilesMenuVisible(false);
  };

  const toggleViewMenu = () => {
    setShowViewMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowSaveMenu(false);
    setShowLoginPopup(false);
    setFilesMenuVisible(false);
  };

  const toggleSaveMenu = () => {
    setShowSaveMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowLoginPopup(false);
    setFilesMenuVisible(false);
  };

  const toggleFilesMenu = () => {
    setFilesMenuVisible((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setShowLoginPopup(false);
  };

  const toggleLoginPopup = () => {
    setShowLoginPopup((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    if (!username || !password) {
      setErrorMessage('Username and password are required.');
      return;
    }

    const response = await fetch('/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({"username": username, "password": password})
    });

    console.log('Sending request with body:' + JSON.stringify({"username": username, "password": password}));

    setShowLoginPopup(false);
    setUsername('');
    setPassword('');
    setErrorMessage('');
  };

  // Handle file selection (for "Add a database")
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile);
      // Handle file import logic here
    }
  };

  return (
    <div className="header">
      <div className="header-buttons">
        <button onClick={toggleSettingsMenu}>Settings</button>
        {showSettingsMenu && (
          <div className="menu settings-menu">
            <h3>Settings Menu</h3>
          </div>
        )}

        <button onClick={toggleViewMenu}>View</button>
        {showViewMenu && (
          <div className="menu view-menu">
            <h3>View Menu</h3>
          </div>
        )}

        <button onClick={toggleSaveMenu}>Save</button>
        {showSaveMenu && (
          <div className="menu save-menu">
            <h3>Save Menu</h3>
          </div>
        )}

        {/* New Files Button */}
        <button className="files-button" onClick={toggleFilesMenu}>Files</button>
        {isFilesMenuVisible && (
          <div className="menu files-menu">
            <ul>
              <li onClick={() => document.getElementById('file-input')?.click()}>Add a database</li>
              <li>Visualize database</li>
              <li>Remove database</li>
            </ul>
          </div>
        )}

        {/* Hidden file input to open the file explorer */}
        <input
          type="file"
          id="file-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <button className="login-button" onClick={toggleLoginPopup}>Login</button>
      {showLoginPopup && (
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
          <button className="close-button" onClick={toggleLoginPopup}>Close</button>
        </div>
      )}
    </div>
  );
};

export default Header;
