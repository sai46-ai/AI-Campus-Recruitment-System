import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsAPI, getUserRole } from '../services/api';
import DashboardTopBar from '../components/DashboardTopBar';
import './PostJob.css';

function PostJob() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    description: '',
    jobType: 'Full-time',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    skills: '',
    deadline: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const jobData = {
        title: formData.title.trim(),
        company: formData.company.trim(),
        location: formData.location.trim(),
        description: formData.description.trim(),
        jobType: formData.jobType,
        experience: formData.experience.trim(),
        requiredSkills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        deadline: formData.deadline || undefined,
        salary: formData.salaryMin && formData.salaryMax ? {
          min: parseInt(formData.salaryMin),
          max: parseInt(formData.salaryMax),
          currency: 'INR'
        } : undefined
      };

      await jobsAPI.create(jobData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/recruiter/jobs');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (getUserRole() !== 'recruiter') {
    return (
      <div className="access-denied">
        <h2>Access Denied</h2>
        <p>Only recruiters can post jobs.</p>
        <Link to="/student-dashboard">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="postjob-page">
      {/* Background */}
      <div className="page-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      <div className="page-content">
        <DashboardTopBar />
        {/* Page Header */}
        <header className="page-header compact">
          <Link to="/recruiter-dashboard" className="back-link">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back to Dashboard
          </Link>
          <h1>Post New Job</h1>
          <p>Create a new job opening for VVIT students</p>
        </header>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>Job posted successfully! Redirecting...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Job Form */}
        <form onSubmit={handleSubmit} className="job-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Job Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Name *</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g., Tech Corp"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., Hyderabad or Remote"
                  required
                />
              </div>

              <div className="form-group">
                <label>Job Type *</label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Job Details</h3>
            <div className="form-group full-width">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows="5"
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Experience Required</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 0-2 years"
                />
              </div>

              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Compensation</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Minimum Salary (₹/year)</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g., 400000"
                />
              </div>

              <div className="form-group">
                <label>Maximum Salary (₹/year)</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g., 800000"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Required Skills</h3>
            <div className="form-group full-width">
              <label>Skills (comma separated) *</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                placeholder="e.g., JavaScript, React, Node.js, MongoDB"
                required
              />
              <span className="input-hint">
                Enter skills separated by commas. These will be used for AI matching.
              </span>
            </div>

            {formData.skills && (
              <div className="skills-preview">
                <span className="preview-label">Preview:</span>
                {formData.skills.split(',').map((skill, i) => 
                  skill.trim() && <span key={i} className="skill-tag">{skill.trim()}</span>
                )}
              </div>
            )}
          </div>

          <div className="form-actions">
            <Link to="/recruiter-dashboard" className="cancel-btn">
              Cancel
            </Link>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Posting...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 2L11 13"/>
                    <path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                  </svg>
                  Post Job
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
