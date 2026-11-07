import * as THREE from 'three';
import { WORLD_CONFIG } from './sceneConfig';
import { InteractableObjectSpec, SceneUniforms } from './types';

/**
 * AnimationController
 * Keeps environmental shader animations running continuously and independently
 * of camera movement, while coordinating interactive pulse waves, river ripples,
 * pause/resume states, hidden-tab suspension, and reduced motion.
 */
export class AnimationController {
  public readonly uniforms: SceneUniforms;
  private animationSpeed = 1.0;
  private sceneIntensity = 1.0;
  private isPaused = false;
  private reducedMotion = false;
  private isTabHidden = false;
  private elapsedTime = 0.0;
  private pulseAge = 999.0;
  private targetRiverHoverBoost = 0.0;

  constructor(initialSpeed = 1.0, initialIntensity = 1.0) {
    this.animationSpeed = initialSpeed;
    this.sceneIntensity = initialIntensity;

    this.uniforms = {
      uTime: { value: 0.0 },
      uIntensity: { value: initialIntensity },
      uPulseOrigin: { value: new THREE.Vector3(0, 0, 0) },
      uPulseTime: { value: 999.0 },
      uPulseColor: { value: new THREE.Color('#00f2fe') },
      uHoveredPos: { value: new THREE.Vector3(0, -999, 0) },
      uSelectedPos: { value: new THREE.Vector3(0, -999, 0) },
      uRiverHoverZ: { value: 999.0 },
      uRiverHoverBoost: { value: 0.0 },
      uSunPosition: { value: new THREE.Vector3(...WORLD_CONFIG.sunPosition) },
      uCameraPos: { value: new THREE.Vector3(0, 7.2, 48.0) },
    };
  }

  public setAnimationSpeed(speed: number): void {
    this.animationSpeed = THREE.MathUtils.clamp(speed, 0.0, 3.0);
  }

  public setSceneIntensity(intensity: number): void {
    this.sceneIntensity = THREE.MathUtils.clamp(intensity, 0.3, 2.0);
    this.uniforms.uIntensity.value = this.sceneIntensity;
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
  }

  public getPaused(): boolean {
    return this.isPaused;
  }

  public setReducedMotion(enabled: boolean): void {
    this.reducedMotion = enabled;
  }

  public getReducedMotion(): boolean {
    return this.reducedMotion;
  }

  public setTabHidden(hidden: boolean): void {
    this.isTabHidden = hidden;
  }

  public isSuspended(): boolean {
    return this.isTabHidden;
  }

  public getActiveAnimationState(): 'RUNNING' | 'PAUSED' | 'REDUCED_MOTION' {
    if (this.isPaused) return 'PAUSED';
    if (this.reducedMotion) return 'REDUCED_MOTION';
    return 'RUNNING';
  }

  public triggerPulseAt(position: [number, number, number], hexColor: string): void {
    this.uniforms.uPulseOrigin.value.set(...position);
    this.uniforms.uPulseColor.value.set(hexColor);
    this.pulseAge = 0.0;
    this.uniforms.uPulseTime.value = 0.0;
  }

  public setHoveredObject(spec: InteractableObjectSpec | null): void {
    if (spec) {
      this.uniforms.uHoveredPos.value.set(...spec.position);
      if (spec.category === 'river-checkpoint') {
        this.uniforms.uRiverHoverZ.value = spec.position[2];
        this.targetRiverHoverBoost = 1.0;
      } else {
        this.targetRiverHoverBoost = 0.35;
        this.uniforms.uRiverHoverZ.value = spec.position[2];
      }
    } else {
      this.uniforms.uHoveredPos.value.set(0, -999, 0);
      this.targetRiverHoverBoost = 0.0;
    }
  }

  public setSelectedObject(spec: InteractableObjectSpec | null): void {
    if (spec) {
      this.uniforms.uSelectedPos.value.set(...spec.position);
      this.triggerPulseAt(spec.position, spec.accentColor);
      if (spec.category === 'river-checkpoint') {
        this.uniforms.uRiverHoverZ.value = spec.position[2];
        this.targetRiverHoverBoost = 1.35;
      }
    } else {
      this.uniforms.uSelectedPos.value.set(0, -999, 0);
      this.targetRiverHoverBoost = 0.0;
    }
  }

  public update(dt: number, cameraPos: THREE.Vector3): void {
    if (this.isTabHidden) return;
    const clampedDt = Math.max(0.0, Math.min(dt, 0.1));

    const speedFactor = this.isPaused
      ? 0.0
      : this.reducedMotion
      ? this.animationSpeed * 0.18
      : this.animationSpeed;

    this.elapsedTime += clampedDt * speedFactor;
    this.uniforms.uTime.value = this.elapsedTime;
    this.uniforms.uCameraPos.value.copy(cameraPos);

    if (this.pulseAge < 35.0 && !this.isPaused) {
      this.pulseAge += clampedDt * (this.reducedMotion ? 0.5 : 1.0);
      this.uniforms.uPulseTime.value = this.pulseAge;
    }

    this.uniforms.uRiverHoverBoost.value = THREE.MathUtils.lerp(
      this.uniforms.uRiverHoverBoost.value,
      this.targetRiverHoverBoost,
      1.0 - Math.exp(-6.0 * clampedDt)
    );
  }
}
