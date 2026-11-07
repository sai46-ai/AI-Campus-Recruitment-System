import * as THREE from 'three';
import { SceneUniforms } from './types';
import {
  FOREST_HOLOGRAM_FRAGMENT_SHADER,
  FOREST_HOLOGRAM_VERTEX_SHADER,
  MOUNTAIN_FRAGMENT_SHADER,
  MOUNTAIN_VERTEX_SHADER,
  RIVER_FRAGMENT_SHADER,
  RIVER_VERTEX_SHADER,
  SKY_DATA_FRAGMENT_SHADER,
  SKY_DATA_VERTEX_SHADER,
  TERRACE_FRAGMENT_SHADER,
  TERRACE_VERTEX_SHADER,
} from './shaders';

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
    color: new THREE.Color('#03150f'),
    emissive: new THREE.Color('#063320'),
    emissiveIntensity: 0.5,
    roughness: 0.65,
    metalness: 0.25,
  });

  const pinePadMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#38f9d7'),
    transparent: true,
    opacity: 0.78,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceCyanMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#00f2fe'),
    transparent: true,
    opacity: 0.88,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceEmeraldMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#10b981'),
    transparent: true,
    opacity: 0.82,
    blending: THREE.AdditiveBlending,
  });

  const raisedTraceGoldMaterial = new THREE.MeshBasicMaterial({
    color: new THREE.Color('#d4af37'),
    transparent: true,
    opacity: 0.78,
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
