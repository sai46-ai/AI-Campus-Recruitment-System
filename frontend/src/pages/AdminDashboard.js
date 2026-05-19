import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, jobsAPI, getUserRole } from '../services/api';
import ProfileDropdown from '../components/ProfileDropdown';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'admin') {
      navigate(role === 'recruiter' ? '/recruiter' : role === 'student' ? '/student' : '/login');
      return;
    }

    const load = async () => {
      try {
        const [profileRes, jobsRes] = await Promise.all([
          authAPI.getProfile(),
          jobsAPI.getAllAdmin()
        ]);
        setUser(profileRes.data?.data?.user || profileRes.data?.user);
        setJobs(jobsRes.data?.data?.jobs || jobsRes.data?.jobs || []);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [navigate]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="admin-content">
        <nav className="admin-nav">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">VVIT Recruit</span>
          </Link>
          <ProfileDropdown user={user} />
        </nav>

        <header className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>System overview: jobs and platform activity.</p>
          </div>
        </header>

        <section className="admin-card">
          <h2>All Jobs</h2>
          {jobs.length === 0 ? (
            <p className="muted">No jobs found.</p>
          ) : (
            <div className="jobs-list">
              {jobs.slice(0, 20).map((j) => (
                <div key={j._id} className="job-row">
                  <div>
                    <div className="job-title">{j.title}</div>
                    <div className="muted">{j.company} • {j.location}</div>
                  </div>
                  <div className="job-status">{(j.status || '').toString()}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
