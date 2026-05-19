import React from 'react';
import './LoadingSpinner3D.css';

const LoadingSpinner3D = ({ message = 'Loading...', size = 'medium' }) => {
  return (
    <div className={`loading-spinner-3d ${size}`}>
      <div className="spinner-container">
        {/* 3D Cube Spinner */}
        <div className="cube-spinner">
          <div className="cube-face front"></div>
          <div className="cube-face back"></div>
          <div className="cube-face left"></div>
          <div className="cube-face right"></div>
          <div className="cube-face top"></div>
          <div className="cube-face bottom"></div>
        </div>
        
        {/* Orbiting Rings */}
        <div className="orbit-ring ring-1"></div>
        <div className="orbit-ring ring-2"></div>
        <div className="orbit-ring ring-3"></div>
      </div>
      
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default LoadingSpinner3D;
