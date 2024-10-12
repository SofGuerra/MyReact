import React from 'react';
import './Sidebar.css';

interface SidebarProps {
  selectedRow: { id: number; name: string; age: number; occupation: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedRow }) => {
  return (
    <div className="sidebar">
      <h2>Details</h2>
      {selectedRow ? (
        <div className="details">
          <p><strong>ID:</strong> {selectedRow.id}</p>
          <p><strong>Name:</strong> {selectedRow.name}</p>
          <p><strong>Age:</strong> {selectedRow.age}</p>
          <p><strong>Occupation:</strong> {selectedRow.occupation}</p>
        </div>
      ) : (
        <p>Select a row to see details.</p>
      )}
    </div>
  );
};

export default Sidebar;
