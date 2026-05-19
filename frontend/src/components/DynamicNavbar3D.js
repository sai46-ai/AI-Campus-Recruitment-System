import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUserRole, getUser } from '../services/api';
import './DynamicNavbar3D.css';

const DynamicNavbar3D = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const userRole = getUserRole();
    const userData = getUser();
    setRole(userRole);
    setUser(userData);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavLinks = () => {
    if (!role) {
      return [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/login', label: 'Login', icon: '🔐' },
        { path: '/register', label: 'Register', icon: '📝' },
      ];
    }

    const commonLinks = [
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/notifications', label: 'Notifications', icon: '🔔' },
      { path: '/settings', label: 'Settings', icon: '⚙️' },
    ];

    switch (role) {
      case 'student':
        return [
          { path: '/student-dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/jobs', label: 'Browse Jobs', icon: '💼' },
          { path: '/applications', label: 'My Applications', icon: '📄' },
          ...commonLinks,
        ];
      case 'recruiter':
        return [
          { path: '/recruiter-dashboard', label: 'Dashboard', icon: '📊' },
          { path: '/post-job', label: 'Post Job', icon: '➕' },
          { path: '/recruiter/jobs', label: 'My Jobs', icon: '💼' },
          { path: '/applicants', label: 'Applicants', icon: '👥' },
          ...commonLinks,
        ];
      case 'admin':
        return [
          { path: '/admin-dashboard', label: 'Admin Dashboard', icon: '👑' },
          ...commonLinks,
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`dynamic-navbar-3d ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-logo">
          <Link to={role ? `/${role}-dashboard` : '/'} className="logo-link">
            <div className="logo-3d">
              <span className="logo-icon">🎓</span>
              <span className="logo-text">AI Campus</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-links">
          {navLinks.map((link, index) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
              style={{ '--link-index': index }}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
              <div className="nav-link-glow"></div>
            </Link>
          ))}
        </div>

        {/* User Menu */}
        <div className="navbar-actions">
          {role ? (
            <div className="user-menu-container">
              <button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar">
                  {user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role-badge">{role}</span>
              </button>

              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{user?.name}</strong>
                      <small>{user?.email}</small>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <span>👤</span> Profile
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <span>⚙️</span> Settings
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    <span>🚪</span> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-3d btn-login">Login</Link>
              <Link to="/register" className="btn-3d btn-register">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
          {role && (
            <>
              <div className="mobile-menu-divider"></div>
              <button className="mobile-nav-link logout-btn" onClick={handleLogout}>
                <span className="nav-icon">🚪</span>
                <span className="nav-label">Logout</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="navbar-bg-effects">
        <div className="glow-orb glow-orb-1"></div>
        <div className="glow-orb glow-orb-2"></div>
      </div>
    </nav>
  );
};

export default DynamicNavbar3D;
