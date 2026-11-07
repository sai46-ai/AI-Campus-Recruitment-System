import { InteractableObjectSpec, ViewpointConfig, ViewpointId } from './types';

export const WORLD_CONFIG = {
  origin: [0, 0, 0] as [number, number, number],
  baseFov: 46,
  nearClip: 0.5,
  farClip: 520,
  maxPixelRatio: 1.85,
  sunPosition: [0, 10.5, -285] as [number, number, number],
  riverZStart: 50.0,
  riverZEnd: -270.0,
};

export const SCENE_DIMENSIONS = WORLD_CONFIG;

/**
 * Evaluates the winding S-curve digital river centerline X and channel half-width at any world Z.
 */
export function evaluateRiverChannel(z: number): {
  centerX: number;
  halfWidth: number;
  recessDepth: number;
} {
  const t = Math.max(0, Math.min(1, (50.0 - z) / 320.0));
  const damp = Math.pow(1.0 - t, 0.82);
  const centerX =
    Math.sin(z * 0.055 + 0.4) * 6.4 * damp +
    Math.cos(z * 0.028 - 0.7) * 2.8 * damp;

  const foregroundFlare = Math.pow(Math.max(0, (z + 32.0) / 82.0), 1.8) * 17.5;
  const halfWidth = 3.2 + (1.0 - t) * 4.4 + foregroundFlare;
  const recessDepth = 0.85 * (1.0 - t * 0.45);

  return { centerX, halfWidth, recessDepth };
}

/**
 * Central Camera Spline Waypoints along the S-curve circuit river.
 * Normalized progress:
 *   0.00 = Establishing View (Z = +48.0)
 *   1.00 = Horizon Convergence Destination (Z = -165.0)
 */
export const CAMERA_PATH_WAYPOINTS: Array<{
  progress: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}> = [
  {
    progress: 0.0,
    position: [0.0, 7.2, 48.0],
    lookAt: [0.0, 4.6, -85.0],
    fov: 46,
  },
  {
    progress: 0.2,
    position: [2.4, 4.2, 22.0],
    lookAt: [-2.2, 2.2, -32.0],
    fov: 45,
  },
  {
    progress: 0.4,
    position: [-4.6, 5.2, -6.0],
    lookAt: [-16.0, 5.8, -54.0],
    fov: 45,
  },
  {
    progress: 0.6,
    position: [4.8, 5.4, -36.0],
    lookAt: [16.5, 6.0, -82.0],
    fov: 45,
  },
  {
    progress: 0.8,
    position: [-2.2, 4.6, -78.0],
    lookAt: [0.8, 4.2, -165.0],
    fov: 43,
  },
  {
    progress: 1.0,
    position: [0.0, 8.2, -165.0],
    lookAt: [0.0, 9.5, -285.0],
    fov: 40,
  },
];

export const VIEWPOINTS: Record<ViewpointId, ViewpointConfig> = {
  establishing: {
    id: 'establishing',
    label: 'Discover',
    progress: 0.0,
    position: [0.0, 7.2, 48.0],
    lookAt: [0.0, 4.6, -85.0],
    fov: 46,
    description: 'Overview of the campus recruitment talent network.',
  },
  'river-delta': {
    id: 'river-delta',
    label: 'Profile Station',
    progress: 0.2,
    position: [2.4, 4.2, 22.0],
    lookAt: [-2.2, 2.2, -32.0],
    fov: 45,
    description: 'Structured ATS resume parsing and profile verification.',
  },
  'west-grove': {
    id: 'west-grove',
    label: 'Candidate Tools',
    progress: 0.4,
    position: [-4.6, 5.2, -6.0],
    lookAt: [-16.0, 5.8, -54.0],
    fov: 45,
    description: 'Interactive Resume Builder and ATS readiness scoring.',
  },
  'east-grove': {
    id: 'east-grove',
    label: 'Opportunities',
    progress: 0.6,
    position: [4.8, 5.4, -36.0],
    lookAt: [16.5, 6.0, -82.0],
    fov: 45,
    description: 'Active enterprise placement drives and role discovery.',
  },
  'mid-canyon': {
    id: 'mid-canyon',
    label: 'Interview Arena',
    progress: 0.8,
    position: [-2.2, 4.6, -78.0],
    lookAt: [0.8, 4.2, -165.0],
    fov: 43,
    description: 'AI-assisted technical readiness and skill evaluation.',
  },
  'solar-horizon': {
    id: 'solar-horizon',
    label: 'Placement',
    progress: 1.0,
    position: [0.0, 8.2, -165.0],
    lookAt: [0.0, 9.5, -285.0],
    fov: 40,
    description: 'Verified placement convergence for candidates and employers.',
  },
};

export const VIEWPOINT_ORDER: ViewpointId[] = [
  'establishing',
  'river-delta',
  'west-grove',
  'east-grove',
  'mid-canyon',
  'solar-horizon',
];

/**
 * Registry of 12 Distinct 3D Interactable Objects mapped directly to real
 * AI Campus Recruitment System routes and platform modules.
 */
export const INTERACTABLE_OBJECTS: InteractableObjectSpec[] = [
  // A. Interactive Circuit Terminals (3)
  {
    id: 'terminal-delta-west',
    name: 'Campus Drive Directory',
    category: 'circuit-terminal',
    categoryLabel: 'Opportunity Terminal',
    position: [-5.8, 0.35, 28.0],
    focusCameraPos: [-1.2, 3.6, 37.5],
    focusLookAt: [-5.8, 0.9, 28.0],
    riverProgress: 0.12,
    hitRadius: 2.8,
    accentColor: '#00f2fe',
    route: '/jobs',
    actionLabel: 'Browse Active Drives',
    structuralRole: 'Verified Enterprise & Internship Listings',
    description: 'Explore live campus placement drives with transparent CGPA cutoffs, role prerequisites, and direct application workflows.',
  },
  {
    id: 'terminal-delta-east',
    name: 'Student Registration Gateway',
    category: 'circuit-terminal',
    categoryLabel: 'Candidate Terminal',
    position: [6.4, 0.35, 24.0],
    focusCameraPos: [1.8, 3.6, 34.0],
    focusLookAt: [6.4, 0.9, 24.0],
    riverProgress: 0.15,
    hitRadius: 2.8,
    accentColor: '#38f9d7',
    route: '/register?role=student',
    actionLabel: 'Create Candidate Account',
    structuralRole: 'Student Onboarding & Academic Verification',
    description: 'Register your university profile to unlock automated resume parsing, live ATS scoring, and campus drive eligibility matching.',
  },
  {
    id: 'terminal-canyon-mid',
    name: 'Enterprise Recruiter Portal',
    category: 'circuit-terminal',
    categoryLabel: 'Recruiter Terminal',
    position: [-4.2, 0.4, -12.0],
    focusCameraPos: [0.5, 4.0, -1.0],
    focusLookAt: [-4.2, 1.0, -12.0],
    riverProgress: 0.36,
    hitRadius: 3.0,
    accentColor: '#00f2fe',
    route: '/login',
    actionLabel: 'Open Recruiter Portal',
    structuralRole: 'Corporate Drive Publishing & Shortlisting',
    description: 'Publish new campus recruitment drives, configure branch and CGPA filters, and evaluate verified student applicants.',
  },

  // B. Interactive Digital Trees (3)
  {
    id: 'tree-west-grove',
    name: 'Interactive Resume Builder',
    category: 'digital-tree',
    categoryLabel: 'Career Authoring Spire',
    position: [-20.5, 3.75, -18.0],
    focusCameraPos: [-8.5, 7.5, -2.0],
    focusLookAt: [-20.5, 8.5, -18.0],
    riverProgress: 0.34,
    hitRadius: 5.2,
    accentColor: '#00ff88',
    route: '/resume-builder',
    actionLabel: 'Open Resume Builder',
    structuralRole: 'AST Document Parser & Live ATS Gauge',
    description: 'Author structured engineering resumes with real-time ATS formatting evaluation and single-click PDF export.',
  },
  {
    id: 'tree-east-grove',
    name: 'Technical Assessment Spire',
    category: 'digital-tree',
    categoryLabel: 'Assessment Spire',
    position: [21.5, 3.75, -26.0],
    focusCameraPos: [9.0, 7.6, -9.0],
    focusLookAt: [21.5, 8.6, -26.0],
    riverProgress: 0.46,
    hitRadius: 5.2,
    accentColor: '#20e3b2',
    route: '/jobs',
    actionLabel: 'View Active Drives',
    structuralRole: 'Technical Assessment & Interview Readiness',
    description: 'Track verified company interview rounds, technical assessment schedules, and panel feedback in your candidate dossier.',
  },
  {
    id: 'tree-deep-valley',
    name: 'Placement Cell Governance',
    category: 'digital-tree',
    categoryLabel: 'Institutional Spire',
    position: [-19.0, 3.75, -68.0],
    focusCameraPos: [-6.5, 7.8, -48.0],
    focusLookAt: [-19.0, 8.8, -68.0],
    riverProgress: 0.66,
    hitRadius: 5.5,
    accentColor: '#00ff88',
    route: '/placement-dashboard',
    actionLabel: 'View Placement Dashboard',
    structuralRole: 'University Drive Approval & Placement Telemetry',
    description: 'Coordinate university-wide placement drives, monitor batch placement velocity, and export institutional placement reports.',
  },

  // C. Interactive Network Nodes (3)
  {
    id: 'node-west-terrace',
    name: 'Student Career Dashboard',
    category: 'network-node',
    categoryLabel: 'Candidate Hub',
    position: [-13.2, 2.4, 10.0],
    focusCameraPos: [-4.5, 5.4, 22.0],
    focusLookAt: [-13.2, 2.8, 10.0],
    riverProgress: 0.22,
    hitRadius: 3.4,
    accentColor: '#38ef7d',
    route: '/student-dashboard',
    actionLabel: 'Open Student Dashboard',
    structuralRole: 'Application Tracking & Profile Readiness',
    description: 'Track active job applications across all interview stages and review personalized skill match recommendations.',
  },
  {
    id: 'node-east-terrace',
    name: 'Recruiter Pipeline Console',
    category: 'network-node',
    categoryLabel: 'Hiring Hub',
    position: [13.8, 2.4, 6.0],
    focusCameraPos: [4.8, 5.4, 18.5],
    focusLookAt: [13.8, 2.8, 6.0],
    riverProgress: 0.25,
    hitRadius: 3.4,
    accentColor: '#ffd166',
    route: '/recruiter-dashboard',
    actionLabel: 'Open Recruiter Console',
    structuralRole: 'Applicant Screening & Stage Transitions',
    description: 'Manage incoming student applications, filter by ATS match score, and advance shortlisted candidates.',
  },
  {
    id: 'node-canyon-overlook',
    name: 'Administration & Security Console',
    category: 'network-node',
    categoryLabel: 'Governance Hub',
    position: [14.5, 3.75, -52.0],
    focusCameraPos: [4.5, 6.8, -36.0],
    focusLookAt: [14.5, 4.2, -52.0],
    riverProgress: 0.56,
    hitRadius: 3.8,
    accentColor: '#00f2fe',
    route: '/admin-dashboard',
    actionLabel: 'Open Admin Console',
    structuralRole: '5-Tier RBAC & System Activity Matrix',
    description: 'Oversee institutional role permissions, recruiter verification, and platform security audit logs.',
  },

  // D. Interactive Circuit River Checkpoints (3)
  {
    id: 'river-cp-delta',
    name: 'Opportunity Landscape',
    category: 'river-checkpoint',
    categoryLabel: 'Pathway Checkpoint',
    position: [1.8, -0.35, 32.0],
    focusCameraPos: [2.4, 4.2, 22.0],
    focusLookAt: [-2.2, 2.2, -32.0],
    riverProgress: 0.16,
    hitRadius: 4.2,
    accentColor: '#00f2fe',
    route: '#chapter-discover',
    actionLabel: 'View Discover Section',
    structuralRole: 'Entry Gateway to Verified Placement',
    description: 'Start at the establishing overview connecting university talent with verified enterprise opportunities.',
  },
  {
    id: 'river-cp-midcanyon',
    name: 'Live Campus Drive Board',
    category: 'river-checkpoint',
    categoryLabel: 'Pathway Checkpoint',
    position: [3.2, -0.35, -38.0],
    focusCameraPos: [-2.2, 4.6, -78.0],
    focusLookAt: [0.8, 4.2, -165.0],
    riverProgress: 0.55,
    hitRadius: 4.8,
    accentColor: '#38f9d7',
    route: '#chapter-opportunities',
    actionLabel: 'Jump to Live Drives',
    structuralRole: 'Real-Time Drive Search & Filtering',
    description: 'Advance to the interactive campus drive board to search and filter published placement opportunities.',
  },
  {
    id: 'river-cp-horizon',
    name: 'Placement Convergence',
    category: 'river-checkpoint',
    categoryLabel: 'Pathway Checkpoint',
    position: [-0.8, -0.25, -112.0],
    focusCameraPos: [0.0, 8.2, -165.0],
    focusLookAt: [0.0, 9.5, -285.0],
    riverProgress: 1.0,
    hitRadius: 5.8,
    accentColor: '#ffe28a',
    route: '#chapter-placement',
    actionLabel: 'Jump to Placement Gateways',
    structuralRole: 'Stakeholder Portals & Registration',
    description: 'Arrive at the horizon convergence linking students, recruiters, and university placement directors.',
  },
];
