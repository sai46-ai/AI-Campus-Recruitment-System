import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI, getUserRole } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import './MyJobs.css';

function MyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filter, setFilter] = useState('all');

  const formatStatus = (status) => {
    if (!status) return 'Open';
    const s = status.toString().toUpperCase();
    if (s === 'OPEN') return 'Open';
    if (s === 'CLOSED') return 'Closed';
    return status;
  };

  const fetchMyJobs = useCallback(async () => {
    try {
      const res = await jobsAPI.getMyJobs();
      setJobs(res.data.jobs || res.data.data?.jobs || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getUserRole() !== 'recruiter') {
      navigate('/student-dashboard');
      return;
    }
    fetchMyJobs();
  }, [fetchMyJobs, navigate]);

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job listing?')) return;
    
    setActionLoading(jobId);
    try {
      await jobsAPI.close(jobId);
      fetchMyJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to close job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReopenJob = async (jobId) => {
    setActionLoading(jobId);
    try {
      await jobsAPI.reopen(jobId);
      fetchMyJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reopen job');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) return;
    
    setActionLoading(jobId);
    try {
      await jobsAPI.delete(jobId);
      fetchMyJobs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete job');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    return job.status?.toLowerCase() === filter;
  });

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'OPEN' || j.status === 'Open').length,
    closed: jobs.filter(j => j.status === 'CLOSED' || j.status === 'Closed').length
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading your jobs...</p>
      </div>
    );
  }

  return (
    <div className="myjobs-page">
      {/* Background */}
      <div className="page-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="page-content">
        <DashboardTopBar />
        {/* Page Header */}
        <header className="page-header">
          <div className="header-text">
            <h1>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              My Job Listings
            </h1>
            <p>Manage your posted positions and view applicants</p>
          </div>
          <Link to="/post-job" className="post-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Post New Job
          </Link>
        </header>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Jobs</span>
          </div>
          <div className="stat-item open">
            <span className="stat-value">{stats.open}</span>
            <span className="stat-label">Open</span>
          </div>
          <div className="stat-item closed">
            <span className="stat-value">{stats.closed}</span>
            <span className="stat-label">Closed</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Jobs ({stats.total})
          </button>
          <button 
            className={`tab ${filter === 'open' ? 'active' : ''}`}
            onClick={() => setFilter('open')}
          >
            Open ({stats.open})
          </button>
          <button 
            className={`tab ${filter === 'closed' ? 'active' : ''}`}
            onClick={() => setFilter('closed')}
          >
            Closed ({stats.closed})
          </button>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
            <h3>{filter === 'all' ? "No jobs posted yet" : `No ${filter} jobs`}</h3>
            <p>{filter === 'all' ? "Start by creating your first job listing" : "Try changing the filter"}</p>
            {filter === 'all' && (
              <Link to="/post-job" className="empty-action">
                Post Your First Job →
              </Link>
            )}
          </div>
        ) : (
          <div className="jobs-list-view">
            {filteredJobs.map((job, index) => (
              <article 
                key={job._id} 
                className="job-list-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="job-main">
                  <div className="job-header">
                    <div className="job-title-section">
                      <h3>{job.title}</h3>
                      <span className={`status-badge ${job.status?.toLowerCase()}`}>
                        {formatStatus(job.status)}
                      </span>
                    </div>
                    <p className="job-company">{job.company} • {job.location}</p>
                  </div>
                  
                  <div className="job-meta">
                    <span className="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                      </svg>
                      {job.jobType || 'Full-time'}
                    </span>
                    <span className="meta-item">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                    {job.salary?.min && job.salary?.max && (
                      <span className="meta-item salary">
                        ₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>

                  <div className="job-skills">
                    {job.requiredSkills?.slice(0, 5).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                    {job.requiredSkills?.length > 5 && (
                      <span className="skill-tag more">+{job.requiredSkills.length - 5}</span>
                    )}
                  </div>
                </div>

                <div className="job-actions">
                  <Link to={`/applicants/${job._id}`} className="action-btn view">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    View Applicants
                  </Link>
                  
                  {(job.status === 'OPEN' || job.status === 'Open') ? (
                    <button 
                      className="action-btn close"
                      onClick={() => handleCloseJob(job._id)}
                      disabled={actionLoading === job._id}
                    >
                      {actionLoading === job._id ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                      )}
                      Close
                    </button>
                  ) : (
                    <button 
                      className="action-btn reopen"
                      onClick={() => handleReopenJob(job._id)}
                      disabled={actionLoading === job._id}
                    >
                      {actionLoading === job._id ? (
                        <div className="spinner-small"></div>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="1 4 1 10 7 10"/>
                          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                        </svg>
                      )}
                      Reopen
                    </button>
                  )}
                  
                  <button 
                    className="action-btn delete"
                    onClick={() => handleDeleteJob(job._id)}
                    disabled={actionLoading === job._id}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyJobs;
