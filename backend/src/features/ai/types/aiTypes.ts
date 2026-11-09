export interface ParsedResumeResult {
  name: string;
  email: string;
  phone: string;
  summary: string;
  skills: string[];
  experience: {
    jobTitle: string;
    company: string;
    duration?: string;
    description?: string;
  }[];
  education: {
    degree: string;
    institution: string;
    year?: number;
  }[];
  projects: {
    title: string;
    description?: string;
    technologies?: string[];
  }[];
  certifications: string[];
  atsScore: number;
  atsBreakdown: {
    skillCoverageScore: number;
    experienceScore: number;
    educationScore: number;
    formattingScore: number;
  };
  aiSuggestions: string[];
  evaluationMethod?: 'gemini_llm' | 'python_ai_engine' | 'heuristic_fallback';
  isHeuristicFallback?: boolean;
}

export interface CandidateMatchResult {
  matchScore: number;
  aiScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  candidateStrengths: string[];
  aiRecommendation: string;
  evaluationMethod?: 'gemini_llm' | 'python_ai_engine' | 'heuristic_fallback';
  isHeuristicFallback?: boolean;
}

export interface AiEngineDiagnostics {
  pythonEngine: {
    available: boolean;
    configured: boolean;
    url?: string;
    latencyMs?: number;
    error?: string;
  };
  geminiProvider: {
    configured: boolean;
    model: string;
  };
  status: 'operational' | 'degraded';
}

