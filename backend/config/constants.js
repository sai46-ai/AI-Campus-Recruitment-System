module.exports = {
  // Application statuses
  APPLICATION_STATUS: {
    APPLIED: 'Applied',
    UNDER_REVIEW: 'Under Review',
    SHORTLISTED: 'Shortlisted',
    REJECTED: 'Rejected',
    SELECTED: 'Selected',
    HIRED: 'Hired'
  },

  // Job statuses
  JOB_STATUS: {
    OPEN: 'OPEN',
    CLOSED: 'CLOSED'
  },

  // User roles
  USER_ROLES: {
    STUDENT: 'student',
    RECRUITER: 'recruiter',
    ADMIN: 'admin'
  },

  // Token expiry
  TOKEN_EXPIRY: '7d',

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50
  }
};
