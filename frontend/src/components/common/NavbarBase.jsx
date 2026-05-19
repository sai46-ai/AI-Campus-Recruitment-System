/**
 * Navbar Base Component
 * Shared navbar logic used by different navbar implementations
 * Reduces code duplication across Navbar, DynamicNavbar3D, DashboardTopBar
 */

import React, { useState, useEffect } from 'react';

const NavbarBase = ({
  navItems = [],
  userRole = null,
  userName = null,
  onLogout = null,
  customActions = null,
  className = '',
  children = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      setIsOpen(false);
    }
  };

  // Get role-specific display color
  const getRoleColor = () => {
    const colors = {
      student: '#667eea',
      recruiter: '#f7b733',
      admin: '#e74c3c'
    };
    return colors[userRole?.toLowerCase()] || '#333';
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      {isMobile && (
        <button
          className={`navbar-toggle ${className}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      )}

      {/* Navbar Container */}
      <nav className={`navbar-base ${className} ${isOpen ? 'open' : ''}`}>
        {/* Navbar Header/Logo */}
        <div className="navbar-header">
          <h1 className="navbar-brand">Campus Recruitment</h1>
          {userRole && (
            <span className="navbar-role" style={{ borderColor: getRoleColor() }}>
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <ul className="navbar-menu">
          {navItems.map((item) => (
            <li key={item.id || item.path} className="navbar-item">
              <a
                href={item.path}
                className="navbar-link"
                onClick={handleNavClick}
              >
                {item.icon && <span className="navbar-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </a>
            </li>
          ))}

          {/* Divider */}
          {navItems.length > 0 && (userName || customActions) && (
            <li className="navbar-divider"></li>
          )}

          {/* User Menu */}
          {userName && (
            <li className="navbar-user-section">
              <div className="navbar-user-info">
                <div className="navbar-user-name">{userName}</div>
                {userRole && (
                  <div className="navbar-user-role">{userRole}</div>
                )}
              </div>
            </li>
          )}

          {/* Custom Actions */}
          {customActions &&
            Array.isArray(customActions) &&
            customActions.map((action) => (
              <li key={action.id} className="navbar-action-item">
                {action.type === 'button' ? (
                  <button
                    className="navbar-action-btn"
                    onClick={action.onClick}
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </button>
                ) : (
                  <a href={action.path} className="navbar-action-link">
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </a>
                )}
              </li>
            ))}

          {/* Logout Button */}
          {onLogout && (
            <li className="navbar-logout">
              <button
                className="btn-logout"
                onClick={handleLogout}
              >
                Logout
              </button>
            </li>
          )}
        </ul>

        {/* Custom Children (for variant-specific content) */}
        {children && <div className="navbar-custom">{children}</div>}
      </nav>

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="navbar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default NavbarBase;
