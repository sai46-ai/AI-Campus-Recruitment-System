import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { applicationsAPI } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import './MyApplications.css';

function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await applicationsAPI.getMyApplications();
      setApplications(res.data.data?.applications || res.data.applications || res.data || []);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    const normalized = status === 'Hired' ? 'Selected' : status;
    const statusMap = {
      'Applied': 'status-applied',
      'Under Review': 'status-review',
      'Shortlisted': 'status-shortlisted',
      'Rejected': 'status-rejected',
      // Treat Selected as the final state; reuse existing styling
      'Selected': 'status-hired',
      'Hired': 'status-hired'
    };
    return statusMap[normalized] || 'status-applied';
  };

  const getStatusIcon = (status) => {
    const normalized = status === 'Hired' ? 'Selected' : status;
    const iconMap = {
      'Applied': '📋',
      'Under Review': '🔍',
      'Shortlisted': '⭐',
      'Rejected': '❌',
      'Selected': '🎉',
      'Hired': '🎉'
    };
    return iconMap[normalized] || '📋';
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="applications-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="applications-topbar">
        <DashboardTopBar />
      </div>
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/student')}>
            ← Back to Dashboard
          </button>
          <h1>📝 My Applications</h1>
          <p className="subtitle">Track your job applications and AI match scores</p>
        </div>
      </header>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-tabs">
          {['all', 'Applied', 'Under Review', 'Shortlisted', 'Rejected', 'Selected'].map(status => (
            <button
              key={status}
              className={`filter-tab ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'all' ? 'All' : status}
              {status === 'all' && ` (${applications.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Grid */}
      <div className="applications-container">
        {filteredApplications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No applications found</h3>
            <p>
              {filter === 'all' 
                ? "You haven't applied to any jobs yet."
                : `No applications with status "${filter}".`}
            </p>
            {filter === 'all' && (
              <button className="cta-btn" onClick={() => navigate('/jobs')}>
                Browse Jobs
              </button>
            )}
          </div>
        ) : (
          <div className="applications-grid">
            {filteredApplications.map((app, index) => (
              <div 
                key={app._id} 
                className="application-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-header">
                  <div className="job-info">
                    <h3>{app.job?.title || 'Job Title'}</h3>
                    <p className="company">{app.job?.company || 'Company'}</p>
                  </div>
                  <div className={`status-badge ${getStatusClass(app.status)}`}>
                    <span className="status-icon">{getStatusIcon(app.status)}</span>
                    {app.status}
                  </div>
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="label">📍 Location</span>
                    <span className="value">{app.job?.location || 'N/A'}</span>
                  </div>
                  
                  <div className="match-score">
                    <div className="score-header">
                      <span>🤖 AI Match Score</span>
                      <span className="score-value">{(app.aiScore ?? app.matchScore) || 0}%</span>
                    </div>
                    <div className="score-bar">
                      <div 
                        className="score-fill"
                        style={{ 
                          width: `${(app.aiScore ?? app.matchScore) || 0}%`,
                          background: (app.aiScore ?? app.matchScore) >= 70 
                            ? 'var(--accent-success)' 
                            : (app.aiScore ?? app.matchScore) >= 40 
                              ? 'var(--accent-warning)' 
                              : 'var(--accent-error)'
                        }}
                      ></div>
                    </div>
                  </div>

                  {app.job?.requiredSkills && (
                    <div className="skills-section">
                      <span className="label">Required Skills</span>
                      <div className="skills-list">
                        {app.job.requiredSkills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="skill-tag">{skill}</span>
                        ))}
                        {app.job.requiredSkills.length > 4 && (
                          <span className="skill-tag more">
                            +{app.job.requiredSkills.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <span className="applied-date">
                    Applied {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyApplications;