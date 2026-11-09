import { ParsedResumeResult, CandidateMatchResult } from '../types/aiTypes';

const KNOWN_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Java',
  'C++', 'C#', 'Go', 'Rust', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'GraphQL', 'REST',
  'Tailwind', 'HTML', 'CSS', 'Linux', 'Microservices', 'FastAPI', 'Next.js',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'Scikit-Learn', 'Data Structures',
];

const escapedSkill = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const parseResumeHeuristic = (rawText: string): ParsedResumeResult => {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const emailMatch = rawText.match(/[\w.-]+@[\w.-]+\.\w+/);
  const phoneMatch = rawText.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);

  const detectedSkills = KNOWN_SKILLS.filter((s) =>
    new RegExp(`(?:^|[^a-zA-Z0-9])${escapedSkill(s)}(?:$|[^a-zA-Z0-9])`, 'i').test(rawText)
  );

  const hasExperienceSection = /experience|intern|work history|employment/i.test(rawText);
  const hasEducationSection = /education|b\.tech|bachelor|master|university|college|institute|cgpa|gpa/i.test(rawText);
  const hasProjectsSection = /projects|portfolio|built|developed|architected|engineered/i.test(rawText);

  const skillScore = Math.min(98, Math.max(40, detectedSkills.length * 11 + 28));
  const experienceScore = hasExperienceSection ? 84 : 62;
  const educationScore = hasEducationSection ? 88 : 65;
  const formattingScore = Math.min(95, Math.max(60, (emailMatch ? 30 : 10) + (phoneMatch ? 25 : 10) + (lines.length >= 5 ? 35 : 20)));

  const breakdown = {
    skillCoverageScore: skillScore,
    experienceScore,
    educationScore,
    formattingScore,
  };
  const atsScore = Math.round(
    0.40 * breakdown.skillCoverageScore +
    0.25 * breakdown.experienceScore +
    0.20 * breakdown.educationScore +
    0.15 * breakdown.formattingScore
  );

  const suggestions: string[] = [];
  if (!emailMatch || !phoneMatch) {
    suggestions.push('Include both a verified institutional email address and a direct phone number in your contact header.');
  }
  if (detectedSkills.length < 6) {
    suggestions.push('Expand your technical skills inventory with specific frameworks, databases, and cloud tools.');
  }
  if (!hasProjectsSection) {
    suggestions.push('Add a dedicated Projects section highlighting system architecture and measurable engineering outcomes.');
  }
  if (suggestions.length === 0) {
    suggestions.push('Quantify project and internship impact with concrete latency, throughput, or reliability metrics.');
  }

  const firstLineName = lines[0] && !lines[0].includes('@') && lines[0].length <= 60 ? lines[0] : '';

  return {
    name: firstLineName,
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0] : '',
    summary:
      detectedSkills.length > 0
        ? `Engineering candidate with verified competencies in ${detectedSkills.slice(0, 6).join(', ')}.`
        : lines.slice(0, 2).join(' ').slice(0, 240),
    skills: detectedSkills,
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    atsScore,
    atsBreakdown: breakdown,
    aiSuggestions: suggestions,
    evaluationMethod: 'heuristic_fallback',
    isHeuristicFallback: true,
  };
};

export const matchCandidateHeuristic = (
  candidateSkills: string[],
  resumeText: string,
  requiredSkills: string[]
): CandidateMatchResult => {
  const lowerCandidate = candidateSkills.map((s) => s.toLowerCase().trim());
  const lowerResume = (resumeText || '').toLowerCase();

  const matchedSkills = requiredSkills.filter((req) => {
    const r = req.toLowerCase().trim();
    return (
      lowerCandidate.some((c) => c === r || c.includes(r) || r.includes(c)) ||
      (r.length > 1 && lowerResume.includes(r))
    );
  });

  const missingSkills = requiredSkills.filter((req) => !matchedSkills.includes(req));
  const overlapRatio = requiredSkills.length > 0 ? matchedSkills.length / requiredSkills.length : 0.75;
  const matchScore = requiredSkills.length > 0 ? Math.round(overlapRatio * 100) : 75;
  const aiScore = Math.min(100, Math.max(0, matchScore));

  return {
    matchScore,
    aiScore,
    matchedSkills,
    missingSkills,
    candidateStrengths:
      matchedSkills.length > 0
        ? [`Verified alignment in required skills: ${matchedSkills.join(', ')}`]
        : ['Submitted candidate profile for review'],
    aiRecommendation:
      matchScore >= 75
        ? `Strong alignment (${matchScore}% required skill coverage). Recommended for shortlisting.`
        : matchScore >= 40
        ? `Moderate alignment (${matchScore}% coverage). Missing skills: ${missingSkills.slice(0, 3).join(', ') || 'none'}.`
        : `Low skill overlap (${matchScore}% coverage). Requires upskilling in ${missingSkills.slice(0, 3).join(', ') || 'core requirements'}.`,
    evaluationMethod: 'heuristic_fallback',
    isHeuristicFallback: true,
  };
};

