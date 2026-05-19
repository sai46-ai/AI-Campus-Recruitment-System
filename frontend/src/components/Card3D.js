import React, { useRef, useEffect } from 'react';
import './Card3D.css';

/**
 * Card3D - Ultra-dynamic 3D card with tilt, glow, and hover effects
 */
const Card3D = ({ children, className = '', glowColor = '#4dd0e1', intensity = 'medium' }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const glow = glowRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / (intensity === 'high' ? 10 : intensity === 'low' ? 30 : 20);
      const rotateY = (centerX - x) / (intensity === 'high' ? 10 : intensity === 'low' ? 30 : 20);
      
      card.style.transform = `
        perspective(1000px) 
        rotateX(${rotateX}deg) 
        rotateY(${rotateY}deg) 
        scale3d(1.02, 1.02, 1.02)
      `;
      
      // Update glow position
      if (glow) {
        glow.style.left = `${x}px`;
        glow.style.top = `${y}px`;
        glow.style.opacity = '0.6';
      }
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      if (glow) {
        glow.style.opacity = '0';
      }
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <div 
      ref={cardRef} 
      className={`card-3d ${className} intensity-${intensity}`}
      style={{ '--glow-color': glowColor }}
    >
      <div ref={glowRef} className="card-3d-glow"></div>
      <div className="card-3d-content">
        {children}
      </div>
      <div className="card-3d-shine"></div>
    </div>
  );
};

export default Card3D;
