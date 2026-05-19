import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI, getUserRole } from '../services/api';
import ProfileDropdown from './ProfileDropdown';
import './DashboardTopBar.css';

function safeParseUser(json) {
  try {
    if (!json) return null;
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function DashboardTopBar({ logoTo }) {
  const role = getUserRole();
  const defaultLogoTo = useMemo(() => {
    if (logoTo) return logoTo;
    return role === 'admin' ? '/admin' : role === 'recruiter' ? '/recruiter' : '/student';
  }, [logoTo, role]);

  const [user, setUser] = useState(() => safeParseUser(localStorage.getItem('user')));

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await authAPI.getProfile();
        const freshUser = res.data?.user || res.data?.data?.user;
        if (!mounted) return;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
          if (freshUser.role) localStorage.setItem('role', freshUser.role);
        }
      } catch {
        // Silent: protected pages will redirect if token is missing.
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <nav className="dashboard-topbar">
      <Link to={defaultLogoTo} className="topbar-logo">
        <span className="logo-icon">🎓</span>
        <span className="logo-text">VVIT Recruit</span>
      </Link>

      <ProfileDropdown user={user} />
    </nav>
  );
}

export default DashboardTopBar;
