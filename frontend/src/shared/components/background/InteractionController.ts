import * as THREE from 'three';
import { evaluateRiverChannel, INTERACTABLE_OBJECTS } from './sceneConfig';
import {
  InteractableObjectSpec,
  InteractableRuntimeObject,
  ObjectInteractionState,
} from './types';

export interface ProjectedLabelItem {
  spec: InteractableObjectSpec;
  state: ObjectInteractionState;
  screenX: number;
  screenY: number;
  visible: boolean;
}

/**
 * InteractionController
 * Builds and animates the 12 multi-part 3D interactive assemblies:
 *  A. Circuit Terminals: socket + rising central piston + expanding/rotating outer ring + sequential trace lines
 *  B. Digital Trees: rooted circular platform + expanding base ring + swaying layered conifer canopy + cluster response
 *  C. Network Nodes: stepped PCB pedestal + scaling/rotating octahedral core + illuminated feeder conduits
 *  D. River Checkpoints: submerged optical gate + flanking channel markers + shader ripple activation
 */
export class InteractionController {
  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNDC = new THREE.Vector2();
  public readonly rootGroup = new THREE.Group();
  private readonly colliderList: THREE.Mesh[] = [];
  private readonly colliderToRuntime = new Map<THREE.Object3D, InteractableRuntimeObject>();
  private readonly runtimeById = new Map<string, InteractableRuntimeObject>();

  private hoveredRuntime: InteractableRuntimeObject | null = null;
  private selectedRuntime: InteractableRuntimeObject | null = null;
  private elapsedTime = 0.0;

  private readonly geometriesToDispose: THREE.BufferGeometry[] = [];
  private readonly materialsToDispose: THREE.Material[] = [];

  constructor(scene: THREE.Scene) {
    this.rootGroup.name = 'InteractableObjectsRegistryGroup';
    this.buildAllInteractableObjects();
    scene.add(this.rootGroup);
  }

  private buildAllInteractableObjects(): void {
    const colliderSphereGeo = new THREE.SphereGeometry(1.0, 12, 10);
    const socketGeo = new THREE.CylinderGeometry(1.15, 1.35, 0.35, 16);
    const pistonGeo = new THREE.CylinderGeometry(0.52, 0.58, 1.1, 12);
    const outerRingGeo = new THREE.RingGeometry(1.15, 1.55, 24);
    outerRingGeo.rotateX(-Math.PI / 2);

    const treePlatformGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.32, 20);
    const treeRingGeo = new THREE.RingGeometry(1.9, 2.45, 24);
    treeRingGeo.rotateX(-Math.PI / 2);
    const treeCone1 = new THREE.ConeGeometry(1.65, 8.2, 12);
    const treeCone2 = new THREE.ConeGeometry(1.25, 7.2, 12);
    const treeCone3 = new THREE.ConeGeometry(0.85, 5.8, 12);

    const nodePedestalGeo = new THREE.CylinderGeometry(1.1, 1.4, 0.45, 8);
    const nodeCoreGeo = new THREE.ConeGeometry(0.95, 2.2, 6);
    const nodeRingGeo = new THREE.RingGeometry(1.2, 1.6, 16);
    nodeRingGeo.rotateX(-Math.PI / 2);

    const riverGateRingGeo = new THREE.RingGeometry(1.4, 1.9, 24);
    riverGateRingGeo.rotateX(-Math.PI / 2);
    const riverPylonGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.2, 10);

    this.geometriesToDispose.push(
      colliderSphereGeo,
      socketGeo,
      pistonGeo,
      outerRingGeo,
      treePlatformGeo,
      treeRingGeo,
      treeCone1,
      treeCone2,
      treeCone3,
      nodePedestalGeo,
      nodeCoreGeo,
      nodeRingGeo,
      riverGateRingGeo,
      riverPylonGeo
    );

    const invisibleColliderMat = new THREE.MeshBasicMaterial({ visible: false });
    this.materialsToDispose.push(invisibleColliderMat);

    for (const spec of INTERACTABLE_OBJECTS) {
      const objGroup = new THREE.Group();
      objGroup.name = `interactable-${spec.id}`;
      objGroup.position.set(...spec.position);
      this.rootGroup.add(objGroup);

      const colliderMesh = new THREE.Mesh(colliderSphereGeo, invisibleColliderMat);
      colliderMesh.position.set(0, spec.category === 'digital-tree' ? 4.5 : 0.6, 0);
      colliderMesh.scale.setScalar(spec.hitRadius);
      objGroup.add(colliderMesh);
      this.colliderList.push(colliderMesh);

      const runtime: InteractableRuntimeObject = {
        spec,
        state: 'IDLE',
        hoverAmount: 0,
        selectAmount: 0,
        rotationAngle: 0,
        swayPhase: Math.random() * Math.PI * 2,
        rootGroup: objGroup,
        colliderMesh,
        connectedTraceMeshes: [],
        baseMaterials: [],
        baseY: spec.position[1],
      };

      if (spec.category === 'circuit-terminal') {
        this.populateCircuitTerminal(runtime, socketGeo, pistonGeo, outerRingGeo);
      } else if (spec.category === 'digital-tree') {
        this.populateDigitalTree(runtime, treePlatformGeo, treeRingGeo, treeCone1, treeCone2, treeCone3);
      } else if (spec.category === 'network-node') {
        this.populateNetworkNode(runtime, nodePedestalGeo, nodeCoreGeo, nodeRingGeo);
      } else if (spec.category === 'river-checkpoint') {
        this.populateRiverCheckpoint(runtime, riverGateRingGeo, riverPylonGeo);
      }

      this.colliderToRuntime.set(colliderMesh, runtime);
      this.runtimeById.set(spec.id, runtime);
    }
  }

  private populateCircuitTerminal(
    runtime: InteractableRuntimeObject,
    socketGeo: THREE.BufferGeometry,
    pistonGeo: THREE.BufferGeometry,
    outerRingGeo: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;

    const socketMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#182428'),
      emissive: new THREE.Color('#0c2832'),
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.7,
    });
    const pistonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentColor),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.5,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.materialsToDispose.push(socketMat, pistonMat, ringMat);
    runtime.baseMaterials.push(pistonMat, ringMat);

    const socketMesh = new THREE.Mesh(socketGeo, socketMat);
    socketMesh.position.set(0, 0.15, 0);
    rootGroup.add(socketMesh);

    const pistonMesh = new THREE.Mesh(pistonGeo, pistonMat);
    pistonMesh.position.set(0, 0.45, 0);
    rootGroup.add(pistonMesh);
    runtime.movingPart = pistonMesh;

    const ringMesh = new THREE.Mesh(outerRingGeo, ringMat);
    ringMesh.position.set(0, 0.36, 0);
    rootGroup.add(ringMesh);
    runtime.ringPart = ringMesh;

    this.buildConnectedTraces(runtime, 4, 5.5);
  }

  private populateDigitalTree(
    runtime: InteractableRuntimeObject,
    platformGeo: THREE.BufferGeometry,
    ringGeo: THREE.BufferGeometry,
    cone1: THREE.BufferGeometry,
    cone2: THREE.BufferGeometry,
    cone3: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;

    const platformMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#102624'),
      emissive: new THREE.Color('#09382a'),
      emissiveIntensity: 0.5,
      roughness: 0.5,
      metalness: 0.6,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#042217'),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.45,
      roughness: 0.5,
      metalness: 0.3,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.materialsToDispose.push(platformMat, canopyMat, ringMat);
    runtime.baseMaterials.push(canopyMat, ringMat);

    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.set(0, 0.16, 0);
    rootGroup.add(platformMesh);

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.35, 0);
    rootGroup.add(ringMesh);
    runtime.ringPart = ringMesh;

    const swayPivot = new THREE.Group();
    swayPivot.position.set(0, 0.3, 0);
    rootGroup.add(swayPivot);

    const tier1 = new THREE.Mesh(cone1, canopyMat);
    tier1.position.set(0, 4.2, 0);
    const tier2 = new THREE.Mesh(cone2, canopyMat);
    tier2.position.set(0, 7.6, 0);
    const tier3 = new THREE.Mesh(cone3, canopyMat);
    tier3.position.set(0, 10.6, 0);
    swayPivot.add(tier1, tier2, tier3);

    runtime.movingPart = swayPivot;
    this.buildConnectedTraces(runtime, 3, 6.5);
  }

  private populateNetworkNode(
    runtime: InteractableRuntimeObject,
    pedestalGeo: THREE.BufferGeometry,
    coreGeo: THREE.BufferGeometry,
    ringGeo: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;

    const pedMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a2426'),
      emissive: new THREE.Color('#0c2228'),
      emissiveIntensity: 0.4,
      roughness: 0.4,
      metalness: 0.7,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentColor),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.6,
    });
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });

    this.materialsToDispose.push(pedMat, coreMat, ringMat);
    runtime.baseMaterials.push(coreMat, ringMat);

    const pedMesh = new THREE.Mesh(pedestalGeo, pedMat);
    pedMesh.position.set(0, 0.22, 0);
    rootGroup.add(pedMesh);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 1.35, 0);
    const upperCone = new THREE.Mesh(coreGeo, coreMat);
    upperCone.position.set(0, 0.55, 0);
    const lowerCone = new THREE.Mesh(coreGeo, coreMat);
    lowerCone.position.set(0, -0.55, 0);
    lowerCone.scale.set(1, -0.65, 1);
    coreGroup.add(upperCone, lowerCone);
    rootGroup.add(coreGroup);
    runtime.movingPart = coreGroup;

    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(0, 0.5, 0);
    rootGroup.add(ringMesh);
    runtime.ringPart = ringMesh;

    this.buildConnectedTraces(runtime, 4, 7.0);
  }

  private populateRiverCheckpoint(
    runtime: InteractableRuntimeObject,
    gateRingGeo: THREE.BufferGeometry,
    pylonGeo: THREE.BufferGeometry
  ): void {
    const { spec, rootGroup } = runtime;
    const { halfWidth } = evaluateRiverChannel(spec.position[2]);

    const gateMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(spec.accentColor),
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const pylonMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(spec.accentColor),
      emissive: new THREE.Color(spec.accentColor),
      emissiveIntensity: 0.55,
      roughness: 0.3,
      metalness: 0.6,
    });

    this.materialsToDispose.push(gateMat, pylonMat);
    runtime.baseMaterials.push(pylonMat, gateMat);

    const gateRing = new THREE.Mesh(gateRingGeo, gateMat);
    gateRing.position.set(0, 0.45, 0);
    rootGroup.add(gateRing);
    runtime.ringPart = gateRing;

    const pylonGroup = new THREE.Group();
    const leftPylon = new THREE.Mesh(pylonGeo, pylonMat);
    leftPylon.position.set(-Math.min(4.5, halfWidth * 0.45), 0.6, 0);
    const rightPylon = new THREE.Mesh(pylonGeo, pylonMat);
    rightPylon.position.set(Math.min(4.5, halfWidth * 0.45), 0.6, 0);
    pylonGroup.add(leftPylon, rightPylon);
    rootGroup.add(pylonGroup);
    runtime.movingPart = pylonGroup;
  }

  private buildConnectedTraces(
    runtime: InteractableRuntimeObject,
    branchCount: number,
    length: number
  ): void {
    const { spec, rootGroup } = runtime;
    for (let b = 0; b < branchCount; b++) {
      const angle = (b / branchCount) * Math.PI * 2 + 0.4;
      const segs = 3;
      for (let s = 0; s < segs; s++) {
        const r0 = 1.4 + (s / segs) * length;
        const r1 = 1.4 + ((s + 1) / segs) * length;
        const p0 = new THREE.Vector3(Math.cos(angle) * r0, 0.12, Math.sin(angle) * r0);
        const p1 = new THREE.Vector3(
          Math.cos(angle + (s % 2 === 0 ? 0.25 : -0.2)) * r1,
          0.12,
          Math.sin(angle + (s % 2 === 0 ? 0.25 : -0.2)) * r1
        );
        const curve = new THREE.CatmullRomCurve3([p0, p1]);
        const tubeGeo = new THREE.TubeGeometry(curve, 6, 0.06, 5, false);
        const traceMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(spec.accentColor),
          transparent: true,
          opacity: 0.28,
          blending: THREE.AdditiveBlending,
        });
        this.geometriesToDispose.push(tubeGeo);
        this.materialsToDispose.push(traceMat);

        const traceMesh = new THREE.Mesh(tubeGeo, traceMat);
        traceMesh.userData.segmentIndex = s;
        rootGroup.add(traceMesh);
        runtime.connectedTraceMeshes.push(traceMesh);
      }
    }
  }

  public updatePointerRaycast(
    ndcX: number,
    ndcY: number,
    camera: THREE.Camera
  ): InteractableObjectSpec | null {
    this.pointerNDC.set(ndcX, ndcY);
    this.raycaster.setFromCamera(this.pointerNDC, camera);

    const hits = this.raycaster.intersectObjects(this.colliderList, false);
    let hitRuntime: InteractableRuntimeObject | null = null;
    if (hits.length > 0) {
      hitRuntime = this.colliderToRuntime.get(hits[0].object) || null;
    }

    if (this.hoveredRuntime !== hitRuntime) {
      if (this.hoveredRuntime && this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'EXITING';
      }
      this.hoveredRuntime = hitRuntime;
      if (this.hoveredRuntime && this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'HOVER';
      }
    }

    return this.hoveredRuntime ? this.hoveredRuntime.spec : null;
  }

  public selectObjectById(id: string | null): InteractableObjectSpec | null {
    if (this.selectedRuntime && this.selectedRuntime.spec.id !== id) {
      this.selectedRuntime.state = 'EXITING';
    }
    if (!id) {
      this.selectedRuntime = null;
      return null;
    }
    const found = this.runtimeById.get(id) || null;
    this.selectedRuntime = found;
    if (found) {
      found.state = 'FOCUSED';
    }
    return found ? found.spec : null;
  }

  public hoverObjectById(id: string | null): InteractableObjectSpec | null {
    if (this.hoveredRuntime && this.hoveredRuntime.spec.id !== id) {
      if (this.hoveredRuntime !== this.selectedRuntime) {
        this.hoveredRuntime.state = 'EXITING';
      }
    }
    if (!id) {
      this.hoveredRuntime = null;
      return null;
    }
    const found = this.runtimeById.get(id) || null;
    this.hoveredRuntime = found;
    if (found && found !== this.selectedRuntime) {
      found.state = 'HOVER';
    }
    return found ? found.spec : null;
  }

  public getHoveredSpec(): InteractableObjectSpec | null {
    return this.hoveredRuntime ? this.hoveredRuntime.spec : null;
  }

  public getSelectedSpec(): InteractableObjectSpec | null {
    return this.selectedRuntime ? this.selectedRuntime.spec : null;
  }

  public getSelectedState(): ObjectInteractionState {
    if (this.selectedRuntime) return this.selectedRuntime.state;
    if (this.hoveredRuntime) return this.hoveredRuntime.state;
    return 'IDLE';
  }

  public getObjectTransformSnapshot(id: string): {
    state: ObjectInteractionState;
    movingPartY: number;
    movingPartScale: number;
    movingPartRotZ: number;
    ringScale: number;
    ringRotY: number;
    emissiveIntensity: number;
  } | null {
    const rt = this.runtimeById.get(id);
    if (!rt) return null;
    const stdMat = rt.baseMaterials[0] as THREE.MeshStandardMaterial | undefined;
    return {
      state: rt.state,
      movingPartY: rt.movingPart ? rt.movingPart.position.y : 0,
      movingPartScale: rt.movingPart ? rt.movingPart.scale.x : 1,
      movingPartRotZ: rt.movingPart ? rt.movingPart.rotation.z : 0,
      ringScale: rt.ringPart ? rt.ringPart.scale.x : 1,
      ringRotY: rt.ringPart ? rt.ringPart.rotation.y : 0,
      emissiveIntensity: stdMat && stdMat.emissiveIntensity !== undefined ? stdMat.emissiveIntensity : 1,
    };
  }

  public update(dt: number, reducedMotion = false): void {
    const clampedDt = Math.max(0.0, Math.min(dt, 0.1));
    this.elapsedTime += clampedDt;
    const rate = 1.0 - Math.exp(-(reducedMotion ? 10.0 : 7.5) * clampedDt);

    for (const rt of this.runtimeById.values()) {
      const isHovered = this.hoveredRuntime === rt;
      const isSelected = this.selectedRuntime === rt;

      const targetHover = isHovered || isSelected ? 1.0 : 0.0;
      const targetSelect = isSelected ? 1.0 : 0.0;

      rt.hoverAmount = THREE.MathUtils.lerp(rt.hoverAmount, targetHover, rate);
      rt.selectAmount = THREE.MathUtils.lerp(rt.selectAmount, targetSelect, rate);

      if (!isHovered && !isSelected) {
        if (rt.hoverAmount < 0.02 && rt.selectAmount < 0.02) {
          rt.state = 'IDLE';
          rt.hoverAmount = 0;
          rt.selectAmount = 0;
        } else {
          rt.state = 'EXITING';
        }
      }

      if (rt.spec.category === 'circuit-terminal') {
        if (rt.movingPart) {
          rt.movingPart.position.y = 0.45 + rt.hoverAmount * 0.55 + rt.selectAmount * 0.8;
        }
        if (rt.ringPart) {
          const ringScale = 1.0 + rt.hoverAmount * 0.32 + rt.selectAmount * 0.28;
          rt.ringPart.scale.set(ringScale, ringScale, ringScale);
          if (rt.selectAmount > 0.05) {
            rt.rotationAngle += clampedDt * 2.4 * rt.selectAmount;
          }
          rt.ringPart.rotation.y = rt.rotationAngle;
        }
      } else if (rt.spec.category === 'digital-tree') {
        if (rt.movingPart) {
          const swayAmp = (rt.hoverAmount * 0.065 + rt.selectAmount * 0.045) * (reducedMotion ? 0.35 : 1.0);
          rt.movingPart.rotation.z = Math.sin(this.elapsedTime * 2.8 + rt.swayPhase) * swayAmp;
          rt.movingPart.rotation.x = Math.cos(this.elapsedTime * 2.1 + rt.swayPhase) * swayAmp * 0.7;
          const liftScale = 1.0 + rt.hoverAmount * 0.06 + rt.selectAmount * 0.08;
          rt.movingPart.scale.set(liftScale, liftScale, liftScale);
        }
        if (rt.ringPart) {
          const rScale = 1.0 + rt.hoverAmount * 0.38 + rt.selectAmount * 0.32;
          rt.ringPart.scale.set(rScale, rScale, rScale);
        }
      } else if (rt.spec.category === 'network-node') {
        if (rt.movingPart) {
          const nScale = 1.0 + rt.hoverAmount * 0.25 + rt.selectAmount * 0.25;
          rt.movingPart.scale.set(nScale, nScale, nScale);
          rt.movingPart.position.y = 1.35 + rt.hoverAmount * 0.35 + rt.selectAmount * 0.45;
          rt.rotationAngle += clampedDt * (0.6 + rt.hoverAmount * 1.4 + rt.selectAmount * 2.0);
          rt.movingPart.rotation.y = rt.rotationAngle;
        }
        if (rt.ringPart) {
          const rScale = 1.0 + rt.hoverAmount * 0.3 + rt.selectAmount * 0.35;
          rt.ringPart.scale.set(rScale, rScale, rScale);
        }
      } else if (rt.spec.category === 'river-checkpoint') {
        if (rt.movingPart) {
          rt.movingPart.position.y = rt.hoverAmount * 0.4 + rt.selectAmount * 0.6;
          const pScale = 1.0 + rt.hoverAmount * 0.18 + rt.selectAmount * 0.22;
          rt.movingPart.scale.set(pScale, pScale, pScale);
        }
        if (rt.ringPart) {
          const gScale = 1.0 + rt.hoverAmount * 0.35 + rt.selectAmount * 0.4;
          rt.ringPart.scale.set(gScale, gScale, gScale);
        }
      }

      const stdMat = rt.baseMaterials[0] as THREE.MeshStandardMaterial | undefined;
      if (stdMat && stdMat.emissiveIntensity !== undefined) {
        stdMat.emissiveIntensity = 0.5 + rt.hoverAmount * 0.85 + rt.selectAmount * 1.15;
      }

      for (let i = 0; i < rt.connectedTraceMeshes.length; i++) {
        const traceMesh = rt.connectedTraceMeshes[i];
        const segIdx = traceMesh.userData.segmentIndex || 0;
        const mat = traceMesh.material as THREE.MeshBasicMaterial;
        const wave = 0.5 + 0.5 * Math.sin(this.elapsedTime * 5.0 - segIdx * 1.1);
        mat.opacity = 0.22 + rt.hoverAmount * 0.35 + rt.selectAmount * (0.42 * wave);
      }
    }
  }

  public projectLabelsToScreen(
    camera: THREE.Camera,
    width: number,
    height: number
  ): ProjectedLabelItem[] {
    const out: ProjectedLabelItem[] = [];
    const temp = new THREE.Vector3();

    for (const rt of this.runtimeById.values()) {
      temp.set(
        rt.spec.position[0],
        rt.spec.position[1] + (rt.spec.category === 'digital-tree' ? 6.5 : 1.8),
        rt.spec.position[2]
      );
      temp.project(camera);

      const visible =
        temp.z >= -1.0 &&
        temp.z <= 1.0 &&
        Math.abs(temp.x) <= 0.94 &&
        Math.abs(temp.y) <= 0.9;
      out.push({
        spec: rt.spec,
        state: rt.state,
        screenX: (temp.x * 0.5 + 0.5) * width,
        screenY: (-temp.y * 0.5 + 0.5) * height,
        visible,
      });
    }
    return out;
  }

  public dispose(): void {
    for (const g of this.geometriesToDispose) g.dispose();
    for (const m of this.materialsToDispose) m.dispose();
    this.colliderToRuntime.clear();
    this.runtimeById.clear();
  }
}
