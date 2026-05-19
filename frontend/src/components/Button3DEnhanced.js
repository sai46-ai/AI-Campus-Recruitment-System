import React, { useRef } from 'react';
import './Button3DEnhanced.css';

/**
 * Button3DEnhanced - Ultra-dynamic 3D button with ripple and glow effects
 */
const Button3DEnhanced = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  className = ''
}) => {
  const buttonRef = useRef(null);
  const rippleRef = useRef(null);

  const handleClick = (e) => {
    if (disabled || loading) return;

    // Ripple effect
    const button = buttonRef.current;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple-effect');

    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      className={`button-3d-enhanced ${variant} ${size} ${disabled ? 'disabled' : ''} ${loading ? 'loading' : ''} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <span className="button-content">
        {loading && (
          <span className="button-loader">
            <span className="loader-spinner"></span>
          </span>
        )}
        {!loading && icon && <span className="button-icon">{icon}</span>}
        <span className="button-text">{children}</span>
      </span>
      <span className="button-glow"></span>
    </button>
  );
};

export default Button3DEnhanced;
