import * as THREE from 'three';

/**
 * Camera Waypoint Contract for the Five-Chapter 3D Career Journey
 */
export interface CameraWaypoint {
  progress: number;
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
}

// Authored keyframes along the continuous world pathway
const KEYFRAME_WAYPOINTS: CameraWaypoint[] = [
  // 01: Discover (Wide establishing valley, looking down circuit river)
  {
    progress: 0.00,
    position: new THREE.Vector3(0.0, 2.6, 12.0),
    target: new THREE.Vector3(0.0, 0.6, -10.0),
    fov: 52,
  },
  {
    progress: 0.14,
    position: new THREE.Vector3(0.0, 2.2, 4.0),
    target: new THREE.Vector3(0.0, 0.5, -12.0),
    fov: 50,
  },

  // 02: Build Profile (Gliding toward embedded profile station and resume panels)
  {
    progress: 0.24,
    position: new THREE.Vector3(-2.4, 2.8, -7.5),
    target: new THREE.Vector3(0.0, 1.6, -14.0),
    fov: 48,
  },
  {
    progress: 0.35,
    position: new THREE.Vector3(-1.2, 2.2, -10.5),
    target: new THREE.Vector3(0.0, 1.5, -15.0),
    fov: 48,
  },

  // 03: Discover Opportunities (Oblique elevated angle viewing connected network mesh)
  {
    progress: 0.46,
    position: new THREE.Vector3(3.2, 3.6, -21.0),
    target: new THREE.Vector3(0.0, 0.8, -28.0),
    fov: 50,
  },
  {
    progress: 0.58,
    position: new THREE.Vector3(1.6, 2.8, -25.5),
    target: new THREE.Vector3(0.0, 1.0, -31.0),
    fov: 50,
  },

  // 04: Interview Arena (Centering directly on 3D microphone and curved waveform)
  {
    progress: 0.68,
    position: new THREE.Vector3(0.0, 2.4, -36.0),
    target: new THREE.Vector3(0.0, 1.5, -42.0),
    fov: 46,
  },
  {
    progress: 0.80,
    position: new THREE.Vector3(0.0, 2.0, -38.5),
    target: new THREE.Vector3(0.0, 1.4, -43.5),
    fov: 46,
  },

  // 05: Placement (Elevated panoramic view toward luminous horizon beacon)
  {
    progress: 0.90,
    position: new THREE.Vector3(0.0, 4.0, -48.0),
    target: new THREE.Vector3(0.0, 2.0, -75.0),
    fov: 52,
  },
  {
    progress: 1.00,
    position: new THREE.Vector3(0.0, 4.5, -52.0),
    target: new THREE.Vector3(0.0, 2.2, -80.0),
    fov: 54,
  },
];

// Construct smooth Catmull-Rom curves through the authored points
const positionPoints = KEYFRAME_WAYPOINTS.map((w) => w.position);
const targetPoints = KEYFRAME_WAYPOINTS.map((w) => w.target);

export const cameraPositionSpline = new THREE.CatmullRomCurve3(
  positionPoints,
  false,
  'catmullrom',
  0.25
);

export const cameraTargetSpline = new THREE.CatmullRomCurve3(
  targetPoints,
  false,
  'catmullrom',
  0.25
);

/**
 * Evaluates smooth camera position and look-at target for a normalized progress t in [0, 1].
 */
export function getCameraPoseAtProgress(
  t: number,
  outPosition: THREE.Vector3,
  outTarget: THREE.Vector3
): number {
  const clampedT = Math.max(0.0, Math.min(1.0, t));
  cameraPositionSpline.getPoint(clampedT, outPosition);
  cameraTargetSpline.getPoint(clampedT, outTarget);

  // Compute interpolated FOV across keyframes
  for (let i = 0; i < KEYFRAME_WAYPOINTS.length - 1; i++) {
    const k1 = KEYFRAME_WAYPOINTS[i];
    const k2 = KEYFRAME_WAYPOINTS[i + 1];
    if (clampedT >= k1.progress && clampedT <= k2.progress) {
      const span = k2.progress - k1.progress;
      const localRatio = span > 0 ? (clampedT - k1.progress) / span : 0;
      return k1.fov + (k2.fov - k1.fov) * localRatio;
    }
  }

  return KEYFRAME_WAYPOINTS[KEYFRAME_WAYPOINTS.length - 1].fov;
}

/**
 * Returns current chapter index (1..5) from normalized scroll progress
 */
export function getChapterFromProgress(t: number): number {
  if (t < 0.18) return 1;
  if (t < 0.38) return 2;
  if (t < 0.60) return 3;
  if (t < 0.82) return 4;
  return 5;
}

