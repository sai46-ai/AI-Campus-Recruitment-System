import * as THREE from 'three';
import { evaluateRiverChannel } from './sceneConfig';
import { SceneMaterialSet } from './materials';

export interface ForestGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

interface TreePlacement {
  x: number;
  y: number;
  z: number;
  scale: number;
  seed: number;
}

/**
 * Generates the West and East Holographic Emerald Bio-Matrix Conifer Forests.
 * Positioned in the middle ground (Z = -10 to Z = -140) on the stepped circuit terraces
 * so the immediate foreground river delta remains wide open, matching the reference image.
 */
export function buildForestGeometry(materials: SceneMaterialSet): ForestGeometryResult {
  const group = new THREE.Group();
  group.name = 'HolographicBioMatrixForestGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];

  const seededRand = (seed: number): number => {
    const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  };

  const placements: TreePlacement[] = [];
  const sides = [-1, 1];
  let seedCounter = 1;

  for (const side of sides) {
    // Primary mid-ground grove (-10 <= Z <= -72)
    for (let i = 0; i < 28; i++) {
      const r1 = seededRand(seedCounter++);
      const r2 = seededRand(seedCounter++);
      const r3 = seededRand(seedCounter++);

      const z = -10.0 - r1 * 62.0;
      const { centerX, halfWidth } = evaluateRiverChannel(z);
      const lateralOffset = 15.0 + r2 * 36.0;
      const x = centerX + side * (halfWidth + lateralOffset);
      const scale = 0.72 + r3 * 0.65;

      placements.push({
        x,
        y: 3.75,
        z,
        scale,
        seed: r1 * 10.0 + r2,
      });
    }

    // Secondary deeper valley grove (-76 <= Z <= -145)
    for (let i = 0; i < 14; i++) {
      const r1 = seededRand(seedCounter++);
      const r2 = seededRand(seedCounter++);
      const r3 = seededRand(seedCounter++);

      const z = -76.0 - r1 * 68.0;
      const { centerX, halfWidth } = evaluateRiverChannel(z);
      const lateralOffset = 13.0 + r2 * 28.0;
      const x = centerX + side * (halfWidth + lateralOffset);
      const scale = 0.55 + r3 * 0.48;

      placements.push({
        x,
        y: 3.75,
        z,
        scale,
        seed: r1 * 10.0 + r3,
      });
    }
  }

  const coneLowerGeo = new THREE.ConeGeometry(1.18, 7.8, 12, 1);
  const coneUpperGeo = new THREE.ConeGeometry(0.88, 6.8, 12, 1);
  const trunkGeo = new THREE.CylinderGeometry(0.09, 0.13, 2.4, 8);
  const padRingGeo = new THREE.RingGeometry(0.22, 1.25, 20);
  padRingGeo.rotateX(-Math.PI / 2);

  geometriesToDispose.push(coneLowerGeo, coneUpperGeo, trunkGeo, padRingGeo);

  const baseCylinder = new THREE.CylinderGeometry(1.22, 1.22, 20.0, 16, 1, true);
  const cylPos = baseCylinder.attributes.position.array as Float32Array;
  const cylUv = baseCylinder.attributes.uv.array as Float32Array;
  const cylIndex = baseCylinder.index!.array;

  const vertsPerCyl = cylPos.length / 3;
  const indicesPerCyl = cylIndex.length;
  const totalTrees = placements.length;

  const mergedHologramPos = new Float32Array(totalTrees * vertsPerCyl * 3);
  const mergedHologramUv = new Float32Array(totalTrees * vertsPerCyl * 2);
  const mergedHologramSeed = new Float32Array(totalTrees * vertsPerCyl);
  const mergedHologramIndices: number[] = [];

  for (let t = 0; t < totalTrees; t++) {
    const tree = placements[t];

    const lowerCone = new THREE.Mesh(coneLowerGeo, materials.pineCoreMaterial);
    lowerCone.position.set(tree.x, tree.y + 5.2 * tree.scale, tree.z);
    lowerCone.scale.setScalar(tree.scale);
    group.add(lowerCone);

    const upperCone = new THREE.Mesh(coneUpperGeo, materials.pineCoreMaterial);
    upperCone.position.set(tree.x, tree.y + 8.5 * tree.scale, tree.z);
    upperCone.scale.setScalar(tree.scale);
    group.add(upperCone);

    const trunk = new THREE.Mesh(trunkGeo, materials.raisedTraceCyanMaterial);
    trunk.position.set(tree.x, tree.y + 1.2 * tree.scale, tree.z);
    trunk.scale.setScalar(tree.scale);
    group.add(trunk);

    const pad = new THREE.Mesh(padRingGeo, materials.pinePadMaterial);
    pad.position.set(tree.x, tree.y + 0.08, tree.z);
    pad.scale.setScalar(tree.scale);
    group.add(pad);

    const vOffset = t * vertsPerCyl;
    const curtainHeightScale = tree.scale * 1.15;
    const curtainRadiusScale = tree.scale * 0.95;

    for (let v = 0; v < vertsPerCyl; v++) {
      const lx = cylPos[v * 3] * curtainRadiusScale;
      const ly = (cylPos[v * 3 + 1] + 10.0) * curtainHeightScale;
      const lz = cylPos[v * 3 + 2] * curtainRadiusScale;

      mergedHologramPos[(vOffset + v) * 3] = tree.x + lx;
      mergedHologramPos[(vOffset + v) * 3 + 1] = tree.y + ly;
      mergedHologramPos[(vOffset + v) * 3 + 2] = tree.z + lz;

      mergedHologramUv[(vOffset + v) * 2] = cylUv[v * 2];
      mergedHologramUv[(vOffset + v) * 2 + 1] = cylUv[v * 2 + 1];

      mergedHologramSeed[vOffset + v] = tree.seed;
    }

    for (let idx = 0; idx < indicesPerCyl; idx++) {
      mergedHologramIndices.push(vOffset + cylIndex[idx]);
    }
  }

  baseCylinder.dispose();

  const mergedHologramGeo = new THREE.BufferGeometry();
  mergedHologramGeo.setAttribute('position', new THREE.BufferAttribute(mergedHologramPos, 3));
  mergedHologramGeo.setAttribute('uv', new THREE.BufferAttribute(mergedHologramUv, 2));
  mergedHologramGeo.setAttribute('aTreeSeed', new THREE.BufferAttribute(mergedHologramSeed, 1));
  mergedHologramGeo.setIndex(mergedHologramIndices);
  geometriesToDispose.push(mergedHologramGeo);

  const hologramMesh = new THREE.Mesh(mergedHologramGeo, materials.forestHologramMaterial);
  hologramMesh.name = 'MergedForestHologramCurtains';
  group.add(hologramMesh);

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) {
        g.dispose();
      }
    },
  };
}
