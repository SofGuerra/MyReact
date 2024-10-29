import React, { useState, useEffect, useRef } from 'react';
import './Sidebar.css';

interface SidebarProps {
  selectedRow: { id: number; name: string; age: number; occupation: string } | null;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedRow }) => {
  const isDragging = useRef(false);
  const canDragRef = useRef(false);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const minWidth = 230; // ancho mínimo
  const maxWidth = 320; // ancho máximo

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
      const newWidth = event.clientX - sidebarRef.current.getBoundingClientRect().left;
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        sidebarRef.current.style.width = newWidth + 'px';
      }
    }
  };

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
    </div>
  );
};

export default Sidebar;