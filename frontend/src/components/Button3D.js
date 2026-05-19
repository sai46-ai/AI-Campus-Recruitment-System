/**
 * Button3D.js
 * Modern 3D button component with depth, press, and lighting effects
 * Features realistic shadow, glow, and spring-like press animation
 */

import React, { useState, useCallback } from 'react';
import './Button3D.css';

const Button3D = ({
  children,
  variant = 'primary', // primary, secondary, ghost, danger
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'right',
  loading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  onClick,
  ...props
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [ripple, setRipple] = useState(null);

  const handleMouseDown = useCallback((e) => {
    if (disabled || loading) return;
    setIsPressed(true);

    // Create ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setRipple({ x, y, id: Date.now() });
    setTimeout(() => setRipple(null), 600);
  }, [disabled, loading]);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleClick = useCallback((e) => {
    if (disabled || loading) return;
    onClick?.(e);
  }, [disabled, loading, onClick]);

  const buttonClasses = [
    'btn-3d',
    `btn-3d--${variant}`,
    `btn-3d--${size}`,
    isPressed && 'btn-3d--pressed',
    disabled && 'btn-3d--disabled',
    loading && 'btn-3d--loading',
    fullWidth && 'btn-3d--full-width',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {/* 3D layers */}
      <span className="btn-3d__shadow" />
      <span className="btn-3d__edge" />
      <span className="btn-3d__front">
        {loading && (
          <span className="btn-3d__spinner" />
        )}
        {icon && iconPosition === 'left' && (
          <span className="btn-3d__icon btn-3d__icon--left">{icon}</span>
        )}
        <span className="btn-3d__text">{children}</span>
        {icon && iconPosition === 'right' && (
          <span className="btn-3d__icon btn-3d__icon--right">{icon}</span>
        )}
      </span>
      
      {/* Ripple effect */}
      {ripple && (
        <span
          key={ripple.id}
          className="btn-3d__ripple"
          style={{
            left: ripple.x,
            top: ripple.y
          }}
        />
      )}
      
      {/* Glow effect */}
      <span className="btn-3d__glow" />
    </button>
  );
};

export default Button3D;
