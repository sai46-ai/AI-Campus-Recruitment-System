/**
 * Centralized AI Service Configuration
 * All AI microservice URLs defined in one place for consistency
 * 
 * This module eliminates hardcoded URLs scattered throughout the codebase.
 * All services should import from here for AI communication.
 */

const AI_SERVICE_BASE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const AI_SERVICE_TIMEOUT = parseInt(process.env.AI_SERVICE_TIMEOUT || '30000');

/**
 * Configuration object for AI service communication
 */
const aiServiceConfig = {
  // Base URL for AI microservice
  baseUrl: AI_SERVICE_BASE_URL,
  
  // Request timeout in milliseconds
  timeout: AI_SERVICE_TIMEOUT,
  
  // Health check endpoint
  getHealthURL: () => `${AI_SERVICE_BASE_URL}/health`,
  
  // Resume analysis endpoint
  getAnalyzeURL: () => `${AI_SERVICE_BASE_URL}/analyze/file`,
  
  // Skill matching endpoint
  getMatchURL: () => `${AI_SERVICE_BASE_URL}/analyze/match`,
  
  /**
   * Validate that AI service is properly configured
   * @throws {Error} If required configuration is missing
   */
  isConfigured: () => {
    if (!AI_SERVICE_BASE_URL) {
      throw new Error('AI_SERVICE_URL environment variable not configured');
    }
    return true;
  }
};

module.exports = aiServiceConfig;
