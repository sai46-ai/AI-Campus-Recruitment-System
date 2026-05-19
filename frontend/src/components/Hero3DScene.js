/**
 * Hero3DScene.js
 * Immersive 3D hero section with animated floating objects,
 * morphing geometries, and scroll-reactive spatial elements
 * 
 * This component renders an independent Three.js scene specifically
 * designed for hero sections with high visual impact
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const Hero3DScene = ({ className = '' }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const objectsRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const initScene = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.set(0, 0, 80);
    cameraRef.current = camera;

    // Renderer with context loss prevention
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false, // Prevent context creation failures
      preserveDrawingBuffer: true // Help prevent context loss
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    // Handle WebGL context loss gracefully
    const canvas = renderer.domElement;
    canvas.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      console.warn('Hero3DScene: WebGL context lost, attempting recovery...');
    }, false);

    canvas.addEventListener('webglcontextrestored', () => {
      console.log('Hero3DScene: WebGL context restored');
    }, false);

    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);


    // Create main central object group
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Central rotating icosahedron
    const centralGeom = new THREE.IcosahedronGeometry(15, 1);
    const centralMat = new THREE.MeshPhongMaterial({
      color: 0x4dd0e1,
      emissive: 0x0d3d44,
      shininess: 100,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const centralMesh = new THREE.Mesh(centralGeom, centralMat);
    mainGroup.add(centralMesh);

    // Wireframe overlay for central object
    const wireGeom = new THREE.IcosahedronGeometry(16, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4dd0e1,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    mainGroup.add(wireMesh);

    // Outer ring
    const ringGeom = new THREE.TorusGeometry(25, 0.5, 16, 100);
    const ringMat = new THREE.MeshPhongMaterial({
      color: 0x7c4dff,
      emissive: 0x1a0d3d,
      shininess: 80,
      transparent: true,
      opacity: 0.8
    });
    const ring1 = new THREE.Mesh(ringGeom, ringMat);
    ring1.rotation.x = Math.PI / 2;
    mainGroup.add(ring1);

    const ring2 = new THREE.Mesh(ringGeom.clone(), ringMat.clone());
    ring2.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    // Orbiting smaller objects
    const orbiters = [];
    const orbiterGeometries = [
      new THREE.OctahedronGeometry(3, 0),
      new THREE.TetrahedronGeometry(2.5, 0),
      new THREE.DodecahedronGeometry(2, 0),
      new THREE.BoxGeometry(3, 3, 3),
      new THREE.ConeGeometry(2, 4, 4),
      new THREE.TorusKnotGeometry(1.5, 0.5, 64, 8)
    ];

    const orbiterColors = [0x4dd0e1, 0x7c4dff, 0x00e676, 0xffab00, 0xff5252, 0x40c4ff];

    for (let i = 0; i < 12; i++) {
      const geometry = orbiterGeometries[i % orbiterGeometries.length];
      const material = new THREE.MeshPhongMaterial({
        color: orbiterColors[i % orbiterColors.length],
        emissive: new THREE.Color(orbiterColors[i % orbiterColors.length]).multiplyScalar(0.2),
        shininess: 60,
        transparent: true,
        opacity: 0.8,
        wireframe: i % 3 === 0
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Orbit parameters
      mesh.userData = {
        orbitRadius: 35 + Math.random() * 25,
        orbitSpeed: 0.2 + Math.random() * 0.3,
        orbitPhase: (i / 12) * Math.PI * 2,
        orbitTilt: Math.random() * Math.PI,
        floatAmplitude: 3 + Math.random() * 5,
        floatSpeed: 0.5 + Math.random() * 1,
        rotationSpeed: {
          x: 0.01 + Math.random() * 0.02,
          y: 0.01 + Math.random() * 0.02,
          z: 0.005 + Math.random() * 0.01
        }
      };

      scene.add(mesh);
      orbiters.push(mesh);
    }

    // Floating particles around hero
    const particleCount = 500;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x4dd0e1);
    const color2 = new THREE.Color(0x7c4dff);
    const color3 = new THREE.Color(0x00e676);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const radius = 60 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i3 + 2] = radius * Math.cos(phi);

      const colorChoice = Math.random();
      const selectedColor = colorChoice < 0.5 ? color1 : colorChoice < 0.8 ? color2 : color3;
      particleColors[i3] = selectedColor.r;
      particleColors[i3 + 1] = selectedColor.g;
      particleColors[i3 + 2] = selectedColor.b;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(30, 50, 30);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(0x4dd0e1, 1.5, 150);
    pointLight1.position.set(40, 30, 40);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x7c4dff, 1.2, 150);
    pointLight2.position.set(-40, -30, 40);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x00e676, 0.8, 100);
    pointLight3.position.set(0, 50, -30);
    scene.add(pointLight3);

    objectsRef.current = {
      mainGroup,
      centralMesh,
      wireMesh,
      ring1,
      ring2,
      orbiters,
      particles,
      pointLight1,
      pointLight2,
      pointLight3
    };

    return { scene, camera, renderer };
  }, []);

  useEffect(() => {
    const context = initScene();
    if (!context) return;

    const { scene, camera, renderer } = context;
    const objects = objectsRef.current;
    let time = 0;
    let animationId;

    // Mouse handler
    const handleMouseMove = (e) => {
      const rect = containerRef.current.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    // Resize handler
    const handleResize = () => {
      const container = containerRef.current;
      if (!container) return;

      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    containerRef.current?.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      time += 0.01;

      // Camera parallax
      camera.position.x += (mouseRef.current.x * 10 - camera.position.x) * 0.03;
      camera.position.y += (mouseRef.current.y * 8 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      // Main group rotation
      objects.mainGroup.rotation.y += 0.003;
      objects.mainGroup.rotation.x = Math.sin(time * 0.3) * 0.1;

      // Central mesh pulsating
      const pulse = 1 + Math.sin(time * 2) * 0.05;
      objects.centralMesh.scale.setScalar(pulse);
      objects.wireMesh.scale.setScalar(pulse * 1.05);

      // Central mesh rotation
      objects.centralMesh.rotation.x += 0.005;
      objects.centralMesh.rotation.y += 0.008;
      objects.wireMesh.rotation.x -= 0.003;
      objects.wireMesh.rotation.y -= 0.005;

      // Rings rotation
      objects.ring1.rotation.z += 0.01;
      objects.ring2.rotation.z -= 0.008;
      objects.ring2.rotation.x += 0.003;

      // Orbiters animation - REAL 3D MOTION
      objects.orbiters.forEach((orbiter) => {
        const {
          orbitRadius, orbitSpeed, orbitPhase, orbitTilt,
          floatAmplitude, floatSpeed, rotationSpeed
        } = orbiter.userData;

        // Orbital path in 3D space
        const angle = time * orbitSpeed + orbitPhase;
        orbiter.position.x = Math.cos(angle) * orbitRadius;
        orbiter.position.z = Math.sin(angle) * orbitRadius * Math.cos(orbitTilt);
        orbiter.position.y = Math.sin(angle) * orbitRadius * Math.sin(orbitTilt)
          + Math.sin(time * floatSpeed) * floatAmplitude;

        // Continuous rotation
        orbiter.rotation.x += rotationSpeed.x;
        orbiter.rotation.y += rotationSpeed.y;
        orbiter.rotation.z += rotationSpeed.z;

        // Mouse reactivity - objects move toward/away from cursor
        orbiter.position.x += mouseRef.current.x * 3;
        orbiter.position.y += mouseRef.current.y * 3;
      });

      // Particles rotation
      objects.particles.rotation.y += 0.0003;
      objects.particles.rotation.x += 0.0001;

      // Point lights orbiting
      objects.pointLight1.position.x = Math.cos(time * 0.5) * 50;
      objects.pointLight1.position.z = Math.sin(time * 0.5) * 50;
      objects.pointLight2.position.x = Math.cos(time * 0.3 + Math.PI) * 45;
      objects.pointLight2.position.z = Math.sin(time * 0.3 + Math.PI) * 45;
      objects.pointLight3.position.y = Math.sin(time * 0.4) * 30 + 40;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // GSAP entrance animation
    gsap.from(objects.mainGroup.scale, {
      x: 0, y: 0, z: 0,
      duration: 1.5,
      ease: 'elastic.out(1, 0.5)'
    });

    objects.orbiters.forEach((orbiter, index) => {
      gsap.from(orbiter.scale, {
        x: 0, y: 0, z: 0,
        duration: 1,
        delay: 0.5 + index * 0.08,
        ease: 'back.out(1.7)'
      });
    });

    // Cleanup
    const container = containerRef.current;
    return () => {
      cancelAnimationFrame(animationId);
      container?.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [initScene]);

  return (
    <div
      ref={containerRef}
      className={`hero-3d-scene ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'auto'
      }}
    />
  );
};

export default Hero3DScene;
