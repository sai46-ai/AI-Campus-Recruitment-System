import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getUserRole, logout } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import './Ultra3DNavigation.css';

const Ultra3DNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getUserRole();
  const [activeSection, setActiveSection] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      { path: '/profile', label: 'Profile', icon: '👤' },
      { path: '/notifications', label: 'Notifications', icon: '🔔' },
      { path: '/settings', label: 'Settings', icon: '⚙️' }
    ];

    if (role === 'student') {
      return [
        { path: '/student-dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/jobs', label: 'Browse Jobs', icon: '💼' },
        { path: '/applications', label: 'My Applications', icon: '📄' },
        ...commonItems
      ];
    } else if (role === 'recruiter') {
      return [
        { path: '/recruiter-dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/post-job', label: 'Post Job', icon: '➕' },
        { path: '/my-jobs', label: 'My Jobs', icon: '📋' },
        ...commonItems
      ];
    } else if (role === 'admin') {
      return [
        { path: '/admin-dashboard', label: 'Dashboard', icon: '🏠' },
        ...commonItems
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveSection(location.pathname);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Don't show navigation on public pages
  if (['/login', '/register', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <motion.nav
        className={`ultra-3d-nav ${isScrolled ? 'scrolled' : ''}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <div className="nav-container">
          {/* Logo/Brand */}
          <motion.div
            className="nav-brand"
            whileHover={{ scale: 1.05, rotateY: 10 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="brand-icon">🎓</span>
            <span className="brand-text">VVIT Recruit</span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="nav-items-desktop">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item-3d ${isActive ? 'active' : ''}`
                  }
                >
                  <motion.span
                    className="nav-item-content"
                    whileHover={{ scale: 1.1, z: 20 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    <motion.div
                      className="nav-item-glow"
                      layoutId="navGlow"
                    />
                  </motion.span>
                </NavLink>
              </motion.div>
            ))}
          </div>

          {/* Logout Button */}
          <motion.button
            className="nav-logout-3d"
            onClick={handleLogout}
            whileHover={{ scale: 1.05, rotateY: -10 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
          </motion.button>

          {/* Mobile Menu Toggle */}
          <motion.button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.9 }}
          >
            <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </motion.button>
        </div>

        {/* 3D Background Elements */}
        <div className="nav-3d-bg">
          <div className="nav-gradient-orb orb-1"></div>
          <div className="nav-gradient-orb orb-2"></div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="mobile-menu-3d"
            initial={{ opacity: 0, x: '100%', rotateY: 90 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            exit={{ opacity: 0, x: '100%', rotateY: 90 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <div className="mobile-menu-header">
              <span className="mobile-brand-text">Menu</span>
              <motion.button
                className="mobile-close"
                onClick={() => setIsMobileMenuOpen(false)}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            </div>

            <div className="mobile-menu-items">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `mobile-nav-item ${isActive ? 'active' : ''}`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="mobile-nav-icon">{item.icon}</span>
                    <span className="mobile-nav-label">{item.label}</span>
                  </NavLink>
                </motion.div>
              ))}

              <motion.button
                className="mobile-logout"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="mobile-nav-icon">🚪</span>
                <span className="mobile-nav-label">Logout</span>
              </motion.button>
            </div>

            <div className="mobile-menu-bg">
              <div className="mobile-gradient-orb"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Ultra3DNavigation;
