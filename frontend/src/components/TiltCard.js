/**
 * TiltCard.js
 * 3D tilt effect card component with perspective, lighting, and parallax
 * Uses mouse position to calculate 3D rotation and glow effects
 */

import React, { useRef, useState, useCallback } from 'react';
import './TiltCard.css';

const TiltCard = ({ 
  children, 
  className = '', 
  intensity = 15, 
  glare = true,
  scale = 1.02,
  perspective = 1000,
  speed = 300,
  ...props 
}) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    glareX: 50,
    glareY: 50,
    glareOpacity: 0
  });

  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    
    const rotateY = (mouseX / (rect.width / 2)) * intensity;
    const rotateX = -(mouseY / (rect.height / 2)) * intensity;
    
    // Calculate glare position
    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;

    setTransform({
      rotateX,
      rotateY,
      scale,
      glareX,
      glareY,
      glareOpacity: glare ? 0.15 : 0
    });
  }, [intensity, scale, glare]);

  const handleMouseLeave = useCallback(() => {
    setTransform({
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      glareX: 50,
      glareY: 50,
      glareOpacity: 0
    });
  }, []);

  const cardStyle = {
    transform: `
      perspective(${perspective}px) 
      rotateX(${transform.rotateX}deg) 
      rotateY(${transform.rotateY}deg) 
      scale(${transform.scale})
    `,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
    transformStyle: 'preserve-3d'
  };

  const glareStyle = {
    background: `radial-gradient(
      circle at ${transform.glareX}% ${transform.glareY}%, 
      rgba(255, 255, 255, ${transform.glareOpacity}), 
      transparent 60%
    )`,
    opacity: transform.glareOpacity > 0 ? 1 : 0
  };

  return (
    <div
      ref={cardRef}
      className={`tilt-card ${className}`}
      style={cardStyle}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
      {glare && <div className="tilt-card-glare" style={glareStyle} />}
    </div>
  );
};

export default TiltCard;
