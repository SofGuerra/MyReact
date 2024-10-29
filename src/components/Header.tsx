import React, { useEffect, useState } from 'react';
import './Header.css';
import ManageUsers from './ManageUsers';

const Header: React.FC = () => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isFilesMenuVisible, setFilesMenuVisible] = useState(false);
  const [manageUsersPopup, setManageUsersPopup] = useState(false);



  const toggleSettingsMenu = () => {
    setShowSettingsMenu((prev) => !prev);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
  };

  const toggleViewMenu = () => {
    setShowViewMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
  };

  const toggleSaveMenu = () => {
    setShowSaveMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setFilesMenuVisible(false);
  };

  const toggleFilesMenu = () => {
    setFilesMenuVisible((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowSaveMenu(false);
  };

  const toggleManageUsersPopup = () => {
    setManageUsersPopup(!manageUsersPopup);

  }

useEffect(()=> { 
  window.addEventListener
 
},
[])


  // Handle file selection (for "Add a database")
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile);
      // Handle file import logic here
    }
  };

  return (
    <div>
    <div className="header">
       <div className="header-buttons">
        <button onClick={toggleSettingsMenu}>Settings
        {showSettingsMenu && (
          <div className="menu">
          <ul>
          <li>View all users</li>
          <hr></hr>
          <li>More options...</li>
          <hr></hr>
          <li onClick={toggleManageUsersPopup}>Manage users</li>
          </ul>
        </div>
        )}
        </button>

        <button onClick={toggleViewMenu}>View
        {showViewMenu && (
          <div className="menu">
            <ul>
            <li>Hide Sidebar</li>
            <hr></hr>
            <li>another option</li>
            <hr></hr>
            <li>option optionosa</li>
          </ul>
          </div>
        )}
        </button>

        <button onClick={toggleSaveMenu}>Save
        {showSaveMenu && (
          <div className="menu">
          <ul>
            <li onClick={() => document.getElementById('file-input')?.click()}>Save as</li>
            <hr></hr>
            <li>Save</li>
            <hr></hr>
            <li onClick={() => document.getElementById('file-input')?.click()}>Save copy</li>
          </ul>
        </div>
        )}
      </button>
        {/* New Files Button */}
        <button className="files-button" onClick={toggleFilesMenu}>Files
        {isFilesMenuVisible && (
          <div className="menu">
            <ul>
              <li onClick={() => document.getElementById('file-input')?.click()}>Add a database</li>
              <hr></hr>
              <li>Visualize databases</li>
              <hr></hr>
              <li>Remove database</li>
            </ul>
          </div>
        )}
        </button>
        {/* Hidden file input to open the file explorer */}
        <input
          type="file"
          id="file-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

      </div>

      <button className="login-button" onClick={() => {}}>Profile</button>
      
    </div>

    {manageUsersPopup && (
      <div>
        <ManageUsers />
        </div>
    )}
    </div>
  );
};

export default Header;
