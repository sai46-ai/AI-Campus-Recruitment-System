import * as THREE from 'three';
import { WORLD_CONFIG } from './sceneConfig';
import { SceneMaterialSet } from './materials';

export interface SkyGeometryResult {
  group: THREE.Group;
  dispose: () => void;
}

/**
 * Generates:
 *  1. 3D vertical sky binary/glyph stream columns suspended across the upper atmosphere
 *  2. Horizon solar-digital convergence core & seamless full-frustum atmospheric backdrop
 *  3. Upper-zenith starfield points
 */
export function buildSkyGeometry(materials: SceneMaterialSet): SkyGeometryResult {
  const group = new THREE.Group();
  group.name = 'SkyDataAndHorizonCoreGroup';

  const geometriesToDispose: THREE.BufferGeometry[] = [];
  const materialsToDispose: THREE.Material[] = [];

  // 1. Merged 3D vertical sky binary data strips hanging from the upper sky
  const streamCount = 96;
  const positions = new Float32Array(streamCount * 4 * 3);
  const uvs = new Float32Array(streamCount * 4 * 2);
  const seeds = new Float32Array(streamCount * 4);
  const indices: number[] = [];

  const seededRand = (s: number): number => {
    const x = Math.sin(s * 91.7 + 17.3) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < streamCount; i++) {
    const r1 = seededRand(i * 3 + 1);
    const r2 = seededRand(i * 3 + 2);
    const r3 = seededRand(i * 3 + 3);

    const x = (r1 - 0.5) * 280.0;
    const z = -60.0 - r2 * 195.0;
    const topY = 75.0 + r3 * 45.0;
    const bottomY = 20.0 + (1.0 - Math.abs(x) / 150.0) * 5.0 + r2 * 14.0;
    const halfW = 0.24 + r3 * 0.32;

    const vBase = i * 4;
    positions[(vBase + 0) * 3 + 0] = x - halfW;
    positions[(vBase + 0) * 3 + 1] = bottomY;
    positions[(vBase + 0) * 3 + 2] = z;
    uvs[(vBase + 0) * 2 + 0] = 0;
    uvs[(vBase + 0) * 2 + 1] = 0;

    positions[(vBase + 1) * 3 + 0] = x + halfW;
    positions[(vBase + 1) * 3 + 1] = bottomY;
    positions[(vBase + 1) * 3 + 2] = z;
    uvs[(vBase + 1) * 2 + 0] = 1;
    uvs[(vBase + 1) * 2 + 1] = 0;

    positions[(vBase + 2) * 3 + 0] = x - halfW;
    positions[(vBase + 2) * 3 + 1] = topY;
    positions[(vBase + 2) * 3 + 2] = z;
    uvs[(vBase + 2) * 2 + 0] = 0;
    uvs[(vBase + 2) * 2 + 1] = 1;

    positions[(vBase + 3) * 3 + 0] = x + halfW;
    positions[(vBase + 3) * 3 + 1] = topY;
    positions[(vBase + 3) * 3 + 2] = z;
    uvs[(vBase + 3) * 2 + 0] = 1;
    uvs[(vBase + 3) * 2 + 1] = 1;

    for (let k = 0; k < 4; k++) {
      seeds[vBase + k] = r1 * 7.1 + r3 * 3.3;
    }

    indices.push(vBase + 0, vBase + 1, vBase + 2);
    indices.push(vBase + 1, vBase + 3, vBase + 2);
  }

  const skyStreamsGeo = new THREE.BufferGeometry();
  skyStreamsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  skyStreamsGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  skyStreamsGeo.setAttribute('aStreamSeed', new THREE.BufferAttribute(seeds, 1));
  skyStreamsGeo.setIndex(indices);
  geometriesToDispose.push(skyStreamsGeo);

  const skyStreamsMesh = new THREE.Mesh(skyStreamsGeo, materials.skyDataMaterial);
  skyStreamsMesh.name = 'VerticalSkyBinaryStreams';
  group.add(skyStreamsMesh);

  // 2. Seamless Full-Frustum Horizon Solar-Digital Convergence Core & Sky Backdrop
  const backdropGeo = new THREE.PlaneGeometry(920, 420, 1, 1);
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
        vec3 zenithCol = vec3(0.015, 0.055, 0.085);
        vec3 midSkyCol = vec3(0.05, 0.22, 0.26);
        vec3 horizonMist = vec3(0.32, 0.56, 0.52);

        float h = clamp((vUv.y - 0.35) / 0.55, 0.0, 1.0);
        vec3 sky = mix(horizonMist, midSkyCol, smoothstep(0.0, 0.38, h));
        sky = mix(sky, zenithCol, smoothstep(0.35, 0.90, h));

        // Central golden-white sunrise core nestled in the valley gap
        vec2 sunDelta = (vUv - vec2(0.5, 0.385)) * vec2(3.6, 1.6);
        float sunDist = length(sunDelta);

        float pulse = 0.96 + 0.04 * sin(uTime * 1.4);
        float coreGlow = exp(-sunDist * sunDist * 45.0) * pulse;
        float innerHalo = exp(-sunDist * sunDist * 10.0) * pulse;
        float outerHalo = exp(-sunDist * 3.0);

        vec3 coreWhite = vec3(1.0, 0.99, 0.90);
        vec3 warmGold = vec3(1.0, 0.86, 0.52);
        vec3 mintHalo = vec3(0.45, 0.85, 0.72);

        sky += mintHalo * outerHalo * 0.48;
        sky = mix(sky, warmGold, clamp(innerHalo * 0.88, 0.0, 1.0));
        sky = mix(sky, coreWhite, clamp(coreGlow * 1.2, 0.0, 1.0));

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
  backdropMesh.position.set(0, 48, WORLD_CONFIG.sunPosition[2] - 10);
  backdropMesh.name = 'HorizonSkyBackdrop';
  group.add(backdropMesh);

  // 3. Subtle upper-sky starfield points
  const starCount = 260;
  const starPos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPos[i * 3 + 0] = (seededRand(i * 11 + 5) - 0.5) * 380.0;
    starPos[i * 3 + 1] = 28.0 + seededRand(i * 11 + 7) * 85.0;
    starPos[i * 3 + 2] = -90.0 - seededRand(i * 11 + 9) * 195.0;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  geometriesToDispose.push(starGeo);

  const starMat = new THREE.PointsMaterial({
    color: new THREE.Color('#a8f5e8'),
    size: 0.85,
    transparent: true,
    opacity: 0.55,
  });
  materialsToDispose.push(starMat);

  const starPoints = new THREE.Points(starGeo, starMat);
  starPoints.name = 'ZenithStarfield';
  group.add(starPoints);

  return {
    group,
    dispose: () => {
      for (const g of geometriesToDispose) g.dispose();
      for (const m of materialsToDispose) m.dispose();
    },
  };
}
