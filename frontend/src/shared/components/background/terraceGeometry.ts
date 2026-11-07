import * as THREE from 'three';
import { evaluateRiverChannel } from './sceneConfig';
import { SceneMaterialSet } from './materials';

export interface TerraceGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates genuine 3D multi-tiered stepped circuit canyon banks on both sides
 * of the river channel, featuring 45-degree PCB architectural jogs, horizontal
 * plateau decks, and vertical slotted risers.
 */
export function buildTerraceGeometry(materials: SceneMaterialSet): TerraceGeometryResult {
  const group = new THREE.Group();
  group.name = 'SteppedCircuitTerracesGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const sides = [-1, 1]; // -1 = West (Left bank), +1 = East (Right bank)
  const segZ = 140;
  const segX = 44;
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

      // Quantized 45-degree PCB architectural step offset along Z
      const zStepBlock = Math.floor(z * 0.14);
      const zigZagOffset = ((zStepBlock % 3) - 1) * 1.35;

      const innerEdgeX = centerX + side * (halfWidth * 0.96);
      const outerSpan = 88.0;

      for (let ix = 0; ix <= segX; ix++) {
        const u = ix / segX; // 0 at river bank edge, 1 at outer mountain foot
        const distFromRiver = u * outerSpan;
        const x = innerEdgeX + side * distFromRiver;

        // Quantize lateral distance into distinct architectural PCB terrace tiers
        const effectiveDist = Math.max(0, distFromRiver + zigZagOffset * (1.0 - u * 0.5));
        let elevation = 0.25;

        if (effectiveDist < 2.2) {
          elevation = 0.25 + (effectiveDist / 2.2) * 0.85;
        } else if (effectiveDist < 7.5) {
          elevation = 1.15; // Tier 1 lower PCB ledge
        } else if (effectiveDist < 9.0) {
          elevation = 1.15 + ((effectiveDist - 7.5) / 1.5) * 1.25; // Riser wall 1
        } else if (effectiveDist < 18.5) {
          elevation = 2.4; // Tier 2 mid PCB ledge
        } else if (effectiveDist < 20.2) {
          elevation = 2.4 + ((effectiveDist - 18.5) / 1.7) * 1.35; // Riser wall 2
        } else if (effectiveDist < 54.0) {
          elevation = 3.75; // Tier 3 wide bio-matrix forest plateau
        } else {
          // Gradual rise into outer mountain foothills
          elevation = 3.75 + Math.pow((effectiveDist - 54.0) / 34.0, 1.4) * 5.5;
        }

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
    terraceMesh.name = side < 0 ? 'WestSteppedTerrace' : 'EastSteppedTerrace';
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
