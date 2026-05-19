import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import logo from '../assets/logo.png';
import './Login.css';
import './Register.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    skills: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const prevStep = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await authAPI.register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
        skills: skillsArray
      });

      navigate('/login', { 
        state: { message: 'Registration successful! Please login.' }
      });
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Background Elements */}
      <div className="auth-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Left Content */}
      <div className="auth-left">
        <div className="brand-section">
          <img src={logo} alt="VVIT Logo" className="brand-logo" />
          <h1>Join VVIT Recruit</h1>
          <p className="brand-subtitle">
            Create your account and start your journey with AI-powered campus recruitment.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <span className="feature-icon">🧑‍🎓</span>
              <div>
                <h4>Student & Recruiter roles</h4>
                <p>Tailored dashboards and tools for each role</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <div>
                <h4>Skill-based matching</h4>
                <p>Get discovered by the right opportunities</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔔</span>
              <div>
                <h4>Status updates</h4>
                <p>Track applications with real-time notifications</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="auth-right">
        <div className="auth-card register-card">
          <div className="card-header">
            <h2>Create Account</h2>
            <p>Step {step} of 3</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
            <div className="progress-steps">
              <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
                <span>1</span>
                <p>Basic Info</p>
              </div>
              <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
                <span>2</span>
                <p>Security</p>
              </div>
              <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
                <span>3</span>
                <p>Profile</p>
              </div>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="form-step">
                <div className="input-group">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                  />
                  <label>Full Name</label>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>

                <div className="input-group">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                  <label>Email Address</label>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>

                <button type="button" className="submit-btn" onClick={nextStep}>
                  Continue
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2: Password */}
            {step === 2 && (
              <div className="form-step">
                <div className="input-group">
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    required
                  />
                  <label>Password</label>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    required
                  />
                  <label>Confirm Password</label>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>

                <div className="password-requirements">
                  <p>Password must:</p>
                  <ul>
                    <li className={formData.password.length >= 6 ? 'met' : ''}>
                      Be at least 6 characters
                    </li>
                  </ul>
                </div>

                <div className="step-buttons">
                  <button type="button" className="back-btn" onClick={prevStep}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back
                  </button>
                  <button type="button" className="submit-btn" onClick={nextStep}>
                    Continue
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Role & Skills */}
            {step === 3 && (
              <div className="form-step">
                <div className="role-selector">
                  <label className="role-label">I am a:</label>
                  <div className="role-options">
                    <label className={`role-option ${formData.role === 'student' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="student"
                        checked={formData.role === 'student'}
                        onChange={handleChange}
                      />
                      <div className="role-card">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                        <span>Student</span>
                        <p>Looking for opportunities</p>
                      </div>
                    </label>
                    <label className={`role-option ${formData.role === 'recruiter' ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="role"
                        value="recruiter"
                        checked={formData.role === 'recruiter'}
                        onChange={handleChange}
                      />
                      <div className="role-card">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                          <line x1="12" y1="11" x2="12" y2="17"/>
                          <line x1="9" y1="14" x2="15" y2="14"/>
                        </svg>
                        <span>Recruiter</span>
                        <p>Hiring talented candidates</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="e.g., JavaScript, React, Python"
                  />
                  <label>Skills (comma separated)</label>
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>

                <div className="step-buttons">
                  <button type="button" className="back-btn" onClick={prevStep}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                      <polyline points="15 18 9 12 15 6"/>
                    </svg>
                    Back
                  </button>
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="spinner-small"></div>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
            <Link to="/" className="back-home">
              <span>←</span> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
