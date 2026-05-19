/**
 * Calculate AI match score between student skills and job requirements
 * @param {string[]} studentSkills - Array of student skills
 * @param {string[]} jobSkills - Array of required job skills
 * @returns {number} Match score percentage (0-100)
 */
const calculateMatchScore = (studentSkills, jobSkills) => {
  if (!studentSkills || !jobSkills || jobSkills.length === 0) return 0;

  // Normalize skills to lowercase and trim whitespace
  const normalizedStudentSkills = studentSkills.map(skill => 
    skill.toLowerCase().trim()
  );
  const normalizedJobSkills = jobSkills.map(skill => 
    skill.toLowerCase().trim()
  );

  // Find matching skills
  const matchedSkills = normalizedStudentSkills.filter(skill => 
    normalizedJobSkills.some(jobSkill => 
      jobSkill.includes(skill) || skill.includes(jobSkill)
    )
  );

  // Calculate percentage
  const score = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
  return Math.min(score, 100); // Cap at 100%
};

/**
 * Create standardized API response
 * @param {boolean} success - Request success status
 * @param {string} message - Response message
 * @param {object} data - Response data
 * @returns {object} Standardized response object
 */
const createResponse = (success, message, data = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  return response;
};

/**
 * Async handler wrapper to avoid try-catch in every route
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  calculateMatchScore,
  createResponse,
  asyncHandler
};
