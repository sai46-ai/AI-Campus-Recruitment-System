import axios from 'axios';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors with detailed logic
api.interceptors.response.use(
  (response) => {
    // Success - return the response
    return response;
  },
  (error) => {
    // Improved error handling with user-friendly messages
    
    // Get error message from various sources
    let userMessage = 'An error occurred';
    
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;
      
      userMessage = data?.message || data?.error || error.message || userMessage;
      
      // Handle specific status codes
      switch (status) {
        case 400:
          userMessage = userMessage || 'Invalid request. Please check your input.';
          break;
        case 401:
          userMessage = 'Session expired. Please log in again.';
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('user');
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
          break;
        case 403:
          userMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          userMessage = 'Resource not found.';
          break;
        case 409:
          userMessage = userMessage || 'This item already exists or there is a conflict.';
          break;
        case 422:
          userMessage = 'Validation failed. Please check your input.';
          break;
        case 429:
          userMessage = 'Too many requests. Please try again later.';
          break;
        case 500:
          userMessage = 'Server error. Please try again later.';
          break;
        case 503:
          userMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          if (status >= 500) {
            userMessage = 'Server error. Please try again later.';
          }
      }
      
      error.status = status;
    } else if (error.request) {
      // Request made but no response (network error)
      userMessage = 'Network error. Please check your connection.';
      error.status = 0;
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      userMessage = 'Request timeout. Please try again.';
      error.status = 'TIMEOUT';
    }
    
    // Attach user-friendly message for UI layers
    error.userMessage = userMessage;
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        status: error.response?.status,
        message: userMessage,
        data: error.response?.data,
        config: error.config
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
};

// Jobs API
export const jobsAPI = {
  getAll: (params) => api.get('/api/jobs', { params }),
  getById: (id) => api.get(`/api/jobs/${id}`),
  getMyJobs: () => api.get('/api/jobs/recruiter/my-jobs'),
  getAllAdmin: () => api.get('/api/jobs/admin/all'),
  create: (data) => api.post('/api/jobs', data),
  update: (id, data) => api.put(`/api/jobs/${id}`, data),
  close: (id) => api.put(`/api/jobs/${id}/close`),
  reopen: (id) => api.put(`/api/jobs/${id}/reopen`),
  delete: (id) => api.delete(`/api/jobs/${id}`),
};

// Applications API
export const applicationsAPI = {
  apply: (jobId) => api.post(`/api/applications/${jobId}`),
  getMyApplications: () => api.get('/api/applications/my-applications'),
  getJobApplicants: (jobId) => api.get(`/api/applications/job/${jobId}`),
  updateStatus: (applicationId, status) =>
    api.put(`/api/applications/${applicationId}/status`, { status }),
  recomputeAiScore: (applicationId) => api.put(`/api/applications/${applicationId}/ai-score`),
  recomputeJobAiScores: (jobId) => api.put(`/api/applications/job/${jobId}/ai-scores`),
  withdraw: (applicationId) => api.delete(`/api/applications/${applicationId}`),
  getStats: () => api.get('/api/applications/recruiter/stats'),
};

// Notifications API
export const notificationsAPI = {
  getMy: (params) => api.get('/api/notifications', { params }),
  markRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllRead: () => api.put('/api/notifications/read-all')
};

// Resume API
export const resumeAPI = {
  upload: (formData) => {
    return api.post('/api/resumes', formData);
  },
  getMy: () => api.get('/api/resumes/me'),
  getById: (id) => api.get(`/api/resumes/${id}`),
  analyze: (id) => api.post(`/api/resumes/${id}/analyze`),
  delete: (id) => api.delete(`/api/resumes/${id}`),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/api/admin/stats'),
  getAllUsers: (params) => api.get('/api/admin/users', { params }),
  getAllJobs: (params) => api.get('/api/admin/jobs', { params }),
  getAllApplications: (params) => api.get('/api/admin/applications', { params }),
  updateUserRole: (userId, role) => api.put(`/api/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => api.delete(`/api/admin/users/${userId}`),
  verifyRecruiter: (userId, verified = true) => api.put(`/api/admin/users/${userId}/verify`, { verified }),
};

// Interview API
export const interviewAPI = {
  schedule: (data) => api.post('/api/interviews', data),
  getForApplication: (applicationId) => api.get(`/api/interviews/application/${applicationId}`),
  recordParticipation: (id, data) => api.put(`/api/interviews/${id}/participation`, data),
  submitScore: (id, score) => api.put(`/api/interviews/${id}/score`, { score }),
  submitFeedback: (id, data) => api.put(`/api/interviews/${id}/feedback`, data),
  cancel: (id) => api.put(`/api/interviews/${id}/cancel`),
};

// Helper functions
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => localStorage.getItem('token');
export const getUserRole = () => localStorage.getItem('role');
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
export const setUser = (user) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};
export const isAuthenticated = () => !!getAuthToken();

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export default api;
