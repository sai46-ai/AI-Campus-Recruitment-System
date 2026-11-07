import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import * as THREE from 'three';
import {
  INTERACTABLE_OBJECTS,
  VIEWPOINTS,
  VIEWPOINT_ORDER,
  WORLD_CONFIG,
} from './sceneConfig';
import { AnimationController } from './AnimationController';
import { CameraController } from './CameraController';
import { InteractionController } from './InteractionController';
import { NavigationController } from './NavigationController';
import { buildForestGeometry } from './forestGeometry';
import { buildMountainGeometry } from './mountainGeometry';
import { buildRiverGeometry } from './riverGeometry';
import { buildSkyGeometry } from './skyGeometry';
import { buildTerrainGeometry } from './terrainGeometry';
import { createMaterials } from './materials';
import { InteractableObjectSpec, ViewpointId } from './types';
import {
  ENVIRONMENT_REGISTRY,
  EnvironmentId,
  OriginalSceneInstance,
  resolveEnvironmentForRoute,
  createTalentNetworkCoreScene,
  createRecruitmentConnectivityGridScene,
  createResumeProfileStudioScene,
  createOpportunityHorizonScene,
} from './careerWorldScene';

interface AtmosphericBackgroundProps {
  className?: string;
  intensity?: number;
}

function isInteractiveDomElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      'button, a, input, select, textarea, label, [role="button"], [role="dialog"], [role="toolbar"], [data-interactive="true"]'
    )
  );
}

/**
 * Wraps the exact original Environment 01 (Digital River Valley) controllers and geometry
 * into the unified OriginalSceneInstance interface without modifying a single line of its
 * geometry, shaders, materials, or controllers.
 */
function createDigitalRiverValleyScene(
  width: number,
  height: number,
  reducedMotion: boolean,
  intensity = 1.0,
  onStateChange?: () => void
): OriginalSceneInstance {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0c262e');
  scene.fog = new THREE.FogExp2('#0f2f39', 0.0028);

  const ambientLight = new THREE.AmbientLight('#143e4b', 0.92);
  const sunLight = new THREE.DirectionalLight('#ffe4a0', 1.45);
  sunLight.position.set(...WORLD_CONFIG.sunPosition);
  const riverLight = new THREE.PointLight('#00f2fe', 1.6, 95, 1.5);
  riverLight.position.set(0, 4.5, 18);
  scene.add(ambientLight, sunLight, riverLight);

  const animCtrl = new AnimationController(1.0, intensity);
  animCtrl.setReducedMotion(reducedMotion);

  const camCtrl = new CameraController(width / Math.max(1, height));
  const interCtrl = new InteractionController(scene);

  const navCtrl = new NavigationController('immersive', () => {
    interCtrl.selectObjectById(null);
    camCtrl.setFocusedObject(null);
    animCtrl.setSelectedObject(null);
    onStateChange?.();
  });

  const materials = createMaterials(animCtrl.uniforms);
  const skyGeo = buildSkyGeometry(materials);
  const mountainGeo = buildMountainGeometry(materials);
  const terrainGeo = buildTerrainGeometry(materials);
  const riverGeo = buildRiverGeometry(materials);
  const forestGeo = buildForestGeometry(materials);

  scene.add(
    skyGeo.group,
    mountainGeo.group,
    terrainGeo.group,
    riverGeo.group,
    forestGeo.group
  );

  function selectById(id: string | null) {
    const spec = interCtrl.selectObjectById(id);
    animCtrl.setSelectedObject(spec);
    if (spec) {
      if (spec.category === 'river-checkpoint') {
        camCtrl.setFocusedObject(null);
        navCtrl.setTargetProgress(spec.riverProgress, 'object-focus', false);
      } else {
        navCtrl.isAutoFlying = false;
        navCtrl.lastInputSource = 'object-focus';
        camCtrl.setFocusedObject(spec);
      }
    } else {
      camCtrl.setFocusedObject(null);
    }
    onStateChange?.();
    return spec;
  }

  return {
    envId: 'env-01-digital-river-valley',
    scene,
    camera: camCtrl.camera,
    stepSimulation: (dt: number) => {
      const isRM = animCtrl.getReducedMotion();
      navCtrl.update(dt, isRM);
      interCtrl.update(dt, isRM);
      camCtrl.update(dt, navCtrl, isRM);
      animCtrl.update(dt, camCtrl.camera.position);
    },
    handleResize: (w: number, h: number) => {
      camCtrl.handleResize(w, h);
    },
    handleWheel: (e: WheelEvent, h: number) => {
      let pixelDelta = e.deltaY;
      if (e.deltaMode === 1) pixelDelta *= 36;
      else if (e.deltaMode === 2) pixelDelta *= h || 900;
      const sign = Math.sign(pixelDelta);
      const absPixels = Math.abs(pixelDelta);
      const step = sign * Math.min(0.14, Math.max(0.008, absPixels * 0.0014));
      navCtrl.setTargetProgress(navCtrl.targetProgress + step, 'wheel', true);
      onStateChange?.();
    },
    handlePointerDown: (e: PointerEvent) => {
      navCtrl.handlePointerDown(e, null);
    },
    handlePointerMove: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => {
      const dragged = navCtrl.handlePointerMove(e, w, h);
      if (dragged) {
        onStateChange?.();
        return;
      }
      if (isInteractiveDom) {
        if (interCtrl.getHoveredSpec()) {
          interCtrl.hoverObjectById(null);
          camCtrl.setHoveredObject(null);
          animCtrl.setHoveredObject(null);
          onStateChange?.();
        }
        return;
      }
      const nx = (e.clientX / Math.max(1, w)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, h)) * 2 - 1);
      const hitSpec = interCtrl.updatePointerRaycast(nx, ny, camCtrl.camera);
      camCtrl.setHoveredObject(hitSpec);
      animCtrl.setHoveredObject(hitSpec);
      onStateChange?.();
    },
    handlePointerUp: (e: PointerEvent, w: number, h: number, isInteractiveDom: boolean) => {
      const wasDrag = navCtrl.handlePointerUp(e, null);
      if (wasDrag || isInteractiveDom) return;
      const nx = (e.clientX / Math.max(1, w)) * 2 - 1;
      const ny = -((e.clientY / Math.max(1, h)) * 2 - 1);
      const hitSpec = interCtrl.updatePointerRaycast(nx, ny, camCtrl.camera);
      if (hitSpec) {
        const currentSelected = interCtrl.getSelectedSpec();
        selectById(currentSelected?.id === hitSpec.id ? null : hitSpec.id);
      }
    },
    handleKeyDown: (e: KeyboardEvent) => {
      navCtrl.handleKeyDown(e);
      onStateChange?.();
    },
    handleKeyUp: (e: KeyboardEvent) => {
      navCtrl.handleKeyUp(e);
    },
    getViewpoints: () =>
      VIEWPOINT_ORDER.map((id) => ({
        id,
        label: VIEWPOINTS[id].label,
        progress: VIEWPOINTS[id].progress,
        description: VIEWPOINTS[id].description,
      })),
    getActiveViewpointId: () => navCtrl.getActiveViewpointId(),
    goToViewpoint: (id: string) => {
      navCtrl.goToViewpoint(id as ViewpointId, false);
      onStateChange?.();
    },
    setProgress: (p: number) => {
      navCtrl.setTargetProgress(p, 'slider', true);
      onStateChange?.();
    },
    getProgress: () => navCtrl.currentProgress,
    hoverObject: (id: string | null) => {
      const spec = interCtrl.hoverObjectById(id);
      camCtrl.setHoveredObject(spec);
      animCtrl.setHoveredObject(spec);
      onStateChange?.();
      return spec;
    },
    selectObject: (id: string | null) => selectById(id),
    getHoveredObject: () => {
      const s = interCtrl.getHoveredSpec();
      return s
        ? {
            id: s.id,
            title: s.name,
            subtitle: s.structuralRole,
            categoryLabel: s.categoryLabel,
            route: s.route,
            accentColor: s.accentColor,
            summary: s.description,
          }
        : null;
    },
    getSelectedObject: () => {
      const s = interCtrl.getSelectedSpec();
      return s
        ? {
            id: s.id,
            title: s.name,
            subtitle: s.structuralRole,
            categoryLabel: s.categoryLabel,
            route: s.route,
            accentColor: s.accentColor,
            summary: s.description,
            position: s.position,
            heightOffset: 1.5,
          }
        : null;
    },
    getInteractiveObjects: () =>
      INTERACTABLE_OBJECTS.map((s) => ({
        id: s.id,
        title: s.name,
        subtitle: s.structuralRole,
        categoryLabel: s.categoryLabel,
        route: s.route,
        accentColor: s.accentColor,
        summary: s.description,
      })),
    getState: () => ({
      environmentId: 'env-01-digital-river-valley',
      environmentName: 'Digital River Valley',
      cameraPos: [
        Number(camCtrl.camera.position.x.toFixed(3)),
        Number(camCtrl.camera.position.y.toFixed(3)),
        Number(camCtrl.camera.position.z.toFixed(3)),
      ],
      cameraTarget: [
        Number(camCtrl.currentTarget.x.toFixed(3)),
        Number(camCtrl.currentTarget.y.toFixed(3)),
        Number(camCtrl.currentTarget.z.toFixed(3)),
      ],
      fov: Number(camCtrl.camera.fov.toFixed(2)),
      currentProgress: Number(navCtrl.currentProgress.toFixed(4)),
      targetProgress: Number(navCtrl.targetProgress.toFixed(4)),
      activeViewpoint: navCtrl.getActiveViewpointId(),
      lastInputSource: navCtrl.lastInputSource,
      hoveredObjectId: interCtrl.getHoveredSpec()?.id || null,
      selectedObjectId: interCtrl.getSelectedSpec()?.id || null,
      selectedObjectState: interCtrl.getSelectedState(),
      cameraTransitionState: camCtrl.getTransitionState(navCtrl),
      activeAnimationState: animCtrl.getActiveAnimationState(),
      uTime: Number(animCtrl.uniforms.uTime.value.toFixed(3)),
      uPulseTime: Number(animCtrl.uniforms.uPulseTime.value.toFixed(3)),
      uRiverHoverBoost: Number(animCtrl.uniforms.uRiverHoverBoost.value.toFixed(3)),
      interactableCount: INTERACTABLE_OBJECTS.length,
    }),
    dispose: () => {
      interCtrl.dispose();
      skyGeo.dispose();
      mountainGeo.dispose();
      terrainGeo.dispose();
      riverGeo.dispose();
      forestGeo.dispose();
      materials.dispose();
    },
  };
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({
  className = '',
  intensity = 1.0,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const location = useLocation();

  const activeEnvId: EnvironmentId = resolveEnvironmentForRoute(location.pathname);
  const envMeta = ENVIRONMENT_REGISTRY[activeEnvId];

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const activeInstanceRef = useRef<OriginalSceneInstance | null>(null);
  const selectedItemRef = useRef<any | null>(null);

  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [hoveredItem, setHoveredItem] = useState<any | null>(null);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [viewpoints, setViewpoints] = useState<Array<{ id: string; label: string; progress: number; description: string }>>([]);
  const [activeVpId, setActiveVpId] = useState<string>('');
  const [progressPct, setProgressPct] = useState<number>(0);

  useEffect(() => {
    selectedItemRef.current = selectedItem;
  }, [selectedItem]);

  const syncUiFromScene = useCallback(() => {
    const inst = activeInstanceRef.current;
    if (!inst) return;
    setHoveredItem(inst.getHoveredObject());
    setSelectedItem(inst.getSelectedObject());
    setViewpoints(inst.getViewpoints());
    setActiveVpId(inst.getActiveViewpointId());
    setProgressPct(Math.round(inst.getProgress() * 100));
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer = rendererRef.current;
    if (!renderer) {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          preserveDrawingBuffer: true,
        });
        rendererRef.current = renderer;
      } catch (err) {
        console.warn('WebGL initialization fallback:', err);
        setWebGlSupported(false);
        return;
      }
    }

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 720;
    const isMobile = width < 768;
    const maxDpr = isMobile ? 1.35 : WORLD_CONFIG.maxPixelRatio;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;

    // Instantiate the exact original 3D scene for the current route's EnvironmentId
    let sceneInstance: OriginalSceneInstance;
    if (activeEnvId === 'env-02-talent-network-core') {
      sceneInstance = createTalentNetworkCoreScene(width, height, prefersReducedMotion, syncUiFromScene);
    } else if (activeEnvId === 'env-03-recruitment-connectivity-grid') {
      sceneInstance = createRecruitmentConnectivityGridScene(width, height, prefersReducedMotion, syncUiFromScene);
    } else if (activeEnvId === 'env-04-resume-profile-studio') {
      sceneInstance = createResumeProfileStudioScene(width, height, prefersReducedMotion, syncUiFromScene);
    } else if (activeEnvId === 'env-05-opportunity-horizon') {
      sceneInstance = createOpportunityHorizonScene(width, height, prefersReducedMotion, intensity, syncUiFromScene);
    } else {
      sceneInstance = createDigitalRiverValleyScene(width, height, prefersReducedMotion, intensity, syncUiFromScene);
    }

    activeInstanceRef.current = sceneInstance;
    syncUiFromScene();

    const onWheel = (e: WheelEvent) => {
      if (isInteractiveDomElement(e.target)) return;
      sceneInstance.handleWheel(e, container.clientHeight || 900);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (isInteractiveDomElement(e.target)) return;
      sceneInstance.handlePointerDown(e);
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      sceneInstance.handlePointerMove(e, w, h, isInteractiveDomElement(e.target));
    };

    const onPointerUp = (e: PointerEvent) => {
      const w = container.clientWidth || window.innerWidth || 1280;
      const h = container.clientHeight || window.innerHeight || 720;
      sceneInstance.handlePointerUp(e, w, h, isInteractiveDomElement(e.target));
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        activeInstanceRef.current?.selectObject(null);
        syncUiFromScene();
        return;
      }
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
      sceneInstance.handleKeyDown(e);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      sceneInstance.handleKeyUp(e);
    };

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: cw, height: ch } = entry.contentRect;
        if (cw > 0 && ch > 0 && renderer) {
          renderer.setSize(cw, ch, false);
          sceneInstance.handleResize(cw, ch);
        }
      }
    });
    resizeObserver.observe(container);

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    (window as any).__CAMPUS_3D_WORLD__ = {
      getState: () => ({
        ...sceneInstance.getState(),
        renderCalls: renderer?.info.render.calls || 0,
        triangles: renderer?.info.render.triangles || 0,
      }),
      getViewpoints: () => sceneInstance.getViewpoints(),
      getInteractiveObjects: () => sceneInstance.getInteractiveObjects(),
      hoverObject: (id: string | null) => sceneInstance.hoverObject(id),
      selectObject: (id: string | null) => sceneInstance.selectObject(id),
      goToViewpoint: (id: string) => sceneInstance.goToViewpoint(id),
      setProgress: (p: number) => sceneInstance.setProgress(p),
      stepFrames: (count = 25, dt = 0.04) => {
        const n = Math.max(1, count);
        for (let i = 0; i < n; i++) {
          sceneInstance.stepSimulation(dt);
        }
        if (renderer) {
          renderer.render(sceneInstance.scene, sceneInstance.camera);
        }
        syncUiFromScene();
        return (window as any).__CAMPUS_3D_WORLD__.getState();
      },
    };

    let rafId = 0;
    let lastTime = performance.now();
    let frameCounter = 0;

    sceneInstance.stepSimulation(0.016);
    renderer.render(sceneInstance.scene, sceneInstance.camera);

    const animate = (now: number) => {
      rafId = requestAnimationFrame(animate);
      if (document.hidden || !renderer) return;
      const dt = Math.max(0.001, Math.min((now - lastTime) * 0.001, 0.1));
      lastTime = now;

      sceneInstance.stepSimulation(dt);
      renderer.render(sceneInstance.scene, sceneInstance.camera);

      frameCounter++;
      if (frameCounter % 6 === 0) {
        syncUiFromScene();
      }
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      sceneInstance.dispose();
      sceneInstance.scene.clear();
    };
  }, [activeEnvId, intensity, syncUiFromScene]);

  return (
    <>
      {/* Fixed 3D WebGL Environment Layer — zero dark blocking overlays so the 3D scene shines clearly */}
      <div
        ref={mountRef}
        aria-hidden="true"
        className={`fixed inset-0 z-0 overflow-hidden select-none ${className}`}
        style={{ backgroundColor: envMeta.backgroundColor }}
      >
        <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

        {!webGlSupported && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.22),rgba(255,255,255,0))]" />
        )}
      </div>
    </>
  );
};

export default AtmosphericBackground;
