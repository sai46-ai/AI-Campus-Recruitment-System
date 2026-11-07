import * as THREE from 'three';
import { CAMERA_PATH_WAYPOINTS, WORLD_CONFIG } from './sceneConfig';
import { InteractableObjectSpec } from './types';
import { NavigationController } from './NavigationController';

/**
 * CameraController
 * Evaluates camera position, lookAt target, and FOV along the continuous 3D
 * Catmull-Rom river spline driven by NavigationController.currentProgress,
 * and smoothly blends into/out of focused 3D object viewpoints when selected.
 */
export class CameraController {
  public readonly camera: THREE.PerspectiveCamera;
  private readonly positionSpline: THREE.CatmullRomCurve3;
  private readonly lookAtSpline: THREE.CatmullRomCurve3;

  public readonly currentPosition = new THREE.Vector3();
  public readonly currentTarget = new THREE.Vector3();
  private readonly splinePos = new THREE.Vector3();
  private readonly splineLook = new THREE.Vector3();

  private focusedObject: InteractableObjectSpec | null = null;
  private hoveredObject: InteractableObjectSpec | null = null;
  private focusBlend = 0.0;
  private hoverNudgeBlend = 0.0;
  private readonly focusPos = new THREE.Vector3();
  private readonly focusLook = new THREE.Vector3();
  private readonly hoverLook = new THREE.Vector3();

  private aspect = 16 / 9;

  constructor(aspect = 16 / 9) {
    this.aspect = aspect;
    this.camera = new THREE.PerspectiveCamera(
      this.computeResponsiveFov(WORLD_CONFIG.baseFov, aspect),
      aspect,
      WORLD_CONFIG.nearClip,
      WORLD_CONFIG.farClip
    );

    const posPoints = CAMERA_PATH_WAYPOINTS.map(
      (wp) => new THREE.Vector3(...wp.position)
    );
    const lookPoints = CAMERA_PATH_WAYPOINTS.map(
      (wp) => new THREE.Vector3(...wp.lookAt)
    );

    this.positionSpline = new THREE.CatmullRomCurve3(posPoints, false, 'catmullrom', 0.5);
    this.lookAtSpline = new THREE.CatmullRomCurve3(lookPoints, false, 'catmullrom', 0.5);

    this.positionSpline.getPointAt(0, this.currentPosition);
    this.lookAtSpline.getPointAt(0, this.currentTarget);
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentTarget);
  }

  private computeResponsiveFov(baseFov: number, aspect: number): number {
    if (aspect >= 1.2) return baseFov;
    const clamped = Math.max(0.55, aspect);
    return Math.min(72, baseFov * (1.15 / Math.pow(clamped, 0.38)));
  }

  public handleResize(width: number, height: number): void {
    if (height <= 0) return;
    this.aspect = width / height;
    this.camera.aspect = this.aspect;
    this.camera.updateProjectionMatrix();
  }

  public setHoveredObject(spec: InteractableObjectSpec | null): void {
    this.hoveredObject = spec;
    if (spec) {
      this.hoverLook.set(...spec.position);
    }
  }

  public setFocusedObject(spec: InteractableObjectSpec | null): void {
    this.focusedObject = spec;
    if (spec) {
      this.focusPos.set(...spec.focusCameraPos);
      this.focusLook.set(...spec.focusLookAt);
    }
  }

  public getFocusedObject(): InteractableObjectSpec | null {
    return this.focusedObject;
  }

  public getTransitionState(
    nav: NavigationController
  ): 'SPLINE_LOCKED' | 'INTERPOLATING_PATH' | 'OBJECT_FOCUS_TRANSITION' | 'AUTO_FLYING' {
    if (this.focusedObject || this.focusBlend > 0.02) {
      return 'OBJECT_FOCUS_TRANSITION';
    }
    if (nav.isAutoFlying && !nav.isPaused) {
      return 'AUTO_FLYING';
    }
    if (Math.abs(nav.targetProgress - nav.currentProgress) > 0.004) {
      return 'INTERPOLATING_PATH';
    }
    return 'SPLINE_LOCKED';
  }

  public update(
    dt: number,
    nav: NavigationController,
    reducedMotion = false
  ): void {
    const clampedDt = Math.max(0.0, Math.min(dt, 0.1));
    const damping = reducedMotion ? 12.0 : 5.5;
    const factor = 1.0 - Math.exp(-damping * clampedDt);

    // 1. Evaluate base camera position and lookAt along the central river spline
    const prog = THREE.MathUtils.clamp(nav.currentProgress, 0, 1);
    this.positionSpline.getPointAt(prog, this.splinePos);
    this.lookAtSpline.getPointAt(prog, this.splineLook);

    // Apply horizontal/vertical viewing angle adjustments from drag or pointer
    const parallaxScale = reducedMotion ? 0.35 : 1.0;
    const angleOffsetX = nav.smoothedLookAngle.x * 3.8 * parallaxScale;
    const angleOffsetY = -nav.smoothedLookAngle.y * 1.8 * parallaxScale;

    const desiredSplinePos = new THREE.Vector3(
      this.splinePos.x + angleOffsetX * 0.45,
      Math.max(1.6, this.splinePos.y + angleOffsetY * 0.35),
      this.splinePos.z
    );
    const desiredSplineLook = new THREE.Vector3(
      this.splineLook.x + angleOffsetX * 3.2,
      this.splineLook.y + angleOffsetY * 2.2,
      this.splineLook.z
    );

    // Subtle camera attention nudge when hovering an interactive object
    const targetHoverBlend = this.hoveredObject && !this.focusedObject ? 0.14 : 0.0;
    this.hoverNudgeBlend = THREE.MathUtils.lerp(
      this.hoverNudgeBlend,
      targetHoverBlend,
      factor
    );
    if (this.hoverNudgeBlend > 0.001) {
      desiredSplineLook.lerp(this.hoverLook, this.hoverNudgeBlend);
    }

    // 2. Smoothly blend between spline travel and focused 3D object camera pose
    const targetFocusBlend = this.focusedObject ? 1.0 : 0.0;
    this.focusBlend = THREE.MathUtils.lerp(
      this.focusBlend,
      targetFocusBlend,
      factor
    );

    const finalDesiredPos = desiredSplinePos.clone().lerp(this.focusPos, this.focusBlend);
    const finalDesiredLook = desiredSplineLook.clone().lerp(this.focusLook, this.focusBlend);

    this.currentPosition.lerp(finalDesiredPos, factor);
    this.currentTarget.lerp(finalDesiredLook, factor);

    // 3. Interpolate FOV along path or focus state
    const baseSplineFov = WORLD_CONFIG.baseFov - prog * 6.0;
    const desiredFov = THREE.MathUtils.lerp(baseSplineFov, 40.0, this.focusBlend);
    const responsiveFov = this.computeResponsiveFov(desiredFov, this.aspect);
    if (Math.abs(this.camera.fov - responsiveFov) > 0.04) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, responsiveFov, factor);
      this.camera.updateProjectionMatrix();
    }

    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.currentTarget);
  }
}
