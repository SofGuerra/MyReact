import React, { useEffect, useState } from 'react';
import './Header.css';
import Cookies from 'js-cookie';  
import ManageUsers from './ManageUsers';

interface HeaderProps {
  onLogOut: () => void;
  isAdmin: boolean;
  name: string
} 

const Header: React.FC <HeaderProps>= ({onLogOut, isAdmin, name}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showViewMenu, setShowViewMenu] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [isFilesMenuVisible, setFilesMenuVisible] = useState(false);
  const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);
  const [manageUsersPopup, setManageUsersPopup] = useState(false);

let logOut = () => {
  Cookies.remove("token");
  onLogOut();
}

  const toggleSettingsMenu = () => {
    setShowSettingsMenu((prev) => !prev);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
    setProfileMenuVisible(false);
    console.log("Is admin:" + isAdmin);
  };

  const toggleViewMenu = () => {
    setShowViewMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
    setProfileMenuVisible(false);
  };

  const toggleSaveMenu = () => {
    setShowSaveMenu((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setFilesMenuVisible(false);
    setProfileMenuVisible(false);
  };

  const toggleFilesMenu = () => {
    setFilesMenuVisible((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setProfileMenuVisible(false);
  };

  const toggleProfileMenu = () => {
    setProfileMenuVisible((prev) => !prev);
    setShowSettingsMenu(false);
    setShowViewMenu(false);
    setShowSaveMenu(false);
    setFilesMenuVisible(false);
  };

  const toggleManageUsersPopup = () => {
    setManageUsersPopup(!manageUsersPopup);

  }

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
          {isAdmin && (
            <div>
              <hr></hr>
              <li onClick={toggleManageUsersPopup}>Manage users</li>
              </div>
          )}
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

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h6 style={{ marginRight: '10px', height: '100%', textAlign: 'center', fontWeight: 'lighter', marginTop: '-12px', marginBottom: '-12px', fontSize: '17px'}}>{name}</h6>
        <button  onClick={toggleProfileMenu}>Profile
        {isProfileMenuVisible && (
            <div className="menu" style={{transform: 'translateX(-100%)'}}>
              <ul>
                <li onClick={() => document.getElementById('file-input')?.click()}>View Profile</li>
                <hr></hr>
                <li onClick={logOut}>Log out</li>
              </ul>
            </div>
          )}
        </button>
      </div>

    </div>


    {manageUsersPopup && (
      <div>
        <ManageUsers setShown={setManageUsersPopup} />
        </div>
    )}
    </div>
  );
};

export default Header;
