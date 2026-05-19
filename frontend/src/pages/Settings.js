import { useNavigate } from 'react-router-dom';
import DashboardTopBar from '../components/DashboardTopBar';
import { logout } from '../services/api';
import './Settings.css';

function Settings() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="settings-page">
      <div className="page-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="page-content">
        <DashboardTopBar />

        <div className="settings-card">
          <h1>Settings</h1>
          <p>This section is intentionally minimal for now.</p>
          <div className="settings-actions">
            <button className="btn" onClick={() => navigate('/profile')}>Back to Profile</button>
            <button className="btn danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
