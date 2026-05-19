import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { jobsAPI, applicationsAPI, getUserRole } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import TiltCard from '../components/TiltCard';
import './ViewJobs.css';

function ViewJobs() {
  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // NEW: State for the AI Analysis Modal
  const [selectedJobAnalysis, setSelectedJobAnalysis] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    skills: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const userRole = getUserRole();

  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, applicationsRes] = await Promise.all([
        jobsAPI.getAll(),
        userRole === 'student' ? applicationsAPI.getMyApplications() : Promise.resolve({ data: { applications: [] } })
      ]);

      setJobs(jobsRes.data.jobs || jobsRes.data.data?.jobs || []);
      
      if (userRole === 'student') {
        const apps = applicationsRes.data.applications || applicationsRes.data.data?.applications || [];
        const appliedJobIds = apps.map(app => app.job?._id);
        setAppliedJobs(appliedJobIds.filter(Boolean));
      }
    } catch (error) {
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // NEW: Function to fetch detailed AI Gap Analysis
  const handleViewAnalysis = async (jobId) => {
    setIsAnalysing(true);
    try {
      const response = await jobsAPI.getById(jobId);
      // This contains { job, aiMatch: { score, missingSkills } }
      setSelectedJobAnalysis(response.data.data);
    } catch (error) {
      console.error("Analysis fetch failed:", error);
    } finally {
      setIsAnalysing(false);
    }
  };

  const handleApply = async (jobId) => {
    setApplying(jobId);
    try {
      await applicationsAPI.apply(jobId);
      setAppliedJobs(prev => [...prev, jobId]);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply for job');
    } finally {
      setApplying(null);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return '#10b981'; 
    if (score >= 50) return '#f59e0b'; 
    return '#ef4444'; 
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchTerm || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !filters.location || 
      job.location?.toLowerCase().includes(filters.location.toLowerCase());
    
    const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
    
    const matchesSkills = !filters.skills ||
      job.requiredSkills?.some(skill => 
        skill.toLowerCase().includes(filters.skills.toLowerCase())
      );

    return matchesSearch && matchesLocation && matchesJobType && matchesSkills;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilters({ location: '', jobType: '', skills: '' });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading opportunities...</p>
      </div>
    );
  }

  return (
    <div className="jobs-page">
      <div className="page-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="page-content">
        <DashboardTopBar />
        <header className="page-header">
          <div className="header-text">
            <h1>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
              Browse Opportunities
            </h1>
            <p>Discover roles precisely matched to your skill set by our AI</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{jobs.length}</span>
              <span className="stat-label">Total Jobs</span>
            </div>
            <div className="stat">
              <span className="stat-number">{jobs.filter(j => j.status?.toUpperCase() === 'OPEN').length}</span>
              <span className="stat-label">Open Positions</span>
            </div>
          </div>
        </header>

        <section className="search-section">
          <div className="search-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search jobs, companies, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="filter-toggle" onClick={() => setShowFilters(!showFilters)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="City or Remote"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
              <div className="filter-group">
                <label>Job Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Skills</label>
                <input
                  type="text"
                  placeholder="e.g., React, Python"
                  value={filters.skills}
                  onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                />
              </div>
              <button className="clear-filters" onClick={clearFilters}>Clear All</button>
            </div>
          )}
        </section>

        <div className="results-info">
          <span>Showing {filteredJobs.length} of {jobs.length} jobs</span>
          {(searchTerm || filters.location || filters.jobType || filters.skills) && (
            <button className="clear-search" onClick={clearFilters}>Clear filters</button>
          )}
        </div>

        {filteredJobs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3>No jobs found</h3>
            <p>Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="reset-btn">Reset Filters</button>
          </div>
        ) : (
          <div className="jobs-grid">
            {filteredJobs.map((job, index) => (
              <TiltCard key={job._id} className="job-card-wrapper" intensity={8} glare={true} scale={1.02}>
                <article className="job-card" style={{ animationDelay: `${index * 0.05}s` }}>
                <div className="job-card-header">
                  <div className="company-logo">
                    {job.company?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="job-title-section">
                    <h3>{job.title}</h3>
                    <p className="company-name">{job.company}</p>
                  </div>
                  
                  {/* DYNAMIC AI MATCH BADGE - Now Clickable for Details */}
                  {userRole === 'student' && job.matchScore !== undefined && (
                    <div 
                      className="ai-match-badge clickable"
                      title="Click for Skill Gap Analysis"
                      onClick={() => handleViewAnalysis(job._id)}
                      style={{ 
                        borderColor: getMatchColor(job.matchScore),
                        color: getMatchColor(job.matchScore),
                        boxShadow: `0 0 10px ${getMatchColor(job.matchScore)}33`,
                        cursor: 'pointer'
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                      {job.matchScore}% Match
                    </div>
                  )}

                  {(job.status?.toUpperCase() === 'OPEN') && (
                    <span className="status-badge open">Open</span>
                  )}
                </div>

                <div className="job-meta">
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {job.location}
                  </span>
                  <span className="meta-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
                    {job.jobType || 'Full-time'}
                  </span>
                </div>

                <p className="job-description">
                  {job.description?.substring(0, 140)}...
                </p>

                <div className="skills-section">
                  <div className="skills-list">
                    {job.requiredSkills?.slice(0, 4).map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                    {job.requiredSkills?.length > 4 && (
                      <span className="skill-tag more">+{job.requiredSkills.length - 4}</span>
                    )}
                  </div>
                </div>

                <div className="job-card-footer">
                  {userRole === 'student' && (
                    <>
                      <button 
                         className="analysis-btn-inline"
                         onClick={() => handleViewAnalysis(job._id)}
                         style={{
                           background: 'rgba(77, 208, 225, 0.1)',
                           border: '1px solid var(--primary)',
                           color: 'var(--primary)',
                           padding: '0.5rem 1rem',
                           borderRadius: '8px',
                           cursor: 'pointer',
                           fontSize: '0.85rem',
                           fontWeight: '600'
                         }}
                      >
                        AI Analysis
                      </button>

                      {appliedJobs.includes(job._id) ? (
                        <button className="applied-btn" disabled>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                          Applied
                        </button>
                      ) : (
                        <button className="apply-btn" onClick={() => handleApply(job._id)} disabled={applying === job._id}>
                          {applying === job._id ? <div className="spinner-small"></div> : 'Apply Now'}
                        </button>
                      )}
                    </>
                  )}
                  {userRole === 'recruiter' && (
                    <Link to={`/applicants/${job._id}`} className="view-applicants-btn">
                      View Applicants
                    </Link>
                  )}
                </div>
              </article>
              </TiltCard>
            ))}
          </div>
        )}

        {/* AI ANALYSIS MODAL - Appears when a user clicks the match badge or Analysis button */}
        {selectedJobAnalysis && (
          <div className="ai-modal-overlay" onClick={() => setSelectedJobAnalysis(null)}>
            <div className="ai-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">
                  <h2>AI Match Analysis</h2>
                  <p>{selectedJobAnalysis.job.title} @ {selectedJobAnalysis.job.company}</p>
                </div>
                <button className="close-modal" onClick={() => setSelectedJobAnalysis(null)}>&times;</button>
              </div>
              
              <div className="modal-body">
                <div className="analysis-score-container">
                  <div className="score-ring" style={{ borderColor: getMatchColor(selectedJobAnalysis.aiMatch.score) }}>
                    {selectedJobAnalysis.aiMatch.score}%
                  </div>
                  <p className="score-status">Overall Match Strength</p>
                </div>

                <div className="gap-analysis">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    Missing Skills to Learn
                  </h3>
                  <div className="missing-skills-list">
                    {selectedJobAnalysis.aiMatch.missingSkills?.length > 0 ? (
                      selectedJobAnalysis.aiMatch.missingSkills.map((skill, i) => (
                        <span key={i} className="skill-tag missing">{skill}</span>
                      ))
                    ) : (
                      <p className="success-msg">You have a perfect skill match for this role!</p>
                    )}
                  </div>
                </div>

                <div className="ai-recommendation">
                  <div className="advice-box">
                    <strong>💡 AI Career Advice:</strong>
                    <p>
                      {selectedJobAnalysis.aiMatch.score > 80 
                        ? "You are a top candidate for this role! Your resume strongly reflects the required expertise." 
                        : "To improve your chances, consider adding the missing skills to your projects and updating your resume."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViewJobs;