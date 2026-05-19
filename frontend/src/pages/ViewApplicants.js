import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { jobsAPI, applicationsAPI, getUserRole } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import AIResumeAnalyzer from '../components/AIResumeAnalyzer.jsx';
import './ViewApplicants.css';

function ViewApplicants() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(jobId || '');
  const [selectedJobDetails, setSelectedJobDetails] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const statusClass = (status) =>
    (status || '').toString().toLowerCase().trim().replace(/\s+/g, '-');

  const normalizeStatus = (status) => {
    const s = (status || '').toString();
    // Back-compat: treat "Hired" as final "Selected" in UI
    if (s === 'Hired') return 'Selected';
    return s || 'Applied';
  };

  const fetchApplicants = useCallback(async (id) => {
    if (!id) return;
    
    setLoading(true);
    try {
      const res = await applicationsAPI.getJobApplicants(id);
      const apps = res.data?.data?.applications || res.data?.applications || [];
      setApplications(apps);
      
      // Find job details
      const job = jobs.find(j => j._id === id);
      setSelectedJobDetails(job || null);
    } catch (error) {
      console.error('Failed to load applicants:', error);
    } finally {
      setLoading(false);
    }
  }, [jobs]);

  useEffect(() => {
    if (getUserRole() !== 'recruiter') {
      navigate('/student-dashboard');
      return;
    }

    const fetchJobs = async () => {
      try {
        const res = await jobsAPI.getMyJobs();
        const fetchedJobs = res.data?.data?.jobs || res.data?.jobs || [];
        setJobs(fetchedJobs);
        
        if (jobId && fetchedJobs.length > 0) {
          const job = fetchedJobs.find(j => j._id === jobId);
          if (job) {
            setSelectedJobDetails(job);
          }
        }
      } catch (error) {
        console.error('Failed to load jobs:', error);
      }
    };

    fetchJobs();
  }, [jobId, navigate]);

  useEffect(() => {
    if (selectedJob) {
      fetchApplicants(selectedJob);
    } else {
      setLoading(false);
    }
  }, [selectedJob, fetchApplicants]);

  const handleJobChange = (id) => {
    setSelectedJob(id);
    navigate(`/applicants/${id}`, { replace: true });
  };

  const handleUpdateStatus = async (applicationId, status) => {
    setActionLoading(applicationId);
    try {
      await applicationsAPI.updateStatus(applicationId, status);
      fetchApplicants(selectedJob);
    } catch (error) {
      alert(error?.userMessage || error.response?.data?.message || error.message || 'Failed to update status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRecomputeAllAi = async () => {
    if (!selectedJob) return;
    setAiLoading(true);
    try {
      const res = await applicationsAPI.recomputeJobAiScores(selectedJob);
      const apps = res.data?.data?.applications || res.data?.applications || [];
      setApplications(apps);
    } catch (error) {
      alert(error?.userMessage || error.response?.data?.message || error.message || 'Failed to recompute AI scores');
    } finally {
      setAiLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return statusClass(normalizeStatus(app.status)) === filter.toLowerCase();
  });

  const stats = {
    total: applications.length,
    applied: applications.filter(a => normalizeStatus(a.status) === 'Applied').length,
    underReview: applications.filter(a => normalizeStatus(a.status) === 'Under Review').length,
    shortlisted: applications.filter(a => normalizeStatus(a.status) === 'Shortlisted').length,
    rejected: applications.filter(a => normalizeStatus(a.status) === 'Rejected').length,
    selected: applications.filter(a => normalizeStatus(a.status) === 'Selected').length
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="applicants-page">
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
            <Link to="/recruiter/jobs" className="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Back to My Jobs
            </Link>
            <h1>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              AI Applicant Leaderboard
            </h1>
            <p>Review and manage applicants with AI-powered ranking</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={handleRecomputeAllAi}
              disabled={!selectedJob || loading || aiLoading}
              className="ai-badge-large"
              style={{ cursor: (!selectedJob || loading || aiLoading) ? 'not-allowed' : 'pointer' }}
              title={!selectedJob ? 'Select a job first' : 'Recompute AI scores for all applicants'}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              {aiLoading ? 'Updating Rank…' : 'Recompute AI'}
            </button>
            <div className="ai-badge-large" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              AI Ranked
            </div>
          </div>
        </header>

        {/* Job Selector */}
        <div className="job-selector-section">
          <div className="job-selector">
            <label>Select Job Position</label>
            <select
              value={selectedJob}
              onChange={(e) => handleJobChange(e.target.value)}
            >
              <option value="">Choose a job...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.company}
                </option>
              ))}
            </select>
          </div>
          
          {selectedJobDetails && (
            <div className="selected-job-info">
              <h3>{selectedJobDetails.title}</h3>
              <p>{selectedJobDetails.company} • {selectedJobDetails.location}</p>
            </div>
          )}
        </div>

        {!selectedJob ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="17" y1="8" x2="23" y2="8"/>
            </svg>
            <h3>Select a job to view applicants</h3>
            <p>Choose a job position from the dropdown above</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading applicants...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <h3>No applicants yet</h3>
            <p>Applicants will appear here once students apply to this job</p>
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-value">{stats.applied}</span>
                <span className="stat-label">Applied</span>
              </div>
              <div className="stat-item pending">
                <span className="stat-value">{stats.underReview}</span>
                <span className="stat-label">Under Review</span>
              </div>
              <div className="stat-item shortlisted">
                <span className="stat-value">{stats.shortlisted}</span>
                <span className="stat-label">Shortlisted</span>
              </div>
              <div className="stat-item rejected">
                <span className="stat-value">{stats.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
              <div className="stat-item hired">
                <span className="stat-value">{stats.selected}</span>
                <span className="stat-label">Selected</span>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
              <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                All ({stats.total})
              </button>
              <button className={`tab ${filter === 'applied' ? 'active' : ''}`} onClick={() => setFilter('applied')}>
                Applied ({stats.applied})
              </button>
              <button className={`tab ${filter === 'under-review' ? 'active' : ''}`} onClick={() => setFilter('under-review')}>
                Under Review ({stats.underReview})
              </button>
              <button className={`tab ${filter === 'shortlisted' ? 'active' : ''}`} onClick={() => setFilter('shortlisted')}>
                Shortlisted ({stats.shortlisted})
              </button>
              <button className={`tab ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>
                Rejected ({stats.rejected})
              </button>
              <button className={`tab ${filter === 'selected' ? 'active' : ''}`} onClick={() => setFilter('selected')}>
                Selected ({stats.selected})
              </button>
            </div>

            {/* Applicants Grid */}
            <div className="applicants-grid leaderboard-view">
              {filteredApplications
                // LEADERBOARD SORTING: Automatically rank applicants by AI Match Score
                .sort((a, b) => {
                  const aAi = a.aiScore ?? a.matchScore ?? 0;
                  const bAi = b.aiScore ?? b.matchScore ?? 0;
                  if (bAi !== aAi) return bAi - aAi;
                  const aBase = a.matchScore ?? 0;
                  const bBase = b.matchScore ?? 0;
                  return bBase - aBase;
                })
                .map((app, index) => {
                  const currentScore = app.aiScore ?? app.matchScore ?? 0;
                  const isTopMatch = currentScore >= 85 && index < 3; // LEADERBOARD LOGIC: Highlight top matches

                  return (
                    <article 
                      key={app._id} 
                      className={`applicant-card ${isTopMatch ? 'top-match-card' : ''}`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* LEADERBOARD RANK BADGE */}
                      {isTopMatch && <div className="leaderboard-rank">#{index + 1} Best Match</div>}

                      <div className="applicant-header">
                        <div className="applicant-avatar">
                          {app.student?.name?.charAt(0).toUpperCase() || 'S'}
                        </div>
                        <div className="applicant-info">
                          <h3>{app.student?.name || 'Unknown'}</h3>
                          <p>{app.student?.email || 'No email'}</p>
                        </div>
                        <span className={`status-badge ${statusClass(normalizeStatus(app.status))}`}>
                          {normalizeStatus(app.status) || 'Applied'}
                        </span>
                      </div>

                      <div className="match-score-section">
                        <div className="score-header">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                          <span>AI Match Score</span>
                        </div>
                        <div className={`score-bar ${getScoreColor(currentScore)}`}>
                          <div 
                            className="score-fill" 
                            style={{ width: `${currentScore}%` }}
                          ></div>
                          <span className="score-value">{currentScore}%</span>
                        </div>

                        <AIResumeAnalyzer
                          applicationId={app._id}
                          onUpdated={(updated, aiScore) => {
                            setApplications((prev) =>
                              prev.map((p) =>
                                p._id === app._id
                                  ? {
                                      ...p,
                                      aiScore:
                                        updated?.aiScore ??
                                        aiScore ??
                                        p.aiScore ??
                                        p.matchScore ??
                                        0,
                                      matchScore: updated?.matchScore ?? p.matchScore,
                                      status: updated?.status ?? p.status
                                    }
                                  : p
                              )
                            );
                          }}
                        />
                      </div>

                      <div className="applicant-skills">
                        <h4>Verified Skills</h4>
                        <div className="skills-list">
                          {app.student?.skills?.slice(0, 5).map((skill, i) => (
                            <span key={i} className="skill-tag">{skill}</span>
                          ))}
                          {app.student?.skills?.length > 5 && (
                            <span className="skill-tag more">+{app.student.skills.length - 5}</span>
                          )}
                        </div>
                      </div>

                      {app.coverLetter && (
                        <div className="cover-letter">
                          <h4>Cover Letter</h4>
                          <p>{app.coverLetter.substring(0, 150)}{app.coverLetter.length > 150 && '...'}</p>
                        </div>
                      )}

                      <div className="applicant-meta">
                        <span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                          </svg>
                          Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="applicant-actions">
                        {normalizeStatus(app.status) === 'Applied' && (
                          <>
                            <button 
                              className="action-btn shortlist"
                              onClick={() => handleUpdateStatus(app._id, 'Under Review')}
                              disabled={actionLoading === app._id}
                            >
                              {actionLoading === app._id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                              Review
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              disabled={actionLoading === app._id}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        )}

                        {normalizeStatus(app.status) === 'Under Review' && (
                          <>
                            <button 
                              className="action-btn shortlist"
                              onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                              disabled={actionLoading === app._id}
                            >
                              {actionLoading === app._id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                              Shortlist
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              disabled={actionLoading === app._id}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                        
                        {normalizeStatus(app.status) === 'Shortlisted' && (
                          <>
                            <button 
                              className="action-btn hire"
                              onClick={() => handleUpdateStatus(app._id, 'Selected')}
                              disabled={actionLoading === app._id}
                            >
                              {actionLoading === app._id ? (
                                <div className="spinner-small"></div>
                              ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                              )}
                              Select
                            </button>
                            <button 
                              className="action-btn reject"
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              disabled={actionLoading === app._id}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                              </svg>
                              Reject
                            </button>
                          </>
                        )}
                        
                        {normalizeStatus(app.status) === 'Rejected' && (
                          <button 
                            className="action-btn reconsider"
                            onClick={() => handleUpdateStatus(app._id, 'Under Review')}
                            disabled={actionLoading === app._id}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="1 4 1 10 7 10"/>
                              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                            </svg>
                            Reconsider
                          </button>
                        )}
                        
                        {normalizeStatus(app.status) === 'Selected' && (
                          <div className="hired-badge">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                              <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            Selected
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ViewApplicants;