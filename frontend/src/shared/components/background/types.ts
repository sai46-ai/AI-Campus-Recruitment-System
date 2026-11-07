import * as THREE from 'three';

export type ViewpointId =
  | 'establishing'
  | 'river-delta'
  | 'west-grove'
  | 'east-grove'
  | 'mid-canyon'
  | 'solar-horizon';

export type NavigationInputMode = 'immersive' | 'website-scroll';

export type LastInputSource =
  | 'initial'
  | 'wheel'
  | 'drag'
  | 'touch'
  | 'keyboard'
  | 'button-forward'
  | 'button-back'
  | 'slider'
  | 'viewpoint-preset'
  | 'auto-fly'
  | 'object-focus'
  | 'reset'
  | 'window-scroll';

export type ObjectInteractionState =
  | 'IDLE'
  | 'HOVER'
  | 'SELECTED'
  | 'FOCUSED'
  | 'EXITING';

export type InteractableCategory =
  | 'circuit-terminal'
  | 'digital-tree'
  | 'network-node'
  | 'river-checkpoint';

export interface ViewpointConfig {
  id: ViewpointId;
  label: string;
  progress: number;
  position: [number, number, number];
  lookAt: [number, number, number];
  fov: number;
  description: string;
}

export interface InteractableObjectSpec {
  id: string;
  name: string;
  category: InteractableCategory;
  categoryLabel: string;
  position: [number, number, number];
  focusCameraPos: [number, number, number];
  focusLookAt: [number, number, number];
  riverProgress: number;
  hitRadius: number;
  accentColor: string;
  route: string;
  actionLabel: string;
  structuralRole: string;
  description: string;
}

export interface InteractableRuntimeObject {
  spec: InteractableObjectSpec;
  state: ObjectInteractionState;
  hoverAmount: number;
  selectAmount: number;
  rotationAngle: number;
  swayPhase: number;
  rootGroup: THREE.Group;
  colliderMesh: THREE.Mesh;
  movingPart?: THREE.Object3D;
  ringPart?: THREE.Object3D;
  secondaryPart?: THREE.Object3D;
  connectedTraceMeshes: THREE.Mesh[];
  baseMaterials: THREE.Material[];
  baseY: number;
}

export interface SceneUniforms {
  uTime: { value: number };
  uIntensity: { value: number };
  uPulseOrigin: { value: THREE.Vector3 };
  uPulseTime: { value: number };
  uPulseColor: { value: THREE.Color };
  uHoveredPos: { value: THREE.Vector3 };
  uSelectedPos: { value: THREE.Vector3 };
  uRiverHoverZ: { value: number };
  uRiverHoverBoost: { value: number };
  uSunPosition: { value: THREE.Vector3 };
  uCameraPos: { value: THREE.Vector3 };
}
