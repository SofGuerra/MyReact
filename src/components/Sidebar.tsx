import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';
import Cookies from "js-cookie";

interface SidebarProps {
  selectedRow: { id: number; name: string; age: number; occupation: string } | null;
  setCurrentTable: (n: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedRow, setCurrentTable }) => {
  const isDragging = useRef(false);
  const canDragRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const [selectedName, setSelectedName] = useState<string>("");
  const [options, setOptions] = useState<{ id: number; table_name: string }[]>([]);

  const minWidth = 230; // ancho mínimo
  const maxWidth = 320; // ancho máximo

  const onDivMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let distanceToRightEdge = event.currentTarget.clientLeft + event.currentTarget.clientWidth - event.clientX;
    if (distanceToRightEdge < 20) {
      event.currentTarget.style.cursor = 'ew-resize';
      canDragRef.current = true;
    } else {
      event.currentTarget.style.cursor = 'default';
      canDragRef.current = false;
    }
  };

  const onDivExit = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'default';
    canDragRef.current = false;
  };

  const onMousePress = (event: MouseEvent) => {
    if (canDragRef.current) {
      isDragging.current = true;
    }
  };

  const onMouseRelease = (event: MouseEvent) => {
    isDragging.current = false;
  };

  const onMouseMove = (event: MouseEvent) => {
    if (sidebarRef.current && isDragging.current) {
      const newWidth = event.clientX - sidebarRef.current.getBoundingClientRect().left + 10;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        sidebarRef.current.style.minWidth = newWidth + 'px';
        sidebarRef.current.style.maxWidth = newWidth + 'px';
      }
    }
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) return;
    fetch('/api/user-tables', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token
      }
    })
      .then(response => response.json()
      .then(data => {setOptions(data.tables); console.log(data.tables)}
      ))
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', onMousePress);
    window.addEventListener("mouseup", onMouseRelease);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener('mousedown', onMousePress);
      window.removeEventListener("mouseup", onMouseRelease);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentTable(options[parseInt(event.target.value)].id);
    console.log("Set current table to " + options[parseInt(event.target.value)].id);
    setSelectedName(event.target.value);
  };

  return (
    <div
      id="sidebar"
      className="sidebar"
      onMouseMove={onDivMove}
      onMouseLeave={onDivExit}
      ref={sidebarRef}
      style={{ minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px` }}
    >
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

<select id="table-select" value={selectedName} onChange={handleChange}>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.table_name}
          </option>
        ))}
      </select>

    </div>
  );
};

export default Sidebar;