/**
 * Scene3DManager.js
 * Advanced 3D Scene Manager with scroll-driven animations, orbiting objects,
 * and interactive spatial experiences using Three.js
 * 
 * Features:
 * - Scroll-synced camera movement through 3D space
 * - Multiple orbiting 3D geometries with continuous motion
 * - Mouse-reactive lighting and object interactions
 * - Performance-optimized particle systems
 * - Depth-based fog and atmospheric effects
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

// Configuration for 3D scene
const SCENE_CONFIG = {
  camera: {
    fov: 60,
    near: 0.1,
    far: 2000,
    initialZ: 100
  },
  particles: {
    count: 2000,
    spread: 400,
    size: 1.5
  },
  objects: {
    count: 15,
    orbitRadius: { min: 30, max: 80 },
    orbitSpeed: { min: 0.001, max: 0.005 }
  },
  colors: {
    primary: 0x4dd0e1,
    secondary: 0x7c4dff,
    accent: 0x00e676,
    warning: 0xffab00
  }
};

const Scene3DManager = ({ 
  scrollIntensity = 1, 
  enableScrollSync = true,
  enableMouseInteraction = true,
  theme = 'default'
}) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const objectsRef = useRef([]);
  const particlesRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const scrollRef = useRef({ current: 0, target: 0, velocity: 0 });
  const frameRef = useRef(0);
  const clockRef = useRef(new THREE.Clock());

  // Create materials with proper disposal tracking
  const createMaterials = useCallback(() => {
    const materials = {
      primary: new THREE.MeshPhysicalMaterial({
        color: SCENE_CONFIG.colors.primary,
        metalness: 0.3,
        roughness: 0.4,
        transparent: true,
        opacity: 0.8,
        envMapIntensity: 1
      }),
      secondary: new THREE.MeshPhysicalMaterial({
        color: SCENE_CONFIG.colors.secondary,
        metalness: 0.5,
        roughness: 0.3,
        transparent: true,
        opacity: 0.7
      }),
      wireframe: new THREE.MeshBasicMaterial({
        color: SCENE_CONFIG.colors.primary,
        wireframe: true,
        transparent: true,
        opacity: 0.3
      }),
      glass: new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        thickness: 0.5,
        transparent: true,
        opacity: 0.3
      })
    };
    return materials;
  }, []);

  // Create orbiting 3D objects with varied geometries
  const createOrbitingObjects = useCallback((scene, materials) => {
    const objects = [];
    const geometries = [
      new THREE.IcosahedronGeometry(4, 0),
      new THREE.OctahedronGeometry(5, 0),
      new THREE.TetrahedronGeometry(4, 0),
      new THREE.DodecahedronGeometry(3, 0),
      new THREE.TorusGeometry(3, 1, 16, 32),
      new THREE.TorusKnotGeometry(2.5, 0.8, 64, 16),
      new THREE.BoxGeometry(4, 4, 4),
      new THREE.ConeGeometry(3, 5, 6)
    ];

    for (let i = 0; i < SCENE_CONFIG.objects.count; i++) {
      const geometry = geometries[i % geometries.length];
      const materialType = i % 3 === 0 ? 'primary' : i % 3 === 1 ? 'secondary' : 'wireframe';
      const material = materials[materialType].clone();
      
      const mesh = new THREE.Mesh(geometry, material);
      
      // Create orbit parameters
      const orbitRadius = THREE.MathUtils.randFloat(
        SCENE_CONFIG.objects.orbitRadius.min,
        SCENE_CONFIG.objects.orbitRadius.max
      );
      const orbitSpeed = THREE.MathUtils.randFloat(
        SCENE_CONFIG.objects.orbitSpeed.min,
        SCENE_CONFIG.objects.orbitSpeed.max
      );
      const orbitOffset = Math.random() * Math.PI * 2;
      const orbitTilt = THREE.MathUtils.randFloat(-0.5, 0.5);
      const verticalOffset = THREE.MathUtils.randFloat(-50, 50);
      
      // Store orbit data
      mesh.userData = {
        orbitRadius,
        orbitSpeed: orbitSpeed * (Math.random() > 0.5 ? 1 : -1),
        orbitOffset,
        orbitTilt,
        verticalOffset,
        rotationSpeed: {
          x: THREE.MathUtils.randFloat(0.002, 0.01),
          y: THREE.MathUtils.randFloat(0.002, 0.01),
          z: THREE.MathUtils.randFloat(0.001, 0.005)
        },
        floatAmplitude: THREE.MathUtils.randFloat(2, 8),
        floatSpeed: THREE.MathUtils.randFloat(0.5, 2),
        phase: Math.random() * Math.PI * 2,
        originalScale: mesh.scale.clone(),
        hoverScale: 1.3
      };

      // Initial position
      const angle = orbitOffset;
      mesh.position.x = Math.cos(angle) * orbitRadius;
      mesh.position.z = Math.sin(angle) * orbitRadius + verticalOffset * orbitTilt;
      mesh.position.y = verticalOffset;

      scene.add(mesh);
      objects.push(mesh);

      // Add wireframe overlay for some objects
      if (i % 4 === 0) {
        const wireGeom = geometry.clone();
        const wireMesh = new THREE.Mesh(wireGeom, materials.wireframe.clone());
        wireMesh.scale.multiplyScalar(1.1);
        mesh.add(wireMesh);
      }
    }

    return objects;
  }, []);

  // Create particle system with color variation
  const createParticleSystem = useCallback((scene) => {
    const count = SCENE_CONFIG.particles.count;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);

    const color1 = new THREE.Color(SCENE_CONFIG.colors.primary);
    const color2 = new THREE.Color(SCENE_CONFIG.colors.secondary);
    const color3 = new THREE.Color(SCENE_CONFIG.colors.accent);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const radius = THREE.MathUtils.randFloat(50, SCENE_CONFIG.particles.spread);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);

      // Color variation
      const colorChoice = Math.random();
      const selectedColor = colorChoice < 0.5 ? color1 : colorChoice < 0.8 ? color2 : color3;
      colors[i3] = selectedColor.r;
      colors[i3 + 1] = selectedColor.g;
      colors[i3 + 2] = selectedColor.b;

      sizes[i] = THREE.MathUtils.randFloat(0.5, 3);

      // Particle velocities for continuous motion
      velocities[i3] = THREE.MathUtils.randFloat(-0.02, 0.02);
      velocities[i3 + 1] = THREE.MathUtils.randFloat(-0.02, 0.02);
      velocities[i3 + 2] = THREE.MathUtils.randFloat(-0.02, 0.02);
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    geometry.userData.velocities = velocities;

    const material = new THREE.PointsMaterial({
      size: SCENE_CONFIG.particles.size,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    return particles;
  }, []);

  // Create ambient 3D grid for depth perception
  const createDepthGrid = useCallback((scene) => {
    const gridSize = 500;
    const divisions = 40;
    
    // Horizontal grid
    const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x4dd0e1, 0x1a3a4a);
    gridHelper.position.y = -80;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.15;
    scene.add(gridHelper);

    // Vertical grid planes for depth
    const planeGeom = new THREE.PlaneGeometry(gridSize, gridSize, divisions, divisions);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x4dd0e1,
      wireframe: true,
      transparent: true,
      opacity: 0.03
    });

    const backPlane = new THREE.Mesh(planeGeom, planeMat);
    backPlane.position.z = -200;
    scene.add(backPlane);

    return { gridHelper, backPlane };
  }, []);

  // Create lighting system
  const createLighting = useCallback((scene) => {
    // Ambient light for base illumination
    const ambient = new THREE.AmbientLight(0x404060, 0.4);
    scene.add(ambient);

    // Main directional light
    const directional = new THREE.DirectionalLight(0xffffff, 0.6);
    directional.position.set(50, 100, 50);
    directional.castShadow = true;
    scene.add(directional);

    // Colored point lights that move
    const pointLights = [];
    const lightColors = [0x4dd0e1, 0x7c4dff, 0x00e676];
    
    lightColors.forEach((color, index) => {
      const light = new THREE.PointLight(color, 1, 150);
      light.userData = {
        orbitRadius: 60 + index * 20,
        orbitSpeed: 0.3 + index * 0.1,
        phase: (index / lightColors.length) * Math.PI * 2
      };
      scene.add(light);
      pointLights.push(light);
    });

    return { ambient, directional, pointLights };
  }, []);

  // Initialize Three.js scene
  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020b18, 0.003);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      SCENE_CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      SCENE_CONFIG.camera.near,
      SCENE_CONFIG.camera.far
    );
    camera.position.z = SCENE_CONFIG.camera.initialZ;
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    // Style canvas
    Object.assign(renderer.domElement.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '-1',
      pointerEvents: 'none'
    });

    container.appendChild(renderer.domElement);

    // Create scene elements
    const materials = createMaterials();
    const objects = createOrbitingObjects(scene, materials);
    const particles = createParticleSystem(scene);
    const lighting = createLighting(scene);
    createDepthGrid(scene);

    objectsRef.current = objects;
    particlesRef.current = particles;

    return { scene, camera, renderer, objects, particles, lighting, materials };
  }, [createMaterials, createOrbitingObjects, createParticleSystem, createLighting, createDepthGrid]);

  // Animation loop
  useEffect(() => {
    const context = initScene();
    if (!context) return;

    const { scene, camera, renderer, objects, particles, lighting } = context;
    let animationId;

    // Event handlers
    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRef.current.target = scrollY / maxScroll;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    if (enableMouseInteraction) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    if (enableScrollSync) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      const time = clockRef.current.getElapsedTime();
      frameRef.current++;

      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Smooth scroll interpolation
      scrollRef.current.velocity = scrollRef.current.target - scrollRef.current.current;
      scrollRef.current.current += scrollRef.current.velocity * 0.1;

      // Camera movement based on mouse and scroll
      const scrollOffset = scrollRef.current.current * scrollIntensity;
      camera.position.x += (mouseRef.current.x * 15 - camera.position.x) * 0.02;
      camera.position.y += (mouseRef.current.y * 10 + 10 - scrollOffset * 50 - camera.position.y) * 0.02;
      camera.position.z = SCENE_CONFIG.camera.initialZ - scrollOffset * 30;
      camera.lookAt(0, -scrollOffset * 20, -50);

      // Animate orbiting objects
      objects.forEach((obj, index) => {
        const { 
          orbitRadius, orbitSpeed, orbitOffset, orbitTilt, verticalOffset,
          rotationSpeed, floatAmplitude, floatSpeed, phase 
        } = obj.userData;

        // Orbital motion - objects move in 3D space
        const angle = time * orbitSpeed + orbitOffset;
        obj.position.x = Math.cos(angle) * orbitRadius;
        obj.position.z = Math.sin(angle) * orbitRadius * Math.cos(orbitTilt);
        obj.position.y = verticalOffset + Math.sin(time * floatSpeed + phase) * floatAmplitude;

        // Continuous rotation
        obj.rotation.x += rotationSpeed.x;
        obj.rotation.y += rotationSpeed.y;
        obj.rotation.z += rotationSpeed.z;

        // Scroll-based transformations
        const scrollFactor = scrollRef.current.current;
        obj.position.y += scrollFactor * (index % 2 === 0 ? 30 : -30);
        
        // Mouse-reactive subtle movement
        obj.position.x += mouseRef.current.x * (index % 3) * 2;
        obj.position.y += mouseRef.current.y * (index % 3) * 2;
      });

      // Animate particles
      if (particles && frameRef.current % 2 === 0) { // Optimize: update every 2 frames
        const positions = particles.geometry.attributes.position.array;
        const velocities = particles.geometry.userData.velocities;
        
        for (let i = 0; i < positions.length; i += 3) {
          positions[i] += velocities[i];
          positions[i + 1] += velocities[i + 1] + Math.sin(time + i * 0.01) * 0.01;
          positions[i + 2] += velocities[i + 2];

          // Wrap particles that go too far
          const dist = Math.sqrt(
            positions[i] ** 2 + positions[i + 1] ** 2 + positions[i + 2] ** 2
          );
          if (dist > SCENE_CONFIG.particles.spread) {
            const scale = 50 / dist;
            positions[i] *= scale;
            positions[i + 1] *= scale;
            positions[i + 2] *= scale;
          }
        }
        particles.geometry.attributes.position.needsUpdate = true;
      }
      
      // Rotate particle system
      particles.rotation.y += 0.0002;
      particles.rotation.x += 0.0001;

      // Animate point lights
      lighting.pointLights.forEach((light, index) => {
        const { orbitRadius, orbitSpeed, phase } = light.userData;
        light.position.x = Math.cos(time * orbitSpeed + phase) * orbitRadius;
        light.position.y = Math.sin(time * orbitSpeed * 0.5 + phase) * 30 + 20;
        light.position.z = Math.sin(time * orbitSpeed + phase) * orbitRadius;
      });

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    const container = containerRef.current;
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      // Dispose resources
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [initScene, scrollIntensity, enableScrollSync, enableMouseInteraction]);

  return (
    <div 
      ref={containerRef} 
      className="scene-3d-manager"
      aria-hidden="true"
    />
  );
};

export default Scene3DManager;
