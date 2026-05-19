import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI, jobsAPI, applicationsAPI, getUserRole } from '../services/api';
import Page3DWrapper from '../components/Page3DWrapper';
import StatCard3D from '../components/StatCard3D';
import Card3D from '../components/Card3D';
import Button3DEnhanced from '../components/Button3DEnhanced';
import LoadingSpinner3D from '../components/LoadingSpinner3D';
import './StudentDashboard.css';

/**
 * AI-Powered Student Dashboard
 * Updated to reflect Student-Pro scoring (75% Skills Weight)
 */
function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    appliedJobs: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    avgMatchScore: 0 // Reflects the new weighted AI Score
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = getUserRole();
    if (role !== 'student') {
      navigate(role === 'recruiter' ? '/recruiter-dashboard' : '/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const [profileRes, jobsRes, applicationsRes] = await Promise.all([
          authAPI.getProfile(),
          jobsAPI.getAll({ limit: 5 }),
          applicationsAPI.getMyApplications()
        ]);

        const resolvedUser = profileRes.data?.data?.user || profileRes.data?.user;
        setUser(resolvedUser);

        const jobsPayload = jobsRes.data?.data;
        setRecentJobs(jobsPayload?.jobs || []);

        const applications = applicationsRes.data?.data?.applications || applicationsRes.data?.applications || [];
        setMyApplications(applications);

        // --- AI ANALYTICS CALCULATION ---
        // Prioritize aiScore (weighted) over matchScore (raw)
        const scores = applications.map(a => a.aiScore || a.matchScore || 0).filter(s => s > 0);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

        setStats({
          totalJobs: jobsPayload?.pagination?.total || jobsPayload?.jobs?.length || 0,
          appliedJobs: applications.length,
          pendingApplications: applications.filter(a => a.status === 'Applied' || a.status === 'Pending').length,
          acceptedApplications: applications.filter(a => ['Shortlisted', 'Selected', 'Hired'].includes(a.status)).length,
          avgMatchScore: avgScore
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
      <Page3DWrapper>
        <LoadingSpinner3D message="Loading your AI career insights..." size="large" />
      </Page3DWrapper>
    );
  }

  return (
    <Page3DWrapper className="student-dashboard">
      <div className="dashboard-container">
        <section className="hero-section animate-on-scroll">
          <div className="hero-content">
            <h1 className="hero-title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Avinash'}</span>! 👋
            </h1>
            <p className="hero-subtitle">
              Your AI profile is currently optimized for <span className="highlight-text">Artificial Intelligence & Data Science</span> roles.
            </p>
            <div className="hero-actions">
              <Link to="/jobs">
                <Button3DEnhanced variant="primary" size="large" icon="🔍">
                  Browse Jobs
                </Button3DEnhanced>
              </Link>
              <Link to="/applications">
                <Button3DEnhanced variant="secondary" size="large" icon="📊">
                  Track My Rank
                </Button3DEnhanced>
              </Link>
            </div>
          </div>
        </section>

        {/* --- DYNAMIC STATS GRID --- */}
        <section className="stats-grid animate-on-scroll">
          <StatCard3D icon="💼" label="Available Jobs" value={stats.totalJobs} color="#4dd0e1" delay={0} />
          <StatCard3D 
            icon="🎯" 
            label="Avg. Match Score" 
            value={`${stats.avgMatchScore}%`} 
            color={stats.avgMatchScore >= 80 ? "#00e676" : "#7c4dff"} 
            delay={0.1} 
          />
          <StatCard3D icon="⏳" label="Under Review" value={stats.pendingApplications} color="#ffab00" delay={0.2} />
          <StatCard3D icon="🏆" label="Accepted Roles" value={stats.acceptedApplications} color="#00e676" delay={0.3} />
        </section>

        {/* --- AI LEADERBOARD SECTION --- */}
        <section className="ai-insights-section animate-on-scroll">
          <h2 className="section-title">🚀 AI Leaderboard Standing</h2>
          <div className="insights-grid">
            {/* Top Rank Logic: Triggers if score >= 85% */}
            {myApplications.filter(a => (a.aiScore || a.matchScore) >= 85).slice(0, 1).map((topApp) => (
              <Card3D key={topApp._id} glowColor="#00e676" className="top-rank-card highlight-card">
                <div className="rank-content">
                  <div className="rank-badge gold">Gold Rank candidate</div>
                  <h3>You're the #1 Match for <span>{topApp.job?.title}</span></h3>
                  <p>
                    Your skills in <strong>{topApp.job?.requiredSkills?.slice(0,3).join(', ')}</strong> perfectly align with the 75% Skill-Weight requirement.
                  </p>
                  <Link to="/applications" className="view-rank-btn">View Full Breakdown →</Link>
                </div>
              </Card3D>
            ))}
            
            {/* Optimization Logic: Triggers if Skill Gaps are found */}
            {(stats.avgMatchScore < 70 && stats.appliedJobs > 0) && (
              <Card3D glowColor="#ffab00" className="top-rank-card">
                <div className="rank-content">
                  <div className="rank-badge warning">AI Optimization Tip</div>
                  <h3>Increase your Visibility</h3>
                  <p>Our AI suggests adding specific keywords like "FastAPI" or "Cloud Deployment" to increase your match score by up to 15%.</p>
                  <Link to="/profile" className="view-rank-btn">Optimize My Resume →</Link>
                </div>
              </Card3D>
            )}
          </div>
        </section>

        <section className="recent-jobs-section animate-on-scroll">
          <div className="section-header">
            <h2 className="section-title">🔥 New High-Match Roles</h2>
            <Link to="/jobs"><Button3DEnhanced variant="secondary" size="small">See All Jobs</Button3DEnhanced></Link>
          </div>
          
          <div className="jobs-grid">
            {recentJobs.length === 0 ? (
              <Card3D className="empty-state-card">
                <p>No new jobs posted today. Check back tomorrow!</p>
              </Card3D>
            ) : (
              recentJobs.map((job) => (
                <Card3D key={job._id} className="job-card-3d" glowColor="#4dd0e1">
                  <div className="job-card-header">
                    <div className="job-company-logo">{job.company?.charAt(0)}</div>
                    <div className="job-meta">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-company">{job.company}</p>
                    </div>
                  </div>
                  <div className="job-card-body">
                    <div className="job-details">
                      <span className="job-detail">📍 {job.location}</span>
                      <span className="job-detail">💰 ₹{job.salary?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="job-card-footer">
                    <Link to={`/jobs/${job._id}`}>
                      <Button3DEnhanced variant="primary" size="small">View & Apply</Button3DEnhanced>
                    </Link>
                  </div>
                </Card3D>
              ))
            )}
          </div>
        </section>

        <section className="quick-actions-section animate-on-scroll">
          <h2 className="section-title">⚡ Dashboard Quick Links</h2>
          <div className="actions-grid">
            <Card3D glowColor="#4dd0e1" className="action-card">
              <Link to="/profile" className="action-link">
                <span className="action-icon">👤</span>
                <h3>Verified Skills</h3>
                <p>Manage your AI-extracted skill list</p>
              </Link>
            </Card3D>
            <Card3D glowColor="#7c4dff" className="action-card">
              <Link to="/applications" className="action-link">
                <span className="action-icon">📈</span>
                <h3>My Ranking</h3>
                <p>Analyze how you rank against peers</p>
              </Link>
            </Card3D>
          </div>
        </section>
      </div>
    </Page3DWrapper>
  );
}

export default StudentDashboard;