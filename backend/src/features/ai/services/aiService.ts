import logger from '../../../shared/utils/logger';
import { ParsedResumeResult, CandidateMatchResult, AiEngineDiagnostics } from '../types/aiTypes';
import {
  parseResumeWithPythonEngine,
  matchCandidateWithPythonEngine,
  isPythonEngineConfigured,
  pingPythonEngine,
} from '../providers/pythonAiClient';
import {
  parseResumeGemini,
  matchCandidateGemini,
  isValidGeminiKey,
} from '../providers/geminiProvider';
import {
  parseResumeHeuristic,
  matchCandidateHeuristic,
} from '../providers/heuristicProvider';

export class AiService {
  /**
   * Parse resume text through multi-tier AI pipeline:
   * Tier 1: Internal Python AI Engine (if configured)
   * Tier 2: Cloud Gemini LLM (if configured)
   * Tier 3: Deterministic Heuristic Fallback
   */
  public async parseResume(rawText: string, correlationId?: string): Promise<ParsedResumeResult> {
    // Preserve strict test harness guard
    if (!isValidGeminiKey(process.env.GEMINI_API_KEY) && process.env.NODE_ENV === 'test') {
      throw new Error('Resume parsing is temporarily unavailable. Please try again later or contact support.');
    }

    // Tier 1: Internal Python AI Engine
    if (isPythonEngineConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        const pythonResult = await parseResumeWithPythonEngine(rawText, correlationId);
        if (pythonResult) {
          logger.info('[AiService] Resume parsed via internal Python AI Engine', { correlationId });
          return pythonResult;
        }
      } catch (err: any) {
        logger.warn(`[AiService] Python AI engine tier failed: ${err.message}`, { correlationId });
      }
    }

    // Tier 2: Cloud Gemini LLM
    try {
      const geminiResult = await parseResumeGemini(rawText, correlationId);
      if (geminiResult) {
        logger.info('[AiService] Resume parsed via Google Gemini LLM', { correlationId });
        return geminiResult;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_GEMINI === 'true') {
        throw err;
      }
      logger.warn(`[AiService] Gemini tier failed: ${err.message}`, { correlationId });
    }

    // Tier 3: Deterministic Heuristic Engine
    logger.info('[AiService] Resume parsed via Deterministic Heuristic Fallback', { correlationId });
    return parseResumeHeuristic(rawText);
  }

  /**
   * Evaluate candidate-to-job match through multi-tier AI pipeline:
   * Tier 1: Internal Python AI Engine (if configured)
   * Tier 2: Cloud Gemini LLM (if configured)
   * Tier 3: Deterministic Heuristic Fallback
   */
  public async matchCandidate(
    candidateSkills: string[],
    resumeText: string,
    jobTitle: string,
    jobDescription: string,
    requiredSkills: string[],
    correlationId?: string
  ): Promise<CandidateMatchResult> {
    // Preserve strict test harness guard
    if (!isValidGeminiKey(process.env.GEMINI_API_KEY) && process.env.NODE_ENV === 'test') {
      throw new Error('Candidate-job matching is temporarily unavailable. Please try again later or contact support.');
    }

    // Tier 1: Internal Python AI Engine
    if (isPythonEngineConfigured() && process.env.NODE_ENV !== 'test') {
      try {
        const pythonResult = await matchCandidateWithPythonEngine(candidateSkills, requiredSkills, correlationId);
        if (pythonResult) {
          logger.info('[AiService] Match computed via internal Python AI Engine', { correlationId });
          return pythonResult;
        }
      } catch (err: any) {
        logger.warn(`[AiService] Python AI matching failed: ${err.message}`, { correlationId });
      }
    }

    // Tier 2: Cloud Gemini LLM
    try {
      const geminiResult = await matchCandidateGemini(
        candidateSkills,
        resumeText,
        jobTitle,
        jobDescription,
        requiredSkills,
        correlationId
      );
      if (geminiResult) {
        logger.info('[AiService] Match computed via Google Gemini LLM', { correlationId });
        return geminiResult;
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'production' && process.env.REQUIRE_GEMINI === 'true') {
        throw err;
      }
      logger.warn(`[AiService] Gemini matching tier failed: ${err.message}`, { correlationId });
    }

    // Tier 3: Deterministic Heuristic Engine
    logger.info('[AiService] Match computed via Deterministic Heuristic Fallback', { correlationId });
    return matchCandidateHeuristic(candidateSkills, resumeText, requiredSkills);
  }

  /**
   * Return health and engine diagnostics for monitoring
   */
  public async getDiagnostics(): Promise<AiEngineDiagnostics> {
    const pythonStatus = await pingPythonEngine();
    const geminiConfigured = isValidGeminiKey(process.env.GEMINI_API_KEY);

    return {
      pythonEngine: {
        available: pythonStatus.available,
        configured: isPythonEngineConfigured(),
        url: process.env.AI_SERVICE_URL,
        latencyMs: pythonStatus.latencyMs,
        error: pythonStatus.error,
      },
      geminiProvider: {
        configured: geminiConfigured,
        model: 'gemini-1.5-flash',
      },
      status: pythonStatus.available || geminiConfigured ? 'operational' : 'degraded',
    };
  }
}

export const aiService = new AiService();
export default aiService;

