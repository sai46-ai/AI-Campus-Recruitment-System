/**
 * Backward-Compatibility Layer for Legacy AI Service Callers
 * Delegates directly to the modular features/ai orchestrator.
 */
import { aiService } from '../../features/ai/services/aiService';
import { ParsedResumeResult, CandidateMatchResult } from '../../features/ai/types/aiTypes';

export { ParsedResumeResult, CandidateMatchResult };

export const parseResumeWithGemini = async (rawText: string): Promise<ParsedResumeResult> => {
  return aiService.parseResume(rawText);
};

export const calculateCandidateJobMatch = async (
  candidateSkills: string[],
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<CandidateMatchResult> => {
  return aiService.matchCandidate(
    candidateSkills,
    resumeText,
    jobTitle,
    jobDescription,
    requiredSkills
  );
};

export default {
  parseResumeWithGemini,
  calculateCandidateJobMatch,
};
