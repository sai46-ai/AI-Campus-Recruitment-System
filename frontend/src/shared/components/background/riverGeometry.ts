import * as THREE from 'three';
import { evaluateRiverChannel } from './sceneConfig';
import { SceneMaterialSet } from './materials';

export interface RiverGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates the central S-shaped 3D circuit river:
 *  - Properly recessed 3D river channel with concave bathymetry and beveled bank rims
 *  - 11 raised 3D luminous circuit tracks (cyan, turquoise, emerald, and bronze-gold)
 *  - 24 embedded circular 3D connection terminals along the river floor
 */
export function buildRiverGeometry(materials: SceneMaterialSet): RiverGeometryResult {
  const group = new THREE.Group();
  group.name = 'CentralRecessedCircuitRiverGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const segZ = 180;
  const segX = 48;
  const zStart = 50.0;
  const zEnd = -270.0;

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

      // Properly recessed 3D channel trough (-recessDepth in center, rising to +0.35 at bank bevels)
      const channelProfile = Math.pow(Math.abs(signedU), 2.4);
      const microTrackRelief = Math.sin(signedU * 42.0 * Math.PI) * 0.045 * (1.0 - v * 0.6);
      const y = -recessDepth * (1.0 - channelProfile) + channelProfile * 0.35 + microTrackRelief;

      positions[pIdx] = x;
      positions[pIdx + 1] = y;
      positions[pIdx + 2] = z;

      normals[pIdx] = -signedU * 0.16;
      normals[pIdx + 1] = 0.98;
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

  // Raised 3D luminous circuit tracks along the recessed river channel
  const laneOffsets = [-0.84, -0.68, -0.5, -0.32, -0.15, 0.0, 0.15, 0.32, 0.5, 0.68, 0.84];
  laneOffsets.forEach((laneU, idx) => {
    const pts: THREE.Vector3[] = [];
    const steps = 70;
    for (let i = 0; i <= steps; i++) {
      const v = i / steps;
      const z = zStart + (zEnd - zStart) * v * 0.85;
      const { centerX, halfWidth, recessDepth } = evaluateRiverChannel(z);

      const jogPhase = Math.floor(v * 15.0 + idx * 0.7);
      const jogOffset = ((jogPhase % 3) - 1) * 0.042;
      const u = THREE.MathUtils.clamp(laneU + jogOffset, -0.95, 0.95);

      const x = centerX + u * halfWidth;
      const channelProfile = Math.pow(Math.abs(u), 2.4);
      const y = -recessDepth * (1.0 - channelProfile) + channelProfile * 0.35 + 0.09;
      pts.push(new THREE.Vector3(x, y, z));
    }

    const curve = new THREE.CatmullRomCurve3(pts);
    const radius = Math.abs(laneU) < 0.35 ? 0.068 : 0.052;
    const tubeGeo = new THREE.TubeGeometry(curve, 96, radius, 6, false);
    geometriesToDispose.push(tubeGeo);

    const mat =
      Math.abs(laneU) > 0.65
        ? materials.raisedTraceGoldMaterial
        : idx % 3 === 0
        ? materials.raisedTraceEmeraldMaterial
        : materials.raisedTraceCyanMaterial;
    group.add(new THREE.Mesh(tubeGeo, mat));
  });

  // Embedded 3D circular connection terminals along the river floor
  const viaRingGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.1, 16);
  geometriesToDispose.push(viaRingGeo);

  const viaCoords: Array<[number, number]> = [
    [-0.55, 42], [-0.42, 37], [-0.25, 44], [0.18, 41], [0.35, 38],
    [0.52, 43], [0.64, 35], [-0.68, 29], [-0.32, 26], [0.28, 30],
    [0.48, 25], [0.72, 28], [-0.45, 18], [0.38, 17], [0.58, 14],
    [-0.5, 6], [0.46, 4], [-0.55, -8], [0.52, -12], [-0.48, -26],
    [0.44, -32], [-0.52, -48], [0.5, -54], [-0.46, -72], [0.48, -88],
  ];

  viaCoords.forEach(([uNorm, z], i) => {
    const { centerX, halfWidth, recessDepth } = evaluateRiverChannel(z);
    const x = centerX + uNorm * halfWidth;
    const channelProfile = Math.pow(Math.abs(uNorm), 2.4);
    const y = -recessDepth * (1.0 - channelProfile) + channelProfile * 0.35 + 0.08;
    const viaMesh = new THREE.Mesh(
      viaRingGeo,
      i % 2 === 0 ? materials.raisedTraceCyanMaterial : materials.raisedTraceGoldMaterial
    );
    viaMesh.position.set(x, y, z);
    group.add(viaMesh);
  });

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
    },
  };
}
