// @ts-nocheck
import * as THREE from 'three';
import { InteractableObjectSpec, SceneUniforms, ObjectInteractionState, ViewpointSpec, ViewpointId } from './types';
import { AnimationController } from './AnimationController';
import { CameraController } from './CameraController';
import { NavigationController } from './NavigationController';

export type EnvironmentId =
  | 'env-01-digital-river-valley'
  | 'env-02-talent-network-core'
  | 'env-03-recruitment-connectivity-grid'
  | 'env-04-resume-profile-studio'
  | 'env-05-opportunity-horizon';

export interface EnvironmentMetadata {
  id: EnvironmentId;
  number: string;
  name: string;
  subtitle: string;
  backgroundColor: string;
  fogColor: string;
  fogDensity: number;
}

export const ENVIRONMENT_REGISTRY: Record<EnvironmentId, EnvironmentMetadata> = {
  'env-01-digital-river-valley': {
    id: 'env-01-digital-river-valley',
    number: '01',
    name: 'Digital River Valley',
    subtitle: 'Public Landing & Platform Overview',
    backgroundColor: '#0c262e',
    fogColor: '#0f2f39',
    fogDensity: 0.0028,
  },
  'env-02-talent-network-core': {
    id: 'env-02-talent-network-core',
    number: '02',
    name: 'Talent Network Core',
    subtitle: 'Authentication & Role Access Gateway',
    backgroundColor: '#10273a',
    fogColor: '#142f46',
    fogDensity: 0.015,
  },
  'env-03-recruitment-connectivity-grid': {
    id: 'env-03-recruitment-connectivity-grid',
    number: '03',
    name: 'Recruitment Connectivity Grid',
    subtitle: 'Recruiter, Placement Cell & Admin Operations',
    backgroundColor: '#122c34',
    fogColor: '#16333c',
    fogDensity: 0.013,
  },
  'env-04-resume-profile-studio': {
    id: 'env-04-resume-profile-studio',
    number: '04',
    name: 'Resume & Profile Studio',
    subtitle: 'Student Hub, Resume Builder & ATS Intelligence',
    backgroundColor: '#13243c',
    fogColor: '#1b3050',
    fogDensity: 0.012,
  },
  'env-05-opportunity-horizon': {
    id: 'env-05-opportunity-horizon',
    number: '05',
    name: 'Opportunity Horizon',
    subtitle: 'Job Discovery, Eligibility & Application Tracking',
    backgroundColor: '#0e2932',
    fogColor: '#12343f',
    fogDensity: 0.0026,
  },
};

export function resolveEnvironmentForRoute(pathname: string): EnvironmentId {
  const path = pathname.toLowerCase();
  if (
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/auth') ||
    path.startsWith('/signin') ||
    path.startsWith('/get-started')
  ) {
    return 'env-02-talent-network-core';
  }
  if (
    path.startsWith('/recruiter') ||
    path.startsWith('/post-job') ||
    path.startsWith('/my-jobs') ||
    path.startsWith('/applicants') ||
    path.startsWith('/placement') ||
    path.startsWith('/admin')
  ) {
    return 'env-03-recruitment-connectivity-grid';
  }
  if (
    path.startsWith('/student') ||
    path.startsWith('/profile') ||
    path.startsWith('/resume') ||
    path.startsWith('/notifications')
  ) {
    return 'env-04-resume-profile-studio';
  }
  if (
    path.startsWith('/jobs') ||
    path.startsWith('/my-applications') ||
    path.startsWith('/opportunities')
  ) {
    return 'env-05-opportunity-horizon';
  }
  return 'env-01-digital-river-valley';
}

export interface OriginalSceneInstance {
  envId: EnvironmentId;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  stepSimulation: (dt: number) => void;
  handleResize: (w: number, h: number) => void;
  handleWheel: (e: WheelEvent, h: number) => void;
  handlePointerDown: (e: PointerEvent) => void;
  handlePointerMove: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => void;
  handlePointerUp: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => void;
  handleKeyDown: (e: KeyboardEvent) => void;
  handleKeyUp: (e: KeyboardEvent) => void;
  getViewpoints: () => Array<{ id: string; label: string; progress: number; description: string }>;
  getActiveViewpointId: () => string;
  goToViewpoint: (id: string) => void;
  setProgress: (p: number) => void;
  getProgress: () => number;
  hoverObject: (id: string | null) => any;
  selectObject: (id: string | null) => any;
  getHoveredObject: () => any;
  getSelectedObject: () => any;
  getInteractiveObjects: () => Array<{ id: string; title: string; subtitle: string; categoryLabel: string; route: string; accentColor: string; summary: string }>;
  getState: () => any;
  dispose: () => void;
}

// ============================================================================
// ENVIRONMENT 02: TALENT NETWORK CORE (EXACT ORIGINAL FROM TalentNetwork.html)
// ============================================================================
export function createTalentNetworkCoreScene(
  width: number,
  height: number,
  reducedMotion: boolean,
  onStateChange?: () => void
): OriginalSceneInstance {
      var VIEWPOINT_ORDER = [
        'establishing',
        'crystal-core',
        'network-layer',
        'modular-foundation',
        'intelligence-panels',
        'full-perspective'
      ];

      var VIEWPOINTS = {
        'establishing': {
          id: 'establishing',
          label: 'Viewpoint 1: Establishing',
          progress: 0.0,
          position: [0.0, 8.2, 22.8],
          target: [0.0, 2.2, 0.0],
          fov: 42,
          description: 'Complete isometric three-quarter view of the modular platform, upright polygonal glass enclosure, faceted crystal core, 5-lane diagonal circuit conduit, and rear intelligence panels.'
        },
        'crystal-core': {
          id: 'crystal-core',
          label: 'Viewpoint 2: Crystal Core',
          progress: 0.2,
          position: [-2.8, 4.4, 11.6],
          target: [-0.4, 3.3, 0.2],
          fov: 38,
          description: 'Close inspection of the multi-faceted emerald and cyan crystalline structures suspended inside the dual-layer holographic glass enclosure.'
        },
        'network-layer': {
          id: 'network-layer',
          label: 'Viewpoint 3: Network Layer',
          progress: 0.4,
          position: [4.6, 5.2, 12.4],
          target: [0.6, 3.8, -0.4],
          fov: 40,
          description: 'Spatial traversal through the hexagonal nodes, triangular lattice formations, and the 5-lane diagonal parallel circuit conduit.'
        },
        'modular-foundation': {
          id: 'modular-foundation',
          label: 'Viewpoint 4: Modular Foundation',
          progress: 0.6,
          position: [-6.4, 2.6, 15.2],
          target: [0.0, -0.8, 1.2],
          fov: 40,
          description: 'Low-angle inspection of the stepped dark-metallic foundation blocks, translucent emerald and cyan vertical light towers, chamfered seams, and recessed circuit grids.'
        },
        'intelligence-panels': {
          id: 'intelligence-panels',
          label: 'Viewpoint 5: Intelligence Panels',
          progress: 0.8,
          position: [0.0, 6.8, 16.8],
          target: [0.0, 4.5, -4.8],
          fov: 44,
          description: 'Focused perspective on the six angled rear 3D digital display surfaces and their connectivity to the central holographic talent network.'
        },
        'full-perspective': {
          id: 'full-perspective',
          label: 'Viewpoint 6: Full Network Perspective',
          progress: 1.0,
          position: [8.8, 11.4, 23.5],
          target: [0.0, 2.0, -0.5],
          fov: 45,
          description: 'Elevated architectural perspective revealing the entire 3D Talent Network Core assembly and its interconnected recruitment layers.'
        }
      };

      var INTERACTABLE_OBJECTS = [
        // A. 6 Major Crystalline Structures
        {
          id: 'crystal-student-resume',
          title: 'Resume Builder & ATS Engine',
          subtitle: 'Primary Emerald Faceted Crystal Cluster',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Student Feature',
          domain: 'student',
          position: [-1.35, 3.35, 0.85],
          focusCameraPosition: [-4.2, 4.3, 7.6],
          focusCameraTarget: [-1.35, 3.35, 0.85],
          hitRadius: 1.35,
          primaryColor: '#00E6A0',
          secondaryColor: '#19F5B5',
          route: '/student',
          actionLabel: 'Open Resume Builder & ATS',
          summary: 'Construct structured engineering resumes, preview clean recruiter-ready layouts, and run deterministic ATS compatibility analysis against job prerequisites.',
          capabilities: [
            'Structured academic, project, and technical skill sections',
            'Real-time Resume Preview with standardized formatting',
            'Deterministic ATS alignment analysis without paid AI lock-in'
          ],
          connectedIds: ['crystal-student-profile', 'node-ats-parser', 'crystal-application-tracker', 'panel-student-intelligence']
        },
        {
          id: 'crystal-opportunity-discovery',
          title: 'Campus Job Discovery & Eligibility',
          subtitle: 'Upper-Right Cyan Polyhedral Lattice',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Opportunity Feature',
          domain: 'opportunity',
          position: [1.55, 4.25, 0.45],
          focusCameraPosition: [4.6, 5.1, 7.8],
          focusCameraTarget: [1.55, 4.25, 0.45],
          hitRadius: 1.4,
          primaryColor: '#12DCE8',
          secondaryColor: '#00E6A0',
          route: '/jobs',
          actionLabel: 'Explore Campus Drives',
          summary: 'Browse active campus placement drives, inspect company information, verify CGPA and branch eligibility criteria, and review role requirements.',
          capabilities: [
            'Live search and employment-type filtering across published drives',
            'Explicit academic cutoff and required skill verification',
            'Honest empty state when no drives match active filters'
          ],
          connectedIds: ['crystal-student-profile', 'node-job-listings', 'crystal-recruiter-workflow', 'panel-opportunity-landscape']
        },
        {
          id: 'crystal-student-profile',
          title: 'Student Profile & Readiness Hub',
          subtitle: 'Apex Hexagonal Crystalline Node',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Student Feature',
          domain: 'student',
          position: [0.0, 5.15, 0.15],
          focusCameraPosition: [0.0, 6.2, 7.8],
          focusCameraTarget: [0.0, 5.15, 0.15],
          hitRadius: 1.15,
          primaryColor: '#19F5B5',
          secondaryColor: '#12DCE8',
          route: '/student',
          actionLabel: 'Open Student Hub',
          summary: 'Central student workspace synchronizing verified academic records, skill readiness indicators, resume completeness, and eligible campus drives.',
          capabilities: [
            'Unified student profile and academic credential management',
            'Readiness tracking across resume sections and skill tags',
            'Direct access to eligible placement opportunities'
          ],
          connectedIds: ['crystal-student-resume', 'crystal-opportunity-discovery', 'node-ats-parser']
        },
        {
          id: 'crystal-recruiter-workflow',
          title: 'Recruiter Drives & Applicant Workflows',
          subtitle: 'Lower-Center Triangular Prism Assembly',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Recruiter Feature',
          domain: 'recruiter',
          position: [0.75, 1.85, 1.15],
          focusCameraPosition: [3.6, 3.0, 8.2],
          focusCameraTarget: [0.75, 1.85, 1.15],
          hitRadius: 1.25,
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          route: '/recruiter',
          actionLabel: 'Open Recruiter Portal',
          summary: 'Manage published campus drives, configure eligibility requirements, evaluate incoming candidate applications, and coordinate stage transitions.',
          capabilities: [
            'Publish and update campus job postings with custom cutoffs',
            'Review applicant resumes and structured skill profiles',
            'Manage candidate status from Applied to Shortlisted and Offered'
          ],
          connectedIds: ['crystal-opportunity-discovery', 'node-recruiter-post', 'node-candidate-screening', 'panel-recruiter-drives']
        },
        {
          id: 'crystal-application-tracker',
          title: 'Job Applications & Status Tracking',
          subtitle: 'Left Hexagonal Containment Prism',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Student Feature',
          domain: 'student',
          position: [-1.85, 1.95, 1.35],
          focusCameraPosition: [-4.8, 3.1, 8.4],
          focusCameraTarget: [-1.85, 1.95, 1.35],
          hitRadius: 1.15,
          primaryColor: '#00E6A0',
          secondaryColor: '#19F5B5',
          route: '/student',
          actionLabel: 'Track Applications',
          summary: 'Track submitted campus drive applications in real time with transparent stage updates across screening, shortlisting, and final offer decisions.',
          capabilities: [
            'Chronological application ledger with status badges',
            'Direct linkage to job requirements and company details',
            'Role-protected candidate privacy and application history'
          ],
          connectedIds: ['crystal-student-resume', 'node-student-applications', 'block-foundation-student']
        },
        {
          id: 'crystal-placement-governance',
          title: 'Placement Cell Coordination & Analytics',
          subtitle: 'Right Diamond Crystalline Node',
          category: 'crystal',
          categoryLabel: 'Crystalline Core • Placement Team Feature',
          domain: 'placement',
          position: [2.05, 2.35, -0.35],
          focusCameraPosition: [5.4, 3.6, 6.8],
          focusCameraTarget: [2.05, 2.35, -0.35],
          hitRadius: 1.15,
          primaryColor: '#12DCE8',
          secondaryColor: '#1676B6',
          route: '/placement',
          actionLabel: 'Open Placement Console',
          summary: 'Institutional governance console for placement officers to coordinate campus drives, monitor student participation, and generate verified reports.',
          capabilities: [
            'Cohort-level student and recruiter drive oversight',
            'Institutional policy enforcement and eligibility governance',
            'Real-time placement workflow coordination and reporting'
          ],
          connectedIds: ['crystal-recruiter-workflow', 'node-placement-audit', 'panel-placement-governance', 'block-foundation-placement']
        },

        // B. 6 Spatial Network Nodes
        {
          id: 'node-ats-parser',
          title: 'Resume ATS Analysis Node',
          subtitle: 'Hexagonal Network Node • Upper Left',
          category: 'network-node',
          categoryLabel: 'Network Node • Student Intelligence',
          domain: 'student',
          position: [-2.35, 4.35, -0.45],
          focusCameraPosition: [-5.4, 5.2, 6.4],
          focusCameraTarget: [-2.35, 4.35, -0.45],
          hitRadius: 0.85,
          primaryColor: '#19F5B5',
          secondaryColor: '#00E6A0',
          route: '/student',
          actionLabel: 'Run Resume ATS Check',
          summary: 'Evaluates structural completeness, section formatting, and keyword alignment between student resumes and target job descriptions.',
          capabilities: [
            'Instant structural formatting and section validation',
            'Keyword alignment comparison against job requirements',
            'Actionable suggestions to improve profile clarity'
          ],
          connectedIds: ['crystal-student-resume', 'crystal-student-profile', 'panel-student-intelligence']
        },
        {
          id: 'node-job-listings',
          title: 'Verified Job Listings & Eligibility Node',
          subtitle: 'Hexagonal Network Node • Upper Right',
          category: 'network-node',
          categoryLabel: 'Network Node • Opportunity Mesh',
          domain: 'opportunity',
          position: [2.55, 4.65, -0.65],
          focusCameraPosition: [5.8, 5.5, 6.2],
          focusCameraTarget: [2.55, 4.65, -0.65],
          hitRadius: 0.85,
          primaryColor: '#12DCE8',
          secondaryColor: '#19F5B5',
          route: '/jobs',
          actionLabel: 'Browse Job Directory',
          summary: 'Connects published enterprise job openings with structured eligibility criteria so students can filter roles by type, skill, and location.',
          capabilities: [
            'Filter by Full-time, Internship, Remote, and Contract roles',
            'Inspect required technical competencies and deadlines',
            'Graceful empty state when no drives match active filters'
          ],
          connectedIds: ['crystal-opportunity-discovery', 'panel-network-topology', 'block-foundation-opportunities']
        },
        {
          id: 'node-recruiter-post',
          title: 'Job Posting & Drive Configuration Node',
          subtitle: 'Triangular Network Relay • Mid Right',
          category: 'network-node',
          categoryLabel: 'Network Node • Recruiter Workflow',
          domain: 'recruiter',
          position: [2.65, 3.25, 1.05],
          focusCameraPosition: [5.8, 4.1, 7.8],
          focusCameraTarget: [2.65, 3.25, 1.05],
          hitRadius: 0.85,
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          route: '/recruiter',
          actionLabel: 'Post Campus Drive',
          summary: 'Allows authorized recruiters and administrators to publish new campus recruitment drives with defined skills, compensation, and eligibility rules.',
          capabilities: [
            'Structured job posting form with validation',
            'Configurable employment type, location, and CGPA cutoff',
            'Immediate synchronization with the Campus Drive Board'
          ],
          connectedIds: ['crystal-opportunity-discovery', 'crystal-recruiter-workflow', 'block-foundation-recruiter']
        },
        {
          id: 'node-candidate-screening',
          title: 'Applicant Management & Screening Node',
          subtitle: 'Spatial Network Node • Lower Front-Right',
          category: 'network-node',
          categoryLabel: 'Network Node • Recruiter Screening',
          domain: 'recruiter',
          position: [1.45, 1.15, 2.25],
          focusCameraPosition: [4.2, 2.4, 8.8],
          focusCameraTarget: [1.45, 1.15, 2.25],
          hitRadius: 0.85,
          primaryColor: '#12DCE8',
          secondaryColor: '#1676B6',
          route: '/recruiter',
          actionLabel: 'Manage Drives & Applicants',
          summary: 'Enables recruiting teams to inspect applicants per job drive, review submitted resumes, and update candidate selection statuses.',
          capabilities: [
            'Per-drive applicant roster and resume inspection',
            'Status workflow updates for shortlisted and selected candidates',
            'Role-based access restricted to authorized recruiters and officers'
          ],
          connectedIds: ['crystal-recruiter-workflow', 'block-foundation-recruiter']
        },
        {
          id: 'node-student-applications',
          title: 'Candidate Application Relay Node',
          subtitle: 'Spatial Network Node • Lower Front-Left',
          category: 'network-node',
          categoryLabel: 'Network Node • Student Pipeline',
          domain: 'student',
          position: [-1.35, 1.15, 2.35],
          focusCameraPosition: [-4.2, 2.4, 8.8],
          focusCameraTarget: [-1.35, 1.15, 2.35],
          hitRadius: 0.85,
          primaryColor: '#00E6A0',
          secondaryColor: '#19F5B5',
          route: '/student',
          actionLabel: 'View My Applications',
          summary: 'Links student profiles and verified resumes directly to active campus job applications with status tracking.',
          capabilities: [
            'Single-view tracking of all submitted job applications',
            'Real-time reflection of recruiter status updates',
            'Direct navigation back to job specifications'
          ],
          connectedIds: ['crystal-application-tracker', 'crystal-student-resume', 'block-foundation-student']
        },
        {
          id: 'node-placement-audit',
          title: 'Placement Reporting & Governance Node',
          subtitle: 'Hexagonal Network Node • Rear Center',
          category: 'network-node',
          categoryLabel: 'Network Node • Placement Governance',
          domain: 'placement',
          position: [0.0, 2.85, -1.85],
          focusCameraPosition: [0.0, 4.2, 6.6],
          focusCameraTarget: [0.0, 2.85, -1.85],
          hitRadius: 0.85,
          primaryColor: '#12DCE8',
          secondaryColor: '#00E6A0',
          route: '/placement',
          actionLabel: 'Open Placement Dashboard',
          summary: 'Connects student cohorts, recruiter drives, and institutional placement records into a single governance and reporting hub.',
          capabilities: [
            'Placement team oversight across departments and drives',
            'Verified institutional reporting without fabricated statistics',
            'Role-segregated administrative access controls'
          ],
          connectedIds: ['crystal-placement-governance', 'panel-placement-governance', 'block-foundation-placement']
        },

        // C. 4 Interactive Modular Foundation Blocks
        {
          id: 'block-foundation-student',
          title: 'Student Ecosystem Foundation Module',
          subtitle: 'Illuminated Emerald Vertical Pillar • West Flank',
          category: 'modular-block',
          categoryLabel: 'Modular Foundation • Student Gateway',
          domain: 'student',
          position: [-3.8, -0.55, 1.8],
          focusCameraPosition: [-7.2, 2.2, 8.8],
          focusCameraTarget: [-3.8, -0.2, 1.8],
          hitRadius: 1.2,
          primaryColor: '#00E6A0',
          secondaryColor: '#19F5B5',
          route: '/student',
          actionLabel: 'Enter Student Workspace',
          summary: 'Foundation terminal anchoring student registration, profile readiness, resume building, and application tracking.',
          capabilities: [
            'Direct gateway to Student Hub and Resume Builder',
            'Role-verified student authentication and profile storage',
            'Connected via luminous circuit traces to the central crystal core'
          ],
          connectedIds: ['crystal-application-tracker', 'node-student-applications']
        },
        {
          id: 'block-foundation-opportunities',
          title: 'Opportunity Conduit Terminal Block',
          subtitle: 'Front-Center Illuminated Apex Block',
          category: 'modular-block',
          categoryLabel: 'Modular Foundation • Opportunity Conduit',
          domain: 'opportunity',
          position: [0.0, -0.35, 3.65],
          focusCameraPosition: [0.0, 2.3, 10.6],
          focusCameraTarget: [0.0, -0.2, 3.65],
          hitRadius: 1.25,
          primaryColor: '#12DCE8',
          secondaryColor: '#00E6A0',
          route: '/jobs',
          actionLabel: 'Open Campus Drive Board',
          summary: 'Primary front-facing foundation terminal feeding the 5-lane diagonal circuit conduit into the central holographic talent network.',
          capabilities: [
            'Origin point of the 5-lane parallel circuit conduit',
            'Direct access to public and authenticated job listings',
            'Real-time filtering across active campus recruitment drives'
          ],
          connectedIds: ['node-student-applications', 'node-candidate-screening', 'crystal-recruiter-workflow']
        },
        {
          id: 'block-foundation-recruiter',
          title: 'Recruiter Operations Foundation Module',
          subtitle: 'Translucent Cyan Vertical Pillar • South-East Flank',
          category: 'modular-block',
          categoryLabel: 'Modular Foundation • Recruiter Gateway',
          domain: 'recruiter',
          position: [2.25, -0.75, 3.85],
          focusCameraPosition: [6.2, 2.0, 10.2],
          focusCameraTarget: [2.25, -0.4, 3.85],
          hitRadius: 1.2,
          primaryColor: '#12DCE8',
          secondaryColor: '#1676B6',
          route: '/recruiter',
          actionLabel: 'Enter Recruiter Portal',
          summary: 'Structural foundation module supporting enterprise recruiter authentication, drive publishing, and applicant evaluation workflows.',
          capabilities: [
            'Recruiter dashboard and job posting management',
            'Structured applicant evaluation and stage progression',
            'Protected by role-based access control'
          ],
          connectedIds: ['node-candidate-screening', 'node-recruiter-post', 'crystal-recruiter-workflow']
        },
        {
          id: 'block-foundation-placement',
          title: 'Placement Governance Foundation Module',
          subtitle: 'Illuminated Emerald Vertical Pillar • East Flank',
          category: 'modular-block',
          categoryLabel: 'Modular Foundation • Placement Cell',
          domain: 'placement',
          position: [3.95, -0.55, 1.65],
          focusCameraPosition: [7.6, 2.2, 8.4],
          focusCameraTarget: [3.95, -0.2, 1.65],
          hitRadius: 1.2,
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          route: '/placement',
          actionLabel: 'Enter Placement Console',
          summary: 'Foundation terminal dedicated to university placement officers and administrators overseeing campus recruitment operations.',
          capabilities: [
            'Institutional oversight across student cohorts and drives',
            'Policy governance and verified placement reporting',
            'Integrated with administrative audit controls'
          ],
          connectedIds: ['crystal-placement-governance', 'node-placement-audit']
        },

        // D. Rear Dashboard Panels (Interactive 3D Display Surfaces)
        {
          id: 'panel-student-intelligence',
          title: 'Student Readiness & ATS Display Panel',
          subtitle: 'Upper-Left Angled 3D Holographic Display',
          category: 'dashboard-panel',
          categoryLabel: '3D Dashboard Panel • Student Readiness',
          domain: 'student',
          position: [-5.8, 5.3, -3.2],
          focusCameraPosition: [-3.2, 5.4, 5.2],
          focusCameraTarget: [-5.4, 5.1, -2.8],
          hitRadius: 2.1,
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          route: '/student',
          actionLabel: 'Open Resume & ATS Studio',
          summary: 'Angled 3D display surface visualizing resume section completeness and structural ATS alignment without fabricated metrics.',
          capabilities: [
            'Circular readiness ring and section completion indicators',
            'Direct navigation to the interactive Resume Builder',
            'Displays neutral standby visualization when no student session is active'
          ],
          connectedIds: ['crystal-student-resume', 'node-ats-parser']
        },
        {
          id: 'panel-network-topology',
          title: 'Interconnected Talent Topology Panel',
          subtitle: 'Upper-Right Wide 3D Constellation Display',
          category: 'dashboard-panel',
          categoryLabel: '3D Dashboard Panel • Network Topology',
          domain: 'placement',
          position: [5.9, 5.1, -3.1],
          focusCameraPosition: [3.4, 5.2, 5.4],
          focusCameraTarget: [5.5, 4.9, -2.8],
          hitRadius: 2.2,
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          route: '/placement',
          actionLabel: 'Open Placement Governance',
          summary: 'Wide angled 3D holographic frame projecting a spatial node-link constellation of student skills, job requirements, and recruiting teams.',
          capabilities: [
            '3D node-and-edge constellation matching the right flank of the reference image',
            'Highlights real structural relationships across the platform',
            'Interactive camera focus and route navigation'
          ],
          connectedIds: ['node-job-listings', 'crystal-opportunity-discovery', 'crystal-placement-governance']
        }
      ];

      var NETWORK_EDGES = [
        { id: 'e1', fromId: 'crystal-student-resume', toId: 'crystal-student-profile', fromPos: [-1.35, 3.35, 0.85], toPos: [0.0, 5.15, 0.15], color: '#00E6A0', speed: 0.65, phase: 0.0 },
        { id: 'e2', fromId: 'crystal-student-profile', toId: 'crystal-opportunity-discovery', fromPos: [0.0, 5.15, 0.15], toPos: [1.55, 4.25, 0.45], color: '#12DCE8', speed: 0.72, phase: 0.2 },
        { id: 'e3', fromId: 'crystal-student-resume', toId: 'crystal-application-tracker', fromPos: [-1.35, 3.35, 0.85], toPos: [-1.85, 1.95, 1.35], color: '#19F5B5', speed: 0.58, phase: 0.4 },
        { id: 'e4', fromId: 'crystal-opportunity-discovery', toId: 'crystal-recruiter-workflow', fromPos: [1.55, 4.25, 0.45], toPos: [0.75, 1.85, 1.15], color: '#00E6A0', speed: 0.62, phase: 0.15 },
        { id: 'e5', fromId: 'crystal-recruiter-workflow', toId: 'crystal-placement-governance', fromPos: [0.75, 1.85, 1.15], toPos: [2.05, 2.35, -0.35], color: '#12DCE8', speed: 0.54, phase: 0.55 },
        { id: 'e6', fromId: 'crystal-opportunity-discovery', toId: 'crystal-placement-governance', fromPos: [1.55, 4.25, 0.45], toPos: [2.05, 2.35, -0.35], color: '#12DCE8', speed: 0.68, phase: 0.35 },
        { id: 'e7', fromId: 'crystal-student-resume', toId: 'node-ats-parser', fromPos: [-1.35, 3.35, 0.85], toPos: [-2.35, 4.35, -0.45], color: '#19F5B5', speed: 0.76, phase: 0.1 },
        { id: 'e8', fromId: 'crystal-opportunity-discovery', toId: 'node-job-listings', fromPos: [1.55, 4.25, 0.45], toPos: [2.55, 4.65, -0.65], color: '#12DCE8', speed: 0.8, phase: 0.25 },
        { id: 'e9', fromId: 'crystal-opportunity-discovery', toId: 'node-recruiter-post', fromPos: [1.55, 4.25, 0.45], toPos: [2.65, 3.25, 1.05], color: '#00E6A0', speed: 0.64, phase: 0.45 },
        { id: 'e10', fromId: 'crystal-recruiter-workflow', toId: 'node-candidate-screening', fromPos: [0.75, 1.85, 1.15], toPos: [1.45, 1.15, 2.25], color: '#12DCE8', speed: 0.71, phase: 0.3 },
        { id: 'e11', fromId: 'crystal-application-tracker', toId: 'node-student-applications', fromPos: [-1.85, 1.95, 1.35], toPos: [-1.35, 1.15, 2.35], color: '#00E6A0', speed: 0.67, phase: 0.5 },
        { id: 'e12', fromId: 'crystal-placement-governance', toId: 'node-placement-audit', fromPos: [2.05, 2.35, -0.35], toPos: [0.0, 2.85, -1.85], color: '#12DCE8', speed: 0.55, phase: 0.8 },
        { id: 'e13', fromId: 'block-foundation-student', toId: 'crystal-application-tracker', fromPos: [-3.8, 0.4, 1.8], toPos: [-1.85, 1.95, 1.35], color: '#00E6A0', speed: 0.6, phase: 0.12 },
        { id: 'e14', fromId: 'block-foundation-opportunities', toId: 'node-student-applications', fromPos: [0.0, 0.25, 3.65], toPos: [-1.35, 1.15, 2.35], color: '#19F5B5', speed: 0.74, phase: 0.22 },
        { id: 'e15', fromId: 'block-foundation-opportunities', toId: 'node-candidate-screening', fromPos: [0.0, 0.25, 3.65], toPos: [1.45, 1.15, 2.25], color: '#12DCE8', speed: 0.74, phase: 0.38 },
        { id: 'e16', fromId: 'block-foundation-recruiter', toId: 'node-candidate-screening', fromPos: [2.25, 0.2, 3.85], toPos: [1.45, 1.15, 2.25], color: '#12DCE8', speed: 0.63, phase: 0.48 },
        { id: 'e17', fromId: 'block-foundation-placement', toId: 'crystal-placement-governance', fromPos: [3.95, 0.4, 1.65], toPos: [2.05, 2.35, -0.35], color: '#00E6A0', speed: 0.57, phase: 0.62 },
        { id: 'e18', fromId: 'node-ats-parser', toId: 'panel-student-intelligence', fromPos: [-2.35, 4.35, -0.45], toPos: [-4.6, 5.0, -2.5], color: '#00E6A0', speed: 0.5, phase: 0.18 },
        { id: 'e19', fromId: 'node-job-listings', toId: 'panel-network-topology', fromPos: [2.55, 4.65, -0.65], toPos: [4.7, 4.9, -2.4], color: '#12DCE8', speed: 0.56, phase: 0.28 }
      ];

      var canvas = document.getElementById('talent-canvas');

      var scene = new THREE.Scene();
      scene.background = new THREE.Color('#10273a');
      scene.fog = new THREE.FogExp2('#142f46', 0.015);

      var ambientLight = new THREE.AmbientLight('#0d2836', 1.25);
      var keyLight = new THREE.DirectionalLight('#e7f3f5', 1.55);
      keyLight.position.set(10, 18, 14);
      var rimLight = new THREE.DirectionalLight('#12DCE8', 1.15);
      rimLight.position.set(-14, 12, -10);
      var coreEmeraldLight = new THREE.PointLight('#00E6A0', 2.6, 20, 1.4);
      coreEmeraldLight.position.set(-0.6, 3.3, 0.9);
      var coreCyanLight = new THREE.PointLight('#12DCE8', 2.2, 20, 1.4);
      coreCyanLight.position.set(1.5, 4.1, 0.5);
      scene.add(ambientLight, keyLight, rimLight, coreEmeraldLight, coreCyanLight);

      var uniforms = {
        uTime: { value: 0.0 },
        uPrimaryColor: { value: new THREE.Color('#00E6A0') },
        uCyanColor: { value: new THREE.Color('#12DCE8') }
      };

      var glassShaderMat = new THREE.ShaderMaterial({
        vertexShader: [
          'varying vec3 vWorldPos;',
          'varying vec3 vNormal;',
          'varying vec2 vUv;',
          'void main() {',
          '  vUv = uv;',
          '  vNormal = normalize(normalMatrix * normal);',
          '  vec4 wp = modelMatrix * vec4(position, 1.0);',
          '  vWorldPos = wp.xyz;',
          '  gl_Position = projectionMatrix * viewMatrix * wp;',
          '}'
        ].join('\n'),
        fragmentShader: [
          'uniform float uTime;',
          'uniform vec3 uPrimaryColor;',
          'uniform vec3 uCyanColor;',
          'varying vec3 vWorldPos;',
          'varying vec3 vNormal;',
          'varying vec2 vUv;',
          'void main() {',
          '  vec3 viewDir = normalize(cameraPosition - vWorldPos);',
          '  float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.1);',
          '  float scan = smoothstep(0.04, 0.0, abs(fract(vWorldPos.y * 0.15 - uTime * 0.14) - 0.5));',
          '  float bx = smoothstep(0.055, 0.0, min(vUv.x, 1.0 - vUv.x));',
          '  float by = smoothstep(0.05, 0.0, min(vUv.y, 1.0 - vUv.y));',
          '  float border = max(bx, by);',
          '  vec3 baseCol = vec3(0.03, 0.12, 0.16);',
          '  vec3 rimCol = mix(uCyanColor, uPrimaryColor, vUv.y);',
          '  vec3 col = baseCol + rimCol * (fresnel * 0.68 + border * 0.48 + scan * 0.15);',
          '  float alpha = clamp(0.10 + fresnel * 0.26 + border * 0.36 + scan * 0.06, 0.08, 0.56);',
          '  gl_FragColor = vec4(col, alpha);',
          '}'
        ].join('\n'),
        uniforms: uniforms,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      var darkFoundationMat = new THREE.MeshStandardMaterial({
        color: '#0A1922',
        roughness: 0.3,
        metalness: 0.8,
        emissive: '#041016',
        emissiveIntensity: 0.38
      });

      var raisedMetallicMat = new THREE.MeshStandardMaterial({
        color: '#112932',
        roughness: 0.24,
        metalness: 0.85,
        emissive: '#07222c',
        emissiveIntensity: 0.48
      });

      var emeraldEdgeMat = new THREE.LineBasicMaterial({ color: '#19F5B5', transparent: true, opacity: 0.86 });
      var cyanEdgeMat = new THREE.LineBasicMaterial({ color: '#12DCE8', transparent: true, opacity: 0.82 });

      var talentCoreRoot = new THREE.Group();
      talentCoreRoot.name = 'TalentNetworkCoreScene';
      scene.add(talentCoreRoot);

      var riverValleyRoot = new THREE.Group();
      riverValleyRoot.name = 'DigitalRiverValleyCompanionScene';
      riverValleyRoot.visible = false;
      scene.add(riverValleyRoot);

      var runtimeRegistry = new Map();
      var hitMeshes = [];
      var edgeVisuals = [];
      var pulsePackets = [];

      var diamondGlassGroup = new THREE.Group();
      diamondGlassGroup.rotation.y = Math.PI / 4;
      talentCoreRoot.add(diamondGlassGroup);

      var innerStageGeo = new THREE.BoxGeometry(4.4, 0.75, 4.4);
      var innerStageMesh = new THREE.Mesh(innerStageGeo, darkFoundationMat);
      innerStageMesh.position.set(0, 0.25, 0);
      innerStageMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(innerStageGeo), emeraldEdgeMat));
      diamondGlassGroup.add(innerStageMesh);

      var padGeo = new THREE.BoxGeometry(1.65, 0.08, 1.65);
      var padMesh = new THREE.Mesh(padGeo, raisedMetallicMat);
      padMesh.position.set(0.95, 0.66, 0.95);
      padMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(padGeo), emeraldEdgeMat));
      diamondGlassGroup.add(padMesh);

      var padRingGeo = new THREE.RingGeometry(0.18, 0.25, 24);
      padRingGeo.rotateX(-Math.PI / 2);
      var padRingMesh = new THREE.Mesh(padRingGeo, new THREE.MeshBasicMaterial({ color: '#19F5B5', side: THREE.DoubleSide }));
      padRingMesh.position.set(0.95, 0.72, 0.95);
      diamondGlassGroup.add(padRingMesh);

      function buildGlassEnclosure(w, h, d, thickness, yCenter, edgeMaterial) {
        var g = new THREE.Group();
        g.position.y = yCenter;
        var frontGeo = new THREE.BoxGeometry(w, h, thickness);
        var sideGeo = new THREE.BoxGeometry(thickness, h, d);
        var walls = [
          { geo: frontGeo, pos: [0, 0, d / 2] },
          { geo: frontGeo, pos: [0, 0, -d / 2] },
          { geo: sideGeo, pos: [w / 2, 0, 0] },
          { geo: sideGeo, pos: [-w / 2, 0, 0] }
        ];
        walls.forEach(function (wSpec) {
          var m = new THREE.Mesh(wSpec.geo, glassShaderMat);
          m.position.set(wSpec.pos[0], wSpec.pos[1], wSpec.pos[2]);
          m.add(new THREE.LineSegments(new THREE.EdgesGeometry(wSpec.geo), edgeMaterial));
          g.add(m);
        });
        var colGeo = new THREE.CylinderGeometry(0.045, 0.045, h + 0.1, 6);
        var corners = [[w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]];
        corners.forEach(function (c, i) {
          var colMat = new THREE.MeshBasicMaterial({ color: i === 0 ? '#19F5B5' : '#12DCE8' });
          var col = new THREE.Mesh(colGeo, colMat);
          col.position.set(c[0], 0, c[1]);
          g.add(col);
        });
        return g;
      }

      diamondGlassGroup.add(buildGlassEnclosure(5.4, 6.0, 5.4, 0.07, 3.25, cyanEdgeMat));
      diamondGlassGroup.add(buildGlassEnclosure(4.65, 5.35, 4.65, 0.05, 3.05, emeraldEdgeMat));

      var floorGridHelper = new THREE.GridHelper(38, 38, '#12DCE8', '#0e2d3b');
      floorGridHelper.position.y = -2.12;
      floorGridHelper.rotation.y = Math.PI / 4;
      talentCoreRoot.add(floorGridHelper);

      var tiers = [
        { w: 9.2, h: 0.45, d: 9.2, y: -1.9, edge: cyanEdgeMat },
        { w: 7.6, h: 0.55, d: 7.6, y: -1.4, edge: emeraldEdgeMat },
        { w: 6.1, h: 0.65, d: 6.1, y: -0.8, edge: cyanEdgeMat },
        { w: 5.5, h: 0.55, d: 5.5, y: -0.2, edge: emeraldEdgeMat }
      ];
      tiers.forEach(function (t, idx) {
        var tGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
        var tMesh = new THREE.Mesh(tGeo, idx % 2 === 0 ? darkFoundationMat : raisedMetallicMat);
        tMesh.position.set(0, t.y, 0);
        tMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(tGeo), t.edge));
        diamondGlassGroup.add(tMesh);
      });

      var decoBlocks = [
        { pos: [2.85, -1.05, 2.85], size: [0.78, 0.62, 0.78], col: '#112932', op: 0.96 },
        { pos: [3.55, -1.28, 3.55], size: [0.68, 0.52, 0.68], col: '#0d222c', op: 0.96 },
        { pos: [3.55, -1.32, 2.72], size: [0.64, 0.48, 0.64], col: '#112932', op: 0.96 },
        { pos: [2.72, -1.32, 3.55], size: [0.64, 0.48, 0.64], col: '#112932', op: 0.96 },
        { pos: [4.18, -1.52, 4.18], size: [0.58, 0.42, 0.58], col: '#0b2030', op: 0.96 },
        { pos: [4.18, -1.55, 3.42], size: [0.55, 0.38, 0.55], col: '#0f2838', op: 0.96 },
        { pos: [3.42, -1.55, 4.18], size: [0.55, 0.38, 0.55], col: '#0f2838', op: 0.96 },
        { pos: [1.85, -1.15, 3.65], size: [0.74, 0.85, 0.74], col: '#00b87c', op: 0.52 },
        { pos: [3.65, -1.12, 1.85], size: [0.68, 1.28, 0.68], col: '#1676B6', op: 0.58 },
        { pos: [-1.8, -1.15, 3.8], size: [0.82, 0.95, 0.82], col: '#00b87c', op: 0.52 },
        { pos: [-2.8, -0.95, 3.4], size: [1.1, 0.75, 1.1], col: '#124e78', op: 0.58 },
        { pos: [-4.2, -1.1, 2.2], size: [0.85, 1.1, 0.85], col: '#00b87c', op: 0.52 },
        { pos: [3.8, -0.85, -1.6], size: [0.82, 1.35, 0.82], col: '#00b87c', op: 0.52 },
        { pos: [3.5, -1.15, 1.05], size: [0.76, 1.35, 0.76], col: '#00b87c', op: 0.55 },
        { pos: [4.2, -1.35, 0.1], size: [1.05, 0.7, 1.05], col: '#0e6b85', op: 0.55 }
      ];
      decoBlocks.forEach(function (b) {
        var bGeo = new THREE.BoxGeometry(b.size[0], b.size[1], b.size[2]);
        var bMat = new THREE.MeshPhysicalMaterial({
          color: b.col,
          emissive: b.col,
          emissiveIntensity: b.op < 0.85 ? 0.52 : 0.2,
          roughness: 0.2,
          metalness: 0.5,
          transparent: b.op < 0.9,
          opacity: b.op
        });
        var bMesh = new THREE.Mesh(bGeo, bMat);
        bMesh.position.set(b.pos[0], b.pos[1], b.pos[2]);
        bMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(bGeo), b.col === '#00E6A0' ? emeraldEdgeMat : cyanEdgeMat));
        diamondGlassGroup.add(bMesh);
      });

      var packetGeo = new THREE.SphereGeometry(0.068, 10, 10);
      for (var lane = 0; lane < 5; lane++) {
        var off = (lane - 2) * 0.14;
        var lanePts = [
          new THREE.Vector3(-1.55 + off * 0.7, -1.35, 3.15 + off * 0.7),
          new THREE.Vector3(-1.55 + off * 0.7, 0.42, 3.15 + off * 0.7),
          new THREE.Vector3(-0.35 + off, 0.85, 1.45 + off * 0.6),
          new THREE.Vector3(-0.35 + off, 2.55 + off * 0.25, 0.95 + off * 0.4),
          new THREE.Vector3(0.85 + off * 0.8, 3.85 + off * 0.3, 0.35 + off * 0.3),
          new THREE.Vector3(1.55 + off * 0.6, 4.35 + off * 0.25, 0.15 + off * 0.3)
        ];
        var laneCurve = new THREE.CatmullRomCurve3(lanePts, false, 'catmullrom', 0.12);
        var tubeGeo = new THREE.TubeGeometry(laneCurve, 60, lane === 2 ? 0.028 : 0.019, 6, false);
        var tubeCol = lane % 2 === 0 ? '#19F5B5' : '#12DCE8';
        var tubeMesh = new THREE.Mesh(tubeGeo, new THREE.MeshBasicMaterial({ color: tubeCol }));
        talentCoreRoot.add(tubeMesh);

        var pktMesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: tubeCol }));
        talentCoreRoot.add(pktMesh);
        pulsePackets.push({
          mesh: pktMesh,
          curve: laneCurve,
          speed: 0.26 + lane * 0.035,
          progress: (lane * 0.2) % 1.0,
          fromId: 'block-foundation-opportunities',
          toId: 'crystal-opportunity-discovery'
        });
      }

      var extraPanels = [
        { pos: [-5.8, 2.4, -3.2], w: 3.5, h: 1.95, rotY: Math.PI / 4.6, col: '#19F5B5' },
        { pos: [-2.3, 6.7, -5.2], w: 2.4, h: 1.4, rotY: Math.PI / 4.6, col: '#00E6A0' },
        { pos: [2.3, 6.7, -5.2], w: 2.4, h: 1.4, rotY: -Math.PI / 4.6, col: '#12DCE8' },
        { pos: [5.9, 2.1, -3.1], w: 3.5, h: 1.95, rotY: -Math.PI / 4.6, col: '#12DCE8' }
      ];
      extraPanels.forEach(function (ep) {
        var pg = new THREE.Group();
        pg.position.set(ep.pos[0], ep.pos[1], ep.pos[2]);
        pg.rotation.y = ep.rotY;
        var sGeo = new THREE.BoxGeometry(ep.w, ep.h, 0.05);
        var sMat = new THREE.MeshStandardMaterial({
          color: '#081821',
          emissive: '#07222e',
          emissiveIntensity: 0.45,
          transparent: true,
          opacity: 0.82
        });
        var sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(sGeo), new THREE.LineBasicMaterial({ color: ep.col, transparent: true, opacity: 0.8 })));
        pg.add(sMesh);

        var bars = 8;
        var span = ep.w - 0.5;
        var step = span / bars;
        for (var bi = 0; bi < bars; bi++) {
          var bh = (0.35 + ((bi * 37) % 65) / 100) * (ep.h * 0.55);
          var bGeo = new THREE.BoxGeometry(step * 0.55, bh, 0.025);
          var bMat = new THREE.MeshBasicMaterial({ color: bi % 2 === 0 ? '#00E6A0' : '#12DCE8', transparent: true, opacity: 0.82 });
          var bMesh = new THREE.Mesh(bGeo, bMat);
          bMesh.position.set(-span / 2 + bi * step + step * 0.5, -ep.h * 0.32 + bh / 2, 0.035);
          pg.add(bMesh);
        }
        talentCoreRoot.add(pg);
      });

      INTERACTABLE_OBJECTS.forEach(function (spec) {
        var rootGroup = new THREE.Group();
        rootGroup.position.set(spec.position[0], spec.position[1], spec.position[2]);
        talentCoreRoot.add(rootGroup);

        var primaryGroup = new THREE.Group();
        rootGroup.add(primaryGroup);

        var mat = new THREE.MeshPhysicalMaterial({
          color: spec.primaryColor,
          emissive: spec.primaryColor,
          emissiveIntensity: 0.55,
          roughness: 0.16,
          metalness: 0.22,
          clearcoat: 1.0,
          transparent: true,
          opacity: 0.86,
          flatShading: true
        });
        var lineMat = new THREE.LineBasicMaterial({
          color: spec.secondaryColor,
          transparent: true,
          opacity: 0.9
        });

        if (spec.category === 'crystal') {
          if (spec.id === 'crystal-student-resume') {
            var cGeo1 = new THREE.IcosahedronGeometry(0.78, 0);
            cGeo1.scale(1.15, 0.92, 0.95);
            var cMesh1 = new THREE.Mesh(cGeo1, mat);
            cMesh1.rotation.set(0.35, 0.5, -0.2);
            cMesh1.add(new THREE.LineSegments(new THREE.EdgesGeometry(cGeo1), lineMat));
            primaryGroup.add(cMesh1);

            var shardGeo = new THREE.OctahedronGeometry(0.46, 0);
            shardGeo.scale(0.9, 1.35, 0.85);
            var shardMesh = new THREE.Mesh(shardGeo, mat);
            shardMesh.position.set(0.52, 0.22, -0.18);
            shardMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(shardGeo), lineMat));
            primaryGroup.add(shardMesh);
          } else if (spec.id === 'crystal-opportunity-discovery') {
            var octGeo = new THREE.OctahedronGeometry(0.74, 0);
            octGeo.scale(1.1, 1.25, 0.9);
            var octMesh = new THREE.Mesh(octGeo, mat);
            octMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(octGeo), lineMat));
            primaryGroup.add(octMesh);

            var sOffsets = [[-0.55, 0.42, -0.2, 0.4], [0.52, -0.35, 0.22, 0.36], [0.16, 0.6, -0.32, 0.32]];
            sOffsets.forEach(function (so) {
              var tGeo = new THREE.TetrahedronGeometry(so[3], 0);
              var tMesh = new THREE.Mesh(tGeo, mat);
              tMesh.position.set(so[0], so[1], so[2]);
              tMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(tGeo), lineMat));
              primaryGroup.add(tMesh);
            });
          } else if (spec.id === 'crystal-student-profile') {
            var hexGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.14, 6, 1, true);
            hexGeo.rotateX(Math.PI / 2);
            hexGeo.rotateY(Math.PI / 4);
            primaryGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(hexGeo), lineMat));

            var coreGemGeo = new THREE.OctahedronGeometry(0.42, 0);
            var coreGem = new THREE.Mesh(coreGemGeo, mat);
            coreGem.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreGemGeo), lineMat));
            primaryGroup.add(coreGem);

            var topCubeGeo = new THREE.BoxGeometry(0.42, 0.42, 0.42);
            var topCube = new THREE.Mesh(topCubeGeo, mat);
            topCube.position.set(0, 0.92, 0);
            topCube.rotation.set(Math.PI / 4, Math.PI / 4, 0);
            topCube.add(new THREE.LineSegments(new THREE.EdgesGeometry(topCubeGeo), lineMat));
            primaryGroup.add(topCube);
          } else if (spec.id === 'crystal-recruiter-workflow') {
            var coneGeo = new THREE.ConeGeometry(0.68, 1.35, 4);
            var coneMesh = new THREE.Mesh(coneGeo, mat);
            coneMesh.rotation.set(0.15, Math.PI / 5, -0.18);
            coneMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(coneGeo), lineMat));
            primaryGroup.add(coneMesh);
          } else {
            var podGeo = new THREE.CylinderGeometry(0.56, 0.56, 0.48, 6);
            var podWire = new THREE.LineSegments(new THREE.EdgesGeometry(podGeo), lineMat);
            podWire.rotation.set(Math.PI / 3, Math.PI / 4, 0);
            primaryGroup.add(podWire);

            var innerOctGeo = new THREE.OctahedronGeometry(0.38, 0);
            var innerOct = new THREE.Mesh(innerOctGeo, mat);
            innerOct.add(new THREE.LineSegments(new THREE.EdgesGeometry(innerOctGeo), lineMat));
            primaryGroup.add(innerOct);
          }
        } else if (spec.category === 'network-node') {
          var nSphereGeo = new THREE.SphereGeometry(0.17, 16, 16);
          var nSphere = new THREE.Mesh(nSphereGeo, mat);
          primaryGroup.add(nSphere);

          var nHexGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.06, 6, 1, true);
          nHexGeo.rotateX(Math.PI / 2);
          var nHexWire = new THREE.LineSegments(new THREE.EdgesGeometry(nHexGeo), lineMat);
          nHexWire.rotation.y = Math.PI / 4;
          primaryGroup.add(nHexWire);
        } else if (spec.category === 'modular-block') {
          primaryGroup.rotation.y = Math.PI / 4;
          var isApex = spec.id === 'block-foundation-opportunities';
          var bw = isApex ? 1.15 : 0.86;
          var bh = isApex ? 0.95 : 1.68;
          var bd = isApex ? 1.15 : 0.86;
          mat.opacity = 0.54;
          mat.emissiveIntensity = 0.38;
          var blkGeo = new THREE.BoxGeometry(bw, bh, bd);
          var blkMesh = new THREE.Mesh(blkGeo, mat);
          blkMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(blkGeo), lineMat));
          primaryGroup.add(blkMesh);
          var innerColGeo = new THREE.BoxGeometry(bw * 0.38, bh * 0.82, bd * 0.38);
          var innerColMesh = new THREE.Mesh(innerColGeo, new THREE.MeshBasicMaterial({ color: spec.primaryColor, transparent: true, opacity: 0.85 }));
          primaryGroup.add(innerColMesh);
        } else if (spec.category === 'dashboard-panel') {
          var isLeft = spec.position[0] < 0;
          primaryGroup.rotation.y = isLeft ? Math.PI / 4.6 : -Math.PI / 4.6;
          var pw = 3.7;
          var ph = 2.2;
          var pGeo = new THREE.BoxGeometry(pw, ph, 0.06);
          mat.color.set('#081821');
          mat.emissive.set('#07222e');
          mat.opacity = 0.84;
          mat.emissiveIntensity = 0.38;
          var pMesh = new THREE.Mesh(pGeo, mat);
          pMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(pGeo), lineMat));
          primaryGroup.add(pMesh);

          if (spec.id === 'panel-student-intelligence') {
            var rGeo = new THREE.RingGeometry(0.32, 0.48, 28, 1, 0, Math.PI * 1.6);
            var rMesh = new THREE.Mesh(rGeo, new THREE.MeshBasicMaterial({ color: '#00E6A0', side: THREE.DoubleSide }));
            rMesh.position.set(-1.05, -0.1, 0.045);
            primaryGroup.add(rMesh);
            var rGeo2 = new THREE.RingGeometry(0.32, 0.48, 28, 1, Math.PI * 1.65, Math.PI * 0.3);
            var rMesh2 = new THREE.Mesh(rGeo2, new THREE.MeshBasicMaterial({ color: '#12DCE8', side: THREE.DoubleSide }));
            rMesh2.position.set(-1.05, -0.1, 0.046);
            primaryGroup.add(rMesh2);

            var hBars = [0.95, 0.72, 0.86, 0.6, 0.78];
            hBars.forEach(function (bw, bi) {
              var hbGeo = new THREE.BoxGeometry(bw, 0.09, 0.02);
              var hbMat = new THREE.MeshBasicMaterial({ color: bi % 2 === 0 ? '#00E6A0' : '#12DCE8' });
              var hbMesh = new THREE.Mesh(hbGeo, hbMat);
              hbMesh.position.set(-0.2 + bw / 2, 0.36 - bi * 0.2, 0.045);
              primaryGroup.add(hbMesh);
            });
          } else {
            var cNodes = [[-1.3, 0.25, 0.08], [-0.7, -0.35, 0.12], [-0.15, 0.42, 0.1], [0.4, -0.22, 0.12], [0.95, 0.35, 0.08], [1.4, -0.25, 0.1]];
            var dGeo = new THREE.SphereGeometry(0.075, 8, 8);
            cNodes.forEach(function (cn, ci) {
              var dm = new THREE.Mesh(dGeo, new THREE.MeshBasicMaterial({ color: ci % 2 === 0 ? '#00E6A0' : '#12DCE8' }));
              dm.position.set(cn[0], cn[1], cn[2]);
              primaryGroup.add(dm);
            });
            var cLinePts = [
              new THREE.Vector3(-1.3, 0.25, 0.08), new THREE.Vector3(-0.7, -0.35, 0.12),
              new THREE.Vector3(-1.3, 0.25, 0.08), new THREE.Vector3(-0.15, 0.42, 0.1),
              new THREE.Vector3(-0.7, -0.35, 0.12), new THREE.Vector3(-0.15, 0.42, 0.1),
              new THREE.Vector3(-0.15, 0.42, 0.1), new THREE.Vector3(0.4, -0.22, 0.12),
              new THREE.Vector3(-0.7, -0.35, 0.12), new THREE.Vector3(0.4, -0.22, 0.12),
              new THREE.Vector3(-0.15, 0.42, 0.1), new THREE.Vector3(0.95, 0.35, 0.08),
              new THREE.Vector3(0.4, -0.22, 0.12), new THREE.Vector3(0.95, 0.35, 0.08),
              new THREE.Vector3(0.95, 0.35, 0.08), new THREE.Vector3(1.4, -0.25, 0.1),
              new THREE.Vector3(0.4, -0.22, 0.12), new THREE.Vector3(1.4, -0.25, 0.1)
            ];
            var cLineGeo = new THREE.BufferGeometry().setFromPoints(cLinePts);
            primaryGroup.add(new THREE.LineSegments(cLineGeo, lineMat));
          }
        }

        var hitGeo = new THREE.SphereGeometry(spec.hitRadius, 12, 12);
        var hitMat = new THREE.MeshBasicMaterial({ visible: false });
        var hitMesh = new THREE.Mesh(hitGeo, hitMat);
        hitMesh.userData.interactableId = spec.id;
        rootGroup.add(hitMesh);
        hitMeshes.push(hitMesh);

        runtimeRegistry.set(spec.id, {
          spec: spec,
          state: 'IDLE',
          hoverFactor: 0,
          selectFactor: 0,
          rootGroup: rootGroup,
          primaryMesh: primaryGroup,
          hitMesh: hitMesh,
          material: mat,
          lineMaterial: lineMat,
          basePosition: rootGroup.position.clone(),
          baseScale: { x: primaryGroup.scale.x, y: primaryGroup.scale.y, z: primaryGroup.scale.z },
          baseRotation: { x: primaryGroup.rotation.x, y: primaryGroup.rotation.y, z: primaryGroup.rotation.z },
          baseEmissiveIntensity: 0.55
        });
      });

      NETWORK_EDGES.forEach(function (edge) {
        var p1 = new THREE.Vector3(edge.fromPos[0], edge.fromPos[1], edge.fromPos[2]);
        var p2 = new THREE.Vector3(edge.toPos[0], edge.toPos[1], edge.toPos[2]);
        var mid = p1.clone().lerp(p2, 0.5);
        mid.y += 0.18;

        var lGeo = new THREE.BufferGeometry().setFromPoints([p1, mid, p2]);
        var lMat = new THREE.LineBasicMaterial({ color: edge.color, transparent: true, opacity: 0.54 });
        var line = new THREE.Line(lGeo, lMat);
        talentCoreRoot.add(line);
        edgeVisuals.push({
          id: edge.id,
          fromId: edge.fromId,
          toId: edge.toId,
          material: lMat,
          baseOpacity: 0.54
        });

        var curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
        var pMesh = new THREE.Mesh(packetGeo, new THREE.MeshBasicMaterial({ color: edge.color }));
        talentCoreRoot.add(pMesh);
        pulsePackets.push({
          mesh: pMesh,
          curve: curve,
          speed: edge.speed * 0.42,
          progress: edge.phase,
          fromId: edge.fromId,
          toId: edge.toId
        });
      });

      // Companion Digital River Valley scene
      (function buildRiverValleyCompanion() {
        var rCurvePts = [
          new THREE.Vector3(0, -1.6, 16),
          new THREE.Vector3(-3.5, -1.6, 6),
          new THREE.Vector3(3.2, -1.6, -4),
          new THREE.Vector3(-2.4, -1.6, -16),
          new THREE.Vector3(0, -1.6, -28)
        ];
        var rCurve = new THREE.CatmullRomCurve3(rCurvePts);
        var rTubeGeo = new THREE.TubeGeometry(rCurve, 80, 1.15, 8, false);
        rTubeGeo.scale(1.0, 0.12, 1.0);
        var rMat = new THREE.MeshStandardMaterial({
          color: '#00E6A0',
          emissive: '#00E6A0',
          emissiveIntensity: 0.75,
          roughness: 0.15,
          metalness: 0.3
        });
        riverValleyRoot.add(new THREE.Mesh(rTubeGeo, rMat));

        for (var side = -1; side <= 1; side += 2) {
          for (var tier = 0; tier < 4; tier++) {
            var bankGeo = new THREE.BoxGeometry(3.2, 0.5 + tier * 0.55, 42);
            var bankMesh = new THREE.Mesh(bankGeo, tier % 2 === 0 ? darkFoundationMat : raisedMetallicMat);
            bankMesh.position.set(side * (4.5 + tier * 2.8), -1.8 + tier * 0.4, -6);
            bankMesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(bankGeo), tier % 2 === 0 ? emeraldEdgeMat : cyanEdgeMat));
            riverValleyRoot.add(bankMesh);
          }
        }
      })();

      var camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 180);
      var currentTarget = new THREE.Vector3(0, 2.2, 0);
      camera.position.set(0.0, 8.2, 22.8);
      camera.lookAt(currentTarget);

      var posCurve = new THREE.CatmullRomCurve3(
        VIEWPOINT_ORDER.map(function (id) {
          var p = VIEWPOINTS[id].position;
          return new THREE.Vector3(p[0], p[1], p[2]);
        }),
        false,
        'catmullrom',
        0.35
      );
      var tgtCurve = new THREE.CatmullRomCurve3(
        VIEWPOINT_ORDER.map(function (id) {
          var t = VIEWPOINTS[id].target;
          return new THREE.Vector3(t[0], t[1], t[2]);
        }),
        false,
        'catmullrom',
        0.35
      );

      var navState = {
        targetProgress: 0.0,
        currentProgress: 0.0,
        activeViewpoint: 'establishing',
        lastInputSource: 'initial',
        isAutoTouring: false,
        isPaused: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        orbitYaw: 0.0,
        hoveredId: null,
        selectedId: null,
        activeEnvironment: 'talent-network-core',
        activeRoute: 'home',
        domainFilter: 'all'
      };

      var raycaster = new THREE.Raycaster();
      var pointerNdc = new THREE.Vector2();

  navState.reducedMotion = reducedMotion;

  var raycaster = new THREE.Raycaster();
  var pointerNdc = new THREE.Vector2();
  var isDragging = false;
  var dragMoved = false;
  var dragStartX = 0;
  var dragStartY = 0;

  function getClosestViewpointId(prog) {
    var best = 'establishing';
    var minD = 999;
    VIEWPOINT_ORDER.forEach(function (id) {
      var d = Math.abs(VIEWPOINTS[id].progress - prog);
      if (d < minD) {
        minD = d;
        best = id;
      }
    });
    return best;
  }

      function stepSimulation(dt) {
        if (!navState.isPaused) {
          var tScale = navState.reducedMotion ? 0.15 : 1.0;
          uniforms.uTime.value += dt * tScale;

          if (navState.isAutoTouring) {
            var nextP = navState.targetProgress + dt * 0.065;
            navState.targetProgress = nextP > 1.0 ? 0.0 : nextP;
            navState.lastInputSource = 'auto-tour';
          }
        }

        var navDamp = navState.reducedMotion ? 18.0 : 6.5;
        var navAlpha = 1.0 - Math.exp(-navDamp * dt);
        navState.currentProgress += (navState.targetProgress - navState.currentProgress) * navAlpha;
        if (Math.abs(navState.targetProgress - navState.currentProgress) < 0.0002) {
          navState.currentProgress = navState.targetProgress;
        }

        var selEntry = navState.selectedId ? runtimeRegistry.get(navState.selectedId) : null;
        var hovEntry = navState.hoveredId ? runtimeRegistry.get(navState.hoveredId) : null;
        var connectedSet = new Set(
          (selEntry && selEntry.spec.connectedIds) ||
          (hovEntry && hovEntry.spec.connectedIds) ||
          []
        );

        var objAlpha = 1.0 - Math.exp(-(navState.reducedMotion ? 16.0 : 8.5) * dt);
        runtimeRegistry.forEach(function (obj, id) {
          var isSel = id === navState.selectedId;
          var isHov = id === navState.hoveredId;
          var isRel = connectedSet.has(id);

          var tHov = isHov || isRel ? 1.0 : 0.0;
          var tSel = isSel ? 1.0 : 0.0;
          obj.hoverFactor += (tHov - obj.hoverFactor) * objAlpha;
          obj.selectFactor += (tSel - obj.selectFactor) * objAlpha;

          if (isSel) {
            obj.state = obj.selectFactor > 0.82 ? 'FOCUSED' : 'SELECTED';
          } else if (isHov) {
            obj.state = 'HOVER';
          } else if (obj.selectFactor > 0.04 || obj.hoverFactor > 0.04) {
            obj.state = 'EXITING';
          } else {
            obj.state = 'IDLE';
          }

          var isPanel = obj.spec.category === 'dashboard-panel';
          var lift = isPanel ? 0 : obj.hoverFactor * 0.16 + obj.selectFactor * 0.25;
          obj.rootGroup.position.set(
            obj.basePosition.x,
            obj.basePosition.y + lift,
            obj.basePosition.z
          );

          var sBoost = isPanel
            ? 1.0 + obj.hoverFactor * 0.03 + obj.selectFactor * 0.05
            : 1.0 + obj.hoverFactor * 0.08 + obj.selectFactor * 0.14;
          obj.primaryMesh.scale.set(
            obj.baseScale.x * sBoost,
            obj.baseScale.y * sBoost,
            obj.baseScale.z * sBoost
          );

          if (!isPanel) {
            var rotOff = obj.selectFactor * 0.35 + obj.hoverFactor * 0.12;
            obj.primaryMesh.rotation.set(
              obj.baseRotation.x,
              obj.baseRotation.y + rotOff,
              obj.baseRotation.z
            );
          }

          obj.material.emissiveIntensity =
            obj.baseEmissiveIntensity + obj.hoverFactor * 0.45 + obj.selectFactor * 0.75;
        });

        var activeId = navState.selectedId || navState.hoveredId;
        edgeVisuals.forEach(function (ev) {
          var isConn = activeId && (ev.fromId === activeId || ev.toId === activeId);
          var tOp = isConn ? 0.98 : activeId ? 0.25 : ev.baseOpacity;
          ev.material.opacity += (tOp - ev.material.opacity) * Math.min(1, dt * 8);
        });

        pulsePackets.forEach(function (pkt) {
          var boost = activeId && (pkt.fromId === activeId || pkt.toId === activeId) ? 1.85 : 1.0;
          if (!navState.isPaused && !navState.reducedMotion) {
            pkt.progress = (pkt.progress + dt * pkt.speed * boost) % 1.0;
          }
          pkt.mesh.position.copy(pkt.curve.getPointAt(pkt.progress));
        });

        var desiredPos, desiredTarget;
        if (selEntry) {
          desiredPos = new THREE.Vector3(
            selEntry.spec.focusCameraPosition[0],
            selEntry.spec.focusCameraPosition[1],
            selEntry.spec.focusCameraPosition[2]
          );
          desiredTarget = new THREE.Vector3(
            selEntry.spec.focusCameraTarget[0],
            selEntry.spec.focusCameraTarget[1],
            selEntry.spec.focusCameraTarget[2]
          );
        } else {
          var cp = Math.max(0.0, Math.min(1.0, navState.currentProgress));
          desiredPos = posCurve.getPointAt(cp);
          desiredTarget = tgtCurve.getPointAt(cp);
        }

        var aspect = camera.aspect;
        if (aspect < 0.95) {
          var pull = 1.0 + (0.95 - aspect) * 0.42;
          var rel = desiredPos.clone().sub(desiredTarget).multiplyScalar(pull);
          desiredPos = desiredTarget.clone().add(rel);
        }

        if (Math.abs(navState.orbitYaw) > 0.001) {
          var offsetVec = desiredPos.clone().sub(desiredTarget);
          offsetVec.applyAxisAngle(new THREE.Vector3(0, 1, 0), navState.orbitYaw);
          desiredPos = desiredTarget.clone().add(offsetVec);
        }

        var camAlpha = 1.0 - Math.exp(-(navState.reducedMotion ? 20.0 : 6.0) * dt);
        camera.position.lerp(desiredPos, camAlpha);
        currentTarget.lerp(desiredTarget, camAlpha);
        camera.lookAt(currentTarget);
      }



  return {
    envId: 'env-02-talent-network-core',
    scene,
    camera,
    stepSimulation: function (dt) {
      stepSimulation(Math.max(0.001, Math.min(dt, 0.1)));
      navState.activeViewpoint = getClosestViewpointId(navState.currentProgress);
    },
    handleResize: function (w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    handleWheel: function (e) {
      var sign = Math.sign(e.deltaY);
      if (sign !== 0) {
        var step = sign * Math.min(0.12, Math.max(0.015, Math.abs(e.deltaY) * 0.0009));
        navState.targetProgress = Math.max(0, Math.min(1, navState.targetProgress + step));
        navState.selectedId = null;
        navState.lastInputSource = 'wheel';
        onStateChange?.();
      }
    },
    handlePointerDown: function (e) {
      if (e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    },
    handlePointerMove: function (e, w, h, isInteractiveDom) {
      if (isDragging) {
        var dx = e.clientX - dragStartX;
        var dy = e.clientY - dragStartY;
        if (Math.hypot(dx, dy) > 5) dragMoved = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        navState.targetProgress = Math.max(0, Math.min(1, navState.targetProgress - dy / Math.max(320, h) * 1.15));
        navState.orbitYaw = Math.max(-0.55, Math.min(0.55, navState.orbitYaw - dx * 0.0032));
        navState.lastInputSource = 'drag';
        onStateChange?.();
        return;
      }
      if (isInteractiveDom) {
        if (navState.hoveredId) {
          navState.hoveredId = null;
          onStateChange?.();
        }
        return;
      }
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -((e.clientY / Math.max(1, h)) * 2 - 1);
      raycaster.setFromCamera(pointerNdc, camera);
      var hits = raycaster.intersectObjects(hitMeshes, false);
      var hitId = hits.length > 0 ? hits[0].object.userData.interactableId : null;
      if (navState.hoveredId !== hitId) {
        navState.hoveredId = hitId;
        onStateChange?.();
      }
    },
    handlePointerUp: function (e, w, h, isInteractiveDom) {
      var wasDrag = dragMoved;
      isDragging = false;
      dragMoved = false;
      if (wasDrag || isInteractiveDom) return;
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -((e.clientY / Math.max(1, h)) * 2 - 1);
      raycaster.setFromCamera(pointerNdc, camera);
      var hits = raycaster.intersectObjects(hitMeshes, false);
      var hitId = hits.length > 0 ? hits[0].object.userData.interactableId : null;
      if (hitId) {
        navState.selectedId = navState.selectedId === hitId ? null : hitId;
        navState.lastInputSource = 'object-focus';
        onStateChange?.();
      }
    },
    handleKeyDown: function (e) {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        navState.targetProgress = Math.min(1, navState.targetProgress + 0.08);
        onStateChange?.();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        navState.targetProgress = Math.max(0, navState.targetProgress - 0.08);
        onStateChange?.();
      } else if (e.key === 'Escape') {
        navState.selectedId = null;
        onStateChange?.();
      }
    },
    handleKeyUp: function () {},
    getViewpoints: function () {
      return VIEWPOINT_ORDER.map(function (id) {
        return {
          id: id,
          label: VIEWPOINTS[id].label,
          progress: VIEWPOINTS[id].progress,
          description: VIEWPOINTS[id].description,
        };
      });
    },
    getActiveViewpointId: function () {
      return getClosestViewpointId(navState.currentProgress);
    },
    goToViewpoint: function (id) {
      var vp = VIEWPOINTS[id] || VIEWPOINTS.establishing;
      navState.targetProgress = vp.progress;
      navState.selectedId = null;
      navState.orbitYaw = 0;
      navState.lastInputSource = 'viewpoint-preset';
      onStateChange?.();
    },
    setProgress: function (p) {
      navState.targetProgress = Math.max(0, Math.min(1, p));
      navState.selectedId = null;
      onStateChange?.();
    },
    getProgress: function () {
      return navState.currentProgress;
    },
    hoverObject: function (id) {
      navState.hoveredId = id && runtimeRegistry.has(id) ? id : null;
      onStateChange?.();
      return navState.hoveredId ? runtimeRegistry.get(navState.hoveredId).spec : null;
    },
    selectObject: function (id) {
      navState.selectedId = id && runtimeRegistry.has(id) ? id : null;
      onStateChange?.();
      return navState.selectedId ? runtimeRegistry.get(navState.selectedId).spec : null;
    },
    getHoveredObject: function () {
      if (!navState.hoveredId) return null;
      var spec = runtimeRegistry.get(navState.hoveredId)?.spec;
      return spec ? {
        id: spec.id,
        title: spec.title,
        subtitle: spec.subtitle,
        categoryLabel: spec.categoryLabel,
        route: spec.route,
        accentColor: spec.primaryColor,
        summary: spec.summary,
      } : null;
    },
    getSelectedObject: function () {
      if (!navState.selectedId) return null;
      var spec = runtimeRegistry.get(navState.selectedId)?.spec;
      return spec ? {
        id: spec.id,
        title: spec.title,
        subtitle: spec.subtitle,
        categoryLabel: spec.categoryLabel,
        route: spec.route,
        accentColor: spec.primaryColor,
        summary: spec.summary,
        position: spec.position,
        heightOffset: 1.4,
      } : null;
    },
    getInteractiveObjects: function () {
      return INTERACTABLE_OBJECTS.map(function (s) {
        return {
          id: s.id,
          title: s.title,
          subtitle: s.subtitle,
          categoryLabel: s.categoryLabel,
          route: s.route,
          accentColor: s.primaryColor,
          summary: s.summary,
        };
      });
    },
    getState: function () {
      return {
        environmentId: 'env-02-talent-network-core',
        environmentName: 'Talent Network Core',
        cameraPos: [Number(camera.position.x.toFixed(3)), Number(camera.position.y.toFixed(3)), Number(camera.position.z.toFixed(3))],
        cameraTarget: [Number(currentTarget.x.toFixed(3)), Number(currentTarget.y.toFixed(3)), Number(currentTarget.z.toFixed(3))],
        fov: Number(camera.fov.toFixed(2)),
        currentProgress: Number(navState.currentProgress.toFixed(4)),
        targetProgress: Number(navState.targetProgress.toFixed(4)),
        activeViewpoint: getClosestViewpointId(navState.currentProgress),
        hoveredObjectId: navState.hoveredId,
        selectedObjectId: navState.selectedId,
        interactableCount: INTERACTABLE_OBJECTS.length,
      };
    },
    dispose: function () {
      runtimeRegistry.clear();
    },
  };
}

// ============================================================================
// ENVIRONMENT 03: RECRUITMENT CONNECTIVITY GRID (EXACT ORIGINAL FROM HTML)
// ============================================================================
export function createRecruitmentConnectivityGridScene(
  width: number,
  height: number,
  reducedMotion: boolean,
  onStateChange?: () => void
): OriginalSceneInstance {
      var PALETTE = {
        deepEnvironment: 0x122c34,
        darkPlatform: 0x0b1821,
        raisedStructures: 0x112832,
        emeraldNetwork: 0x00e6a0,
        brightGreen: 0x28f5b4,
        cyanConnections: 0x12dce8,
        secondaryBlue: 0x258dc4,
        goldEnergy: 0xf2b65c
      };

      var CAMERA_WAYPOINTS = [
        {
          id: 'establishing',
          label: '1. Full Network Establishing View',
          progress: 0.0,
          position: [23.5, 20.5, 25.5],
          target: [0.0, 1.2, 0.0],
          summary: 'High-angle isometric establishing perspective matching the reference composition.'
        },
        {
          id: 'central-junction',
          label: '2. Central Branching Junction',
          progress: 0.17,
          position: [7.8, 6.8, 9.6],
          target: [1.4, 1.2, 1.4],
          summary: 'Focused view of the central crystalline cube intersection and southeastern spherical conduit relay.'
        },
        {
          id: 'left-cluster',
          label: '3. Left Cluster · Student Network',
          progress: 0.34,
          position: [-16.2, 8.4, 9.2],
          target: [-9.8, 1.3, 2.2],
          summary: 'Student constellation: Profiles, Resume Builder, Preview, ATS Analysis, Discovery, and Applications.'
        },
        {
          id: 'right-cluster',
          label: '4. Right Cluster · Recruiter Network',
          progress: 0.50,
          position: [18.4, 8.8, 7.6],
          target: [10.8, 1.8, -0.8],
          summary: 'Recruiter constellation with elevated polyhedral lattice tower, Job Posting, and Candidate Discovery.'
        },
        {
          id: 'foreground-cluster',
          label: '5. Foreground Cluster · Opportunity Network',
          progress: 0.67,
          position: [5.2, 6.2, 20.8],
          target: [-1.8, 1.0, 10.6],
          summary: 'Close-range interactive platform deck for Jobs, Companies, Eligibility Rules, and Descriptions.'
        },
        {
          id: 'background-zone',
          label: '6. Background Zone · Placement & Monitors',
          progress: 0.83,
          position: [2.8, 8.8, -2.5],
          target: [-2.0, 4.8, -13.2],
          summary: 'Rear transparent glass architecture and 3 angled 3D monitoring screens for Placement Teams.'
        },
        {
          id: 'elevated-view',
          label: '7. Elevated Network Topology View',
          progress: 1.0,
          position: [0.2, 33.5, 11.5],
          target: [0.0, 0.0, -0.5],
          summary: 'High-altitude architectural overview of all 5 connected regions and branching conduits.'
        }
      ];

      var FEATURE_NODES = [
        // REGION 1: CENTRAL JUNCTION
        {
          id: 'node-central-junction',
          label: 'Central Connectivity Core',
          domain: 'junction',
          region: 'Region 1 · Central Junction',
          route: '/recruiter',
          role: 'Authenticated',
          pos: [0, 1.45, 0],
          kind: 'junction-cube',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Primary 4-way branching intersection linking Student, Recruiter, Opportunity, and Placement conduits through a multi-layered holographic glass cube.',
          peers: ['node-energy-sphere', 'node-student-profile', 'node-recruiter-post', 'node-opp-jobs', 'node-place-coord'],
          schema: ['router_node_id', 'active_domain_routes', 'rbac_session_state']
        },
        {
          id: 'node-energy-sphere',
          label: 'High-Throughput Conduit Relay',
          domain: 'junction',
          region: 'Region 1 · Central Junction',
          route: '/my-jobs',
          role: 'Authenticated',
          pos: [6.4, 1.55, 6.4],
          kind: 'energy-sphere',
          color: '#F2B65C',
          hex: 0xf2b65c,
          description: 'Luminous golden-emerald spherical accelerator along the southeastern trunk coordinating application packets and eligibility verification.',
          peers: ['node-central-junction', 'node-opp-jobs', 'node-recruiter-applicants'],
          schema: ['dispatch_channel', 'eligibility_gate', 'workflow_stage']
        },

        // REGION 2: LEFT CLUSTER (STUDENT NETWORK)
        {
          id: 'node-student-profile',
          label: 'Student Profiles',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/profile',
          role: 'Student',
          pos: [-7.8, 1.25, 1.2],
          kind: 'hex-prism',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Verified academic profile, department credentials, CGPA clearance, and skill portfolio registry.',
          peers: ['node-central-junction', 'node-resume-builder', 'node-job-discovery', 'node-ats-analysis'],
          schema: ['student_id', 'department_code', 'verified_cgpa', 'skills_list']
        },
        {
          id: 'node-resume-builder',
          label: 'Resume Builder',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/resume',
          role: 'Student',
          pos: [-11.4, 1.5, 2.8],
          kind: 'octa-core',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Structured resume authoring studio with real-time section validation and campus template compliance.',
          peers: ['node-student-profile', 'node-resume-preview', 'node-ats-analysis'],
          schema: ['resume_doc_id', 'education_entries', 'project_blocks', 'updated_at']
        },
        {
          id: 'node-resume-preview',
          label: 'Resume Preview',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/resume',
          role: 'Student',
          pos: [-14.2, 1.2, 0.4],
          kind: 'hex-prism',
          color: '#12DCE8',
          hex: 0x12dce8,
          description: 'Document layout verifier ensuring clean pagination and formatting before submitting to job requisitions.',
          peers: ['node-resume-builder', 'node-ats-analysis'],
          schema: ['preview_snapshot', 'page_count', 'export_status']
        },
        {
          id: 'node-ats-analysis',
          label: 'Resume ATS Analysis',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/resume',
          role: 'Student',
          pos: [-10.8, 1.85, -1.8],
          kind: 'icosa-cage',
          color: '#F2B65C',
          hex: 0xf2b65c,
          description: 'Deterministic ATS parser evaluating resume structure, role competency alignment, and required keywords.',
          peers: ['node-resume-builder', 'node-resume-preview', 'node-student-profile'],
          schema: ['ats_parse_tree', 'matched_competencies', 'missing_requirements']
        },
        {
          id: 'node-job-discovery',
          label: 'Job Discovery',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/jobs',
          role: 'Student',
          pos: [-6.8, 1.2, 4.8],
          kind: 'hex-prism',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Eligibility-aware campus opportunity explorer connecting student profiles directly to open roles.',
          peers: ['node-student-profile', 'node-job-applications', 'node-opp-jobs'],
          schema: ['job_filter_query', 'eligible_branches', 'open_windows']
        },
        {
          id: 'node-job-applications',
          label: 'Job Applications',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/my-applications',
          role: 'Student',
          pos: [-9.6, 1.15, 6.8],
          kind: 'octa-core',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Application submission node binding a student resume version to a target employer requisition.',
          peers: ['node-job-discovery', 'node-app-tracking'],
          schema: ['application_id', 'job_id', 'resume_version_id', 'submitted_at']
        },
        {
          id: 'node-app-tracking',
          label: 'Application Tracking',
          domain: 'student',
          region: 'Region 2 · Left Cluster (Student)',
          route: '/my-applications',
          role: 'Student',
          pos: [-13.2, 1.35, 5.6],
          kind: 'hex-prism',
          color: '#12DCE8',
          hex: 0x12dce8,
          description: 'Real-time status tracker reflecting recruiter review stages and placement cell schedules.',
          peers: ['node-job-applications'],
          schema: ['tracking_timeline', 'current_stage', 'next_action_date']
        },

        // REGION 3: RIGHT CLUSTER (RECRUITER NETWORK)
        {
          id: 'node-recruiter-profile',
          label: 'Recruiter Profiles',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/recruiter',
          role: 'Recruiter',
          pos: [8.4, 1.3, -1.2],
          kind: 'hex-prism',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Verified employer organization profile, hiring delegates, and campus partnership credentials.',
          peers: ['node-central-junction', 'node-recruiter-post', 'node-recruiter-workflows'],
          schema: ['employer_id', 'organization_name', 'verification_tier']
        },
        {
          id: 'node-recruiter-post',
          label: 'Job Posting Lattice Tower',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/post-job',
          role: 'Recruiter',
          pos: [10.8, 2.35, -4.2],
          kind: 'crystal-pylon',
          color: '#F2B65C',
          hex: 0xf2b65c,
          description: 'Elevated polyhedral lattice tower governing new job requisitions, role criteria, and eligibility rules.',
          peers: ['node-central-junction', 'node-recruiter-profile', 'node-recruiter-manage'],
          schema: ['requisition_id', 'role_title', 'eligibility_criteria', 'Compensation_band']
        },
        {
          id: 'node-recruiter-manage',
          label: 'Job Management',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/my-jobs',
          role: 'Recruiter',
          pos: [14.2, 1.4, -0.8],
          kind: 'octa-core',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Active requisition console controlling application deadlines, intake caps, and evaluation rubrics.',
          peers: ['node-recruiter-post', 'node-recruiter-applicants'],
          schema: ['active_jobs_list', 'window_status', 'rubric_schema']
        },
        {
          id: 'node-recruiter-applicants',
          label: 'Applicant Management',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/my-jobs',
          role: 'Recruiter',
          pos: [11.8, 1.25, 2.5],
          kind: 'hex-prism',
          color: '#12DCE8',
          hex: 0x12dce8,
          description: 'Structured applicant evaluation workbench displaying verified student submissions and ATS compatibility.',
          peers: ['node-recruiter-manage', 'node-candidate-discovery', 'node-energy-sphere'],
          schema: ['applicant_queue', 'shortlist_flags', 'evaluator_notes']
        },
        {
          id: 'node-candidate-discovery',
          label: 'Candidate Discovery',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/recruiter',
          role: 'Recruiter',
          pos: [15.6, 1.5, 1.8],
          kind: 'icosa-cage',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Role-permissioned candidate search across opt-in campus cohorts filtered by verified skills.',
          peers: ['node-recruiter-applicants', 'node-recruiter-workflows'],
          schema: ['candidate_filter', 'skill_taxonomy_match', 'opt_in_consent']
        },
        {
          id: 'node-recruiter-workflows',
          label: 'Recruitment Workflows',
          domain: 'recruiter',
          region: 'Region 3 · Right Cluster (Recruiter)',
          route: '/recruiter',
          role: 'Recruiter',
          pos: [13.6, 1.3, 4.8],
          kind: 'octa-core',
          color: '#F2B65C',
          hex: 0xf2b65c,
          description: 'Stage progression engine coordinating screening, technical evaluation rounds, and final selection handoffs.',
          peers: ['node-candidate-discovery', 'node-recruiter-profile'],
          schema: ['workflow_pipeline_id', 'stage_transitions', 'placement_sync']
        },

        // REGION 4: FOREGROUND CLUSTER (OPPORTUNITY NETWORK)
        {
          id: 'node-opp-jobs',
          label: 'Opportunities · Jobs Hub',
          domain: 'opportunity',
          region: 'Region 4 · Foreground Cluster (Opportunities)',
          route: '/jobs',
          role: 'Authenticated',
          pos: [-2.2, 1.25, 8.8],
          kind: 'hex-prism',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Close-range foreground hub indexing verified full-time and internship roles across the campus grid.',
          peers: ['node-central-junction', 'node-energy-sphere', 'node-opp-companies', 'node-opp-eligibility'],
          schema: ['job_posting_id', 'department_scope', 'role_category']
        },
        {
          id: 'node-opp-companies',
          label: 'Participating Companies',
          domain: 'opportunity',
          region: 'Region 4 · Foreground Cluster (Opportunities)',
          route: '/jobs',
          role: 'Authenticated',
          pos: [-5.6, 1.15, 10.8],
          kind: 'octa-core',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Registry of verified hiring organizations and industry partners approved by the placement office.',
          peers: ['node-opp-jobs', 'node-opp-descriptions'],
          schema: ['company_id', 'industry_sector', 'campus_drive_history']
        },
        {
          id: 'node-opp-eligibility',
          label: 'Eligibility Requirements',
          domain: 'opportunity',
          region: 'Region 4 · Foreground Cluster (Opportunities)',
          route: '/jobs',
          role: 'Authenticated',
          pos: [1.4, 1.35, 11.2],
          kind: 'icosa-cage',
          color: '#F2B65C',
          hex: 0xf2b65c,
          description: 'Automated academic and prerequisite rule verifier matching degree programs to job criteria.',
          peers: ['node-opp-jobs', 'node-opp-details'],
          schema: ['min_cgpa_rule', 'allowed_branches', 'backlog_policy']
        },
        {
          id: 'node-opp-descriptions',
          label: 'Job Descriptions',
          domain: 'opportunity',
          region: 'Region 4 · Foreground Cluster (Opportunities)',
          route: '/jobs',
          role: 'Authenticated',
          pos: [-3.2, 1.1, 13.6],
          kind: 'hex-prism',
          color: '#12DCE8',
          hex: 0x12dce8,
          description: 'Detailed role specifications, responsibilities, required technical stack, and evaluation format.',
          peers: ['node-opp-companies', 'node-opp-details'],
          schema: ['role_summary', 'technical_requirements', 'location_mode']
        },
        {
          id: 'node-opp-details',
          label: 'Application Details',
          domain: 'opportunity',
          region: 'Region 4 · Foreground Cluster (Opportunities)',
          route: '/my-applications',
          role: 'Authenticated',
          pos: [0.6, 1.15, 14.2],
          kind: 'octa-core',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Submission requirements, document checklist, and timeline milestones for each campus opportunity.',
          peers: ['node-opp-eligibility', 'node-opp-descriptions'],
          schema: ['submission_deadline', 'required_attachments', 'drive_schedule']
        },

        // REGION 5: BACKGROUND INFORMATION ZONE (PLACEMENT NETWORK & 3D MONITORS)
        {
          id: 'node-place-coord',
          label: 'Placement Coordination Core',
          domain: 'placement',
          region: 'Region 5 · Rear Zone (Placement)',
          route: '/placement',
          role: 'Placement Officer',
          pos: [-1.4, 1.45, -7.2],
          kind: 'icosa-cage',
          color: '#28F5B4',
          hex: 0x28f5b4,
          description: 'Placement cell command node linking student clearance, recruiter schedules, and rear monitoring screens.',
          peers: ['node-central-junction', 'node-place-students', 'node-panel-1', 'node-panel-2', 'node-panel-3'],
          schema: ['coordination_cycle', 'officer_id', 'drive_calendar']
        },
        {
          id: 'node-place-students',
          label: 'Student Cohort Management',
          domain: 'placement',
          region: 'Region 5 · Rear Zone (Placement)',
          route: '/placement',
          role: 'Placement Officer',
          pos: [-5.4, 1.25, -8.8],
          kind: 'hex-prism',
          color: '#00E6A0',
          hex: 0x00e6a0,
          description: 'Cohort verification node managing academic transcript sign-off and placement policy compliance.',
          peers: ['node-place-coord', 'node-panel-1'],
          schema: ['cohort_batch', 'verification_status', 'eligibility_clearance']
        },
        {
          id: 'node-panel-1',
          label: 'Display Panel 01 · Cohort & Workflow Matrix',
          domain: 'placement',
          region: 'Region 5 · Rear Zone (3D Monitor)',
          route: '/placement',
          role: 'Placement Officer',
          pos: [-9.2, 5.6, -13.2],
          kind: 'display-panel',
          color: '#00E6A0',
          hex: 0x00e6a0,
          rotY: 0.22,
          description: 'Angled rear 3D digital screen rendering recruitment workflow topology and cohort schema state.',
          peers: ['node-place-coord', 'node-place-students'],
          schema: ['workflow_matrix_state', 'cohort_sync_status', 'empty_state_verified']
        },
        {
          id: 'node-panel-2',
          label: 'Display Panel 02 · Placement Reporting Console',
          domain: 'placement',
          region: 'Region 5 · Rear Zone (3D Monitor)',
          route: '/placement',
          role: 'Placement Officer',
          pos: [-1.8, 6.2, -14.6],
          kind: 'display-panel',
          color: '#F2B65C',
          hex: 0xf2b65c,
          rotY: 0.05,
          description: 'Central rear 3D holographic board displaying verified placement reporting channels (clean empty state when unpopulated).',
          peers: ['node-place-coord'],
          schema: ['report_schema_v1', 'audit_log_stream', 'verified_records_only']
        },
        {
          id: 'node-panel-3',
          label: 'Display Panel 03 · Recruitment Analytics Grid',
          domain: 'placement',
          region: 'Region 5 · Rear Zone (3D Monitor)',
          route: '/admin',
          role: 'Placement Officer',
          pos: [7.6, 5.2, -12.4],
          kind: 'display-panel',
          color: '#12DCE8',
          hex: 0x12dce8,
          rotY: -0.28,
          description: 'Right-rear 3D transparent structural screen visualizing real network connectivity across campus domains.',
          peers: ['node-place-coord'],
          schema: ['topology_nodes_25', 'active_conduits_6', 'zero_synthetic_metrics']
        }
      ];

      var PATHWAYS = [
        {
          id: 'path-nw-trunk',
          label: 'Northwest Conduit · Placement & Cohort Trunk',
          domain: 'placement',
          region: 'Primary Branching Conduit',
          route: '/placement',
          role: 'Placement Officer',
          primaryColor: '#00E6A0',
          secondaryColor: '#F2B65C',
          primaryHex: 0x00e6a0,
          secondaryHex: 0xf2b65c,
          radius: 0.16,
          speed: 1.15,
          points: [
            [0, 0.55, 0],
            [-3.8, 0.55, -3.8],
            [-8.2, 0.65, -8.2],
            [-14.5, 1.1, -14.5]
          ],
          description: 'Major northwestern trunk channel linking the Central Connectivity Core to Placement Coordination and the rear emitter.'
        },
        {
          id: 'path-se-trunk',
          label: 'Southeast Conduit · High-Throughput Accelerator Trunk',
          domain: 'junction',
          region: 'Primary Branching Conduit',
          route: '/my-jobs',
          role: 'Authenticated',
          primaryColor: '#F2B65C',
          secondaryColor: '#28F5B4',
          primaryHex: 0xf2b65c,
          secondaryHex: 0x28f5b4,
          radius: 0.19,
          speed: 1.45,
          points: [
            [0, 0.55, 0],
            [3.2, 0.65, 3.2],
            [6.4, 1.15, 6.4],
            [11.2, 0.65, 11.2],
            [16.5, 0.55, 16.5]
          ],
          description: 'Golden-emerald primary energy trunk passing through the High-Throughput Conduit Relay sphere.'
        },
        {
          id: 'path-sw-trunk',
          label: 'Southwest Conduit · Opportunity & Jobs Trunk',
          domain: 'opportunity',
          region: 'Primary Branching Conduit',
          route: '/jobs',
          role: 'Authenticated',
          primaryColor: '#F2B65C',
          secondaryColor: '#00E6A0',
          primaryHex: 0xf2b65c,
          secondaryHex: 0x00e6a0,
          radius: 0.16,
          speed: 1.1,
          points: [
            [0, 0.55, 0],
            [-1.8, 0.55, 2.6],
            [-3.8, 0.55, 6.8],
            [-8.4, 0.55, 11.8],
            [-13.8, 0.55, 16.2]
          ],
          description: 'Curved southwestern energy corridor energizing the Foreground Opportunity Cluster and Student Job Applications.'
        },
        {
          id: 'path-ne-trunk',
          label: 'Northeast Conduit · Recruiter Lattice Trunk',
          domain: 'recruiter',
          region: 'Primary Branching Conduit',
          route: '/post-job',
          role: 'Recruiter',
          primaryColor: '#00E6A0',
          secondaryColor: '#F2B65C',
          primaryHex: 0x00e6a0,
          secondaryHex: 0xf2b65c,
          radius: 0.16,
          speed: 1.25,
          points: [
            [0, 0.55, 0],
            [3.6, 0.55, -2.2],
            [8.8, 0.65, -5.2],
            [15.8, 0.75, -10.2]
          ],
          description: 'Northeastern branching conduit feeding the Recruiter Lattice Tower and Job Posting subsystem.'
        },
        {
          id: 'path-west-student',
          label: 'West Lateral Branch · Student Constellation Feeder',
          domain: 'student',
          region: 'Cluster Branch Conduit',
          route: '/profile',
          role: 'Student',
          primaryColor: '#12DCE8',
          secondaryColor: '#00E6A0',
          primaryHex: 0x12dce8,
          secondaryHex: 0x00e6a0,
          radius: 0.11,
          speed: 1.0,
          points: [
            [0, 0.55, 0],
            [-3.8, 0.55, 0.6],
            [-7.8, 0.75, 1.2],
            [-11.4, 0.95, 2.8],
            [-14.2, 0.85, 0.4]
          ],
          description: 'Dedicated cyan-emerald lateral pathway linking the central core to Student Profiles, Resume Builder, and Preview.'
        },
        {
          id: 'path-east-recruiter',
          label: 'East Lateral Branch · Recruiter Workflow Feeder',
          domain: 'recruiter',
          region: 'Cluster Branch Conduit',
          route: '/my-jobs',
          role: 'Recruiter',
          primaryColor: '#00E6A0',
          secondaryColor: '#12DCE8',
          primaryHex: 0x00e6a0,
          secondaryHex: 0x12dce8,
          radius: 0.11,
          speed: 1.05,
          points: [
            [0, 0.55, 0],
            [4.2, 0.55, 0.3],
            [8.4, 0.75, -1.2],
            [11.8, 0.85, 2.5],
            [15.6, 0.95, 1.8]
          ],
          description: 'Eastern lateral pathway feeding Recruiter Profiles, Applicant Management, and Candidate Discovery.'
        }
      ];


  var scene = new THREE.Scene();
  scene.background = new THREE.Color(PALETTE.deepEnvironment);
  scene.fog = new THREE.FogExp2(PALETTE.deepEnvironment, 0.014);
  var camera = new THREE.PerspectiveCamera(44, width / Math.max(1, height), 0.1, 180);

      var ambientLight = new THREE.AmbientLight(0x112832, 1.35);
      scene.add(ambientLight);

      var dirLight = new THREE.DirectionalLight(0xeaf3f4, 0.9);
      dirLight.position.set(18, 32, 22);
      scene.add(dirLight);

      var corePointLight = new THREE.PointLight(0x28f5b4, 2.6, 26);
      corePointLight.position.set(0, 3.2, 0);
      scene.add(corePointLight);

      var spherePointLight = new THREE.PointLight(0xf2b65c, 2.4, 20);
      spherePointLight.position.set(6.4, 2.5, 6.4);
      scene.add(spherePointLight);

      var leftClusterLight = new THREE.PointLight(0x00e6a0, 1.6, 18);
      leftClusterLight.position.set(-10.5, 3.0, 2.5);
      scene.add(leftClusterLight);

      var rightClusterLight = new THREE.PointLight(0x12dce8, 1.6, 18);
      rightClusterLight.position.set(12.0, 3.5, 0.5);
      scene.add(rightClusterLight);

      // Procedural dark metallic micro-grid texture for platform sectors
      function createPlatformGridTexture() {
        var c = document.createElement('canvas');
        c.width = 256;
        c.height = 256;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#0B1821';
        ctx.fillRect(0, 0, 256, 256);
        ctx.strokeStyle = 'rgba(18, 220, 232, 0.14)';
        ctx.lineWidth = 1;
        for (var i = 0; i <= 256; i += 32) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i, 256);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(0, i);
          ctx.lineTo(256, i);
          ctx.stroke();
        }
        ctx.strokeStyle = 'rgba(0, 230, 160, 0.25)';
        ctx.strokeRect(2, 2, 252, 252);
        var tex = new THREE.CanvasTexture(c);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(4, 4);
        return tex;
      }

      var platformTex = createPlatformGridTexture();

      // =========================================================================
      // 3. MULTI-LAYERED 3D DIGITAL PLATFORM INFRASTRUCTURE
      // =========================================================================
      var platformGroup = new THREE.Group();
      scene.add(platformGroup);

      var darkFoundationMat = new THREE.MeshStandardMaterial({
        color: PALETTE.darkPlatform,
        map: platformTex,
        metalness: 0.78,
        roughness: 0.24
      });

      var raisedStructureMat = new THREE.MeshStandardMaterial({
        color: PALETTE.raisedStructures,
        map: platformTex,
        metalness: 0.84,
        roughness: 0.18
      });

      var darkGlassDeckMat = new THREE.MeshPhysicalMaterial({
        color: 0x0d2230,
        metalness: 0.25,
        roughness: 0.1,
        transparent: true,
        opacity: 0.76,
        reflectivity: 0.9
      });

      var seamLineMat = new THREE.LineBasicMaterial({
        color: PALETTE.emeraldNetwork,
        transparent: true,
        opacity: 0.36
      });

      var cyanSeamMat = new THREE.LineBasicMaterial({
        color: PALETTE.cyanConnections,
        transparent: true,
        opacity: 0.32
      });

      var platformSectors = [
        // Deep continuous infrastructure sub-slab
        { pos: [0, -1.05, 0], size: [46, 0.7, 44], mat: darkFoundationMat, seam: cyanSeamMat },
        // Recessed cross-channel floor plates
        { pos: [0, -0.45, 0], size: [36, 0.3, 36], mat: darkFoundationMat, seam: seamLineMat },
        // Four primary quadrant blocks separated by the central luminous channels
        { pos: [-10.8, -0.05, 3.2], size: [13.5, 0.65, 12.5], mat: raisedStructureMat, seam: seamLineMat },
        { pos: [12.0, -0.02, 0.6], size: [13.5, 0.7, 13.5], mat: raisedStructureMat, seam: seamLineMat },
        { pos: [-2.2, -0.08, 11.4], size: [11.8, 0.62, 9.2], mat: raisedStructureMat, seam: cyanSeamMat },
        { pos: [-2.0, -0.04, -10.2], size: [16.5, 0.68, 8.8], mat: raisedStructureMat, seam: cyanSeamMat },
        // Outer architectural stepped terraces (foreground left/right & rear flanks)
        { pos: [-15.5, -0.25, 12.8], size: [8.2, 0.55, 7.4], mat: darkFoundationMat, seam: cyanSeamMat },
        { pos: [14.8, -0.22, 12.5], size: [8.8, 0.6, 8.2], mat: darkFoundationMat, seam: seamLineMat },
        { pos: [-15.2, -0.18, -9.8], size: [8.5, 0.62, 8.5], mat: darkFoundationMat, seam: cyanSeamMat },
        { pos: [14.5, -0.15, -10.2], size: [8.5, 0.68, 8.5], mat: darkFoundationMat, seam: seamLineMat },
        // Raised translucent dark-glass cluster decks
        { pos: [-10.6, 0.38, 2.8], size: [10.8, 0.16, 9.6], mat: darkGlassDeckMat, seam: seamLineMat },
        { pos: [12.2, 0.42, 0.5], size: [10.6, 0.16, 10.2], mat: darkGlassDeckMat, seam: cyanSeamMat },
        { pos: [-2.2, 0.34, 11.4], size: [9.4, 0.16, 7.2], mat: darkGlassDeckMat, seam: seamLineMat }
      ];

      platformSectors.forEach(function (sec) {
        var geo = new THREE.BoxGeometry(sec.size[0], sec.size[1], sec.size[2]);
        var mesh = new THREE.Mesh(geo, sec.mat);
        mesh.position.set(sec.pos[0], sec.pos[1], sec.pos[2]);
        platformGroup.add(mesh);

        var edgeGeo = new THREE.EdgesGeometry(geo);
        var edgeLines = new THREE.LineSegments(edgeGeo, sec.seam);
        edgeLines.position.copy(mesh.position);
        platformGroup.add(edgeLines);
      });

      // =========================================================================
      // 4. TRANSPARENT VERTICAL GLASS STRUCTURES (NON-CLICKABLE ARCHITECTURE)
      // =========================================================================
      var glassArchitectureGroup = new THREE.Group();
      scene.add(glassArchitectureGroup);

      var verticalGlassMat = new THREE.MeshPhysicalMaterial({
        color: 0x0c2432,
        metalness: 0.12,
        roughness: 0.08,
        transparent: true,
        opacity: 0.34,
        reflectivity: 0.92,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      var glassFrameMat = new THREE.LineBasicMaterial({
        color: PALETTE.cyanConnections,
        transparent: true,
        opacity: 0.48
      });

      var glassWalls = [
        { pos: [-16.2, 6.8, -6.5], size: [0.22, 14.0, 10.5], rotY: 0.12 },
        { pos: [-11.5, 7.6, -15.2], size: [9.5, 15.5, 0.22], rotY: 0.18 },
        { pos: [-1.8, 8.2, -16.4], size: [11.0, 16.5, 0.22], rotY: 0.04 },
        { pos: [9.2, 7.5, -14.8], size: [9.8, 15.0, 0.22], rotY: -0.22 },
        { pos: [16.8, 7.0, -7.2], size: [0.22, 14.2, 10.2], rotY: -0.14 },
        { pos: [18.2, 5.8, 4.2], size: [0.22, 12.0, 8.4], rotY: 0.0 },
        { pos: [-17.8, 5.6, 5.2], size: [0.22, 11.5, 8.2], rotY: 0.0 },
        // Translucent vertical glass enclosure column in rear-right (from reference image)
        { pos: [6.8, 5.0, -9.2], size: [3.8, 10.2, 3.8], rotY: 0.25 }
      ];

      glassWalls.forEach(function (w) {
        var geo = new THREE.BoxGeometry(w.size[0], w.size[1], w.size[2]);
        var mesh = new THREE.Mesh(geo, verticalGlassMat);
        mesh.position.set(w.pos[0], w.pos[1], w.pos[2]);
        if (w.rotY) mesh.rotation.y = w.rotY;
        glassArchitectureGroup.add(mesh);

        var edges = new THREE.EdgesGeometry(geo);
        var line = new THREE.LineSegments(edges, glassFrameMat);
        line.position.copy(mesh.position);
        line.rotation.copy(mesh.rotation);
        glassArchitectureGroup.add(line);
      });

      // =========================================================================
      // 5. CUSTOM GLSL SHADER CONDUITS & DIRECTIONAL ENERGY PACKETS
      // =========================================================================
      var conduitVertexShader = [
        'varying vec2 vUv;',
        'void main() {',
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
        '}'
      ].join('\n');

      var conduitFragmentShader = [
        'uniform float uTime;',
        'uniform float uSpeed;',
        'uniform float uHighlight;',
        'uniform vec3 uPrimaryColor;',
        'uniform vec3 uSecondaryColor;',
        'varying vec2 vUv;',
        'void main() {',
        '  float wave1 = fract(vUv.x * 3.2 - uTime * uSpeed);',
        '  float pulse1 = smoothstep(0.0, 0.16, wave1) * (1.0 - smoothstep(0.16, 0.38, wave1));',
        '  float wave2 = fract(vUv.x * 1.8 - uTime * (uSpeed * 0.7) + 0.45);',
        '  float pulse2 = smoothstep(0.0, 0.12, wave2) * (1.0 - smoothstep(0.12, 0.28, wave2));',
        '  vec3 baseCol = mix(uPrimaryColor * 0.48, uSecondaryColor * 0.68, pulse2);',
        '  vec3 glowCol = mix(uPrimaryColor, uSecondaryColor, 0.5) * (pulse1 * 2.2 + uHighlight * 1.15);',
        '  float alpha = clamp(0.62 + pulse1 * 0.38 + uHighlight * 0.28, 0.0, 1.0);',
        '  gl_FragColor = vec4(baseCol + glowCol, alpha);',
        '}'
      ].join('\n');

      var interactableObjects = [];
      var objectRegistry = {};
      var conduitControllers = [];

      PATHWAYS.forEach(function (pathDef) {
        var pts = pathDef.points.map(function (p) {
          return new THREE.Vector3(p[0], p[1], p[2]);
        });
        var curve = new THREE.CatmullRomCurve3(pts);

        var tubeGeo = new THREE.TubeGeometry(curve, 76, pathDef.radius, 12, false);
        var shaderMat = new THREE.ShaderMaterial({
          vertexShader: conduitVertexShader,
          fragmentShader: conduitFragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uSpeed: { value: pathDef.speed },
            uHighlight: { value: 0 },
            uPrimaryColor: { value: new THREE.Color(pathDef.primaryHex) },
            uSecondaryColor: { value: new THREE.Color(pathDef.secondaryHex) }
          }
        });

        var tubeMesh = new THREE.Mesh(tubeGeo, shaderMat);
        tubeMesh.userData = {
          id: pathDef.id,
          interactableType: 'pathway',
          definition: pathDef
        };
        scene.add(tubeMesh);
        interactableObjects.push(tubeMesh);

        // Parallel secondary luminous rail conduits alongside each primary trunk
        var offsetLeft = pts.map(function (v) {
          return new THREE.Vector3(v.x + 0.34, v.y - 0.06, v.z - 0.34);
        });
        var offsetRight = pts.map(function (v) {
          return new THREE.Vector3(v.x - 0.34, v.y - 0.06, v.z + 0.34);
        });
        var railGeo1 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(offsetLeft), 56, 0.045, 6, false);
        var railGeo2 = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(offsetRight), 56, 0.045, 6, false);
        var railMat1 = new THREE.MeshBasicMaterial({
          color: pathDef.secondaryHex,
          transparent: true,
          opacity: 0.72
        });
        var railMat2 = new THREE.MeshBasicMaterial({
          color: pathDef.primaryHex,
          transparent: true,
          opacity: 0.65
        });
        scene.add(new THREE.Mesh(railGeo1, railMat1));
        scene.add(new THREE.Mesh(railGeo2, railMat2));

        // Physical 3D light packet spheres traveling along the curve
        var packets = [];
        for (var k = 0; k < 3; k++) {
          var pktGeo = new THREE.SphereGeometry(pathDef.radius * 1.35, 12, 12);
          var pktMat = new THREE.MeshBasicMaterial({
            color: k % 2 === 0 ? pathDef.primaryHex : pathDef.secondaryHex
          });
          var pktMesh = new THREE.Mesh(pktGeo, pktMat);
          scene.add(pktMesh);
          packets.push({ mesh: pktMesh, offset: k / 3 });
        }

        var controllerRecord = {
          id: pathDef.id,
          definition: pathDef,
          mesh: tubeMesh,
          curve: curve,
          shaderMat: shaderMat,
          packets: packets,
          state: 'IDLE',
          highlightTarget: 0
        };
        conduitControllers.push(controllerRecord);
        objectRegistry[pathDef.id] = controllerRecord;
      });

      // =========================================================================
      // 6. 3D MONITORING PANELS, CENTRAL JUNCTION, & CLUSTER NODES
      // =========================================================================
      function createMonitoringScreenTexture(node) {
        var canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 320;
        var ctx = canvas.getContext('2d');

        ctx.fillStyle = 'rgba(6, 18, 26, 0.94)';
        ctx.fillRect(0, 0, 512, 320);

        // Subtle monitoring grid
        ctx.strokeStyle = 'rgba(18, 220, 232, 0.14)';
        ctx.lineWidth = 1;
        for (var x = 0; x <= 512; x += 32) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 320);
          ctx.stroke();
        }
        for (var y = 0; y <= 320; y += 32) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(512, y);
          ctx.stroke();
        }

        // Border & header bar
        ctx.strokeStyle = node.color;
        ctx.lineWidth = 3;
        ctx.strokeRect(6, 6, 500, 308);

        ctx.fillStyle = node.color;
        ctx.fillRect(18, 18, 12, 12);
        ctx.font = '600 15px "JetBrains Mono", monospace';
        ctx.fillText(node.label.toUpperCase(), 38, 29);

        ctx.fillStyle = '#91A8AF';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('ROUTE: ' + node.route + '  |  RBAC: ' + node.role.toUpperCase(), 18, 54);

        // Abstract structural bars & network topology ring (no fake numbers)
        ctx.strokeStyle = '#00E6A0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(410, 175, 58, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#F2B65C';
        ctx.beginPath();
        ctx.arc(410, 175, 36, 0.4, Math.PI * 1.65);
        ctx.stroke();

        for (var row = 0; row < 5; row++) {
          var by = 86 + row * 34;
          ctx.fillStyle = 'rgba(17, 40, 50, 0.95)';
          ctx.fillRect(20, by, 290, 20);
          ctx.fillStyle = row % 2 === 0 ? '#00E6A0' : '#F2B65C';
          ctx.fillRect(20, by, 95 + (row * 33) % 140, 20);
        }

        ctx.fillStyle = '#EAF3F4';
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillText('STATUS: SCHEMA-BOUND · LIVE EMPTY STATE READY', 20, 286);

        return new THREE.CanvasTexture(canvas);
      }

      var nodeControllers = [];

      FEATURE_NODES.forEach(function (node) {
        var group = new THREE.Group();
        group.position.set(node.pos[0], node.pos[1], node.pos[2]);
        if (node.rotY) group.rotation.y = node.rotY;
        scene.add(group);

        var primaryMesh;
        var secondaryMesh = null;

        if (node.kind === 'junction-cube') {
          // Multi-layered central holographic cube + rotating inner octahedron core
          var outerGeo = new THREE.BoxGeometry(2.35, 2.35, 2.35);
          var outerMat = new THREE.MeshPhysicalMaterial({
            color: 0x0d2e3a,
            emissive: 0x00e6a0,
            emissiveIntensity: 0.42,
            transparent: true,
            opacity: 0.68,
            roughness: 0.12,
            metalness: 0.25
          });
          primaryMesh = new THREE.Mesh(outerGeo, outerMat);
          group.add(primaryMesh);

          var edgeLines = new THREE.LineSegments(
            new THREE.EdgesGeometry(outerGeo),
            new THREE.LineBasicMaterial({ color: 0x28f5b4 })
          );
          group.add(edgeLines);

          var innerGeo = new THREE.OctahedronGeometry(0.95, 0);
          var innerMat = new THREE.MeshStandardMaterial({
            color: 0xf2b65c,
            emissive: 0xf2b65c,
            emissiveIntensity: 0.9,
            metalness: 0.6,
            roughness: 0.2
          });
          secondaryMesh = new THREE.Mesh(innerGeo, innerMat);
          group.add(secondaryMesh);
        } else if (node.kind === 'energy-sphere') {
          // Prominent glowing golden-emerald sphere on the lower-right trunk
          var sphGeo = new THREE.SphereGeometry(1.42, 28, 28);
          var sphMat = new THREE.MeshStandardMaterial({
            color: 0x28f5b4,
            emissive: 0xf2b65c,
            emissiveIntensity: 0.88,
            metalness: 0.35,
            roughness: 0.15,
            transparent: true,
            opacity: 0.88
          });
          primaryMesh = new THREE.Mesh(sphGeo, sphMat);
          group.add(primaryMesh);

          var cageGeo = new THREE.IcosahedronGeometry(1.82, 1);
          var cageWire = new THREE.LineSegments(
            new THREE.WireframeGeometry(cageGeo),
            new THREE.LineBasicMaterial({ color: 0x28f5b4, transparent: true, opacity: 0.62 })
          );
          secondaryMesh = cageWire;
          group.add(cageWire);
        } else if (node.kind === 'display-panel') {
          // Rear 3D angled monitoring screen
          var screenTex = createMonitoringScreenTexture(node);
          var panelGeo = new THREE.BoxGeometry(5.8, 3.6, 0.16);
          var panelMat = new THREE.MeshStandardMaterial({
            map: screenTex,
            emissive: node.hex,
            emissiveMap: screenTex,
            emissiveIntensity: 0.65,
            roughness: 0.2,
            metalness: 0.3
          });
          primaryMesh = new THREE.Mesh(panelGeo, panelMat);
          group.add(primaryMesh);

          var panelEdges = new THREE.LineSegments(
            new THREE.EdgesGeometry(panelGeo),
            new THREE.LineBasicMaterial({ color: node.hex })
          );
          group.add(panelEdges);
        } else {
          // Cluster nodes: hex-prism, octa-core, icosa-cage, crystal-pylon
          var nodeGeo;
          if (node.kind === 'hex-prism') {
            nodeGeo = new THREE.CylinderGeometry(0.72, 0.72, 0.46, 6);
          } else if (node.kind === 'octa-core') {
            nodeGeo = new THREE.OctahedronGeometry(0.72, 0);
          } else if (node.kind === 'icosa-cage') {
            nodeGeo = new THREE.IcosahedronGeometry(0.78, 0);
          } else if (node.kind === 'crystal-pylon') {
            nodeGeo = new THREE.CylinderGeometry(0.35, 1.05, 2.8, 6);
          } else {
            nodeGeo = new THREE.BoxGeometry(0.85, 0.85, 0.85);
          }

          var nodeMat = new THREE.MeshStandardMaterial({
            color: node.hex,
            emissive: node.hex,
            emissiveIntensity: 0.52,
            metalness: 0.65,
            roughness: 0.2
          });
          primaryMesh = new THREE.Mesh(nodeGeo, nodeMat);
          group.add(primaryMesh);

          var wireOverlay = new THREE.LineSegments(
            new THREE.EdgesGeometry(nodeGeo),
            new THREE.LineBasicMaterial({ color: 0xeaf3f4, transparent: true, opacity: 0.75 })
          );
          secondaryMesh = wireOverlay;
          group.add(wireOverlay);

          // Hexagonal base holo-pad on the platform deck
          var ringGeo = new THREE.RingGeometry(0.78, 1.02, 6);
          var ringMat = new THREE.MeshBasicMaterial({
            color: node.hex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55
          });
          var ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = -Math.PI / 2;
          ringMesh.position.y = -node.pos[1] + 0.48;
          group.add(ringMesh);
        }

        primaryMesh.userData = {
          id: node.id,
          interactableType: 'node',
          definition: node
        };
        interactableObjects.push(primaryMesh);

        var rec = {
          id: node.id,
          definition: node,
          group: group,
          primaryMesh: primaryMesh,
          secondaryMesh: secondaryMesh,
          baseY: node.pos[1],
          baseScale: 1.0,
          currentScale: 1.0,
          targetScale: 1.0,
          baseEmissive: node.kind === 'display-panel' ? 0.65 : 0.52,
          currentEmissive: node.kind === 'display-panel' ? 0.65 : 0.52,
          targetEmissive: node.kind === 'display-panel' ? 0.65 : 0.52,
          state: 'IDLE'
        };
        nodeControllers.push(rec);
        objectRegistry[node.id] = rec;
      });

      // Build 3D intra-cluster angular network links between peer nodes
      var peerEdgeRecords = [];
      var createdPairs = {};
      FEATURE_NODES.forEach(function (node) {
        (node.peers || []).forEach(function (peerId) {
          var pairKey = [node.id, peerId].sort().join('--');
          if (createdPairs[pairKey]) return;
          var targetRec = objectRegistry[peerId];
          if (!targetRec || !targetRec.definition || !targetRec.definition.pos) return;
          createdPairs[pairKey] = true;

          var p1 = new THREE.Vector3(node.pos[0], node.pos[1], node.pos[2]);
          var p2 = new THREE.Vector3(
            targetRec.definition.pos[0],
            targetRec.definition.pos[1],
            targetRec.definition.pos[2]
          );
          var mid = p1.clone().lerp(p2, 0.5);
          mid.y += 0.35;

          var linkCurve = new THREE.CatmullRomCurve3([p1, mid, p2]);
          var linkGeo = new THREE.TubeGeometry(linkCurve, 20, 0.032, 6, false);
          var linkMat = new THREE.MeshBasicMaterial({
            color: node.hex,
            transparent: true,
            opacity: 0.38
          });
          var linkMesh = new THREE.Mesh(linkGeo, linkMat);
          scene.add(linkMesh);
          peerEdgeRecords.push({
            nodeA: node.id,
            nodeB: peerId,
            material: linkMat,
            baseColor: new THREE.Color(node.hex)
          });
        });
      });

      // Restrained atmospheric floating light motes in background depth
      var particleCount = 140;
      var particleGeo = new THREE.BufferGeometry();
      var particlePositions = new Float32Array(particleCount * 3);
      for (var pIdx = 0; pIdx < particleCount; pIdx++) {
        particlePositions[pIdx * 3] = (Math.random() - 0.5) * 44;
        particlePositions[pIdx * 3 + 1] = 1.2 + Math.random() * 14;
        particlePositions[pIdx * 3 + 2] = (Math.random() - 0.5) * 40;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      var particleMat = new THREE.PointsMaterial({
        color: 0x28f5b4,
        size: 0.16,
        transparent: true,
        opacity: 0.55
      });
      var particleSystem = new THREE.Points(particleGeo, particleMat);
      scene.add(particleSystem);

      // =========================================================================
      // 7. CENTRALIZED CAMERA & NAVIGATION CONTROLLER
      // =========================================================================
      var cameraSpline = new THREE.CatmullRomCurve3(
        CAMERA_WAYPOINTS.map(function (wp) {
          return new THREE.Vector3(wp.position[0], wp.position[1], wp.position[2]);
        })
      );
      var targetSpline = new THREE.CatmullRomCurve3(
        CAMERA_WAYPOINTS.map(function (wp) {
          return new THREE.Vector3(wp.target[0], wp.target[1], wp.target[2]);
        })
      );

      var navState = {
        targetProgress: 0.0,
        currentProgress: 0.0,
        savedProgressBeforeFocus: 0.0,
        activeWaypointId: 'establishing',
        activeChapter: 'connectivity-grid',
        focusOverridePos: null,
        focusOverrideTarget: null,
        orbitYawOffset: 0.0,
        orbitPitchOffset: 0.0,
        reducedMotion: false,
        activeRole: 'Student',
        selectedId: 'node-central-junction',
        hoveredId: null,
        domainFilter: 'all'
      };

      var currentCameraLookAt = new THREE.Vector3(0, 1.2, 0);


  navState.reducedMotion = reducedMotion;
  navState.selectedId = null;
  camera.position.set(23.5, 20.5, 25.5);
  camera.lookAt(currentCameraLookAt);

  var elapsed = 0;
  var raycaster = new THREE.Raycaster();
  var pointerNdc = new THREE.Vector2();
  var isDragging = false;
  var dragMoved = false;
  var prevX = 0;
  var prevY = 0;

  function focusCameraOnObject(id) {
    var rec = objectRegistry[id];
    if (!rec) return;
    if (!navState.focusOverridePos) {
      navState.savedProgressBeforeFocus = navState.targetProgress;
    }
    var def = rec.definition;
    var centerVec;
    var offsetVec;
    if (rec.curve) {
      centerVec = rec.curve.getPointAt(0.5);
      offsetVec = new THREE.Vector3(6.5, 5.5, 7.5);
    } else {
      centerVec = new THREE.Vector3(def.pos[0], def.pos[1], def.pos[2]);
      if (def.kind === 'display-panel') {
        offsetVec = new THREE.Vector3(0.0, 0.6, 8.2);
      } else if (def.id === 'node-central-junction') {
        offsetVec = new THREE.Vector3(6.2, 5.2, 7.2);
      } else {
        offsetVec = new THREE.Vector3(4.8, 3.8, 5.8);
      }
    }
    navState.focusOverrideTarget = centerVec.clone();
    navState.focusOverridePos = centerVec.clone().add(offsetVec);
  }

  function selectNetworkEntity(id, moveCamera) {
    if (!id || !objectRegistry[id]) {
      navState.selectedId = null;
      navState.focusOverridePos = null;
      navState.focusOverrideTarget = null;
      nodeControllers.forEach(function (nc) {
        nc.state = 'IDLE';
        nc.targetScale = 1.0;
        nc.targetEmissive = nc.baseEmissive;
      });
      conduitControllers.forEach(function (cc) {
        cc.state = 'IDLE';
        cc.highlightTarget = 0.0;
      });
      onStateChange?.();
      return null;
    }
    var rec = objectRegistry[id];
    navState.selectedId = id;
    var def = rec.definition;
    var connectedSet = {};
    connectedSet[id] = true;
    (def.peers || []).forEach(function (p) {
      connectedSet[p] = true;
    });
    nodeControllers.forEach(function (nc) {
      if (nc.id === id) {
        nc.state = 'SELECTED';
        nc.targetScale = 1.28;
        nc.targetEmissive = 1.25;
      } else if (connectedSet[nc.id]) {
        nc.state = 'FOCUSED';
        nc.targetScale = 1.12;
        nc.targetEmissive = 0.85;
      } else {
        nc.state = 'IDLE';
        nc.targetScale = 1.0;
        nc.targetEmissive = nc.baseEmissive * 0.75;
      }
    });
    conduitControllers.forEach(function (cc) {
      var isSelectedPath = cc.id === id;
      var matchesDomain = cc.definition.domain === def.domain || def.id === 'node-central-junction';
      if (isSelectedPath) {
        cc.state = 'SELECTED';
        cc.highlightTarget = 1.0;
      } else if (matchesDomain) {
        cc.state = 'FOCUSED';
        cc.highlightTarget = 0.55;
      } else {
        cc.state = 'IDLE';
        cc.highlightTarget = 0.0;
      }
    });
    peerEdgeRecords.forEach(function (edge) {
      var activeEdge = edge.nodeA === id || edge.nodeB === id;
      edge.material.opacity = activeEdge ? 0.92 : 0.24;
    });
    if (moveCamera !== false) {
      focusCameraOnObject(id);
    }
    onStateChange?.();
    return def;
  }

  function stepSimulation(dt) {
    var clampedDt = Math.max(0.001, Math.min(dt, 0.05));
    elapsed += clampedDt;
    var damping = 1.0 - Math.exp(-5.0 * clampedDt);

    navState.currentProgress += (navState.targetProgress - navState.currentProgress) * damping;
    var clampedProg = Math.max(0.0, Math.min(1.0, navState.currentProgress));

    var bestWp = CAMERA_WAYPOINTS[0].id;
    var minDiff = 999;
    CAMERA_WAYPOINTS.forEach(function (wp) {
      var d = Math.abs(wp.progress - clampedProg);
      if (d < minDiff) {
        minDiff = d;
        bestWp = wp.id;
      }
    });
    navState.activeWaypointId = bestWp;

    var baseCamPos = navState.focusOverridePos
      ? navState.focusOverridePos.clone()
      : cameraSpline.getPointAt(clampedProg);
    var baseCamTarget = navState.focusOverrideTarget
      ? navState.focusOverrideTarget.clone()
      : targetSpline.getPointAt(clampedProg);

    baseCamPos.x += navState.orbitYawOffset;
    baseCamPos.y += navState.orbitPitchOffset;

    camera.position.lerp(baseCamPos, damping);
    currentCameraLookAt.lerp(baseCamTarget, damping);
    camera.lookAt(currentCameraLookAt);

    conduitControllers.forEach(function (cc) {
      var curH = cc.shaderMat.uniforms.uHighlight.value;
      cc.shaderMat.uniforms.uHighlight.value += (cc.highlightTarget - curH) * damping;
      cc.shaderMat.uniforms.uTime.value = navState.reducedMotion ? 0.0 : elapsed;

      cc.packets.forEach(function (pkt) {
        var speedMult = cc.state === 'SELECTED' ? 1.65 : 1.0;
        var t = navState.reducedMotion
          ? pkt.offset
          : (elapsed * cc.definition.speed * 0.16 * speedMult + pkt.offset) % 1.0;
        var posOnCurve = cc.curve.getPointAt(t);
        pkt.mesh.position.copy(posOnCurve);
      });
    });

    nodeControllers.forEach(function (nc, idx) {
      nc.currentScale += (nc.targetScale - nc.currentScale) * damping;
      nc.group.scale.setScalar(nc.currentScale);

      if (nc.primaryMesh.material && nc.primaryMesh.material.emissiveIntensity !== undefined) {
        nc.currentEmissive += (nc.targetEmissive - nc.currentEmissive) * damping;
        nc.primaryMesh.material.emissiveIntensity = nc.currentEmissive;
      }

      if (!navState.reducedMotion) {
        if (nc.definition.kind === 'junction-cube' && nc.secondaryMesh) {
          nc.secondaryMesh.rotation.y = elapsed * 0.85;
          nc.secondaryMesh.rotation.x = elapsed * 0.55;
        } else if (nc.definition.kind === 'energy-sphere' && nc.secondaryMesh) {
          nc.secondaryMesh.rotation.y = -elapsed * 0.65;
          nc.secondaryMesh.rotation.z = elapsed * 0.45;
        } else if (nc.definition.kind !== 'display-panel') {
          nc.primaryMesh.rotation.y = elapsed * 0.35 + idx * 0.4;
        }
      }
    });
  }

  return {
    envId: 'env-03-recruitment-connectivity-grid',
    scene,
    camera,
    stepSimulation,
    handleResize: function (w, h) {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    handleWheel: function (e) {
      navState.focusOverridePos = null;
      navState.focusOverrideTarget = null;
      var delta = e.deltaY * 0.00055;
      navState.targetProgress = Math.max(0.0, Math.min(1.0, navState.targetProgress + delta));
      onStateChange?.();
    },
    handlePointerDown: function (e) {
      if (e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      prevX = e.clientX;
      prevY = e.clientY;
    },
    handlePointerMove: function (e, w, h, isInteractiveDom) {
      if (isDragging) {
        var dx = e.clientX - prevX;
        var dy = e.clientY - prevY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) dragMoved = true;
        prevX = e.clientX;
        prevY = e.clientY;
        navState.orbitYawOffset = Math.max(-7.5, Math.min(7.5, navState.orbitYawOffset - dx * 0.025));
        navState.orbitPitchOffset = Math.max(-3.5, Math.min(5.5, navState.orbitPitchOffset + dy * 0.02));
        onStateChange?.();
        return;
      }
      if (isInteractiveDom) {
        if (navState.hoveredId) {
          navState.hoveredId = null;
          onStateChange?.();
        }
        return;
      }
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -(e.clientY / Math.max(1, h)) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      var hits = raycaster.intersectObjects(interactableObjects, false);
      var hitId = hits.length > 0 ? hits[0].object.userData?.id : null;
      if (navState.hoveredId !== hitId) {
        navState.hoveredId = hitId;
        nodeControllers.forEach(function (nc) {
          if (nc.id === navState.selectedId) return;
          if (nc.id === hitId) {
            nc.state = 'HOVER';
            nc.targetScale = 1.18;
            nc.targetEmissive = 1.05;
          } else if (nc.state === 'HOVER') {
            nc.state = 'IDLE';
            nc.targetScale = 1.0;
            nc.targetEmissive = nc.baseEmissive;
          }
        });
        onStateChange?.();
      }
    },
    handlePointerUp: function (e, w, h, isInteractiveDom) {
      var wasDrag = dragMoved;
      isDragging = false;
      dragMoved = false;
      if (wasDrag || isInteractiveDom) return;
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -(e.clientY / Math.max(1, h)) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      var hits = raycaster.intersectObjects(interactableObjects, false);
      if (hits.length > 0 && hits[0].object.userData?.id) {
        var clickedId = hits[0].object.userData.id;
        selectNetworkEntity(navState.selectedId === clickedId ? null : clickedId, true);
      }
    },
    handleKeyDown: function (e) {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        navState.targetProgress = Math.min(1, navState.targetProgress + 0.14);
        onStateChange?.();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        navState.targetProgress = Math.max(0, navState.targetProgress - 0.14);
        onStateChange?.();
      } else if (e.key === 'Escape') {
        selectNetworkEntity(null, false);
      }
    },
    handleKeyUp: function () {},
    getViewpoints: function () {
      return CAMERA_WAYPOINTS.map(function (wp) {
        return {
          id: wp.id,
          label: wp.label,
          progress: wp.progress,
          description: wp.summary,
        };
      });
    },
    getActiveViewpointId: function () {
      return navState.activeWaypointId;
    },
    goToViewpoint: function (id) {
      var found = CAMERA_WAYPOINTS.find(function (w) { return w.id === id; }) || CAMERA_WAYPOINTS[0];
      navState.activeWaypointId = found.id;
      navState.targetProgress = found.progress;
      navState.focusOverridePos = null;
      navState.focusOverrideTarget = null;
      navState.orbitYawOffset = 0;
      navState.orbitPitchOffset = 0;
      onStateChange?.();
    },
    setProgress: function (p) {
      navState.focusOverridePos = null;
      navState.focusOverrideTarget = null;
      navState.targetProgress = Math.max(0, Math.min(1, p));
      onStateChange?.();
    },
    getProgress: function () {
      return navState.currentProgress;
    },
    hoverObject: function (id) {
      navState.hoveredId = id && objectRegistry[id] ? id : null;
      onStateChange?.();
      return navState.hoveredId ? objectRegistry[navState.hoveredId].definition : null;
    },
    selectObject: function (id) {
      return selectNetworkEntity(id, true);
    },
    getHoveredObject: function () {
      if (!navState.hoveredId) return null;
      var def = objectRegistry[navState.hoveredId]?.definition;
      return def ? {
        id: def.id,
        title: def.label,
        subtitle: def.region,
        categoryLabel: def.domain.toUpperCase(),
        route: def.route,
        accentColor: def.color || def.primaryColor || '#00E6A0',
        summary: def.description,
      } : null;
    },
    getSelectedObject: function () {
      if (!navState.selectedId) return null;
      var def = objectRegistry[navState.selectedId]?.definition;
      return def ? {
        id: def.id,
        title: def.label,
        subtitle: def.region,
        categoryLabel: def.domain.toUpperCase(),
        route: def.route,
        accentColor: def.color || def.primaryColor || '#00E6A0',
        summary: def.description,
        position: def.pos,
        heightOffset: 1.4,
      } : null;
    },
    getInteractiveObjects: function () {
      return FEATURE_NODES.map(function (n) {
        return {
          id: n.id,
          title: n.label,
          subtitle: n.region,
          categoryLabel: n.domain.toUpperCase(),
          route: n.route,
          accentColor: n.color,
          summary: n.description,
        };
      });
    },
    getState: function () {
      return {
        environmentId: 'env-03-recruitment-connectivity-grid',
        environmentName: 'Recruitment Connectivity Grid',
        cameraPos: [Number(camera.position.x.toFixed(3)), Number(camera.position.y.toFixed(3)), Number(camera.position.z.toFixed(3))],
        cameraTarget: [Number(currentCameraLookAt.x.toFixed(3)), Number(currentCameraLookAt.y.toFixed(3)), Number(currentCameraLookAt.z.toFixed(3))],
        fov: Number(camera.fov.toFixed(2)),
        currentProgress: Number(navState.currentProgress.toFixed(4)),
        targetProgress: Number(navState.targetProgress.toFixed(4)),
        activeViewpoint: navState.activeWaypointId,
        hoveredObjectId: navState.hoveredId,
        selectedObjectId: navState.selectedId,
        interactableCount: FEATURE_NODES.length + PATHWAYS.length,
      };
    },
    dispose: function () {
      platformTex.dispose();
    },
  };
}

// ============================================================================
// ENVIRONMENT 04: RESUME & PROFILE STUDIO (EXACT ORIGINAL FROM HTML)
// ============================================================================
export function createResumeProfileStudioScene(
  width: number,
  height: number,
  reducedMotion: boolean,
  onStateChange?: () => void
): OriginalSceneInstance {
      const CAMERA_WAYPOINTS = [
        {
          id: 'vp-1-establishing',
          index: 1,
          label: '01 · Office Establishing View',
          progress: 0.0,
          position: [0.42, 2.22, 7.55],
          lookAt: [-0.05, 2.32, 0.20],
          fov: 48,
        },
        {
          id: 'vp-2-resume-focus',
          index: 2,
          label: '02 · Holographic Resume Focus',
          progress: 0.2,
          position: [0.22, 2.48, 4.45],
          lookAt: [-0.18, 2.48, 1.15],
          fov: 44,
        },
        {
          id: 'vp-3-profile-details',
          index: 3,
          label: '03 · Profile Identity & Header',
          progress: 0.4,
          position: [-0.18, 3.65, 3.10],
          lookAt: [-0.18, 3.65, 1.15],
          fov: 40,
        },
        {
          id: 'vp-4-experience-education',
          index: 4,
          label: '04 · Experience & Education Tiers',
          progress: 0.6,
          position: [-0.18, 2.65, 3.22],
          lookAt: [-0.18, 2.65, 1.15],
          fov: 40,
        },
        {
          id: 'vp-5-skills-projects',
          index: 5,
          label: '05 · Skills, Projects & Certifications',
          progress: 0.8,
          position: [-0.18, 1.45, 3.18],
          lookAt: [-0.18, 1.45, 1.15],
          fov: 40,
        },
        {
          id: 'vp-6-panoramic-office',
          index: 6,
          label: '06 · Panoramic Executive Office & Skyline',
          progress: 1.0,
          position: [2.85, 2.58, 5.25],
          lookAt: [-0.55, 2.28, -1.2],
          fov: 48,
        },
      ];

      const container = document.getElementById('webgl-container');

  const STUDIO_INTERACTABLES = [
    {
      id: 'holo-header-identity',
      title: 'Candidate Identity & Academic Profile',
      subtitle: 'Holographic Monolith • Upper Tier',
      categoryLabel: 'Resume Section • Profile',
      route: '/profile',
      accentColor: '#38E8FF',
      position: [-0.18, 3.65, 1.15],
      focusPos: [-0.18, 3.65, 3.10],
      focusLook: [-0.18, 3.65, 1.15],
      hitRadius: 0.75,
      summary: 'Authenticated student identity, contact links, department, and verified CGPA.',
    },
    {
      id: 'holo-experience-education',
      title: 'Education & Engineering Experience',
      subtitle: 'Holographic Monolith • Mid Tier',
      categoryLabel: 'Resume Section • Experience',
      route: '/resume',
      accentColor: '#FFB84D',
      position: [-0.18, 2.55, 1.15],
      focusPos: [-0.18, 2.65, 3.22],
      focusLook: [-0.18, 2.65, 1.15],
      hitRadius: 0.75,
      summary: 'Structured academic degrees, internships, and measurable engineering impact highlights.',
    },
    {
      id: 'holo-skills-projects-ats',
      title: 'Skills, Capstone Projects & ATS Score',
      subtitle: 'Holographic Monolith • Lower Tier',
      categoryLabel: 'Resume Section • ATS & Skills',
      route: '/resume',
      accentColor: '#38E8FF',
      position: [-0.18, 1.45, 1.15],
      focusPos: [-0.18, 1.45, 3.18],
      focusLook: [-0.18, 1.45, 1.15],
      hitRadius: 0.75,
      summary: 'Technical skill taxonomy, project links, and live AI/ATS compatibility evaluation.',
    },
    {
      id: 'office-executive-desk',
      title: 'Executive Career Readiness Console',
      subtitle: 'Elliptical Gunmetal Desk Assembly',
      categoryLabel: 'Studio Station • Student Hub',
      route: '/student',
      accentColor: '#FFB84D',
      position: [0.0, 1.24, -0.62],
      focusPos: [2.2, 2.35, 3.8],
      focusLook: [0.0, 1.35, -0.4],
      hitRadius: 1.1,
      summary: 'Return to the main Student Dashboard overview and readiness indicators.',
    },
  ];

  let scene = new THREE.Scene();
  scene.background = new THREE.Color(0x13243c);
  scene.fog = new THREE.FogExp2(0x1b3050, 0.012);
  let camera = new THREE.PerspectiveCamera(48, width / Math.max(height, 1), 0.1, 140);
  let holoRootGroup, holoShaderMat, goldFrameMat, cyanFrameMat, focusHighlightRingMesh;
  const aerialVehicles = [];

        const ambientLight = new THREE.AmbientLight(0x88b4e0, 0.88);
        scene.add(ambientLight);

        const ceilingLight = new THREE.PointLight(0xb8f4ff, 1.65, 24, 1.3);
        ceilingLight.position.set(0, 5.65, 1.2);
        ceilingLight.castShadow = true;
        scene.add(ceilingLight);

        const sunsetDirLight = new THREE.DirectionalLight(0xffb380, 1.2);
        sunsetDirLight.position.set(4.5, 4.2, -14.0);
        scene.add(sunsetDirLight);

        const holoGoldLight = new THREE.PointLight(0xffb84d, 1.45, 8.5, 1.5);
        holoGoldLight.position.set(-0.18, 2.4, 1.85);
        scene.add(holoGoldLight);

        const chairFillLight = new THREE.PointLight(0xffdfb8, 1.25, 9.0, 1.4);
        chairFillLight.position.set(2.9, 2.4, 3.6);
        scene.add(chairFillLight);

        const cabinetFillLight = new THREE.PointLight(0x9ad8ff, 0.95, 8.0, 1.4);
        cabinetFillLight.position.set(-2.9, 2.1, 3.4);
        scene.add(cabinetFillLight);

        buildTwilightSkyAndCity();
        buildCurvedExecutiveOffice();
        buildExecutiveFurniture();
        buildHolographicMonolithFrame();

  buildTwilightSkyAndCity();
  buildCurvedExecutiveOffice();
  buildExecutiveFurniture();
  buildHolographicMonolithFrame();

      function buildTwilightSkyAndCity() {
        const cityGroup = new THREE.Group();
        const skyGeo = new THREE.SphereGeometry(75, 48, 32);
        const skyMat = new THREE.ShaderMaterial({
          side: THREE.BackSide,
          depthWrite: false,
          uniforms: {
            uTopColor: { value: new THREE.Color(0x13253e) },
            uMidColor: { value: new THREE.Color(0x3b597d) },
            uHorizonColor: { value: new THREE.Color(0xdc8e6e) },
            uGlowColor: { value: new THREE.Color(0xf7ba83) },
          },
          vertexShader: `
            varying vec3 vWorldPos;
            void main() {
              vec4 wp = modelMatrix * vec4(position, 1.0);
              vWorldPos = wp.xyz;
              gl_Position = projectionMatrix * viewMatrix * wp;
            }
          `,
          fragmentShader: `
            uniform vec3 uTopColor;
            uniform vec3 uMidColor;
            uniform vec3 uHorizonColor;
            uniform vec3 uGlowColor;
            varying vec3 vWorldPos;
            void main() {
              vec3 d = normalize(vWorldPos);
              float h = clamp((d.y + 0.06) / 0.58, 0.0, 1.0);
              float sunFocus = clamp(1.0 - abs(d.x - 0.14) * 1.1, 0.0, 1.0);
              float horizonBand = pow(1.0 - clamp(abs(d.y - 0.04) * 3.5, 0.0, 1.0), 2.2);
              vec3 col = mix(uHorizonColor, uMidColor, smoothstep(0.0, 0.42, h));
              col = mix(col, uTopColor, smoothstep(0.42, 1.0, h));
              col += uGlowColor * horizonBand * sunFocus * 0.45;
              gl_FragColor = vec4(col, 1.0);
            }
          `,
        });
        cityGroup.add(new THREE.Mesh(skyGeo, skyMat));

        const towerMat = new THREE.MeshStandardMaterial({
          color: 0x243b56,
          roughness: 0.32,
          metalness: 0.72,
          emissive: 0x17314a,
          emissiveIntensity: 0.55,
        });

        const towers = [
          { x: -12.8, z: -11.5, w: 3.4, d: 3.0, h: 17.5, spire: false },
          { x: -9.5, z: -14.8, w: 2.5, d: 2.5, h: 15.2, spire: true },
          { x: -6.7, z: -18.2, w: 2.1, d: 2.1, h: 12.4, spire: true },
          { x: -1.2, z: -24.0, w: 2.2, d: 2.2, h: 12.8, spire: true },
          { x: 4.8, z: -20.5, w: 2.3, d: 2.3, h: 14.0, spire: true },
          { x: 7.9, z: -16.8, w: 1.95, d: 1.95, h: 16.5, spire: true },
          { x: 13.0, z: -11.2, w: 4.0, d: 3.5, h: 15.8, spire: false },
        ];

        towers.forEach((t) => {
          const mesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, t.h, t.d), towerMat);
          mesh.position.set(t.x, t.h / 2 - 4.2, t.z);
          cityGroup.add(mesh);
          if (t.spire) {
            const tierMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.08, t.w * 0.35, 3.6, 12), towerMat);
            tierMesh.position.set(t.x, t.h - 4.2 + 1.8, t.z);
            cityGroup.add(tierMesh);
          }
        });

        const shipHullMat = new THREE.MeshStandardMaterial({ color: 0x223348, roughness: 0.28, metalness: 0.82 });
        [
          { x: -6.8, y: 3.85, z: -12.5, scale: 0.95, speed: 0.32, span: 2.2, dir: 1 },
          { x: 7.4, y: 4.15, z: -13.2, scale: 1.12, speed: 0.26, span: 2.4, dir: -1 },
        ].forEach((s) => {
          const ship = new THREE.Group();
          const bodyGeo = new THREE.SphereGeometry(0.42 * s.scale, 16, 12);
          bodyGeo.scale(2.5, 0.52, 0.88);
          ship.add(new THREE.Mesh(bodyGeo, shipHullMat));
          ship.position.set(s.x, s.y, s.z);
          cityGroup.add(ship);
          aerialVehicles.push({ mesh: ship, baseX: s.x, baseY: s.y, speed: s.speed, span: s.span, dir: s.dir });
        });

        scene.add(cityGroup);
      }

      function buildCurvedExecutiveOffice() {
        const officeGroup = new THREE.Group();
        const floorMesh = new THREE.Mesh(
          new THREE.CircleGeometry(14.5, 64),
          new THREE.MeshStandardMaterial({ color: 0x0b1422, roughness: 0.14, metalness: 0.72 })
        );
        floorMesh.rotation.x = -Math.PI / 2;
        floorMesh.receiveShadow = true;
        officeGroup.add(floorMesh);

        const wallRadius = 9.2;
        const wallHeight = 6.2;
        const arcSpan = Math.PI * 0.84;
        const startAngle = Math.PI + (Math.PI - arcSpan) / 2;

        const glassWallMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(wallRadius, wallRadius, wallHeight, 48, 1, true, startAngle, arcSpan),
          new THREE.MeshPhysicalMaterial({
            color: 0x9ad8f5,
            transparent: true,
            opacity: 0.10,
            roughness: 0.06,
            metalness: 0.15,
            side: THREE.DoubleSide,
            depthWrite: false,
          })
        );
        glassWallMesh.position.y = wallHeight / 2;
        officeGroup.add(glassWallMesh);

        const frameMetalMat = new THREE.MeshStandardMaterial({ color: 0x131d2e, roughness: 0.30, metalness: 0.82 });
        for (let i = 0; i <= 5; i++) {
          const angle = -arcSpan / 2 + (i / 5) * arcSpan;
          const colMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, wallHeight, 0.34), frameMetalMat);
          colMesh.position.set(Math.sin(angle) * (wallRadius - 0.08), wallHeight / 2, -Math.cos(angle) * (wallRadius - 0.08));
          colMesh.rotation.y = -angle;
          officeGroup.add(colMesh);
        }

        const ledRingMesh = new THREE.Mesh(
          new THREE.TorusGeometry(6.35, 0.068, 16, 96),
          new THREE.MeshBasicMaterial({ color: 0xdff9ff })
        );
        ledRingMesh.rotation.x = Math.PI / 2;
        ledRingMesh.position.set(0, 5.56, 0.55);
        officeGroup.add(ledRingMesh);

        scene.add(officeGroup);
      }

      function buildExecutiveFurniture() {
        const furnGroup = new THREE.Group();
        const deskTopMat = new THREE.MeshStandardMaterial({ color: 0x222b3a, roughness: 0.22, metalness: 0.52 });
        const gunmetalMat = new THREE.MeshStandardMaterial({ color: 0x263142, roughness: 0.24, metalness: 0.85 });

        const deskGeo = new THREE.CylinderGeometry(2.85, 2.85, 0.085, 48);
        deskGeo.scale(1.0, 1.0, 0.46);
        const deskMesh = new THREE.Mesh(deskGeo, deskTopMat);
        deskMesh.position.set(0.0, 1.24, -0.62);
        furnGroup.add(deskMesh);

        [-1.68, 1.68].forEach((lx) => {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.13, 1.22, 20), gunmetalMat);
          leg.position.set(lx, 0.61, -0.62);
          furnGroup.add(leg);
        });

        const cabinet = new THREE.Mesh(
          new THREE.BoxGeometry(1.12, 0.92, 1.06),
          new THREE.MeshStandardMaterial({ color: 0x1c2534, roughness: 0.34, metalness: 0.42 })
        );
        cabinet.position.set(-2.18, 0.46, 1.62);
        cabinet.rotation.y = 0.21;
        furnGroup.add(cabinet);

        const chairGroup = new THREE.Group();
        chairGroup.position.set(2.08, 0.0, 1.88);
        chairGroup.rotation.y = -0.56;
        const leatherMat = new THREE.MeshStandardMaterial({ color: 0x6b4737, roughness: 0.36, metalness: 0.14 });

        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.48, 14), gunmetalMat);
        post.position.y = 0.34;
        chairGroup.add(post);

        for (let i = 0; i < 5; i++) {
          const ang = (i * Math.PI * 2) / 5;
          const legArm = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.042, 0.062), gunmetalMat);
          legArm.position.set(Math.cos(ang) * 0.23, 0.105, Math.sin(ang) * 0.23);
          legArm.rotation.y = -ang;
          chairGroup.add(legArm);
        }

        const seat = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.13, 0.74), leatherMat);
        seat.position.set(0, 0.60, 0.02);
        chairGroup.add(seat);

        const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.72, 1.16, 0.14), leatherMat);
        backrest.position.set(0, 1.22, -0.31);
        backrest.rotation.x = -0.14;
        chairGroup.add(backrest);

        furnGroup.add(chairGroup);
        scene.add(furnGroup);
      }

      function buildHolographicMonolithFrame() {
        holoRootGroup = new THREE.Group();
        holoRootGroup.position.set(-0.18, 2.48, 1.15);
        holoRootGroup.rotation.y = 0.14;

        const W = 3.55;
        const H = 4.26;
        const hw = W / 2;
        const hh = H / 2;
        const bevel = 0.19;

        holoShaderMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          uniforms: {
            uTime: { value: 0 },
            uHoverBoost: { value: 0 },
            uReducedMotion: { value: reducedMotion ? 1.0 : 0.0 },
            uCyan: { value: new THREE.Color(0x38e8ff) },
            uGold: { value: new THREE.Color(0xffb84d) },
            uDeepTint: { value: new THREE.Color(0x091f38) },
          },
          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              vUv = uv;
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vViewPos = -mvPos.xyz;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * mvPos;
            }
          `,
          fragmentShader: `
            uniform float uTime;
            uniform float uHoverBoost;
            uniform float uReducedMotion;
            uniform vec3 uCyan;
            uniform vec3 uGold;
            uniform vec3 uDeepTint;
            varying vec2 vUv;
            varying vec3 vNormal;
            varying vec3 vViewPos;
            void main() {
              vec3 viewDir = normalize(vViewPos);
              float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 2.2);
              float t = uReducedMotion > 0.5 ? 0.0 : uTime * 0.4;
              float scanFine = sin((vUv.y * 240.0) - t * 2.5) * 0.5 + 0.5;
              float ex = min(vUv.x, 1.0 - vUv.x);
              float ey = min(vUv.y, 1.0 - vUv.y);
              float borderGlow = 1.0 - smoothstep(0.0, 0.06, min(ex, ey));
              vec3 col = mix(uDeepTint, uCyan, fresnel * 0.42 + scanFine * 0.04);
              col = mix(col, uGold, borderGlow * 0.45);
              float alpha = 0.20 + fresnel * 0.18 + borderGlow * 0.22 + (uHoverBoost * 0.06);
              gl_FragColor = vec4(col, clamp(alpha, 0.16, 0.55));
            }
          `,
        });

        const glassSlabMesh = new THREE.Mesh(new THREE.BoxGeometry(W - 0.08, H - 0.08, 0.055), holoShaderMat);
        holoRootGroup.add(glassSlabMesh);

        goldFrameMat = new THREE.MeshStandardMaterial({
          color: 0xffe29e,
          emissive: 0xffae38,
          emissiveIntensity: 1.55,
          roughness: 0.18,
          metalness: 0.78,
        });

        cyanFrameMat = new THREE.MeshStandardMaterial({
          color: 0x7ef2ff,
          emissive: 0x22d8ff,
          emissiveIntensity: 1.35,
          roughness: 0.2,
          metalness: 0.6,
        });

        const framePts = [
          new THREE.Vector3(-hw + bevel, hh, 0),
          new THREE.Vector3(hw - bevel, hh, 0),
          new THREE.Vector3(hw, hh - bevel, 0),
          new THREE.Vector3(hw, -hh + bevel, 0),
          new THREE.Vector3(hw - bevel, -hh, 0),
          new THREE.Vector3(-hw + bevel, -hh, 0),
          new THREE.Vector3(-hw, -hh + bevel, 0),
          new THREE.Vector3(-hw, hh - bevel, 0),
          new THREE.Vector3(-hw + bevel, hh, 0),
        ];

        for (let i = 0; i < framePts.length - 1; i++) {
          const p1 = framePts[i];
          const p2 = framePts[i + 1];
          const dist = p1.distanceTo(p2);
          const segMesh = new THREE.Mesh(new THREE.BoxGeometry(dist + 0.04, 0.058, 0.098), goldFrameMat);
          segMesh.position.copy(p1).add(p2).multiplyScalar(0.5);
          segMesh.rotation.z = Math.atan2(p2.y - p1.y, p2.x - p1.x);
          holoRootGroup.add(segMesh);
        }

        // Dynamic 3D Section Focus Highlight Bracket inside the 3D Monolith
        const focusRingGeo = new THREE.BoxGeometry(W - 0.18, 0.65, 0.11);
        focusHighlightRingMesh = new THREE.Mesh(
          focusRingGeo,
          new THREE.MeshBasicMaterial({
            color: 0x38e8ff,
            wireframe: true,
            transparent: true,
            opacity: 0.0,
          })
        );
        holoRootGroup.add(focusHighlightRingMesh);

        scene.add(holoRootGroup);
      }

      // =========================================================================


  const hitMeshes = [];
  const hitGeo = new THREE.SphereGeometry(1.0, 12, 12);
  const hitMat = new THREE.MeshBasicMaterial({ visible: false });
  STUDIO_INTERACTABLES.forEach((item) => {
    const m = new THREE.Mesh(hitGeo, hitMat);
    m.position.set(...item.position);
    m.scale.setScalar(item.hitRadius);
    m.userData.interactableId = item.id;
    scene.add(m);
    hitMeshes.push(m);
  });

  const posCurve = new THREE.CatmullRomCurve3(
    CAMERA_WAYPOINTS.map((wp) => new THREE.Vector3(...wp.position)),
    false,
    'catmullrom',
    0.35
  );
  const lookCurve = new THREE.CatmullRomCurve3(
    CAMERA_WAYPOINTS.map((wp) => new THREE.Vector3(...wp.lookAt)),
    false,
    'catmullrom',
    0.35
  );

  const camCtrl = {
    targetProgress: 0.0,
    currentProgress: 0.0,
    useDynamicTarget: false,
    currentPos: new THREE.Vector3(0.42, 2.22, 7.55),
    targetPos: new THREE.Vector3(0.42, 2.22, 7.55),
    currentLook: new THREE.Vector3(-0.05, 2.32, 0.20),
    targetLook: new THREE.Vector3(-0.05, 2.32, 0.20),
    orbitOffsetX: 0.0,
    orbitOffsetY: 0.0,
    targetOrbitX: 0.0,
    targetOrbitY: 0.0,
    dampingLambda: 6.0,
    activeViewpoint: 'vp-1-establishing',
    hoveredId: null,
    selectedId: null,
  };
  camera.position.copy(camCtrl.currentPos);
  camera.lookAt(camCtrl.currentLook);

  let elapsedTime = 0;
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  let isDragging = false;
  let dragMoved = false;
  let prevX = 0;
  let prevY = 0;

  function stepSimulation(dt) {
    const clampedDt = Math.max(0.001, Math.min(dt, 0.1));
    const dampFactor = reducedMotion ? 1.0 : 1.0 - Math.exp(-camCtrl.dampingLambda * clampedDt);

    camCtrl.currentProgress += (camCtrl.targetProgress - camCtrl.currentProgress) * dampFactor;
    camCtrl.orbitOffsetX += (camCtrl.targetOrbitX - camCtrl.orbitOffsetX) * dampFactor;
    camCtrl.orbitOffsetY += (camCtrl.targetOrbitY - camCtrl.orbitOffsetY) * dampFactor;

    let bestWp = CAMERA_WAYPOINTS[0].id;
    let minD = 999;
    CAMERA_WAYPOINTS.forEach((w) => {
      const d = Math.abs(w.progress - camCtrl.currentProgress);
      if (d < minD) {
        minD = d;
        bestWp = w.id;
      }
    });
    camCtrl.activeViewpoint = bestWp;

    if (camCtrl.useDynamicTarget) {
      camCtrl.currentPos.lerp(camCtrl.targetPos, dampFactor);
      camCtrl.currentLook.lerp(camCtrl.targetLook, dampFactor);
    } else {
      const t = Math.max(0, Math.min(1, camCtrl.currentProgress));
      camCtrl.currentPos.copy(posCurve.getPointAt(t));
      camCtrl.currentLook.copy(lookCurve.getPointAt(t));
    }

    camera.position.set(
      camCtrl.currentPos.x + camCtrl.orbitOffsetX * 0.55,
      camCtrl.currentPos.y + camCtrl.orbitOffsetY * 0.35,
      camCtrl.currentPos.z
    );
    camera.lookAt(
      camCtrl.currentLook.x + camCtrl.orbitOffsetX * 0.18,
      camCtrl.currentLook.y + camCtrl.orbitOffsetY * 0.12,
      camCtrl.currentLook.z
    );

    if (!reducedMotion) {
      elapsedTime += clampedDt;
      if (holoShaderMat) holoShaderMat.uniforms.uTime.value = elapsedTime;
      if (goldFrameMat) goldFrameMat.emissiveIntensity = 1.48 + Math.sin(elapsedTime * 1.6) * 0.10;
      aerialVehicles.forEach((v) => {
        v.mesh.position.x = v.baseX + Math.sin(elapsedTime * v.speed) * v.span * v.dir;
        v.mesh.position.y = v.baseY + Math.cos(elapsedTime * v.speed * 1.4) * 0.05;
      });
    }
  }

  return {
    envId: 'env-04-resume-profile-studio',
    scene,
    camera,
    stepSimulation,
    handleResize: (w, h) => {
      camera.aspect = w / Math.max(1, h);
      camera.updateProjectionMatrix();
    },
    handleWheel: (e) => {
      camCtrl.useDynamicTarget = false;
      const step = Math.sign(e.deltaY) * Math.min(0.12, Math.max(0.015, Math.abs(e.deltaY) * 0.0008));
      camCtrl.targetProgress = Math.max(0, Math.min(1, camCtrl.targetProgress + step));
      onStateChange?.();
    },
    handlePointerDown: (e) => {
      if (e.button !== 0) return;
      isDragging = true;
      dragMoved = false;
      prevX = e.clientX;
      prevY = e.clientY;
    },
    handlePointerMove: (e, w, h, isInteractiveDom) => {
      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        if (Math.hypot(dx, dy) > 4) dragMoved = true;
        prevX = e.clientX;
        prevY = e.clientY;
        camCtrl.targetOrbitX = Math.max(-2.2, Math.min(2.2, camCtrl.targetOrbitX - dx * 0.006));
        camCtrl.targetOrbitY = Math.max(-1.2, Math.min(1.2, camCtrl.targetOrbitY + dy * 0.005));
        onStateChange?.();
        return;
      }
      if (isInteractiveDom) {
        if (camCtrl.hoveredId) {
          camCtrl.hoveredId = null;
          if (holoShaderMat) holoShaderMat.uniforms.uHoverBoost.value = 0;
          onStateChange?.();
        }
        return;
      }
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -(e.clientY / Math.max(1, h)) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const hitId = hits.length > 0 ? hits[0].object.userData.interactableId : null;
      if (camCtrl.hoveredId !== hitId) {
        camCtrl.hoveredId = hitId;
        if (holoShaderMat) holoShaderMat.uniforms.uHoverBoost.value = hitId ? 1.0 : 0.0;
        onStateChange?.();
      }
    },
    handlePointerUp: (e, w, h, isInteractiveDom) => {
      const wasDrag = dragMoved;
      isDragging = false;
      dragMoved = false;
      if (wasDrag || isInteractiveDom) return;
      pointerNdc.x = (e.clientX / Math.max(1, w)) * 2 - 1;
      pointerNdc.y = -(e.clientY / Math.max(1, h)) * 2 + 1;
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      const hitId = hits.length > 0 ? hits[0].object.userData.interactableId : null;
      if (hitId) {
        const item = STUDIO_INTERACTABLES.find((s) => s.id === hitId);
        if (item) {
          if (camCtrl.selectedId === hitId) {
            camCtrl.selectedId = null;
            camCtrl.useDynamicTarget = false;
            if (focusHighlightRingMesh) focusHighlightRingMesh.material.opacity = 0.0;
          } else {
            camCtrl.selectedId = hitId;
            camCtrl.useDynamicTarget = true;
            camCtrl.targetPos.set(...item.focusPos);
            camCtrl.targetLook.set(...item.focusLook);
            if (focusHighlightRingMesh) {
              focusHighlightRingMesh.position.y = item.position[1] - 2.48;
              focusHighlightRingMesh.material.opacity = 0.65;
            }
          }
          onStateChange?.();
        }
      }
    },
    handleKeyDown: (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        camCtrl.useDynamicTarget = false;
        camCtrl.targetProgress = Math.min(1, camCtrl.targetProgress + 0.1);
        onStateChange?.();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        camCtrl.useDynamicTarget = false;
        camCtrl.targetProgress = Math.max(0, camCtrl.targetProgress - 0.1);
        onStateChange?.();
      } else if (e.key === 'Escape') {
        camCtrl.selectedId = null;
        camCtrl.useDynamicTarget = false;
        if (focusHighlightRingMesh) focusHighlightRingMesh.material.opacity = 0.0;
        onStateChange?.();
      }
    },
    handleKeyUp: () => {},
    getViewpoints: () => CAMERA_WAYPOINTS.map((wp) => ({
      id: wp.id,
      label: wp.label,
      progress: wp.progress,
      description: wp.label,
    })),
    getActiveViewpointId: () => camCtrl.activeViewpoint,
    goToViewpoint: (id) => {
      const wp = CAMERA_WAYPOINTS.find((w) => w.id === id) || CAMERA_WAYPOINTS[0];
      camCtrl.activeViewpoint = wp.id;
      camCtrl.targetProgress = wp.progress;
      camCtrl.targetOrbitX = 0;
      camCtrl.targetOrbitY = 0;
      camCtrl.selectedId = null;
      camCtrl.useDynamicTarget = true;
      camCtrl.targetPos.set(...wp.position);
      camCtrl.targetLook.set(...wp.lookAt);
      if (focusHighlightRingMesh) focusHighlightRingMesh.material.opacity = 0.0;
      onStateChange?.();
    },
    setProgress: (p) => {
      camCtrl.useDynamicTarget = false;
      camCtrl.selectedId = null;
      camCtrl.targetProgress = Math.max(0, Math.min(1, p));
      onStateChange?.();
    },
    getProgress: () => camCtrl.currentProgress,
    hoverObject: (id) => {
      camCtrl.hoveredId = id && STUDIO_INTERACTABLES.some((s) => s.id === id) ? id : null;
      if (holoShaderMat) holoShaderMat.uniforms.uHoverBoost.value = camCtrl.hoveredId ? 1.0 : 0.0;
      onStateChange?.();
      return STUDIO_INTERACTABLES.find((s) => s.id === camCtrl.hoveredId) || null;
    },
    selectObject: (id) => {
      const item = STUDIO_INTERACTABLES.find((s) => s.id === id) || null;
      camCtrl.selectedId = item ? item.id : null;
      if (item) {
        camCtrl.useDynamicTarget = true;
        camCtrl.targetPos.set(...item.focusPos);
        camCtrl.targetLook.set(...item.focusLook);
        if (focusHighlightRingMesh) {
          focusHighlightRingMesh.position.y = item.position[1] - 2.48;
          focusHighlightRingMesh.material.opacity = 0.65;
        }
      } else {
        camCtrl.useDynamicTarget = false;
        if (focusHighlightRingMesh) focusHighlightRingMesh.material.opacity = 0.0;
      }
      onStateChange?.();
      return item;
    },
    getHoveredObject: () => STUDIO_INTERACTABLES.find((s) => s.id === camCtrl.hoveredId) || null,
    getSelectedObject: () => {
      const item = STUDIO_INTERACTABLES.find((s) => s.id === camCtrl.selectedId);
      return item ? { ...item, heightOffset: 1.2 } : null;
    },
    getInteractiveObjects: () => STUDIO_INTERACTABLES,
    getState: () => ({
      environmentId: 'env-04-resume-profile-studio',
      environmentName: 'Resume & Profile Studio',
      cameraPos: [Number(camera.position.x.toFixed(3)), Number(camera.position.y.toFixed(3)), Number(camera.position.z.toFixed(3))],
      cameraTarget: [Number(camCtrl.currentLook.x.toFixed(3)), Number(camCtrl.currentLook.y.toFixed(3)), Number(camCtrl.currentLook.z.toFixed(3))],
      fov: Number(camera.fov.toFixed(2)),
      currentProgress: Number(camCtrl.currentProgress.toFixed(4)),
      targetProgress: Number(camCtrl.targetProgress.toFixed(4)),
      activeViewpoint: camCtrl.activeViewpoint,
      hoveredObjectId: camCtrl.hoveredId,
      selectedObjectId: camCtrl.selectedId,
      interactableCount: STUDIO_INTERACTABLES.length,
    }),
    dispose: () => {},
  };
}

// ============================================================================
// ENVIRONMENT 05: OPPORTUNITY HORIZON (EXACT ORIGINAL FROM Placement Horizon.zip)
// ============================================================================
export namespace Env05Original {
export const WORLD_CONFIG = {
  origin: [0, 0, 0] as [number, number, number],
  baseFov: 44,
  nearClip: 0.5,
  farClip: 520,
  maxPixelRatio: 1.85,
  // Matches p4.jpg: distant warm horizon core slightly right of center
  sunPosition: [14.0, 5.2, -265.0] as [number, number, number],
  riverZStart: 52.0,
  riverZEnd: -265.0,
};

export const SCENE_DIMENSIONS = WORLD_CONFIG;

/**
 * Evaluates the winding S-curve emerald circuit river centerline X and channel half-width at any world Z,
 * matching the composition of p4.jpg (starts wide in bottom-right foreground, curves left in foreground-midground,
 * then winds in an S-curve toward the glowing horizon at X = +14, Z = -265).
 */
export function evaluateRiverChannel(z: number): {
  centerX: number;
  halfWidth: number;
  recessDepth: number;
} {
  const t = Math.max(0, Math.min(1, (52.0 - z) / 317.0));
  const damp = Math.pow(1.0 - t, 0.78);
  // S-curve meandering + gradual drift toward the right-of-center horizon core (+14.0)
  const sWave =
    Math.sin(z * 0.052 - 0.55) * 6.8 * damp +
    Math.cos(z * 0.026 + 0.3) * 2.6 * damp;
  const horizonDrift = t * 14.0;
  const centerX = sWave + horizonDrift;

  const foregroundFlare = Math.pow(Math.max(0, (z + 28.0) / 80.0), 1.85) * 11.5;
  const halfWidth = 2.4 + (1.0 - t) * 3.2 + foregroundFlare;
  const recessDepth = 0.72 * (1.0 - t * 0.45);

  return { centerX, halfWidth, recessDepth };
}

/**
 * 6 Authored Camera Spline Waypoints synchronized with the 6 Landing Page sections:
 *   0.00 = Section 1: Cinematic Hero (Establishing view matching p4.jpg)
 *   0.20 = Section 2: Explore the Opportunity Network
 *   0.40 = Section 3: Student Career Journey
 *   0.60 = Section 4: Recruiter Ecosystem
 *   0.80 = Section 5: Placement Team Ecosystem
 *   1.00 = Section 6: Final Destination (Approaching the glowing horizon)
 */
export const CAMERA_PATH_WAYPOINTS: Array<{
  progress: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
}> = [
  {
    progress: 0.0,
    position: [-1.8, 5.2, 48.0],
    lookAt: [4.5, 2.8, -85.0],
    fov: 44,
  },
  {
    progress: 0.2,
    position: [2.2, 4.0, 20.0],
    lookAt: [-2.5, 2.0, -45.0],
    fov: 44,
  },
  {
    progress: 0.4,
    position: [-3.8, 4.4, -12.0],
    lookAt: [3.2, 2.4, -78.0],
    fov: 43,
  },
  {
    progress: 0.6,
    position: [4.2, 4.6, -46.0],
    lookAt: [-1.5, 2.8, -118.0],
    fov: 43,
  },
  {
    progress: 0.8,
    position: [1.5, 4.8, -88.0],
    lookAt: [10.5, 3.8, -195.0],
    fov: 42,
  },
  {
    progress: 1.0,
    position: [7.5, 5.6, -145.0],
    lookAt: [14.0, 5.0, -265.0],
    fov: 40,
  },
];

export const VIEWPOINTS: Record<ViewpointId, ViewpointConfig> = {
  establishing: {
    id: 'establishing',
    label: 'Hero',
    progress: 0.0,
    position: [-1.8, 5.2, 48.0],
    lookAt: [4.5, 2.8, -85.0],
    fov: 44,
    description: 'Establishing view of the digital recruitment valley.',
  },
  'river-delta': {
    id: 'river-delta',
    label: 'Opportunities',
    progress: 0.2,
    position: [2.2, 4.0, 20.0],
    lookAt: [-2.5, 2.0, -45.0],
    fov: 44,
    description: 'Explore open campus job opportunities and company drives.',
  },
  'west-grove': {
    id: 'west-grove',
    label: 'For Students',
    progress: 0.4,
    position: [-3.8, 4.4, -12.0],
    lookAt: [3.2, 2.4, -78.0],
    fov: 43,
    description: 'Student profile, resume builder, ATS analysis, and application tracking.',
  },
  'east-grove': {
    id: 'east-grove',
    label: 'For Recruiters',
    progress: 0.6,
    position: [4.2, 4.6, -46.0],
    lookAt: [-1.5, 2.8, -118.0],
    fov: 43,
    description: 'Job posting, applicant management, and candidate shortlisting.',
  },
  'mid-canyon': {
    id: 'mid-canyon',
    label: 'Placement Teams',
    progress: 0.8,
    position: [1.5, 4.8, -88.0],
    lookAt: [10.5, 3.8, -195.0],
    fov: 42,
    description: 'Campus recruitment coordination, drive approvals, and cohort analytics.',
  },
  'solar-horizon': {
    id: 'solar-horizon',
    label: 'Destination',
    progress: 1.0,
    position: [7.5, 5.6, -145.0],
    lookAt: [14.0, 5.0, -265.0],
    fov: 40,
    description: 'Build the next generation of campus careers.',
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
 * AI Campus Recruitment System routes and sections.
 * Focus camera poses are framed so the selected 3D terminal sits clearly in the
 * foreground while keeping the glowing emerald river and horizon visible behind it.
 */
export const INTERACTABLE_OBJECTS: InteractableObjectSpec[] = [
  // A. Interactive Circular Terminals (3)
  {
    id: 'terminal-delta-west',
    name: 'Opportunity Discovery Terminal',
    category: 'circuit-terminal',
    categoryLabel: 'Opportunity Terminal',
    position: [-7.2, 0.35, 33.0],
    focusCameraPos: [-9.8, 3.2, 45.0],
    focusLookAt: [2.5, 1.8, -35.0],
    riverProgress: 0.2,
    hitRadius: 3.4,
    accentColor: '#00F0A0',
    route: '/jobs',
    actionLabel: 'Explore Opportunities',
    structuralRole: 'Browse Open Positions & Eligibility Criteria',
    description: 'Browse published campus job opportunities, filter by role type, and review application requirements.',
  },
  {
    id: 'terminal-delta-east',
    name: 'Resume Builder & ATS Terminal',
    category: 'circuit-terminal',
    categoryLabel: 'Student Terminal',
    position: [5.8, 0.4, 10.0],
    focusCameraPos: [2.2, 3.1, 21.5],
    focusLookAt: [8.2, 1.8, -65.0],
    riverProgress: 0.4,
    hitRadius: 3.2,
    accentColor: '#00D9E8',
    route: '/resume-builder',
    actionLabel: 'Open Resume Builder',
    structuralRole: 'Resume Authoring, Preview & ATS Analysis',
    description: 'Build or upload your resume, preview standardized formatting, and inspect section-by-section ATS analysis.',
  },
  {
    id: 'terminal-canyon-mid',
    name: 'Application Tracking Terminal',
    category: 'circuit-terminal',
    categoryLabel: 'Student Terminal',
    position: [-7.8, 0.45, -18.0],
    focusCameraPos: [-10.2, 3.4, -5.5],
    focusLookAt: [3.5, 2.0, -90.0],
    riverProgress: 0.42,
    hitRadius: 3.2,
    accentColor: '#10B981',
    route: '/my-applications',
    actionLabel: 'Track Applications',
    structuralRole: 'Real-Time Application Status & Timeline',
    description: 'Review your submitted job applications and monitor status progression from Applied to Shortlisted and Selected.',
  },

  // B. Interactive Career & Ecosystem Terminals (3)
  {
    id: 'tree-west-grove',
    name: 'Student Workspace Terminal',
    category: 'digital-tree',
    categoryLabel: 'Student Ecosystem',
    position: [8.8, 0.5, -6.0],
    focusCameraPos: [4.8, 3.5, 6.5],
    focusLookAt: [11.0, 2.0, -85.0],
    riverProgress: 0.4,
    hitRadius: 3.8,
    accentColor: '#00F0A0',
    route: '/student-dashboard',
    actionLabel: 'Open Student Workspace',
    structuralRole: 'Student Profile, Skills & Recommendations',
    description: 'Access your student dashboard to manage academic details, view recommended jobs, and track readiness.',
  },
  {
    id: 'tree-east-grove',
    name: 'Recruiter Job Posting Terminal',
    category: 'digital-tree',
    categoryLabel: 'Recruiter Ecosystem',
    position: [11.5, 0.55, -36.0],
    focusCameraPos: [7.2, 3.6, -23.0],
    focusLookAt: [13.5, 2.4, -125.0],
    riverProgress: 0.6,
    hitRadius: 3.8,
    accentColor: '#00D9E8',
    route: '/post-job',
    actionLabel: 'Post a Campus Job',
    structuralRole: 'Publish Job Openings & Eligibility Filters',
    description: 'Create new campus job postings with required skills, minimum CGPA, allowed branches, and application deadlines.',
  },
  {
    id: 'tree-deep-valley',
    name: 'Placement Coordination Terminal',
    category: 'digital-tree',
    categoryLabel: 'Placement Ecosystem',
    position: [-6.5, 0.65, -76.0],
    focusCameraPos: [-9.2, 3.8, -62.0],
    focusLookAt: [8.5, 2.8, -175.0],
    riverProgress: 0.8,
    hitRadius: 4.2,
    accentColor: '#FFE5A0',
    route: '/placement-dashboard',
    actionLabel: 'Open Placement Workspace',
    structuralRole: 'Drive Approvals & Cohort Analytics',
    description: 'Coordinate campus recruitment drives, approve pending job postings, and review cohort placement outcomes.',
  },

  // C. Interactive Network Nodes (3)
  {
    id: 'node-west-terrace',
    name: 'Student Profile & Settings Node',
    category: 'network-node',
    categoryLabel: 'Account Node',
    position: [7.6, 0.5, 22.0],
    focusCameraPos: [3.8, 3.2, 34.0],
    focusLookAt: [9.5, 1.8, -45.0],
    riverProgress: 0.22,
    hitRadius: 3.2,
    accentColor: '#00F0A0',
    route: '/profile',
    actionLabel: 'Manage Profile',
    structuralRole: 'Academic Profile & Career Account Settings',
    description: 'Configure your academic department, graduation batch, CGPA, and technical skills.',
  },
  {
    id: 'node-east-terrace',
    name: 'Recruiter Applicant Management Node',
    category: 'network-node',
    categoryLabel: 'Recruiter Node',
    position: [-5.5, 0.55, -48.0],
    focusCameraPos: [-8.2, 3.6, -35.0],
    focusLookAt: [6.0, 2.4, -135.0],
    riverProgress: 0.62,
    hitRadius: 3.4,
    accentColor: '#00D9E8',
    route: '/recruiter-dashboard',
    actionLabel: 'Open Recruiter Workspace',
    structuralRole: 'Candidate Discovery & Applicant Management',
    description: 'Review submitted student applications, inspect parsed resumes, and update applicant stages.',
  },
  {
    id: 'node-canyon-overlook',
    name: 'Active Job Management Node',
    category: 'network-node',
    categoryLabel: 'Recruiter Node',
    position: [12.2, 0.65, -66.0],
    focusCameraPos: [7.8, 3.8, -53.0],
    focusLookAt: [14.0, 2.8, -165.0],
    riverProgress: 0.72,
    hitRadius: 3.6,
    accentColor: '#10B981',
    route: '/my-jobs',
    actionLabel: 'Manage Posted Jobs',
    structuralRole: 'Recruiter Job Listings & Rosters',
    description: 'View and manage your published campus job postings and inspect applicant rosters for each position.',
  },

  // D. Interactive Circuit River Checkpoints (3)
  {
    id: 'river-cp-delta',
    name: 'Opportunity Network Checkpoint',
    category: 'river-checkpoint',
    categoryLabel: 'River Checkpoint',
    position: [-1.2, -0.25, 24.0],
    focusCameraPos: [2.2, 4.0, 20.0],
    focusLookAt: [-2.5, 2.0, -45.0],
    riverProgress: 0.2,
    hitRadius: 4.0,
    accentColor: '#00F0A0',
    route: '#section-opportunities',
    actionLabel: 'View Opportunity Network',
    structuralRole: 'Section 02 • Job Discovery & Company Drives',
    description: 'Travel along the emerald circuit river to the job discovery and filtering section.',
  },
  {
    id: 'river-cp-midcanyon',
    name: 'Recruiter Ecosystem Checkpoint',
    category: 'river-checkpoint',
    categoryLabel: 'River Checkpoint',
    position: [2.4, -0.25, -42.0],
    focusCameraPos: [4.2, 4.6, -46.0],
    focusLookAt: [-1.5, 2.8, -118.0],
    riverProgress: 0.6,
    hitRadius: 4.5,
    accentColor: '#00D9E8',
    route: '#section-recruiters',
    actionLabel: 'View Recruiter Ecosystem',
    structuralRole: 'Section 04 • Job Posting & Applicant Workflows',
    description: 'Advance to the recruiter network region for job posting and candidate management.',
  },
  {
    id: 'river-cp-horizon',
    name: 'Horizon Destination Checkpoint',
    category: 'river-checkpoint',
    categoryLabel: 'River Checkpoint',
    position: [8.2, -0.2, -115.0],
    focusCameraPos: [7.5, 5.6, -145.0],
    focusLookAt: [14.0, 5.0, -265.0],
    riverProgress: 1.0,
    hitRadius: 5.5,
    accentColor: '#FFE5A0',
    route: '#section-destination',
    actionLabel: 'Reach Final Destination',
    structuralRole: 'Section 06 • Horizon Convergence',
    description: 'Approach the luminous horizon to get started or explore open campus jobs.',
  },
];
/**
 * Custom GLSL Shaders Reconstructing the p4.jpg Digital Landscape:
 *  - Deep environment (#020A0D)
 *  - Dark metallic contour-ribbed terrain (#07151A) & raised surfaces (#10252A)
 *  - Winding emerald energy river (#00F0A0, #10B981, #00D9E8) with warm horizon reflections (#FFE5A0)
 *  - Flowing aurora-like emerald/turquoise sky ribbons
 */

export const RIVER_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPosition.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

export const RIVER_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vNormal;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uPulseColor;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;
  uniform float uRiverHoverZ;
  uniform float uRiverHoverBoost;
  uniform vec3 uSunPosition;
  uniform vec3 uCameraPos;

  float hash11(float p) {
    p = fract(p * 0.1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
  }

  void main() {
    float u = (vUv.x - 0.5) * 2.0;
    float absU = abs(u);
    float v = vUv.y;

    // Sleek parallel emerald-cyan energy lanes inside the winding river channel (matching p4.jpg)
    float leftCore = exp(-pow((u + 0.42) * 5.8, 2.0));
    float rightCore = exp(-pow((u - 0.42) * 5.8, 2.0));
    float centerCore = exp(-pow(u * 4.5, 2.0));
    float innerFill = exp(-absU * absU * 2.4);

    // Fine parallel circuit traces
    float laneFreq = 36.0;
    float laneId = floor((u + 1.0) * 0.5 * laneFreq);
    float laneFract = abs(fract((u + 1.0) * 0.5 * laneFreq) - 0.5) * 2.0;
    float fineTrace = 1.0 - smoothstep(0.12, 0.36, laneFract);

    // Continuous flowing energy packets along the river curves
    float speed1 = 0.32 + hash11(laneId * 1.7) * 0.55;
    float packet1 = pow(0.5 + 0.5 * sin((v * 18.0 + uTime * speed1) * 6.28318 + hash11(laneId) * 6.28), 4.0);
    float packet2 = pow(0.5 + 0.5 * sin((v * 34.0 - uTime * 0.65) * 6.28318), 6.0);

    // Exact palette from Section 1:
    vec3 deepEnv = vec3(0.008, 0.039, 0.051);        // #020A0D
    vec3 darkMetallic = vec3(0.027, 0.082, 0.102);   // #07151A
    vec3 raisedSurface = vec3(0.063, 0.145, 0.165);  // #10252A
    vec3 emeraldEnergy = vec3(0.0, 0.941, 0.627);    // #00F0A0
    vec3 greenHighlight = vec3(0.063, 0.725, 0.506); // #10B981
    vec3 cyanPathway = vec3(0.0, 0.851, 0.910);      // #00D9E8
    vec3 warmHorizon = vec3(1.0, 0.898, 0.627);      // #FFE5A0

    vec3 col = mix(deepEnv, darkMetallic, innerFill);
    col = mix(col, greenHighlight * 0.65, innerFill * 0.7);

    // Intense twin emerald-cyan laser veins along left, center, and right channels
    float primaryVeins = leftCore * 1.15 + rightCore * 1.15 + centerCore * 0.75;
    vec3 veinColor = mix(emeraldEnergy, cyanPathway, 0.35 + 0.35 * sin(v * 10.0 + u * 2.5));
    col += veinColor * primaryVeins * (0.75 + 0.45 * packet1);
    col += emeraldEnergy * fineTrace * innerFill * (0.28 + 0.52 * packet1);
    col += vec3(0.88, 1.0, 0.95) * (leftCore + rightCore) * (0.35 + 0.65 * packet2);

    // Interactive River Checkpoint Hover / Approach Ripple
    float zDistToRiverHover = abs(vWorldPos.z - uRiverHoverZ);
    float riverSegEmphasis = exp(-zDistToRiverHover * 0.075) * uRiverHoverBoost;
    float riverRipple = (0.5 + 0.5 * sin(zDistToRiverHover * 0.85 - uTime * 7.0)) * exp(-zDistToRiverHover * 0.05) * uRiverHoverBoost;
    col += mix(emeraldEnergy, cyanPathway, 0.5) * (riverSegEmphasis * 0.55 + riverRipple * 0.45);

    // Sleek raised metallic curb banks (#10252A) with warm golden & emerald edge reflections
    float curbBand = smoothstep(0.76, 0.88, absU) * (1.0 - smoothstep(0.93, 1.0, absU));
    float curbHighlight = exp(-pow((absU - 0.84) * 28.0, 2.0));
    col = mix(col, raisedSurface, smoothstep(0.78, 0.96, absU) * 0.88);
    col += mix(emeraldEnergy, warmHorizon, 0.45) * curbHighlight * 0.55;
    col += warmHorizon * curbBand * 0.18;

    // Distant warm horizon (#FFE5A0) reflection on the river surface
    float horizonGlow = smoothstep(0.42, 0.98, v) * exp(-absU * absU * 2.8);
    col = mix(col, warmHorizon, horizonGlow * 0.82);

    // Interactive radial pulse wave when a terminal is selected
    float pulseDist = length(vWorldPos - uPulseOrigin);
    float pulseRadius = uPulseTime * 48.0;
    float pulseRing = exp(-pow((pulseDist - pulseRadius) * 0.22, 2.0)) * smoothstep(6.0, 0.0, uPulseTime);
    col += uPulseColor * pulseRing * 1.25;

    // Proximity glow from hovered or selected 3D terminals
    float nearHover = exp(-length(vWorldPos - uHoveredPos) * 0.14);
    float nearSelect = exp(-length(vWorldPos - uSelectedPos) * 0.12);
    col += emeraldEnergy * (nearHover * 0.4 + nearSelect * 0.65);

    // Controlled atmospheric depth perspective
    vec3 horizonFog = mix(vec3(0.02, 0.14, 0.14), warmHorizon, smoothstep(0.58, 1.0, v));
    float fogFactor = smoothstep(0.68, 1.0, v) * 0.58;
    col = mix(col * uIntensity, horizonFog, fogFactor);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const TERRACE_VERTEX_SHADER = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const TERRACE_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uPulseColor;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;

  void main() {
    vec3 n = normalize(vNormal);

    // Exact palette: dark metallic terrain (#07151A) & raised surfaces (#10252A)
    vec3 deepEnv = vec3(0.008, 0.039, 0.051);
    vec3 darkMetallic = vec3(0.027, 0.082, 0.102);
    vec3 raisedSurface = vec3(0.063, 0.145, 0.165);
    vec3 emeraldEnergy = vec3(0.0, 0.941, 0.627);
    vec3 cyanPathway = vec3(0.0, 0.851, 0.910);
    vec3 warmHorizon = vec3(1.0, 0.898, 0.627);

    // Sleek parallel topographic contour ribs matching p4.jpg's ribbed metallic hills
    float contourPhase = vWorldPos.x * 1.45 + vWorldPos.z * 0.32 + vWorldPos.y * 2.2;
    float contourRib = pow(0.5 + 0.5 * sin(contourPhase * 3.14159), 6.0);
    float fineStrata = 0.5 + 0.5 * sin(contourPhase * 9.42);

    vec3 col = mix(deepEnv, darkMetallic, 0.65 + 0.35 * n.y);
    col = mix(col, raisedSurface, contourRib * 0.55);

    // Directional lighting & metallic specular reflection from the warm horizon + emerald river
    vec3 toSun = normalize(vec3(14.0, 12.0, -265.0) - vWorldPos);
    vec3 viewDir = normalize(vec3(0.0, 6.0, 48.0) - vWorldPos);
    vec3 halfVec = normalize(toSun + viewDir);
    float spec = pow(max(0.0, dot(n, halfVec)), 28.0);
    float rim = pow(1.0 - max(0.0, dot(n, viewDir)), 2.4);

    // Warm golden reflection on right-bank ribbed terrain & emerald reflection near river
    float riverProx = exp(-abs(vWorldPos.x) * 0.045);
    float rightBankWarmth = smoothstep(-5.0, 18.0, vWorldPos.x) * smoothstep(-40.0, 45.0, vWorldPos.z);

    col += warmHorizon * spec * (0.35 + 0.65 * contourRib) * (0.45 + 0.55 * rightBankWarmth);
    col += mix(emeraldEnergy, cyanPathway, 0.4) * contourRib * riverProx * 0.32;
    col += emeraldEnergy * rim * fineStrata * 0.18;

    // Subtle flowing circuit pulse along select contour veins
    float activeVein = pow(0.5 + 0.5 * sin(contourPhase * 1.57 - uTime * 1.4), 10.0);
    col += emeraldEnergy * contourRib * activeVein * 0.26;

    // Interactive terminal hover / selection proximity reflection on metallic ground
    float hoverHighlight = exp(-length(vWorldPos - uHoveredPos) * 0.15);
    float selectHighlight = exp(-length(vWorldPos - uSelectedPos) * 0.12);
    float pulseDist = length(vWorldPos - uPulseOrigin);
    float pulseWave = exp(-pow((pulseDist - uPulseTime * 48.0) * 0.2, 2.0)) * smoothstep(6.0, 0.0, uPulseTime);

    col += emeraldEnergy * (hoverHighlight * 0.5 + selectHighlight * 0.8);
    col += uPulseColor * pulseWave * 0.85;

    // Atmospheric depth fade toward horizon
    float depthFactor = smoothstep(20.0, -255.0, vWorldPos.z);
    vec3 mistColor = mix(vec3(0.02, 0.12, 0.14), warmHorizon * 0.78, pow(depthFactor, 1.7));
    col = mix(col * uIntensity, mistColor, depthFactor * 0.62);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const FOREST_HOLOGRAM_VERTEX_SHADER = /* glsl */ `
  attribute float aTreeSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aTreeSeed;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const FOREST_HOLOGRAM_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uPulseOrigin;
  uniform float uPulseTime;
  uniform vec3 uHoveredPos;
  uniform vec3 uSelectedPos;

  void main() {
    // Soft upward emerald-cyan energy plume emitted from circular terminals (matching p4.jpg)
    float radialFade = sin(vUv.x * 3.14159265);
    float verticalFade = smoothstep(0.0, 0.18, vUv.y) * pow(1.0 - vUv.y, 1.85);
    float wave = 0.65 + 0.35 * sin((vUv.y * 6.0 - uTime * 1.4 + vSeed) * 6.28318);

    vec3 emeraldEnergy = vec3(0.0, 0.941, 0.627);
    vec3 cyanPathway = vec3(0.0, 0.851, 0.910);
    vec3 col = mix(emeraldEnergy, cyanPathway, vUv.y * 0.6);

    float boost =
      exp(-length(vWorldPos - uHoveredPos) * 0.1) * 0.55 +
      exp(-length(vWorldPos - uSelectedPos) * 0.08) * 0.85;

    float alpha = radialFade * verticalFade * wave * 0.34 * (1.0 + boost) * uIntensity;
    gl_FragColor = vec4(col * (1.0 + boost * 0.6), clamp(alpha, 0.0, 0.72));
  }
`;

export const MOUNTAIN_VERTEX_SHADER = /* glsl */ `
  attribute float aRidgeFactor;
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRidge;

  void main() {
    vRidge = aRidgeFactor;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const MOUNTAIN_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying float vRidge;

  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uSunPosition;

  void main() {
    vec3 n = normalize(vNormal);
    vec3 toSun = normalize(uSunPosition - vWorldPos);
    vec3 viewDir = normalize(vec3(0.0, 6.0, 48.0) - vWorldPos);

    // Parallel contour ribs along the undulating mountain formations (matching p4.jpg)
    float ribPhase = vWorldPos.x * 1.15 + vWorldPos.z * 0.28 + vWorldPos.y * 1.65;
    float contourRib = pow(0.5 + 0.5 * sin(ribPhase * 3.14159), 5.0);

    vec3 deepEnv = vec3(0.008, 0.039, 0.051);
    vec3 darkMetallic = vec3(0.027, 0.082, 0.102);
    vec3 raisedSurface = vec3(0.063, 0.145, 0.165);
    vec3 emeraldEnergy = vec3(0.0, 0.941, 0.627);
    vec3 cyanPathway = vec3(0.0, 0.851, 0.910);
    vec3 warmHorizon = vec3(1.0, 0.898, 0.627);

    float sunDiffuse = max(0.0, dot(n, toSun));
    float crestRim = smoothstep(0.28, 0.88, vRidge);

    vec3 col = mix(deepEnv, darkMetallic, 0.5 + 0.5 * n.y);
    col = mix(col, raisedSurface, contourRib * 0.65);

    // Specular contour highlights & emerald/warm-horizon rim illumination on the undulating hills
    vec3 rimCol = mix(emeraldEnergy, warmHorizon, sunDiffuse * 0.65);
    col += rimCol * crestRim * (0.28 + 0.58 * contourRib) * (0.45 + 0.55 * sunDiffuse);
    col += cyanPathway * contourRib * crestRim * 0.22;

    float distFactor = smoothstep(-25.0, -265.0, vWorldPos.z);
    vec3 mistCol = mix(vec3(0.02, 0.14, 0.15), warmHorizon * 0.72, pow(distFactor, 1.5));
    col = mix(col * uIntensity, mistCol, clamp(distFactor * 0.58, 0.0, 0.82));

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const SKY_DATA_VERTEX_SHADER = /* glsl */ `
  attribute float aStreamSeed;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  void main() {
    vUv = uv;
    vSeed = aStreamSeed;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const SKY_DATA_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying float vSeed;

  uniform float uTime;
  uniform float uIntensity;

  void main() {
    // Flowing emerald & cyan aurora curtains in the upper sky (matching p4.jpg)
    float u = vUv.x;
    float v = vUv.y;

    float wave1 = sin(u * 6.28318 + uTime * 0.28 + vSeed * 4.0) * 0.5 + 0.5;
    float wave2 = sin(u * 12.566 - uTime * 0.18 + v * 3.0) * 0.5 + 0.5;
    float ribbonProfile = exp(-pow((v - 0.42 - 0.12 * sin(u * 4.5 + uTime * 0.22)) * 4.2, 2.0));
    float lengthwiseFade = smoothstep(0.0, 0.18, u) * smoothstep(1.0, 0.15, u);

    vec3 emeraldEnergy = vec3(0.0, 0.941, 0.627);    // #00F0A0
    vec3 greenHighlight = vec3(0.063, 0.725, 0.506); // #10B981
    vec3 cyanPathway = vec3(0.0, 0.851, 0.910);      // #00D9E8

    vec3 auroraCol = mix(greenHighlight, emeraldEnergy, wave1);
    auroraCol = mix(auroraCol, cyanPathway, wave2 * 0.45);

    float alpha = ribbonProfile * lengthwiseFade * (0.28 + 0.36 * wave1 * wave2) * uIntensity;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(auroraCol, clamp(alpha, 0.0, 0.76));
  }
`;
export interface SceneMaterialSet {
  riverMaterial: THREE.ShaderMaterial;
  terraceMaterial: THREE.ShaderMaterial;
  forestHologramMaterial: THREE.ShaderMaterial;
  mountainMaterial: THREE.ShaderMaterial;
  skyDataMaterial: THREE.ShaderMaterial;
  pineCoreMaterial: THREE.MeshStandardMaterial;
  pinePadMaterial: THREE.MeshBasicMaterial;
  raisedTraceCyanMaterial: THREE.MeshBasicMaterial;
  raisedTraceEmeraldMaterial: THREE.MeshBasicMaterial;
  raisedTraceGoldMaterial: THREE.MeshBasicMaterial;
  dispose: () => void;
}

export function createMaterials(uniforms: SceneUniforms): SceneMaterialSet {
  const riverMaterial = new THREE.ShaderMaterial({
    vertexShader: RIVER_VERTEX_SHADER,
    fragmentShader: RIVER_FRAGMENT_SHADER,
    uniforms: {
      uTime: uniforms.uTime,
      uIntensity: uniforms.uIntensity,
      uPulseOrigin: uniforms.uPulseOrigin,
      uPulseTime: uniforms.uPulseTime,
      uPulseColor: uniforms.uPulseColor,
      uHoveredPos: uniforms.uHoveredPos,
      uSelectedPos: uniforms.uSelectedPos,
      uRiverHoverZ: uniforms.uRiverHoverZ,
      uRiverHoverBoost: uniforms.uRiverHoverBoost,
      uSunPosition: uniforms.uSunPosition,
      uCameraPos: uniforms.uCameraPos,
    },
    side: THREE.DoubleSide,
  });

  const terraceMaterial = new THREE.ShaderMaterial({
    vertexShader: TERRACE_VERTEX_SHADER,
    fragmentShader: TERRACE_FRAGMENT_SHADER,
    uniforms: {
      uTime: uniforms.uTime,
      uIntensity: uniforms.uIntensity,
      uPulseOrigin: uniforms.uPulseOrigin,
      uPulseTime: uniforms.uPulseTime,
      uPulseColor: uniforms.uPulseColor,
      uHoveredPos: uniforms.uHoveredPos,
      uSelectedPos: uniforms.uSelectedPos,
    },
  });

  const forestHologramMaterial = new THREE.ShaderMaterial({
    vertexShader: FOREST_HOLOGRAM_VERTEX_SHADER,
    fragmentShader: FOREST_HOLOGRAM_FRAGMENT_SHADER,
    uniforms: {
      uTime: uniforms.uTime,
      uIntensity: uniforms.uIntensity,
      uPulseOrigin: uniforms.uPulseOrigin,
      uPulseTime: uniforms.uPulseTime,
      uHoveredPos: uniforms.uHoveredPos,
      uSelectedPos: uniforms.uSelectedPos,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const mountainMaterial = new THREE.ShaderMaterial({
    vertexShader: MOUNTAIN_VERTEX_SHADER,
    fragmentShader: MOUNTAIN_FRAGMENT_SHADER,
    uniforms: {
      uTime: uniforms.uTime,
      uIntensity: uniforms.uIntensity,
      uSunPosition: uniforms.uSunPosition,
    },
  });

  const skyDataMaterial = new THREE.ShaderMaterial({
    vertexShader: SKY_DATA_VERTEX_SHADER,
    fragmentShader: SKY_DATA_FRAGMENT_SHADER,
    uniforms: {
      uTime: uniforms.uTime,
      uIntensity: uniforms.uIntensity,
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const pineCoreMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#07151A'),
    emissive: new THREE.Color('#10252A'),
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.78,
  });

  const pinePadMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00F0A0'),
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceCyanMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00D9E8'),
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceEmeraldMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00F0A0'),
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceGoldMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#FFE5A0'),
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
  });

  const all: THREE.Material[] = [
    riverMaterial,
    terraceMaterial,
    forestHologramMaterial,
    mountainMaterial,
    skyDataMaterial,
    pineCoreMaterial,
    pinePadMaterial,
    raisedTraceCyanMaterial,
    raisedTraceEmeraldMaterial,
    raisedTraceGoldMaterial,
  ];

  return {
    riverMaterial,
    terraceMaterial,
    forestHologramMaterial,
    mountainMaterial,
    skyDataMaterial,
    pineCoreMaterial,
    pinePadMaterial,
    raisedTraceCyanMaterial,
    raisedTraceEmeraldMaterial,
    raisedTraceGoldMaterial,
    dispose: () => {
      for (const m of all) m.dispose();
    },
  };
}
export interface SkyGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Reconstructs the sky and horizon of p4.jpg:
 *  1. Sweeping 3D emerald/turquoise aurora ribbons in the upper-center and upper-right sky
 *  2. Full-frustum deep #020A0D atmospheric sky backdrop with the #FFE5A0 warm horizon core
 *  3. 4 concentric thin luminous emerald/cyan semicircular target rings + vertical zenith crosshair around the horizon core
 */
export function buildSkyGeometry(materials: SceneMaterialSet): SkyGeometryResult {
  const group = new THREE.Group();
  group.name = 'AuroraSkyAndHorizonRingsGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  // 1. 3D Curved Aurora Ribbons sweeping across the upper-center and upper-right sky (matching p4.jpg)
  const ribbonSpecs = [
    {
      pts: [
        new THREE.Vector3(-18, 62, -110),
        new THREE.Vector3(14, 52, -145),
        new THREE.Vector3(32, 38, -185),
        new THREE.Vector3(24, 24, -225),
      ],
      width: 16.0,
      seed: 0.2,
    },
    {
      pts: [
        new THREE.Vector3(28, 48, -135),
        new THREE.Vector3(58, 38, -175),
        new THREE.Vector3(88, 32, -210),
        new THREE.Vector3(115, 28, -240),
      ],
      width: 14.0,
      seed: 1.5,
    },
    {
      pts: [
        new THREE.Vector3(8, 34, -165),
        new THREE.Vector3(36, 26, -195),
        new THREE.Vector3(64, 22, -225),
        new THREE.Vector3(86, 18, -250),
      ],
      width: 10.5,
      seed: 2.8,
    },
  ];

  for (const spec of ribbonSpecs) {
    const curve = new THREE.CatmullRomCurve3(spec.pts);
    const segU = 64;
    const segV = 12;
    const pos = new Float32Array((segU + 1) * (segV + 1) * 3);
    const uv = new Float32Array((segU + 1) * (segV + 1) * 2);
    const seeds = new Float32Array((segU + 1) * (segV + 1));
    const idx: number[] = [];

    let pIdx = 0;
    let uIdx = 0;
    let sIdx = 0;

    for (let iu = 0; iu <= segU; iu++) {
      const u = iu / segU;
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);
      const sideVec = new THREE.Vector3(-tan.z, 0.35, tan.x).normalize();

      for (let iv = 0; iv <= segV; iv++) {
        const v = iv / segV;
        const signedV = (v - 0.5) * 2.0;
        const archY = Math.cos(signedV * 1.3) * 2.2;

        pos[pIdx++] = pt.x + sideVec.x * signedV * spec.width;
        pos[pIdx++] = pt.y + archY + signedV * 3.5;
        pos[pIdx++] = pt.z + sideVec.z * signedV * spec.width * 0.4;

        uv[uIdx++] = u;
        uv[uIdx++] = v;

        seeds[sIdx++] = spec.seed;
      }
    }

    for (let iu = 0; iu < segU; iu++) {
      for (let iv = 0; iv < segV; iv++) {
        const a = iu * (segV + 1) + iv;
        const b = a + 1;
        const c = a + (segV + 1);
        const d = c + 1;
        idx.push(a, b, c, b, d, c);
      }
    }

    const auroraGeo = new THREE.BufferGeometry();
    auroraGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    auroraGeo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    auroraGeo.setAttribute('aStreamSeed', new THREE.BufferAttribute(seeds, 1));
    auroraGeo.setIndex(idx);
    geometriesToDispose.push(auroraGeo);

    const auroraMesh = new THREE.Mesh(auroraGeo, materials.skyDataMaterial);
    auroraMesh.name = 'SkyAuroraCurtainRibbon';
    group.add(auroraMesh);
  }

  // 2. Seamless Full-Frustum Deep #020A0D Sky Backdrop + #FFE5A0 Horizon Sun Core
  const backdropGeo = new THREE.PlaneGeometry(960, 440, 1, 1);
  geometriesToDispose.push(backdropGeo);

  const backdropMat = new THREE.ShaderMaterial({
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uIntensity;

      void main() {
        vec3 deepEnv = vec3(0.008, 0.039, 0.051);        // #020A0D
        vec3 darkTealSky = vec3(0.020, 0.110, 0.125);
        vec3 emeraldMist = vec3(0.05, 0.34, 0.28);
        vec3 warmHorizon = vec3(1.0, 0.898, 0.627);      // #FFE5A0

        float h = clamp((vUv.y - 0.34) / 0.58, 0.0, 1.0);
        vec3 sky = mix(emeraldMist, darkTealSky, smoothstep(0.0, 0.32, h));
        sky = mix(sky, deepEnv, smoothstep(0.28, 0.82, h));

        // Right-of-center horizon sun core matching p4.jpg
        vec2 sunCenter = vec2(0.515, 0.375);
        vec2 sunDelta = (vUv - sunCenter) * vec2(3.8, 1.75);
        float sunDist = length(sunDelta);

        float pulse = 0.96 + 0.04 * sin(uTime * 1.2);
        float coreGlow = exp(-sunDist * sunDist * 52.0) * pulse;
        float innerHalo = exp(-sunDist * sunDist * 11.0) * pulse;
        float outerHalo = exp(-sunDist * 3.2);

        sky += vec3(0.0, 0.85, 0.62) * outerHalo * 0.42;
        sky = mix(sky, warmHorizon, clamp(innerHalo * 0.88, 0.0, 1.0));
        sky = mix(sky, vec3(1.0, 0.99, 0.93), clamp(coreGlow * 1.25, 0.0, 1.0));

        gl_FragColor = vec4(sky * uIntensity, 1.0);
      }
    `,
    uniforms: {
      uTime: materials.riverMaterial.uniforms.uTime,
      uIntensity: materials.riverMaterial.uniforms.uIntensity,
    },
    depthWrite: false,
  });
  materialsToDispose.push(backdropMat);

  const backdropMesh = new THREE.Mesh(backdropGeo, backdropMat);
  backdropMesh.position.set(0, 48, WORLD_CONFIG.sunPosition[2] - 12);
  backdropMesh.name = 'HorizonSkyBackdrop';
  group.add(backdropMesh);

  // 3. Signature 4 Concentric Luminous Semicircular Target Rings + Vertical Crosshair around the Horizon Core (matching p4.jpg)
  const [sunX, sunY, sunZ] = WORLD_CONFIG.sunPosition;
  const ringRadii = [11.0, 19.5, 29.0, 39.5];
  const ringMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00F0A0'),
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  materialsToDispose.push(ringMat);

  ringRadii.forEach((r) => {
    const rGeo = new THREE.RingGeometry(r, r + 0.24, 64, 1, 0, Math.PI);
    geometriesToDispose.push(rGeo);
    const rMesh = new THREE.Mesh(rGeo, ringMat);
    rMesh.position.set(sunX, sunY - 1.0, sunZ + 2.0);
    group.add(rMesh);
  });

  // Vertical zenith crosshair beam rising from the horizon core
  const vLineGeo = new THREE.PlaneGeometry(0.24, 48.0);
  geometriesToDispose.push(vLineGeo);
  const vLineMesh = new THREE.Mesh(vLineGeo, ringMat);
  vLineMesh.position.set(sunX, sunY + 22.0, sunZ + 2.0);
  group.add(vLineMesh);

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
      for (const m of materialsToDispose) m.dispose();
    },
  };
}
export interface MountainGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates the large undulating contour-ribbed mountain formations framing the digital landscape
 * (matching the sweeping ribbed hills in the middle ground and background of p4.jpg).
 */
export function buildMountainGeometry(materials: SceneMaterialSet): MountainGeometryResult {
  const group = new THREE.Group();
  group.name = 'UndulatingMountainFormationsGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const smoothWave = (x: number, z: number): number => {
    const w1 = 0.5 + 0.5 * Math.sin(x * 0.042 + z * 0.031);
    const w2 = 0.5 + 0.5 * Math.cos(x * 0.078 - z * 0.054);
    const w3 = 0.5 + 0.5 * Math.sin(x * 0.14 + z * 0.095);
    return w1 * 0.55 + w2 * 0.3 + w3 * 0.15;
  };

  const sides = [-1, 1];
  const segZ = 120;
  const segX = 52;
  const zStart = 20.0;
  const zEnd = -285.0;

  for (const side of sides) {
    const positions = new Float32Array((segZ + 1) * (segX + 1) * 3);
    const ridgeFactors = new Float32Array((segZ + 1) * (segX + 1));
    const indices: number[] = [];

    let pIdx = 0;
    let rIdx = 0;

    for (let iz = 0; iz <= segZ; iz++) {
      const v = iz / segZ;
      const z = zStart + (zEnd - zStart) * v;
      const { centerX, halfWidth } = evaluateRiverChannel(z);

      const innerBaseOffset = side < 0 ? 14.0 + (1.0 - v) * 8.0 : 20.0 + (1.0 - v) * 10.0;
      const startX = centerX + side * (halfWidth + innerBaseOffset);
      const spanX = 115.0;

      // Sweeping undulating mountain domes matching p4.jpg's prominent left-center and distant hills
      const leftMainDome = side < 0 ? Math.exp(-Math.pow((z + 82.0) * 0.018, 2.0)) * 34.0 : 0.0;
      const leftForeMound = side < 0 ? Math.exp(-Math.pow((z - 6.0) * 0.032, 2.0)) * 12.0 : 0.0;
      const midRange = Math.exp(-Math.pow((z + 135.0) * 0.016, 2.0)) * 24.0;
      const farRange = Math.exp(-Math.pow((z + 215.0) * 0.018, 2.0)) * 18.0;
      const longitudinalEnvelope = leftMainDome + leftForeMound + midRange + farRange + 6.0 * Math.sin(v * Math.PI);

      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX;
        const x = startX + side * u * spanX;

        // Smooth bell-shaped dome profile
        const domeArch = Math.sin(Math.pow(u, 0.72) * Math.PI);
        const wVal = smoothWave(x + side * 12.0, z);

        // Sculpted parallel contour ribs along the mountain surface
        const ribSculpt = Math.sin(x * 1.15 + z * 0.28) * 0.14 * domeArch;

        const height =
          1.8 +
          longitudinalEnvelope * domeArch * (0.48 + 0.62 * wVal) * smoothstep(0.0, 0.14, u) +
          ribSculpt;

        positions[pIdx] = x;
        positions[pIdx + 1] = Math.max(1.5, height);
        positions[pIdx + 2] = z;

        ridgeFactors[rIdx] = THREE.MathUtils.clamp(wVal * domeArch * 1.25, 0.0, 1.0);

        pIdx += 3;
        rIdx += 1;
      }
    }

    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = a + 1;
        const c = a + (segX + 1);
        const d = c + 1;

        if (side > 0) {
          indices.push(a, c, b);
          indices.push(b, c, d);
        } else {
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }

    const mtnGeo = new THREE.BufferGeometry();
    mtnGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    mtnGeo.setAttribute('aRidgeFactor', new THREE.BufferAttribute(ridgeFactors, 1));
    mtnGeo.setIndex(indices);
    mtnGeo.computeVertexNormals();
    geometriesToDispose.push(mtnGeo);

    const mtnMesh = new THREE.Mesh(mtnGeo, materials.mountainMaterial);
    mtnMesh.name = side < 0 ? 'WestUndulatingMountains' : 'EastUndulatingMountains';
    group.add(mtnMesh);
  }

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) {
        g.dispose();
      }
    },
  };
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
export interface TerraceGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates genuine 3D layered dark metallic terrain and undulating contour-ribbed
 * banks on both sides of the winding emerald river (matching p4.jpg).
 */
export function buildTerraceGeometry(materials: SceneMaterialSet): TerraceGeometryResult {
  const group = new THREE.Group();
  group.name = 'UndulatingMetallicTerrainGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const sides = [-1, 1]; // -1 = Left bank, +1 = Right bank
  const segZ = 150;
  const segX = 48;
  const zStart = 52.0;
  const zEnd = -265.0;

  for (const side of sides) {
    const positions = new Float32Array((segZ + 1) * (segX + 1) * 3);
    const uvs = new Float32Array((segZ + 1) * (segX + 1) * 2);
    const indices: number[] = [];

    let pIdx = 0;
    let uvIdx = 0;

    for (let iz = 0; iz <= segZ; iz++) {
      const v = iz / segZ;
      const z = zStart + (zEnd - zStart) * v;
      const { centerX, halfWidth } = evaluateRiverChannel(z);

      const innerEdgeX = centerX + side * (halfWidth * 0.96);
      const outerSpan = 92.0;

      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX; // 0 at river curb edge, 1 at outer mountain foot
        const distFromRiver = u * outerSpan;
        const x = innerEdgeX + side * distFromRiver;

        // Smooth layered metallic plateaus near the river + undulating contour-ribbed hills further out
        const terraceLedge1 = Math.min(1.0, distFromRiver / 4.5) * 0.42;
        const terraceLedge2 = Math.max(0.0, Math.min(1.0, (distFromRiver - 8.0) / 6.0)) * 0.65;

        // Organic undulating hill waves matching p4.jpg's ribbed mounds
        const wave1 = Math.sin(x * 0.085 + z * 0.045) * Math.cos(z * 0.032 - side * 0.6);
        const wave2 = Math.sin(x * 0.16 - z * 0.075) * 0.45;
        const hillEnvelope = Math.pow(Math.max(0, (distFromRiver - 6.0) / 86.0), 1.15);
        const undulation = (wave1 * 3.2 + wave2 * 1.6 + 2.4) * hillEnvelope;

        // Subtle 3D contour rib relief sculpted into vertex elevation
        const ribRelief = Math.sin(x * 1.45 + z * 0.32) * 0.06 * Math.min(1.0, distFromRiver / 10.0);

        const elevation = 0.18 + terraceLedge1 + terraceLedge2 + undulation + ribRelief;

        positions[pIdx] = x;
        positions[pIdx + 1] = elevation;
        positions[pIdx + 2] = z;

        uvs[uvIdx] = u;
        uvs[uvIdx + 1] = v;

        pIdx += 3;
        uvIdx += 2;
      }
    }

    for (let iz = 0; iz < segZ; iz++) {
      for (let ix = 0; ix < segX; ix++) {
        const a = iz * (segX + 1) + ix;
        const b = a + 1;
        const c = a + (segX + 1);
        const d = c + 1;

        if (side > 0) {
          indices.push(a, c, b);
          indices.push(b, c, d);
        } else {
          indices.push(a, b, c);
          indices.push(b, d, c);
        }
      }
    }

    const terraceGeo = new THREE.BufferGeometry();
    terraceGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    terraceGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
    terraceGeo.setIndex(indices);
    terraceGeo.computeVertexNormals();
    geometriesToDispose.push(terraceGeo);

    const terraceMesh = new THREE.Mesh(terraceGeo, materials.terraceMaterial);
    terraceMesh.name = side < 0 ? 'WestMetallicTerrain' : 'EastMetallicTerrain';
    group.add(terraceMesh);
  }

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) {
        g.dispose();
      }
    },
  };
}

export interface TerrainGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Builds the dark metallic undulating terrain on both sides of the river,
 * combining the contour-ribbed terrain with smooth parabolic network filaments.
 */
export function buildTerrainGeometry(materials: SceneMaterialSet): TerrainGeometryResult {
  const group = new THREE.Group();
  group.name = 'CircuitBoardValleyTerrainGroup';

  const terraceResult = buildTerraceGeometry(materials);
  group.add(terraceResult.group);

  const extraGeos: THREE.BufferGeometry[] = [];
  const nodeOrbGeo = new THREE.SphereGeometry(0.14, 10, 10);
  extraGeos.push(nodeOrbGeo);

  // Smooth elevated parabolic network filaments arching across the riverbanks
  const zPositions = [36, 18, 2, -16, -34, -56, -78, -102];
  for (const side of [-1, 1]) {
    for (let i = 0; i < zPositions.length; i++) {
      const z = zPositions[i];
      const { centerX, halfWidth } = evaluateRiverChannel(z);
      const innerX = centerX + side * (halfWidth + 2.2);
      const midX = centerX + side * (halfWidth + 10.5);
      const outerX = centerX + side * (halfWidth + 20.0);

      const pts = [
        new THREE.Vector3(innerX, 0.35, z),
        new THREE.Vector3((innerX + midX) * 0.5, 2.1, z - 1.2),
        new THREE.Vector3(midX, 0.85, z - 2.5),
        new THREE.Vector3((midX + outerX) * 0.5, 2.8, z - 3.8),
        new THREE.Vector3(outerX, 1.45, z - 5.0),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.024, 6, false);
      extraGeos.push(tubeGeo);

      const mat =
        i % 2 === 0
          ? materials.raisedTraceEmeraldMaterial
          : materials.raisedTraceCyanMaterial;
      group.add(new THREE.Mesh(tubeGeo, mat));

      const orbMesh = new THREE.Mesh(nodeOrbGeo, materials.raisedTraceGoldMaterial);
      orbMesh.position.set((innerX + midX) * 0.5, 2.1, z - 1.2);
      group.add(orbMesh);
    }
  }

  return {
    group,
    dispose: () => {
      terraceResult.dispose();
      for (const g of extraGeos) g.dispose();
    },
  };
}
export interface RiverGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates the central S-shaped 3D emerald circuit river matching p4.jpg:
 *  - Recessed 3D river channel with concave bathymetry and sleek raised metallic curbs
 *  - Smooth continuous 3D luminous energy veins following the S-curve
 */
export function buildRiverGeometry(materials: SceneMaterialSet): RiverGeometryResult {
  const group = new THREE.Group();
  group.name = 'CentralRecessedCircuitRiverGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const segZ = 180;
  const segX = 48;
  const zStart = 52.0;
  const zEnd = -265.0;

  const positions = new Float32Array((segZ + 1) * (segX + 1) * 3);
  const normals = new Float32Array((segZ + 1) * (segX + 1) * 3);
  const uvs = new Float32Array((segZ + 1) * (segX + 1) * 2);
  const indices: number[] = [];

  let pIdx = 0;
  let uvIdx = 0;

  for (let iz = 0; iz <= segZ; iz++) {
    const v = iz / segZ;
    const z = zStart + (zEnd - zStart) * v;
    const { centerX, halfWidth, recessDepth } = evaluateRiverChannel(z);

    for (let ix = 0; ix <= segX; ix++) {
      const u = ix / segX;
      const signedU = (u - 0.5) * 2.0;
      const x = centerX + signedU * halfWidth;

      const channelProfile = Math.pow(Math.abs(signedU), 2.4);
      const y = -recessDepth * (1.0 - channelProfile) + channelProfile * 0.28;

      positions[pIdx] = x;
      positions[pIdx + 1] = y;
      positions[pIdx + 2] = z;

      normals[pIdx] = -signedU * 0.14;
      normals[pIdx + 1] = 0.99;
      normals[pIdx + 2] = 0.0;

      uvs[uvIdx] = u;
      uvs[uvIdx + 1] = v;

      pIdx += 3;
      uvIdx += 2;
    }
  }

  for (let iz = 0; iz < segZ; iz++) {
    for (let ix = 0; ix < segX; ix++) {
      const a = iz * (segX + 1) + ix;
      const b = a + 1;
      const c = a + (segX + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const riverGeo = new THREE.BufferGeometry();
  riverGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  riverGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  riverGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  riverGeo.setIndex(indices);
  geometriesToDispose.push(riverGeo);

  const riverMesh = new THREE.Mesh(riverGeo, materials.riverMaterial);
  riverMesh.name = 'RecessedRiverChannelMesh';
  group.add(riverMesh);

  // Smooth continuous 3D luminous energy veins along the recessed river channel (matching p4.jpg)
  const laneOffsets = [-0.82, -0.44, 0.0, 0.44, 0.82];
  laneOffsets.forEach((laneU, idx) => {
    const pts: THREE.Vector3[] = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const v = i / steps;
      const z = zStart + (zEnd - zStart) * v * 0.92;
      const { centerX, halfWidth, recessDepth } = evaluateRiverChannel(z);

      const x = centerX + laneU * halfWidth;
      const channelProfile = Math.pow(Math.abs(laneU), 2.4);
      const y = -recessDepth * (1.0 - channelProfile) + channelProfile * 0.28 + 0.04;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const radius = Math.abs(laneU) < 0.5 ? 0.055 : 0.038;
    const tubeGeo = new THREE.TubeGeometry(curve, 120, radius, 6, false);
    geometriesToDispose.push(tubeGeo);

    const mat =
      Math.abs(laneU) > 0.7
        ? materials.raisedTraceGoldMaterial
        : idx % 2 === 0
        ? materials.raisedTraceEmeraldMaterial
        : materials.raisedTraceCyanMaterial;
    group.add(new THREE.Mesh(tubeGeo, mat));
  });

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
    },
  };
}
export interface ForestGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

interface BackgroundTerminalPlacement {
  x: number;
  y: number;
  z: number;
  scale: number;
  seed: number;
}

/**
 * Reconstructs the midground and background technological structures from p4.jpg:
 *  - Stepped circular metallic terminals distributed across both sides of the valley
 *  - Translucent glass containment collars & glowing emerald (#00F0A0) cores
 *  - 3D parabolic arcing energy filaments connecting terminals across the terrain
 *  - Luminous white-gold (#FFE5A0) and emerald (#00F0A0) light nodes along the arcs
 */
export function buildForestGeometry(materials: SceneMaterialSet): ForestGeometryResult {
  const group = new THREE.Group();
  group.name = 'NetworkTerminalsAndArcFilamentsGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  const seededRand = (seed: number): number => {
    const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  const placements: BackgroundTerminalPlacement[] = [];
  let seedCounter = 1;

  // Distribute 26 midground & distant circular terminals along both banks of the river
  for (const side of [-1, 1]) {
    for (let i = 0; i < 13; i++) {
      const r1 = seededRand(seedCounter++);
      const r2 = seededRand(seedCounter++);
      const r3 = seededRand(seedCounter++);

      const z = 18.0 - (i / 12) * 210.0 + (r1 - 0.5) * 10.0;
      const { centerX, halfWidth } = evaluateRiverChannel(z);
      const lateralOffset = 7.5 + r2 * 26.0;
      const x = centerX + side * (halfWidth + lateralOffset);
      const scale = (0.65 + r3 * 0.55) * Math.max(0.45, 1.0 - Math.max(0, -z) / 290.0);

      placements.push({
        x,
        y: 0.42 + (lateralOffset / 34.0) * 1.15,
        z,
        scale,
        seed: r1 * 10.0 + r2,
      });
    }
  }

  const basePedestalGeo = new THREE.CylinderGeometry(1.75, 1.95, 0.28, 24);
  const innerCollarGeo = new THREE.CylinderGeometry(1.15, 1.25, 0.34, 24);
  const glassRingGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.42, 24, 1, true);
  const coreDiscGeo = new THREE.RingGeometry(0.15, 0.98, 24);
  coreDiscGeo.rotateX(-Math.PI / 2);
  const goldRimGeo = new THREE.RingGeometry(1.82, 1.98, 24);
  goldRimGeo.rotateX(-Math.PI / 2);
  const nodeOrbGeo = new THREE.SphereGeometry(0.18, 10, 10);

  geometriesToDispose.push(
    basePedestalGeo,
    innerCollarGeo,
    glassRingGeo,
    coreDiscGeo,
    goldRimGeo,
    nodeOrbGeo
  );

  const glassCollarMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00F0A0'),
    transparent: true,
    opacity: 0.28,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const arcFilamentMat = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00F0A0'),
    transparent: true,
    opacity: 0.46,
    blending: THREE.AdditiveBlending,
  });
  materialsToDispose.push(glassCollarMat, arcFilamentMat);

  // Merged upward energy plumes for all background terminals
  const plumeCyl = new THREE.CylinderGeometry(0.85, 0.95, 3.6, 14, 1, true);
  const cylPos = plumeCyl.attributes.position.array as Float32Array;
  const cylUv = plumeCyl.attributes.uv.array as Float32Array;
  const cylIndex = plumeCyl.index!.array;
  const vertsPerCyl = cylPos.length / 3;
  const indicesPerCyl = cylIndex.length;
  const totalTerms = placements.length;

  const mergedPlumePos = new Float32Array(totalTerms * vertsPerCyl * 3);
  const mergedPlumeUv = new Float32Array(totalTerms * vertsPerCyl * 2);
  const mergedPlumeSeed = new Float32Array(totalTerms * vertsPerCyl);
  const mergedPlumeIndices: number[] = [];

  for (let t = 0; t < totalTerms; t++) {
    const term = placements[t];

    const ped = new THREE.Mesh(basePedestalGeo, materials.pineCoreMaterial);
    ped.position.set(term.x, term.y, term.z);
    ped.scale.setScalar(term.scale);
    group.add(ped);

    const collar = new THREE.Mesh(innerCollarGeo, materials.pineCoreMaterial);
    collar.position.set(term.x, term.y + 0.14 * term.scale, term.z);
    collar.scale.setScalar(term.scale);
    group.add(collar);

    const glass = new THREE.Mesh(glassRingGeo, glassCollarMat);
    glass.position.set(term.x, term.y + 0.32 * term.scale, term.z);
    glass.scale.setScalar(term.scale);
    group.add(glass);

    const core = new THREE.Mesh(coreDiscGeo, materials.pinePadMaterial);
    core.position.set(term.x, term.y + 0.33 * term.scale, term.z);
    core.scale.setScalar(term.scale);
    group.add(core);

    const goldRim = new THREE.Mesh(goldRimGeo, materials.raisedTraceGoldMaterial);
    goldRim.position.set(term.x, term.y - 0.11 * term.scale, term.z);
    goldRim.scale.setScalar(term.scale);
    group.add(goldRim);

    const vOffset = t * vertsPerCyl;
    for (let v = 0; v < vertsPerCyl; v++) {
      const lx = cylPos[v * 3] * term.scale;
      const ly = (cylPos[v * 3 + 1] + 1.8) * term.scale;
      const lz = cylPos[v * 3 + 2] * term.scale;

      mergedPlumePos[(vOffset + v) * 3] = term.x + lx;
      mergedPlumePos[(vOffset + v) * 3 + 1] = term.y + ly;
      mergedPlumePos[(vOffset + v) * 3 + 2] = term.z + lz;

      mergedPlumeUv[(vOffset + v) * 2] = cylUv[v * 2];
      mergedPlumeUv[(vOffset + v) * 2 + 1] = cylUv[v * 2 + 1];

      mergedPlumeSeed[vOffset + v] = term.seed;
    }

    for (let idx = 0; idx < indicesPerCyl; idx++) {
      mergedPlumeIndices.push(vOffset + cylIndex[idx]);
    }
  }

  plumeCyl.dispose();

  const mergedPlumeGeo = new THREE.BufferGeometry();
  mergedPlumeGeo.setAttribute('position', new THREE.BufferAttribute(mergedPlumePos, 3));
  mergedPlumeGeo.setAttribute('uv', new THREE.BufferAttribute(mergedPlumeUv, 2));
  mergedPlumeGeo.setAttribute('aTreeSeed', new THREE.BufferAttribute(mergedPlumeSeed, 1));
  mergedPlumeGeo.setIndex(mergedPlumeIndices);
  geometriesToDispose.push(mergedPlumeGeo);

  const plumeMesh = new THREE.Mesh(mergedPlumeGeo, materials.forestHologramMaterial);
  plumeMesh.name = 'TerminalEnergyPlumes';
  group.add(plumeMesh);

  // Parabolic 3D arcing energy filaments connecting neighboring terminals (signature p4.jpg visual feature)
  for (let i = 0; i < placements.length - 1; i++) {
    const a = placements[i];
    const b = placements[(i + 1) % placements.length];
    if (Math.abs(a.z - b.z) > 48.0 || Math.abs(a.x - b.x) > 42.0) continue;

    const midX = (a.x + b.x) * 0.5;
    const midZ = (a.z + b.z) * 0.5;
    const spanDist = Math.hypot(b.x - a.x, b.z - a.z);
    const arcHeight = Math.max(a.y, b.y) + Math.min(5.2, spanDist * 0.22);

    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a.x, a.y + 0.35 * a.scale, a.z),
      new THREE.Vector3(midX, arcHeight, midZ),
      new THREE.Vector3(b.x, b.y + 0.35 * b.scale, b.z),
    ]);

    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.032, 5, false);
    geometriesToDispose.push(tubeGeo);
    group.add(new THREE.Mesh(tubeGeo, arcFilamentMat));

    // Glowing light node on the arc apex
    const orb = new THREE.Mesh(
      nodeOrbGeo,
      i % 2 === 0 ? materials.raisedTraceGoldMaterial : materials.raisedTraceEmeraldMaterial
    );
    orb.position.set(midX, arcHeight, midZ);
    orb.scale.setScalar(0.85);
    group.add(orb);
  }

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
      for (const m of materialsToDispose) m.dispose();
    },
  };
}
export interface ProjectedLabelItem {
  spec: InteractableObjectSpec;
  state: ObjectInteractionState;
  screenX: number;
  screenY: number;
  visible: boolean;
}

/**
 * InteractionController
 * Builds and animates the 12 multi-part 3D interactive assemblies matching p4.jpg:
 *  - Stepped dark metallic circular pedestals (#07151A / #10252A) with warm golden (#FFE5A0) base rings
 *  - Rising central emerald energy cores (#00F0A0)
 *  - Expanding & rotating translucent cylindrical glass collars (#00D9E8 / #00F0A0)
 *  - Smooth 3D parabolic arcing energy filaments with glowing nodes
 */
export class InteractionController {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNDC = new THREE.Vector2();
  public readonly rootGroup = new THREE.Group();
  private readonly colliderList: THREE.Mesh[] = [];
  private readonly colliderToRuntime = new Map<THREE.Object3D, InteractableRuntimeObject>();
  private readonly runtimeById = new Map<string, InteractableRuntimeObject>();

  private hoveredRuntime: InteractableRuntimeObject | null = null;
  private selectedRuntime: InteractableRuntimeObject | null = null;
  private elapsedTime = 0.0;

  private readonly geometriesToDispose: THREE.BufferGeometry[] = [];
  private readonly materialsToDispose: THREE.Material[] = [];

  constructor(scene: THREE.Scene) {
    this.rootGroup.name = 'InteractableObjectsRegistryGroup';
    this.buildAllInteractableObjects();
    scene.add(this.rootGroup);
  }

  private buildAllInteractableObjects(): void {
    const colliderSphereGeo = new THREE.SphereGeometry(1.0, 12, 10);
    const outerBaseGeo = new THREE.CylinderGeometry(2.15, 2.38, 0.34, 36);
    const innerStepGeo = new THREE.CylinderGeometry(1.48, 1.62, 0.38, 36);
    const corePistonGeo = new THREE.CylinderGeometry(0.92, 0.98, 0.55, 32);
    const glassCollarGeo = new THREE.CylinderGeometry(1.32, 1.32, 0.58, 36, 1, true);
    const outerRimRingGeo = new THREE.RingGeometry(2.22, 2.44, 40);
    outerRimRingGeo.rotateX(-Math.PI / 2);

    const riverGateRingGeo = new THREE.RingGeometry(1.5, 2.05, 32);
    riverGateRingGeo.rotateX(-Math.PI / 2);
    const riverPylonGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.65, 14);
    const orbNodeGeo = new THREE.SphereGeometry(0.13, 12, 10);

    this.geometriesToDispose.push(
      colliderSphereGeo,
      outerBaseGeo,
      innerStepGeo,
      corePistonGeo,
      glassCollarGeo,
      outerRimRingGeo,
      riverGateRingGeo,
      riverPylonGeo,
      orbNodeGeo
    );

    const invisibleColliderMat = new THREE.MeshBasicMaterial({ visible: false });
    this.materialsToDispose.push(invisibleColliderMat);

    for (const spec of INTERACTABLE_OBJECTS) {
      const objGroup = new THREE.Group();
      objGroup.name = `interactable-${spec.id}`;
      objGroup.position.set(...spec.position);
      this.rootGroup.add(objGroup);

      const colliderMesh = new THREE.Mesh(colliderSphereGeo, invisibleColliderMat);
      colliderMesh.position.set(0, 0.8, 0);
      colliderMesh.scale.setScalar(spec.hitRadius);
      objGroup.add(colliderMesh);
      this.colliderList.push(colliderMesh);

      const runtime: InteractableRuntimeObject = {
        spec,
        state: 'IDLE',
        hoverAmount: 0,
        selectAmount: 0,
        rotationAngle: 0,
        swayPhase: Math.random() * Math.PI * 2,
        rootGroup: objGroup,
        colliderMesh,
        connectedTraceMeshes: [],
        baseMaterials: [],
        baseY: spec.position[1],
      };

      if (spec.category === 'river-checkpoint') {
        this.populateRiverCheckpoint(runtime, riverGateRingGeo, riverPylonGeo);
      } else {
        this.populateCircularTerminalAssembly(
          runtime,
          outerBaseGeo,
          innerStepGeo,
          corePistonGeo,
          glassCollarGeo,
          outerRimRingGeo,
          orbNodeGeo
        );
      }

      this.colliderToRuntime.set(colliderMesh, runtime);
      this.runtimeById.set(spec.id, runtime);
    }
  }

  private populateCircularTerminalAssembly(
    runtime: InteractableRuntimeObject,
    outerBaseGeo: THREE.BufferGeometry,
    innerStepGeo: THREE.BufferGeometry,
    corePistonGeo: THREE.BufferGeometry,
    glassCollarGeo: THREE.BufferGeometry,
    outerRimRingGeo: THREE.BufferGeometry,
    orbNodeGeo: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;

    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#07151A'),
      emissive: new THREE.Color('#10252A'),
      emissiveIntensity: 0.45,
      roughness: 0.28,
      metalness: 0.82,
    });

    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentColor),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.65,
      roughness: 0.18,
      metalness: 0.45,
    });

    const glassMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    const warmRimMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color('#FFE5A0'),
      transparent: true,
      opacity: 0.78,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.materialsToDispose.push(baseMat, coreMat, glassMat, warmRimMat);
    runtime.baseMaterials.push(coreMat, glassMat, warmRimMat);

    const outerBase = new THREE.Mesh(outerBaseGeo, baseMat);
    outerBase.position.set(0, 0.16, 0);
    rootGroup.add(outerBase);

    const innerStep = new THREE.Mesh(innerStepGeo, baseMat);
    innerStep.position.set(0, 0.32, 0);
    rootGroup.add(innerStep);

    const warmRim = new THREE.Mesh(outerRimRingGeo, warmRimMat);
    warmRim.position.set(0, 0.04, 0);
    rootGroup.add(warmRim);

    const coreMesh = new THREE.Mesh(corePistonGeo, coreMat);
    coreMesh.position.set(0, 0.45, 0);
    rootGroup.add(coreMesh);
    runtime.movingPart = coreMesh;

    const glassCollar = new THREE.Mesh(glassCollarGeo, glassMat);
    glassCollar.position.set(0, 0.56, 0);
    rootGroup.add(glassCollar);
    runtime.ringPart = glassCollar;

    this.buildParabolicArcs(runtime, orbNodeGeo, 4, 8.2);
  }

  private populateRiverCheckpoint(
    runtime: InteractableRuntimeObject,
    gateRingGeo: THREE.BufferGeometry,
    pylonGeo: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;
    const { halfWidth } = evaluateRiverChannel(spec.position[2]);

    const gateMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const pylonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentColor),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.55,
      roughness: 0.25,
      metalness: 0.65,
    });

    this.materialsToDispose.push(gateMat, pylonMat);
    runtime.baseMaterials.push(pylonMat, gateMat);

    const gateRing = new THREE.Mesh(gateRingGeo, gateMat);
    gateRing.position.set(0, 0.35, 0);
    rootGroup.add(gateRing);
    runtime.ringPart = gateRing;

    const pylonGroup = new THREE.Group();
    const leftPylon = new THREE.Mesh(pylonGeo, pylonMat);
    leftPylon.position.set(-Math.min(4.2, halfWidth * 0.45), 0.38, 0);
    const rightPylon = new THREE.Mesh(pylonGeo, pylonMat);
    rightPylon.position.set(Math.min(4.2, halfWidth * 0.45), 0.38, 0);
    pylonGroup.add(leftPylon, rightPylon);
    rootGroup.add(pylonGroup);
    runtime.movingPart = pylonGroup;
  }

  private buildParabolicArcs(
    runtime: InteractableRuntimeObject,
    orbNodeGeo: THREE.BufferGeometry,
    branchCount: number,
    reach: number
  ): void {
    const { spec, rootGroup } = runtime;
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + 0.4;
      const pts: THREE.Vector3[] = [];
      const steps = 8;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const r = 0.15 + t * reach;
        const y = 0.52 + Math.sin(t * Math.PI) * 2.75;
        pts.push(new THREE.Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.022, 6, false);
      const traceMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(spec.accentColor),
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending,
      });
      this.geometriesToDispose.push(tubeGeo);
      this.materialsToDispose.push(traceMat);

      const traceMesh = new THREE.Mesh(tubeGeo, traceMat);
      traceMesh.userData.segmentIndex = b;
      rootGroup.add(traceMesh);
      runtime.connectedTraceMeshes.push(traceMesh);

      const apexPt = curve.getPointAt(0.48);
      const orbMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color('#FFE5A0'),
        transparent: true,
        opacity: 0.9,
      });
      this.materialsToDispose.push(orbMat);
      const orbMesh = new THREE.Mesh(orbNodeGeo, orbMat);
      orbMesh.position.copy(apexPt);
      rootGroup.add(orbMesh);
    }
  }

  public updatePointerRaycast(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera
  ): InteractableObjectSpec | null {
    this.pointerNDC.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointerNDC, camera);

    const hits = this.raycaster.intersectObjects(this.colliderList, false);
    let hitRuntime: InteractableRuntimeObject | null = null;
    if (hits.length > 0) {
      hitRuntime = this.colliderToRuntime.get(hits[0].object) || null;
    }

    if (this.hoveredRuntime !== hitRuntime) {
      if (this.hoveredRuntime && this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'EXITING';
      }
      this.hoveredRuntime = hitRuntime;
      if (this.hoveredRuntime && this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'HOVER';
      }
    }

    return this.hoveredRuntime ? this.hoveredRuntime.spec : null;
  }

  public selectObjectById(id: string | null): InteractableObjectSpec | null {
    if (this.selectedRuntime && this.selectedRuntime.spec.id !== id) {
      this.selectedRuntime.state = 'EXITING';
    }
    if (!id) {
      this.selectedRuntime = null;
      return null;
    }
    const found = this.runtimeById.get(id) || null;
    this.selectedRuntime = found;
    if (found) {
      found.state = 'FOCUSED';
    }
    return found ? found.spec : null;
  }

  public hoverObjectById(id: string | null): InteractableObjectSpec | null {
    if (this.hoveredRuntime && this.hoveredRuntime.spec.id !== id) {
      if (this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'EXITING';
      }
    }
    if (!id) {
      this.hoveredRuntime = null;
      return null;
    }
    const found = this.runtimeById.get(id) || null;
    this.hoveredRuntime = found;
    if (found && found !== this.selectedRuntime) {
      found.state = 'HOVER';
    }
    return found ? found.spec : null;
  }

  public getHoveredSpec(): InteractableObjectSpec | null {
    return this.hoveredRuntime ? this.hoveredRuntime.spec : null;
  }

  public getSelectedSpec(): InteractableObjectSpec | null {
    return this.selectedRuntime ? this.selectedRuntime.spec : null;
  }

  public getSelectedState(): ObjectInteractionState {
    if (this.selectedRuntime) return this.selectedRuntime.state;
    if (this.hoveredRuntime) return this.hoveredRuntime.state;
    return 'IDLE';
  }

  public getObjectTransformSnapshot(id: string): {
    state: ObjectInteractionState;
    movingPartY: number;
    movingPartScale: number;
    movingPartRotZ: number;
    ringScale: number;
    ringRotY: number;
    emissiveIntensity: number;
  } | null {
    const rt = this.runtimeById.get(id);
    if (!rt) return null;
    const stdMat = rt.baseMaterials[0] as THREE.MeshStandardMaterial | undefined;
    return {
      state: rt.state,
      movingPartY: rt.movingPart ? rt.movingPart.position.y : 0,
      movingPartScale: rt.movingPart ? rt.movingPart.scale.x : 1,
      movingPartRotZ: rt.movingPart ? rt.movingPart.rotation.z : 0,
      ringScale: rt.ringPart ? rt.ringPart.scale.x : 1,
      ringRotY: rt.ringPart ? rt.ringPart.rotation.y : 0,
      emissiveIntensity: stdMat && stdMat.emissiveIntensity !== undefined ? stdMat.emissiveIntensity : 1,
    };
  }

  public update(dt: number, reducedMotion = false): void {
    const clampedDt = Math.max(0.0, Math.min(dt, 0.1));
    this.elapsedTime += clampedDt;
    const rate = 1.0 - Math.exp(-(reducedMotion ? 10.0 : 7.5) * clampedDt);

    for (const rt of this.runtimeById.values()) {
      const isHovered = this.hoveredRuntime === rt;
      const isSelected = this.selectedRuntime === rt;

      const targetHover = isHovered || isSelected ? 1.0 : 0.0;
      const targetSelect = isSelected ? 1.0 : 0.0;

      rt.hoverAmount = THREE.MathUtils.lerp(rt.hoverAmount, targetHover, rate);
      rt.selectAmount = THREE.MathUtils.lerp(rt.selectAmount, targetSelect, rate);

      if (!isHovered && !isSelected) {
        if (rt.hoverAmount < 0.02 && rt.selectAmount < 0.02) {
          rt.state = 'IDLE';
          rt.hoverAmount = 0;
          rt.selectAmount = 0;
        } else {
          rt.state = 'EXITING';
        }
      }

      if (rt.spec.category === 'circuit-terminal') {
        if (rt.movingPart) {
          rt.movingPart.position.y = 0.45 + rt.hoverAmount * 0.55 + rt.selectAmount * 0.8;
        }
        if (rt.ringPart) {
          const ringScale = 1.0 + rt.hoverAmount * 0.32 + rt.selectAmount * 0.28;
          rt.ringPart.scale.set(ringScale, ringScale, ringScale);
          if (rt.selectAmount > 0.05) {
            rt.rotationAngle += clampedDt * 2.4 * rt.selectAmount;
          }
          rt.ringPart.rotation.y = rt.rotationAngle;
        }
      } else if (rt.spec.category === 'digital-tree') {
        if (rt.movingPart) {
          const swayAmp = (rt.hoverAmount * 0.065 + rt.selectAmount * 0.045) * (reducedMotion ? 0.35 : 1.0);
          rt.movingPart.rotation.z = Math.sin(this.elapsedTime * 2.8 + rt.swayPhase) * swayAmp;
          rt.movingPart.position.y = 0.45 + rt.hoverAmount * 0.4 + rt.selectAmount * 0.55;
          const liftScale = 1.0 + rt.hoverAmount * 0.14 + rt.selectAmount * 0.16;
          rt.movingPart.scale.set(liftScale, liftScale, liftScale);
        }
        if (rt.ringPart) {
          const rScale = 1.0 + rt.hoverAmount * 0.38 + rt.selectAmount * 0.32;
          rt.ringPart.scale.set(rScale, rScale, rScale);
        }
      } else if (rt.spec.category === 'network-node') {
        if (rt.movingPart) {
          const nScale = 1.0 + rt.hoverAmount * 0.25 + rt.selectAmount * 0.25;
          rt.movingPart.scale.set(nScale, nScale, nScale);
          rt.movingPart.position.y = 0.45 + rt.hoverAmount * 0.45 + rt.selectAmount * 0.6;
          rt.rotationAngle += clampedDt * (0.6 + rt.hoverAmount * 1.4 + rt.selectAmount * 2.0);
          rt.movingPart.rotation.y = rt.rotationAngle;
        }
        if (rt.ringPart) {
          const rScale = 1.0 + rt.hoverAmount * 0.3 + rt.selectAmount * 0.35;
          rt.ringPart.scale.set(rScale, rScale, rScale);
        }
      } else if (rt.spec.category === 'river-checkpoint') {
        if (rt.movingPart) {
          rt.movingPart.position.y = rt.hoverAmount * 0.4 + rt.selectAmount * 0.6;
          const pScale = 1.0 + rt.hoverAmount * 0.18 + rt.selectAmount * 0.22;
          rt.movingPart.scale.set(pScale, pScale, pScale);
        }
        if (rt.ringPart) {
          const gScale = 1.0 + rt.hoverAmount * 0.35 + rt.selectAmount * 0.4;
          rt.ringPart.scale.set(gScale, gScale, gScale);
        }
      }

      const stdMat = rt.baseMaterials[0] as THREE.MeshStandardMaterial | undefined;
      if (stdMat && stdMat.emissiveIntensity !== undefined) {
        stdMat.emissiveIntensity = 0.5 + rt.hoverAmount * 0.85 + rt.selectAmount * 1.15;
      }

      for (let i = 0; i < rt.connectedTraceMeshes.length; i++) {
        const traceMesh = rt.connectedTraceMeshes[i];
        const segIdx = traceMesh.userData.segmentIndex || 0;
        const mat = traceMesh.material as THREE.MeshBasicMaterial;
        const wave = 0.5 + 0.5 * Math.sin(this.elapsedTime * 5.0 - segIdx * 1.1);
        mat.opacity = 0.24 + rt.hoverAmount * 0.36 + rt.selectAmount * (0.4 * wave);
      }
    }
  }

  public projectLabelsToScreen(
    camera: THREE.Camera,
    width: number,
    height: number
  ): ProjectedLabelItem[] {
    const out: ProjectedLabelItem[] = [];
    const temp = new THREE.Vector3();

    for (const rt of this.runtimeById.values()) {
      temp.set(
        rt.spec.position[0],
        rt.spec.position[1] + 1.8,
        rt.spec.position[2]
      );
      temp.project(camera);

      const visible =
        temp.z >= -1.0 &&
        temp.z <= 1.0 &&
        Math.abs(temp.x) <= 0.94 &&
        Math.abs(temp.y) <= 0.9;
      out.push({
        spec: rt.spec,
        state: rt.state,
        screenX: (temp.x * 0.5 + 0.5) * width,
        screenY: (-temp.y * 0.5 + 0.5) * height,
        visible,
      });
    }
    return out;
  }

  public dispose(): void {
    for (const g of this.geometriesToDispose) g.dispose();
    for (const m of this.materialsToDispose) m.dispose();
    this.colliderToRuntime.clear();
    this.runtimeById.clear();
  }
}
}

export function createOpportunityHorizonScene(
  width: number,
  height: number,
  reducedMotion: boolean,
  intensity = 1.0,
  onStateChange?: () => void
): OriginalSceneInstance {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0e2932');
  scene.fog = new THREE.FogExp2('#12343f', 0.0026);

  const ambientLight = new THREE.AmbientLight('#0b262d', 0.9);
  const sunLight = new THREE.DirectionalLight('#FFE5A0', 1.35);
  sunLight.position.set(...Env05Original.WORLD_CONFIG.sunPosition);
  const riverLight = new THREE.PointLight('#00F0A0', 1.45, 95, 1.5);
  riverLight.position.set(0, 4.2, 20);
  scene.add(ambientLight, sunLight, riverLight);

  const animCtrl = new AnimationController(1.0, intensity);
  animCtrl.setReducedMotion(reducedMotion);
  animCtrl.uniforms.uSunPosition.value.set(...Env05Original.WORLD_CONFIG.sunPosition);

  const camCtrl = new CameraController(width / Math.max(1, height));
  const interCtrl = new Env05Original.InteractionController(scene);

  const navCtrl = new NavigationController('immersive', () => {
    interCtrl.selectObjectById(null);
    camCtrl.setFocusedObject(null);
    animCtrl.setSelectedObject(null);
    onStateChange?.();
  });

  const materials = Env05Original.createMaterials(animCtrl.uniforms);
  const skyGeo = Env05Original.buildSkyGeometry(materials);
  const mountainGeo = Env05Original.buildMountainGeometry(materials);
  const terrainGeo = Env05Original.buildTerrainGeometry(materials);
  const riverGeo = Env05Original.buildRiverGeometry(materials);
  const forestGeo = Env05Original.buildForestGeometry(materials);

  scene.add(
    skyGeo.group,
    mountainGeo.group,
    terrainGeo.group,
    riverGeo.group,
    forestGeo.group
  );

  function selectById(id: string | null) {
    const spec = interCtrl.selectObjectById(id);
    animCtrl.setSelectedObject(spec);
    if (spec) {
      if (spec.category === 'river-checkpoint') {
        camCtrl.setFocusedObject(null);
        navCtrl.setTargetProgress(spec.riverProgress, 'object-focus', false);
      } else {
        navCtrl.setTargetProgress(spec.riverProgress, 'object-focus', false);
        camCtrl.setFocusedObject(spec);
      }
    } else {
      camCtrl.setFocusedObject(null);
    }
    onStateChange?.();
    return spec;
  }

  return {
    envId: 'env-05-opportunity-horizon',
    scene,
    camera: camCtrl.camera,
    stepSimulation: (dt: number) => {
      const isRM = animCtrl.getReducedMotion();
      navCtrl.update(dt, isRM);
      interCtrl.update(dt, isRM);
      camCtrl.update(dt, navCtrl, isRM);
      animCtrl.update(dt, camCtrl.camera.position);
    },
    handleResize: (w: number, h: number) => {
      camCtrl.handleResize(w, h);
    },
    handleWheel: (e: WheelEvent, h: number) => {
      let pixelDelta = e.deltaY;
      if (e.deltaMode === 1) pixelDelta *= 36;
      else if (e.deltaMode === 2) pixelDelta *= h || 900;
      const sign = Math.sign(pixelDelta);
      const absPixels = Math.abs(pixelDelta);
      const step = sign * Math.min(0.14, Math.max(0.008, absPixels * 0.0014));
      navCtrl.setTargetProgress(navCtrl.targetProgress + step, 'wheel', true);
      onStateChange?.();
    },
    handlePointerDown: (e: PointerEvent) => {
      navCtrl.handlePointerDown(e, null);
    },
    handlePointerMove: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => {
      const dragged = navCtrl.handlePointerMove(e, w, h);
      if (dragged) {
        onStateChange?.();
        return;
      }
      if (isInteractiveDom) {
        if (interCtrl.getHoveredSpec()) {
          interCtrl.hoverObjectById(null);
          camCtrl.setHoveredObject(null);
          animCtrl.setHoveredObject(null);
          onStateChange?.();
        }
        return;
      }
      const nx = (e.clientX / Math.max(1, w)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, h)) * 2 - 1);
      const hitSpec = interCtrl.updatePointerRaycast(nx, ny, camCtrl.camera);
      camCtrl.setHoveredObject(hitSpec);
      animCtrl.setHoveredObject(hitSpec);
      onStateChange?.();
    },
    handlePointerUp: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => {
      const wasDrag = navCtrl.handlePointerUp(e, null);
      if (wasDrag || isInteractiveDom) return;
      const nx = (e.clientX / Math.max(1, w)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, h)) * 2 - 1);
      const hitSpec = interCtrl.updatePointerRaycast(nx, ny, camCtrl.camera);
      if (hitSpec) {
        const currentSelected = interCtrl.getSelectedSpec();
        selectById(currentSelected?.id === hitSpec.id ? null : hitSpec.id);
      }
    },
    handleKeyDown: (e: KeyboardEvent) => {
      navCtrl.handleKeyDown(e);
      onStateChange?.();
    },
    handleKeyUp: (e: KeyboardEvent) => {
      navCtrl.handleKeyUp(e);
    },
    getViewpoints: () => Env05Original.VIEWPOINT_ORDER.map((id) => ({
      id,
      label: Env05Original.VIEWPOINTS[id].label,
      progress: Env05Original.VIEWPOINTS[id].progress,
      description: Env05Original.VIEWPOINTS[id].description,
    })),
    getActiveViewpointId: () => navCtrl.getActiveViewpointId(),
    goToViewpoint: (id: string) => {
      navCtrl.goToViewpoint(id as ViewpointId);
      onStateChange?.();
    },
    setProgress: (p: number) => {
      navCtrl.setTargetProgress(p, 'slider', true);
      onStateChange?.();
    },
    getProgress: () => navCtrl.currentProgress,
    hoverObject: (id: string | null) => {
      const spec = interCtrl.hoverObjectById(id);
      camCtrl.setHoveredObject(spec);
      animCtrl.setHoveredObject(spec);
      onStateChange?.();
      return spec;
    },
    selectObject: (id: string | null) => selectById(id),
    getHoveredObject: () => {
      const s = interCtrl.getHoveredSpec();
      return s ? {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        categoryLabel: s.categoryLabel,
        route: s.route,
        accentColor: s.accentColor,
        summary: s.description,
      } : null;
    },
    getSelectedObject: () => {
      const s = interCtrl.getSelectedSpec();
      return s ? {
        id: s.id,
        title: s.title,
        subtitle: s.subtitle,
        categoryLabel: s.categoryLabel,
        route: s.route,
        accentColor: s.accentColor,
        summary: s.description,
        position: s.position,
        heightOffset: 1.5,
      } : null;
    },
    getInteractiveObjects: () => Env05Original.INTERACTABLE_OBJECTS.map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle,
      categoryLabel: s.categoryLabel,
      route: s.route,
      accentColor: s.accentColor,
      summary: s.description,
    })),
    getState: () => ({
      environmentId: 'env-05-opportunity-horizon',
      environmentName: 'Opportunity Horizon',
      cameraPos: [
        Number(camCtrl.camera.position.x.toFixed(3)),
        Number(camCtrl.camera.position.y.toFixed(3)),
        Number(camCtrl.camera.position.z.toFixed(3)),
      ],
      cameraTarget: [
        Number(camCtrl.currentTarget.x.toFixed(3)),
        Number(camCtrl.currentTarget.y.toFixed(3)),
        Number(camCtrl.currentTarget.z.toFixed(3)),
      ],
      fov: Number(camCtrl.camera.fov.toFixed(2)),
      currentProgress: Number(navCtrl.currentProgress.toFixed(4)),
      targetProgress: Number(navCtrl.targetProgress.toFixed(4)),
      activeViewpoint: navCtrl.getActiveViewpointId(),
      hoveredObjectId: interCtrl.getHoveredSpec()?.id || null,
      selectedObjectId: interCtrl.getSelectedSpec()?.id || null,
      interactableCount: Env05Original.INTERACTABLE_OBJECTS.length,
    }),
    dispose: () => {
      interCtrl.dispose();
      skyGeo.dispose();
      mountainGeo.dispose();
      terrainGeo.dispose();
      riverGeo.dispose();
      forestGeo.dispose();
      materials.dispose();
    },
  };
}
