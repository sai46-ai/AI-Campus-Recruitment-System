import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Login.css';
import logo from '../assets/logo.png';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await authAPI.login(formData);
      const data = res.data.data || res.data;

      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user?.role || data.role);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect based on role
      const role = data.user?.role || data.role;
      navigate(role === 'admin' ? '/admin-dashboard' : role === 'recruiter' ? '/recruiter-dashboard' : '/student-dashboard');
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
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
        <div className="grid-overlay"></div>
      </div>

      {/* Left Content */}
      <div className="auth-left">
        <div className="brand-section">
          <img src={logo} alt="VVIT Logo" className="brand-logo" />
          <h1>Welcome Back!</h1>
          <p className="brand-subtitle">
            Sign in to continue to your recruitment dashboard
          </p>
        </div>

        <div className="features-list">
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <div>
              <h4>AI-Powered Matching</h4>
              <p>Get matched with the perfect opportunities</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <div>
              <h4>Real-time Tracking</h4>
              <p>Monitor your application status instantly</p>
            </div>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🎯</span>
            <div>
              <h4>Smart Recommendations</h4>
              <p>Personalized job suggestions for you</p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="card-header">
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>

          {error && (
            <div className="error-message">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder=" "
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label>Email Address</label>
              <span className="input-icon">📧</span>
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder=" "
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label>Password</label>
              <span className="input-icon">🔒</span>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            <Link to="/" className="back-home">
              <span>←</span> Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
