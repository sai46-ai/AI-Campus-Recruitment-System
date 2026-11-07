import * as THREE from 'three';
import { evaluateRiverChannel } from './sceneConfig';
import { SceneMaterialSet } from './materials';
import { buildTerraceGeometry } from './terraceGeometry';

export interface TerrainGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Builds the complete circuit-board valley terrain on both sides of the river,
 * combining the layered 3D PCB terraces with extruded raised surface traces
 * and embedded terrain connection terminals.
 */
export function buildTerrainGeometry(materials: SceneMaterialSet): TerrainGeometryResult {
  const group = new THREE.Group();
  group.name = 'CircuitBoardValleyTerrainGroup';

  const terraceResult = buildTerraceGeometry(materials);
  group.add(terraceResult.group);

  const extraGeos: THREE.BufferGeometry[] = [];
  const terminalGeo = new THREE.CylinderGeometry(0.42, 0.5, 0.16, 14);
  extraGeos.push(terminalGeo);

  // Add raised lateral PCB bus traces and connection terminals across both banks
  const zPositions = [38, 22, 8, -6, -20, -36, -54, -74, -96];
  for (const side of [-1, 1]) {
    for (let i = 0; i < zPositions.length; i++) {
      const z = zPositions[i];
      const { centerX, halfWidth } = evaluateRiverChannel(z);
      const innerX = centerX + side * (halfWidth + 2.4);
      const midX = centerX + side * (halfWidth + 11.5);
      const outerX = centerX + side * (halfWidth + 22.0);

      const pts = [
        new THREE.Vector3(innerX, 1.22, z),
        new THREE.Vector3(midX, 2.45, z - 2.5),
        new THREE.Vector3(outerX, 3.82, z - 5.0),
      ];
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.065, 6, false);
      extraGeos.push(tubeGeo);

      const mat =
        i % 2 === 0
          ? materials.raisedTraceCyanMaterial
          : materials.raisedTraceGoldMaterial;
      group.add(new THREE.Mesh(tubeGeo, mat));

      const termMesh = new THREE.Mesh(terminalGeo, mat);
      termMesh.position.set(midX, 2.48, z - 2.5);
      group.add(termMesh);
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
