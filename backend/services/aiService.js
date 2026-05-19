/**
 * AI Service Integration
 * * Communicates with the Python FastAPI AI service for:
 * - Resume parsing (PDF/DOCX)
 * - Skill extraction
 * - AI-powered skill matching and scoring (Student-Pro 75% Weight)
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios'); // Ensure you ran: npm install axios
const logger = require('../utils/logger');

// Import centralized AI service configuration
const aiServiceConfig = require('../config/aiService.config');

// AI Service configuration
const AI_SERVICE_URL = aiServiceConfig.baseUrl;
const AI_SERVICE_TIMEOUT = aiServiceConfig.timeout;

/**
 * Check if AI service is available
 */
async function checkAIServiceHealth() {
    try {
        const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
        return {
            available: true,
            modelsLoaded: response.data.ai_modules_loaded || response.data.models_loaded,
            version: response.data.version
        };
    } catch (error) {
        return { available: false, error: error.message };
    }
}

/**
 * Analyze a resume file using the AI service.
 * FIX: Uses Axios + ReadStream to fix the "Expected boundary character" error.
 */
async function analyzeResumeFile(filePath, requiredSkills, jobDescription = null) {
    if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Resume file not found', fallback: true };
    }
    
    try {
        const formData = new FormData();
        
        // Use createReadStream to prevent memory/boundary issues
        formData.append('file', fs.createReadStream(filePath));
        
        // Format skills exactly as expected by Python's required_skills: str
        const skillsString = Array.isArray(requiredSkills) ? requiredSkills.join(',') : requiredSkills;
        formData.append('required_skills', skillsString);
        
        if (jobDescription) {
            formData.append('job_description', jobDescription);
        }
        
        const response = await axios.post(`${AI_SERVICE_URL}/analyze/file`, formData, {
            headers: {
                ...formData.getHeaders(), // CRITICAL: Fixes the boundary hyphen error
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
            timeout: AI_SERVICE_TIMEOUT
        });
        
        if (!response.data.success) {
            return { success: false, error: response.data.error, fallback: true };
        }
        
        return {
            success: true,
            data: response.data.data,
            source: 'ai-service'
        };
        
    } catch (error) {
        const errorMessage = error.response?.data?.detail || error.message;
        logger.warn(`AI Service file analysis failed: ${errorMessage}`);
        return { success: false, error: errorMessage, fallback: true };
    }
}

/**
 * Analyze resume text using the AI service
 */
async function analyzeResumeText(resumeText, requiredSkills, studentSkills = []) {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/analyze/text`, {
            resume_text: resumeText,
            required_skills: requiredSkills,
            student_skills: studentSkills
        }, { timeout: AI_SERVICE_TIMEOUT });
        
        return response.data.success 
            ? { success: true, data: response.data.data, source: 'ai-service' }
            : { success: false, error: response.data.error, fallback: true };
            
    } catch (error) {
        logger.warn(`AI Service text analysis failed: ${error.message}`);
        return { success: false, error: error.message, fallback: true };
    }
}

/**
 * Quick skill matching for rankings
 */
async function matchSkillsOnly(studentSkills, requiredSkills) {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/analyze/match`, {
            student_skills: studentSkills,
            job_requirements: requiredSkills
        }, { timeout: 15000 });
        
        if (response.data.success) {
            return {
                success: true,
                aiScore: response.data.match_score, // Map to Python result
                matchedCount: response.data.data?.matched_skills?.length || 0,
                totalRequired: response.data.data?.total_required || 0,
                missingSkills: response.data.data?.missing_skills || [],
                source: 'ai-service'
            };
        }
        throw new Error(response.data.error || 'AI service returned error');
    } catch (error) {
        return fallbackSkillMatch(studentSkills, requiredSkills);
    }
}

/**
 * Fallback matching using Student-Pro (75% Skill Weight)
 */
function fallbackSkillMatch(studentSkills, requiredSkills) {
    if (!studentSkills || !requiredSkills || requiredSkills.length === 0) {
        return { success: true, aiScore: 0, coverage: 0, matchedCount: 0, totalRequired: requiredSkills?.length || 0, missingSkills: requiredSkills || [], skillMatches: [], source: 'fallback' };
    }
    
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
    const normalizedStudent = studentSkills.map(normalize);
    
    let matched = 0;
    const missing = [];
    const matches = [];

    requiredSkills.forEach(req => {
        const reqNorm = normalize(req);
        const isMatch = normalizedStudent.some(s => s.includes(reqNorm) || reqNorm.includes(s));
        
        if (isMatch) {
            matched++;
            matches.push({ required_skill: req, matched: true, similarity_score: 1.0 });
        } else {
            missing.push(req);
            matches.push({ required_skill: req, matched: false, similarity_score: 0 });
        }
    });

    const coverage = (matched / requiredSkills.length) * 100;
    // Align fallback with AI Service weights: 75% for skills
    const finalScore = Math.round(coverage * 0.75 + 15); 

    return {
        success: true,
        aiScore: finalScore,
        coverage: Math.round(coverage),
        matchedCount: matched,
        totalRequired: requiredSkills.length,
        missingSkills: missing,
        skillMatches: matches,
        source: 'fallback'
    };
}

/**
 * Build a detailed AI analysis response for the frontend
 */
function buildAnalysisResponse(aiResult, studentSkills, requiredSkills) {
    if (aiResult.success && aiResult.data) {
        const data = aiResult.data;
        return {
            model: 'skill-match-student-pro-v1', // Synced model version
            inputs: { requiredSkills, studentSkills },
            results: {
                matchedSkills: data.skill_matches?.filter(m => m.matched).map(m => m.required_skill) || [],
                missingSkills: data.missing_skills || [],
                coveragePercent: data.skill_coverage_percent || 0,
                extractedSkills: data.extracted_skills?.map(s => s.skill) || []
            },
            scoring: {
                baseScore: data.score_breakdown?.skill_coverage_score || 0,
                experienceScore: data.score_breakdown?.experience_score || 0,
                educationScore: data.score_breakdown?.education_score || 0,
                qualityScore: data.score_breakdown?.resume_quality_score || 0,
                finalScore: data.final_score || 0
            },
            recommendations: data.recommendations || [],
            summary: data.summary || '',
            source: aiResult.source
        };
    }
    
    const fallback = fallbackSkillMatch(studentSkills, requiredSkills);
    return {
        model: 'skill-match-fallback-v1',
        inputs: { requiredSkills, studentSkills },
        results: {
            matchedSkills: fallback.skillMatches.filter(m => m.matched).map(m => m.required_skill),
            missingSkills: fallback.missingSkills,
            coveragePercent: fallback.coverage
        },
        scoring: {
            baseScore: fallback.coverage,
            finalScore: fallback.aiScore
        },
        source: 'fallback'
    };
}

module.exports = {
    checkAIServiceHealth,
    analyzeResumeFile,
    analyzeResumeText,
    matchSkillsOnly,
    fallbackSkillMatch,
    buildAnalysisResponse,
    AI_SERVICE_URL
};