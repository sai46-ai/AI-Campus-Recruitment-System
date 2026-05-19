import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, jobsAPI, applicationsAPI, getUserRole } from '../services/api';
import Floating3DElements from '../components/Floating3DElements';
import ProfileDropdown from '../components/ProfileDropdown';
import './RecruiterDashboard.css';

function RecruiterDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingReview: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'recruiter') {
      navigate(role === 'student' ? '/student-dashboard' : '/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [profileRes, jobsRes, statsRes] = await Promise.all([
          authAPI.getProfile(),
          jobsAPI.getMyJobs(),
          applicationsAPI.getStats()
        ]);

        const resolvedUser = profileRes.data?.data?.user || profileRes.data?.user;
        setUser(resolvedUser);

        const jobs = jobsRes.data?.data?.jobs || jobsRes.data?.jobs || [];
        setRecentJobs(jobs.slice(0, 5));

        const statsPayload = statsRes.data?.data?.stats || statsRes.data?.stats || {};

        setStats({
          totalJobs: jobs.length,
          activeJobs: jobs.filter(j => j.status === 'OPEN' || j.status === 'Open').length,
          totalApplications: statsPayload?.totalApplications || 0,
          pendingReview: statsPayload?.pendingApplications || 0
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* 3D Background Elements */}
      <div className="dashboard-3d-background">
        <Floating3DElements
          type="geometric"
          count={15}
          color="#7c4dff"
          secondaryColor="#4dd0e1"
          speed={0.35}
          size={0.9}
          spread={14}
          interactive={true}
        />
      </div>
      
      {/* Background Effects */}
      <div className="dashboard-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Top Navigation Bar with Profile */}
        <nav className="dashboard-nav">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">VVIT Recruit</span>
          </Link>
          <ProfileDropdown user={user} />
        </nav>

        {/* Welcome Section */}
        <section className="welcome-section">
          <div className="welcome-text">
            <h1>
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Recruiter'}</span>! 👋
            </h1>
            <p>
              Post jobs, review AI-ranked candidates, and manage your recruitment pipeline efficiently.
            </p>
          </div>
          <div className="quick-actions">
            <Link to="/post-job" className="action-btn primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Post New Job
            </Link>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="stats-section">
          <div className="stat-card">
            <div className="stat-icon jobs">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.totalJobs}</h3>
              <p>Total Jobs Posted</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon active">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.activeJobs}</h3>
              <p>Active Listings</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon applications">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="stat-info">
              <h3>{stats.pendingReview}</h3>
              <p>Pending Review</p>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Quick Actions Cards */}
          <section className="action-cards">
            <h2 className="section-title">Quick Actions</h2>
            <div className="cards-grid">
              <Link to="/post-job" className="dash-card">
                <div className="card-icon post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <h3>Post New Job</h3>
                <p>Create and publish new job openings for students</p>
                <span className="card-arrow">→</span>
              </Link>

              <Link to="/recruiter/jobs" className="dash-card">
                <div className="card-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <h3>My Job Listings</h3>
                <p>View, edit, and manage your posted positions</p>
                <span className="card-arrow">→</span>
              </Link>

              <div className="dash-card highlight">
                <div className="card-icon ai">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
                <h3>AI Candidate Ranking</h3>
                <p>Candidates are auto-ranked based on skill match</p>
                <div className="ai-badge">AI Powered</div>
              </div>
            </div>
          </section>

          {/* Recent Jobs */}
          <section className="recent-jobs">
            <div className="section-header">
              <h2 className="section-title">Your Recent Jobs</h2>
              <Link to="/recruiter/jobs" className="see-all">View All →</Link>
            </div>
            
            {recentJobs.length === 0 ? (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                </svg>
                <p>No jobs posted yet</p>
                <Link to="/post-job" className="empty-action">Post your first job →</Link>
              </div>
            ) : (
              <div className="jobs-list">
                {recentJobs.map(job => (
                  <Link to={`/applicants/${job._id}`} key={job._id} className="job-item">
                    <div className="job-info">
                      <div className="job-header">
                        <h4>{job.title}</h4>
                        <span className={`status-badge ${job.status?.toLowerCase()}`}>
                          {job.status || 'Open'}
                        </span>
                      </div>
                      <div className="job-meta">
                        <span className="job-location">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                          {job.location}
                        </span>
                        <span className="job-applicants">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                          </svg>
                          View Applicants
                        </span>
                      </div>
                    </div>
                    <span className="job-arrow">→</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Tips Section */}
        <section className="tips-section">
          <h2 className="section-title">Recruitment Tips</h2>
          <div className="tips-grid">
            <div className="tip-card">
              <div className="tip-number">01</div>
              <h4>Write Clear Job Descriptions</h4>
              <p>Include specific skills and responsibilities to attract the right candidates.</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">02</div>
              <h4>Use AI Matching</h4>
              <p>Our AI ranks candidates by skill match - review top matches first.</p>
            </div>
            <div className="tip-card">
              <div className="tip-number">03</div>
              <h4>Respond Promptly</h4>
              <p>Quick responses improve candidate experience and acceptance rates.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
