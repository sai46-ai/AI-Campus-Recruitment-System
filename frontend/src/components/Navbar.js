import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI, isAuthenticated, getUserRole, logout } from '../services/api';
import logo from '../assets/logo.png';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const isLoggedIn = isAuthenticated();
  const userRole = getUserRole();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setUser(null);
      return;
    }

    let cancelled = false;
    authAPI
      .getProfile()
      .then((res) => {
        if (cancelled) return;
        const payload = res?.data;
        const resolvedUser =
          payload?.data?.user ||
          payload?.user ||
          payload?.data ||
          payload ||
          null;

        if (resolvedUser && typeof resolvedUser === 'object') {
          setUser(resolvedUser);
          localStorage.setItem('user', JSON.stringify(resolvedUser));
          if (resolvedUser.role) {
            localStorage.setItem('role', resolvedUser.role);
          }
        }
      })
      .catch(() => {
        // Ignore: interceptor will handle 401 + redirect.
      });

    return () => {
      cancelled = true;
    };
  }, [isLoggedIn]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    return userRole === 'admin' ? '/admin' : userRole === 'recruiter' ? '/recruiter' : '/student';
  };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="VVIT Logo" />
          <span className="logo-text">VVIT Recruit</span>
        </div>

        {/* Desktop Menu */}
        <ul className="nav-links">
          <li 
            className={location.pathname === '/' ? 'active' : ''} 
            onClick={() => navigate('/')}
          >
            Home
          </li>
          {isLoggedIn ? (
            <>
              <li 
                className={location.pathname.includes(userRole) ? 'active' : ''}
                onClick={() => navigate(getDashboardLink())}
              >
                Dashboard
              </li>
              {userRole === 'student' && (
                <>
                  <li onClick={() => navigate('/jobs')}>Browse Jobs</li>
                  <li onClick={() => navigate('/applications')}>My Applications</li>
                </>
              )}
              {userRole === 'recruiter' && (
                <>
                  <li onClick={() => navigate('/post-job')}>Post Job</li>
                  <li onClick={() => navigate('/recruiter/jobs')}>My Jobs</li>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <li onClick={() => navigate('/admin')}>Admin</li>
                </>
              )}
              <li className="nav-profile" onClick={(e) => e.stopPropagation()}>
                <ProfileDropdown user={user} />
              </li>
            </>
          ) : (
            <>
              <li onClick={() => navigate('/login')}>Login</li>
              <li className="register-btn" onClick={() => navigate('/register')}>
                Get Started
              </li>
            </>
          )}
        </ul>

        {/* Mobile Menu Toggle */}
        <button 
          className={`mobile-toggle ${mobileMenuOpen ? 'open' : ''}`}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <ul>
          <li onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>Home</li>
          {isLoggedIn ? (
            <>
              <li onClick={() => { navigate(getDashboardLink()); setMobileMenuOpen(false); }}>
                Dashboard
              </li>
              <li onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>Profile</li>
              <li onClick={() => { navigate('/settings'); setMobileMenuOpen(false); }}>Settings</li>
              {userRole === 'student' && (
                <>
                  <li onClick={() => { navigate('/jobs'); setMobileMenuOpen(false); }}>Browse Jobs</li>
                  <li onClick={() => { navigate('/applications'); setMobileMenuOpen(false); }}>My Applications</li>
                </>
              )}
              {userRole === 'recruiter' && (
                <>
                  <li onClick={() => { navigate('/post-job'); setMobileMenuOpen(false); }}>Post Job</li>
                  <li onClick={() => { navigate('/recruiter/jobs'); setMobileMenuOpen(false); }}>My Jobs</li>
                </>
              )}
              {userRole === 'admin' && (
                <>
                  <li onClick={() => { navigate('/admin'); setMobileMenuOpen(false); }}>Admin</li>
                </>
              )}
              <li className="logout-btn" onClick={handleLogout}>Logout</li>
            </>
          ) : (
            <>
              <li onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Login</li>
              <li onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Register</li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
