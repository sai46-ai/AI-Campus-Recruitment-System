import * as THREE from 'three';
import { evaluateRiverChannel } from './sceneConfig';
import { SceneMaterialSet } from './materials';

export interface MountainGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates the West (-X) and East (+X) jagged alpine mountain massifs framing the valley.
 * Uses multi-octave ridged multifractal elevation synthesis to match the reference image's
 * sharp alpine peaks, eroded gullies, and central V-shaped horizon valley pass.
 */
export function buildMountainGeometry(materials: SceneMaterialSet): MountainGeometryResult {
  const group = new THREE.Group();
  group.name = 'AlpineMountainRangesGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const ridgeNoise = (x: number, z: number): number => {
    const n1 = 1.0 - Math.abs(Math.sin(x * 0.055 + z * 0.038));
    const n2 = 1.0 - Math.abs(Math.cos(x * 0.11 - z * 0.085));
    const n3 = 1.0 - Math.abs(Math.sin(x * 0.23 + z * 0.19));
    return Math.pow(n1, 1.6) * 0.55 + Math.pow(n2, 1.8) * 0.3 + n3 * 0.15;
  };

  const sides = [-1, 1]; // -1 = West range, +1 = East range
  const segZ = 110;
  const segX = 52;
  const zStart = 10.0;
  const zEnd = -295.0;

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

      // Mountains start outside the forest terrace and sweep slightly inward toward the distant valley pass
      const innerBaseOffset = 36.0 - v * 16.0;
      const startX = centerX + side * (halfWidth + Math.max(14.0, innerBaseOffset));
      const spanX = 118.0;

      // Longitudinal profile: two major peak groups per side (foreground-mid peak & distant pass peak)
      const peakGroup1 = Math.exp(-Math.pow((z + 58.0) * 0.021, 2.0)) * 46.0;
      const peakGroup2 = Math.exp(-Math.pow((z + 155.0) * 0.018, 2.0)) * 38.0;
      const peakGroup3 = Math.exp(-Math.pow((z + 235.0) * 0.022, 2.0)) * 26.0;
      const longitudinalEnvelope = peakGroup1 + peakGroup2 + peakGroup3 + 8.0 * Math.sin(v * Math.PI);

      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX; // 0 at inner terrace foot, 1 at outer boundary
        const x = startX + side * u * spanX;

        // Lateral arch profile: rises steeply from terrace foot to main crest, then tapers at outer edge
        const crestProfile = Math.sin(Math.pow(u, 0.68) * Math.PI);
        const rVal = ridgeNoise(x + side * 17.0, z);

        // Gullies carved perpendicular to the ridge
        const gully = Math.pow(0.5 + 0.5 * Math.sin(z * 0.14 + u * 4.2 * side), 2.0);
        const height =
          3.75 +
          (longitudinalEnvelope * crestProfile * (0.55 + 0.72 * rVal) - gully * 4.5 * crestProfile) *
            smoothstep(0.0, 0.12, u);

        positions[pIdx] = x;
        positions[pIdx + 1] = Math.max(3.6, height);
        positions[pIdx + 2] = z;

        ridgeFactors[rIdx] = THREE.MathUtils.clamp(rVal * crestProfile * 1.35, 0.0, 1.0);

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
    mtnMesh.name = side < 0 ? 'WestMountainMassif' : 'EastMountainMassif';
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
