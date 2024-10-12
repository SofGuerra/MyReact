import React, { useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [isSidebarVisible, setSidebarVisible] = useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <header className="header">
      <h1>My Application</h1>
      <button className="files-button" onClick={toggleSidebar}>
        Files
      </button>

      {isSidebarVisible && (
        <div className="sidebar-menu">
          <ul>
            <li onClick={() => document.getElementById('file-input')?.click()}>Add a database</li>
            <li>Visualize database</li>
            <li>Remove database</li>
          </ul>
        </div>
      )}

      {/* Hidden input for file explorer */}
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            console.log('File selected:', selectedFile);
            // Add your file handling logic here
          }
        }}
      />
    </header>
  );
};

export default Header;
