import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, getUserRole, logout } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import ResumeUpload from '../components/ResumeUpload';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const role = getUserRole();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await authAPI.getProfile();
        const me = res.data?.user || res.data?.data?.user;
        setUser(me);
        if (me) {
          localStorage.setItem('user', JSON.stringify(me));
          if (me.role) localStorage.setItem('role', me.role);
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="profile-page">
      <div className="page-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="page-content">
        <DashboardTopBar />

        <header className="profile-header">
          <div>
            <h1>Profile</h1>
            <p>View your account details and resume status.</p>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </header>

        {loading ? (
          <div className="profile-loading">Loading profile...</div>
        ) : error ? (
          <div className="profile-error">{error}</div>
        ) : (
          <div className="profile-grid">
            <section className="profile-card">
              <h2>Account</h2>
              <div className="profile-row">
                <span className="label">Name</span>
                <span className="value">{user?.name || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="label">Email</span>
                <span className="value">{user?.email || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="label">Role</span>
                <span className="value role">{(user?.role || role || 'student').toString()}</span>
              </div>
            </section>

            {((user?.role || role) === 'student') && (
              <section className="profile-card">
                <ResumeUpload
                  currentResume={user?.resume}
                  onUploadSuccess={(resume) => setUser(prev => ({ ...prev, resume }))}
                />
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
