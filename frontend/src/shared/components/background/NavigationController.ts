import * as THREE from 'three';
import { VIEWPOINTS, VIEWPOINT_ORDER } from './sceneConfig';
import {
  LastInputSource,
  NavigationInputMode,
  ViewpointId,
} from './types';

/**
 * Central NavigationController
 * Every navigation input (wheel, drag, touch, keyboard, buttons, slider, viewpoint preset,
 * or native website scroll) updates `targetProgress` on this single controller.
 * The render loop smoothly interpolates `currentProgress` toward `targetProgress`
 * using frame-rate-independent damping.
 */
export class NavigationController {
  public targetProgress = 0.0;
  public currentProgress = 0.0;
  public lookAngleOffset = new THREE.Vector2(0, 0);
  public smoothedLookAngle = new THREE.Vector2(0, 0);

  public inputMode: NavigationInputMode = 'immersive';
  public lastInputSource: LastInputSource = 'initial';
  public isAutoFlying = false;
  public isPaused = false;
  private autoFlyDirection = 1;
  private keyboardDirection = 0;
  private buttonHoldDirection = 0;

  private isDragging = false;
  private activePointerId: number | null = null;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private dragDistanceAccum = 0;

  private touchStartY = 0;
  private lastTouchY = 0;

  private onClearObjectFocus?: () => void;

  constructor(
    initialMode: NavigationInputMode = 'immersive',
    onClearObjectFocus?: () => void
  ) {
    this.inputMode = initialMode;
    this.onClearObjectFocus = onClearObjectFocus;
  }

  public setInputMode(mode: NavigationInputMode): void {
    this.inputMode = mode;
    if (mode === 'website-scroll') {
      this.isAutoFlying = false;
    }
  }

  public setTargetProgress(
    progress: number,
    source: LastInputSource,
    clearFocus = true,
    immediate = false
  ): void {
    this.targetProgress = THREE.MathUtils.clamp(progress, 0.0, 1.0);
    this.lastInputSource = source;
    if (source !== 'auto-fly') {
      this.isAutoFlying = false;
    }
    if (clearFocus && this.onClearObjectFocus) {
      this.onClearObjectFocus();
    }
    if (immediate) {
      this.currentProgress = this.targetProgress;
    }
  }

  public stepForward(amount = 0.12): void {
    this.setTargetProgress(this.targetProgress + amount, 'button-forward', true);
  }

  public stepBackward(amount = 0.12): void {
    this.setTargetProgress(this.targetProgress - amount, 'button-back', true);
  }

  public startAutoFly(): void {
    this.isAutoFlying = true;
    this.isPaused = false;
    this.lastInputSource = 'auto-fly';
    if (this.onClearObjectFocus) {
      this.onClearObjectFocus();
    }
  }

  public pause(): void {
    this.isAutoFlying = false;
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public reset(): void {
    this.isAutoFlying = false;
    this.isPaused = false;
    this.lookAngleOffset.set(0, 0);
    this.setTargetProgress(0.0, 'reset', true, false);
  }

  public goToViewpoint(viewpointId: ViewpointId, immediate = false): void {
    const vp = VIEWPOINTS[viewpointId] || VIEWPOINTS.establishing;
    this.lookAngleOffset.set(0, 0);
    this.setTargetProgress(vp.progress, 'viewpoint-preset', true, immediate);
  }

  public goToNextViewpoint(): void {
    const eps = 0.03;
    for (const id of VIEWPOINT_ORDER) {
      if (VIEWPOINTS[id].progress > this.targetProgress + eps) {
        this.goToViewpoint(id);
        return;
      }
    }
    this.goToViewpoint(VIEWPOINT_ORDER[VIEWPOINT_ORDER.length - 1]);
  }

  public goToPreviousViewpoint(): void {
    const eps = 0.03;
    for (let i = VIEWPOINT_ORDER.length - 1; i >= 0; i--) {
      const id = VIEWPOINT_ORDER[i];
      if (VIEWPOINTS[id].progress < this.targetProgress - eps) {
        this.goToViewpoint(id);
        return;
      }
    }
    this.goToViewpoint(VIEWPOINT_ORDER[0]);
  }

  public getActiveViewpointId(): ViewpointId {
    let closest: ViewpointId = 'establishing';
    let minDiff = Infinity;
    for (const id of VIEWPOINT_ORDER) {
      const diff = Math.abs(VIEWPOINTS[id].progress - this.currentProgress);
      if (diff < minDiff) {
        minDiff = diff;
        closest = id;
      }
    }
    return closest;
  }

  /**
   * Mouse wheel / trackpad handler:
   * - Scroll down (deltaY > 0) moves camera forward (+progress)
   * - Scroll up (deltaY < 0) moves camera backward (-progress)
   * - Normalizes pixel (0), line (1), and page (2) deltaModes
   */
  public handleWheel(e: WheelEvent, viewportHeight = 900): void {
    const targetTag = (e.target as HTMLElement | null)?.tagName;
    if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
      return;
    }
    if (this.inputMode === 'immersive') {
      e.preventDefault();
    }

    let pixelDelta = e.deltaY;
    if (e.deltaMode === 1) {
      pixelDelta *= 36; // DOM_DELTA_LINE
    } else if (e.deltaMode === 2) {
      pixelDelta *= viewportHeight; // DOM_DELTA_PAGE
    }

    const sign = Math.sign(pixelDelta);
    const absPixels = Math.abs(pixelDelta);
    const normalizedStep = sign * Math.min(0.14, Math.max(0.008, absPixels * 0.0014));
    this.setTargetProgress(this.targetProgress + normalizedStep, 'wheel', true);
  }

  /**
   * Pointer down / drag / up:
   * - Drag upward (dy < 0) moves forward (+progress)
   * - Drag downward (dy > 0) moves backward (-progress)
   * - Horizontal dragging adjusts viewing angle
   */
  public handlePointerDown(e: PointerEvent, canvas?: HTMLCanvasElement | null): void {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    this.isDragging = true;
    this.activePointerId = e.pointerId;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
    this.dragDistanceAccum = 0;
    if (canvas) {
      try {
        canvas.setPointerCapture(e.pointerId);
      } catch (_) {}
    }
  }

  public handlePointerMove(
    e: PointerEvent,
    viewportWidth: number,
    viewportHeight: number
  ): boolean {
    if (this.isDragging) {
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
      this.dragDistanceAccum += Math.hypot(dx, dy);

      // Drag upward (dy < 0) -> progress increases (forward)
      // Drag downward (dy > 0) -> progress decreases (backward)
      const progressDelta = (-dy / Math.max(300, viewportHeight)) * 1.35;
      this.setTargetProgress(this.targetProgress + progressDelta, 'drag', true);

      // Horizontal drag adjusts viewing angle smoothly
      const angleDeltaX = (dx / Math.max(300, viewportWidth)) * 2.2;
      this.lookAngleOffset.x = THREE.MathUtils.clamp(
        this.lookAngleOffset.x + angleDeltaX,
        -1.2,
        1.2
      );
      return true;
    }

    // Subtle hover parallax when not dragging
    const nx = (e.clientX / Math.max(1, viewportWidth)) * 2 - 1;
    const ny = (e.clientY / Math.max(1, viewportHeight)) * 2 - 1;
    this.lookAngleOffset.x = THREE.MathUtils.clamp(nx * 0.45, -1.2, 1.2);
    this.lookAngleOffset.y = THREE.MathUtils.clamp(ny * 0.35, -0.8, 0.8);
    return false;
  }

  public handlePointerUp(_e: PointerEvent, canvas?: HTMLCanvasElement | null): boolean {
    if (!this.isDragging) return false;
    this.isDragging = false;
    if (this.activePointerId !== null && canvas) {
      try {
        canvas.releasePointerCapture(this.activePointerId);
      } catch (_) {}
      this.activePointerId = null;
    }
    return this.dragDistanceAccum > 6;
  }

  /**
   * Touch swipe handler:
   * - Swipe upward (currentY < lastY) advances forward (+progress)
   * - Swipe downward (currentY > lastY) reverses backward (-progress)
   */
  public handleTouchStart(clientY: number): void {
    this.touchStartY = clientY;
    this.lastTouchY = clientY;
  }

  public handleTouchMove(clientY: number, viewportHeight = 800): void {
    const dy = clientY - this.lastTouchY;
    this.lastTouchY = clientY;
    const step = (-dy / Math.max(250, viewportHeight)) * 1.35;
    this.setTargetProgress(this.targetProgress + step, 'touch', true);
  }

  /**
   * Keyboard navigation handler:
   * - W / ArrowUp: forward
   * - S / ArrowDown: backward
   * - PageDown: next viewpoint
   * - PageUp: previous viewpoint
   * - Home: starting viewpoint (0.0)
   * - End: final viewpoint (1.0)
   * Ignores events when typing inside form fields.
   */
  public handleKeyDown(e: KeyboardEvent): void {
    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT' ||
        (activeEl as HTMLElement).isContentEditable)
    ) {
      return;
    }

    switch (e.key) {
      case 'w':
      case 'W':
      case 'ArrowUp':
        this.keyboardDirection = 1;
        this.setTargetProgress(this.targetProgress + 0.045, 'keyboard', true);
        break;
      case 's':
      case 'S':
      case 'ArrowDown':
        this.keyboardDirection = -1;
        this.setTargetProgress(this.targetProgress - 0.045, 'keyboard', true);
        break;
      case 'PageDown':
        this.goToNextViewpoint();
        this.lastInputSource = 'keyboard';
        break;
      case 'PageUp':
        this.goToPreviousViewpoint();
        this.lastInputSource = 'keyboard';
        break;
      case 'Home':
        this.setTargetProgress(0.0, 'keyboard', true);
        break;
      case 'End':
        this.setTargetProgress(1.0, 'keyboard', true);
        break;
    }
  }

  public handleKeyUp(e: KeyboardEvent): void {
    if (
      e.key === 'w' ||
      e.key === 'W' ||
      e.key === 'ArrowUp' ||
      e.key === 's' ||
      e.key === 'S' ||
      e.key === 'ArrowDown'
    ) {
      this.keyboardDirection = 0;
    }
  }

  public setButtonHoldDirection(dir: number): void {
    this.buttonHoldDirection = dir;
  }

  /**
   * Website Integration Mode: syncs targetProgress from native window/document scroll
   */
  public handleWindowScroll(): void {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 10) return;
    const ratio = THREE.MathUtils.clamp(window.scrollY / maxScroll, 0, 1);
    this.setTargetProgress(ratio, 'window-scroll', false);
  }

  public update(dt: number, reducedMotion = false): void {
    const clampedDt = Math.max(0.0, Math.min(dt, 0.1));

    if (this.keyboardDirection !== 0) {
      this.setTargetProgress(
        this.targetProgress + this.keyboardDirection * clampedDt * 0.35,
        'keyboard',
        true
      );
    } else if (this.buttonHoldDirection !== 0) {
      this.setTargetProgress(
        this.targetProgress + this.buttonHoldDirection * clampedDt * 0.35,
        this.buttonHoldDirection > 0 ? 'button-forward' : 'button-back',
        true
      );
    } else if (this.isAutoFlying && !this.isPaused && !reducedMotion) {
      let next = this.targetProgress + this.autoFlyDirection * clampedDt * 0.11;
      if (next >= 1.0) {
        next = 1.0;
        this.autoFlyDirection = -1;
      } else if (next <= 0.0) {
        next = 0.0;
        this.autoFlyDirection = 1;
      }
      this.targetProgress = next;
      this.lastInputSource = 'auto-fly';
    }

    const damping = reducedMotion ? 14.0 : 6.2;
    const factor = 1.0 - Math.exp(-damping * clampedDt);

    this.currentProgress = THREE.MathUtils.lerp(
      this.currentProgress,
      this.targetProgress,
      factor
    );
    this.smoothedLookAngle.x = THREE.MathUtils.lerp(
      this.smoothedLookAngle.x,
      this.lookAngleOffset.x,
      factor
    );
    this.smoothedLookAngle.y = THREE.MathUtils.lerp(
      this.smoothedLookAngle.y,
      this.lookAngleOffset.y,
      factor
    );
  }
}
