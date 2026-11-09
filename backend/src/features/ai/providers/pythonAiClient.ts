import logger from '../../../shared/utils/logger';
import { ParsedResumeResult, CandidateMatchResult } from '../types/aiTypes';

export const isPythonEngineConfigured = (): boolean => {
  return Boolean(process.env.AI_SERVICE_URL && process.env.AI_SERVICE_URL.trim().length > 0);
};

export const getNormalizedAiServiceUrl = (): string => {
  let url = (process.env.AI_SERVICE_URL || '').trim();
  if (!url) return '';
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `http://${url}`;
  }
  return url;
};

export const pingPythonEngine = async (): Promise<{ available: boolean; latencyMs?: number; engine?: string; error?: string }> => {
  if (!isPythonEngineConfigured()) {
    return { available: false, error: 'AI_SERVICE_URL not configured' };
  }

  const base = getNormalizedAiServiceUrl();
  const startTime = Date.now();
  try {
    const healthUrl = new URL('/health', base).toString();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(healthUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data: any = await res.json();
      return {
        available: true,
        latencyMs: Date.now() - startTime,
        engine: data.nlp_engine?.engine || 'fastapi',
      };
    }
    return { available: false, error: `HTTP ${res.status}` };
  } catch (err: any) {
    return { available: false, latencyMs: Date.now() - startTime, error: err.message };
  }
};

export const parseResumeWithPythonEngine = async (
  rawText: string,
  correlationId?: string
): Promise<ParsedResumeResult | null> => {
  if (!isPythonEngineConfigured() || process.env.NODE_ENV === 'test') {
    return null;
  }

  const base = getNormalizedAiServiceUrl();
  try {
    const endpoint = new URL('/analyze/text', base).toString();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (correlationId) {
      headers['X-Correlation-ID'] = correlationId;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        resume_text: rawText,
        required_skills: ['General Engineering'],
        student_skills: [],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const resData: any = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const skillsList: string[] = (d.extracted_skills || [])
          .map((s: any) => (typeof s === 'string' ? s : s.skill))
          .filter(Boolean);
        const breakdown = {
          skillCoverageScore: d.score_breakdown?.skill_coverage_score || 70,
          experienceScore: d.score_breakdown?.experience_score || 70,
          educationScore: d.score_breakdown?.education_score || 70,
          formattingScore: d.score_breakdown?.resume_quality_score || 70,
        };
        return {
          name: d.name || '',
          email: d.email || '',
          phone: d.phone || '',
          summary: d.summary || '',
          skills: skillsList,
          experience: (d.experience || []).map((e: any) => ({
            jobTitle: e.title || '',
            company: e.company || '',
            duration: e.duration || '',
            description: e.description || '',
          })),
          education: (d.education || []).map((ed: any) => ({
            degree: ed.degree || '',
            institution: ed.institution || '',
            year: ed.year ? parseInt(ed.year, 10) : undefined,
          })),
          projects: (d.projects || []).map((p: any) => (typeof p === 'string' ? { title: p } : p)),
          certifications: d.certifications || [],
          atsScore: Math.round(d.final_score || 75),
          atsBreakdown: breakdown,
          aiSuggestions: d.recommendations || d.resume_improvements || [],
          evaluationMethod: 'python_ai_engine',
          isHeuristicFallback: false,
        };
      }
    }
    return null;
  } catch (err: any) {
    logger.warn(`[Python AI Client] Internal AI service parse failed: ${err.message}`, { correlationId });
    return null;
  }
};

export const matchCandidateWithPythonEngine = async (
  candidateSkills: string[],
  requiredSkills: string[],
  correlationId?: string
): Promise<CandidateMatchResult | null> => {
  if (!isPythonEngineConfigured() || process.env.NODE_ENV === 'test') {
    return null;
  }

  const base = getNormalizedAiServiceUrl();
  try {
    const endpoint = new URL('/analyze/match', base).toString();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (correlationId) {
      headers['X-Correlation-ID'] = correlationId;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        student_skills: candidateSkills,
        job_requirements: requiredSkills.length > 0 ? requiredSkills : ['General Engineering'],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const resData: any = await response.json();
      if (resData.success && resData.data) {
        const d = resData.data;
        const matchScore = Math.round(resData.match_score || 0);
        return {
          matchScore,
          aiScore: matchScore,
          matchedSkills: d.matched_skills || [],
          missingSkills: d.missing_skills || [],
          candidateStrengths:
            d.matched_skills && d.matched_skills.length > 0
              ? [`Verified alignment in required skills: ${d.matched_skills.join(', ')}`]
              : ['Submitted candidate profile for review'],
          aiRecommendation:
            matchScore >= 75
              ? `Strong alignment (${matchScore}% required skill coverage). Recommended for shortlisting.`
              : matchScore >= 40
              ? `Moderate alignment (${matchScore}% coverage). Missing skills: ${(d.missing_skills || []).slice(0, 3).join(', ') || 'none'}.`
              : `Low skill overlap (${matchScore}% coverage). Requires upskilling in ${(d.missing_skills || []).slice(0, 3).join(', ') || 'core requirements'}.`,
          evaluationMethod: 'python_ai_engine',
          isHeuristicFallback: false,
        };
      }
    }
    return null;
  } catch (err: any) {
    logger.warn(`[Python AI Client] Internal AI service match failed: ${err.message}`, { correlationId });
    return null;
  }
};
