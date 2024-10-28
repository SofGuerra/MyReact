import React, { useState, useEffect , useRef} from 'react';
import './Sidebar.css';

interface SidebarProps {
  selectedRow: { id: number; name: string; age: number; occupation: string } | null;
}


const Sidebar: React.FC<SidebarProps> = ({ selectedRow }) => {
  const isDragging = useRef(false);
  const canDragRef = useRef(false);

  const onDivMove = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    let distanceToRightEdge = event.currentTarget.clientLeft + event.currentTarget.clientWidth - event.clientX;
    if (distanceToRightEdge < 10) {
      event.currentTarget.style.cursor = 'ew-resize';
      canDragRef.current = true;
    } else {
      event.currentTarget.style.cursor = 'default';
      canDragRef.current = false;
    }
  };

  const onDivExit = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.currentTarget.style.cursor = 'default';
    canDragRef.current = false
  }

  const onMousePress = (event: MouseEvent) => {
    if (canDragRef.current) {
      isDragging.current = true;
    }
  }

  const onMouseRelease = (event: MouseEvent) => {
    isDragging.current = false;
  }

  let sidebarDiv : HTMLDivElement;

  const onMouseMove = (event: MouseEvent) => {
    if (sidebarDiv == null) {
      sidebarDiv = document.getElementById("sidebar") as HTMLDivElement;
      return;
    };
    if (isDragging.current) {
      sidebarDiv.style.width = event.clientX - sidebarDiv.clientLeft + 5 + "px";
    }
  }

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

  return (
    <div id="sidebar" className="sidebar" onMouseMove={onDivMove} onMouseLeave={onDivExit}>
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
