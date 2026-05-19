import DashboardTopBar from '../components/DashboardTopBar';
import NotificationPanel from '../components/NotificationPanel.jsx';
import './Profile.css';

export default function Notifications() {
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
            <h1>Notifications</h1>
            <p>Updates about your applications and jobs.</p>
          </div>
        </header>

        <div className="profile-grid">
          <section className="profile-card">
            <NotificationPanel />
          </section>
        </div>
      </div>
    </div>
  );
}
