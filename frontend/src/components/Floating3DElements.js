/**
 * Floating3DElements.js
 * Reusable 3D component for filling blank/empty sections with
 * continuously moving 3D objects that respond to scroll and mouse
 * 
 * Use this component to add real 3D motion to any section
 */

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

const ELEMENT_TYPES = {
  geometric: ['icosahedron', 'octahedron', 'dodecahedron', 'tetrahedron'],
  abstract: ['torus', 'torusKnot', 'sphere', 'cone'],
  mixed: ['icosahedron', 'torus', 'octahedron', 'torusKnot', 'dodecahedron', 'sphere']
};

const Floating3DElements = ({
  type = 'mixed',
  count = 8,
  color = 0x4dd0e1,
  secondaryColor = 0x7c4dff,
  speed = 1,
  size = 1,
  spread = 50,
  interactive = true,
  className = ''
}) => {
  const containerRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const createGeometry = useCallback((type, scale) => {
    const baseSize = 2 * scale * size;
    switch (type) {
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(baseSize, 0);
      case 'octahedron':
        return new THREE.OctahedronGeometry(baseSize, 0);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(baseSize * 0.8, 0);
      case 'tetrahedron':
        return new THREE.TetrahedronGeometry(baseSize, 0);
      case 'torus':
        return new THREE.TorusGeometry(baseSize * 0.8, baseSize * 0.3, 16, 32);
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(baseSize * 0.6, baseSize * 0.2, 64, 16);
      case 'sphere':
        return new THREE.SphereGeometry(baseSize * 0.8, 16, 16);
      case 'cone':
        return new THREE.ConeGeometry(baseSize * 0.6, baseSize * 1.2, 6);
      case 'box':
        return new THREE.BoxGeometry(baseSize, baseSize, baseSize);
      default:
        return new THREE.IcosahedronGeometry(baseSize, 0);
    }
  }, [size]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      500
    );
    camera.position.z = spread * 1.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create floating objects
    const objects = [];
    const elementTypes = ELEMENT_TYPES[type] || ELEMENT_TYPES.mixed;

    for (let i = 0; i < count; i++) {
      const geometryType = elementTypes[i % elementTypes.length];
      const geometry = createGeometry(geometryType, 0.5 + Math.random() * 1);
      
      const isWireframe = i % 3 === 0;
      const useSecondary = i % 2 === 0;
      
      const material = new THREE.MeshPhongMaterial({
        color: useSecondary ? secondaryColor : color,
        emissive: new THREE.Color(useSecondary ? secondaryColor : color).multiplyScalar(0.15),
        shininess: 80,
        transparent: true,
        opacity: isWireframe ? 0.5 : 0.7,
        wireframe: isWireframe
      });

      const mesh = new THREE.Mesh(geometry, material);

      // Random initial position
      mesh.position.x = (Math.random() - 0.5) * spread * 2;
      mesh.position.y = (Math.random() - 0.5) * spread * 1.5;
      mesh.position.z = (Math.random() - 0.5) * spread;

      // Animation parameters
      mesh.userData = {
        originalPosition: mesh.position.clone(),
        moveSpeed: {
          x: (Math.random() - 0.5) * 0.3 * speed,
          y: (Math.random() - 0.5) * 0.3 * speed,
          z: (Math.random() - 0.5) * 0.2 * speed
        },
        rotationSpeed: {
          x: (Math.random() - 0.5) * 0.02 * speed,
          y: (Math.random() - 0.5) * 0.02 * speed,
          z: (Math.random() - 0.5) * 0.01 * speed
        },
        floatOffset: Math.random() * Math.PI * 2,
        floatSpeed: 0.5 + Math.random() * 1,
        floatAmplitude: 5 + Math.random() * 10,
        bounds: {
          x: spread * 1.5,
          y: spread,
          z: spread * 0.8
        }
      };

      scene.add(mesh);
      objects.push(mesh);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404050, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(20, 30, 20);
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(color, 0.8, 100);
    pointLight1.position.set(30, 20, 30);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(secondaryColor, 0.6, 100);
    pointLight2.position.set(-30, -20, 20);
    scene.add(pointLight2);

    // Event handlers
    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    container.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Animation
    let time = 0;
    let animationId;

    const animate = () => {
      time += 0.01;

      // Camera subtle movement
      if (interactive) {
        camera.position.x += (mouseRef.current.x * 15 - camera.position.x) * 0.02;
        camera.position.y += (mouseRef.current.y * 10 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);
      }

      // Animate objects
      objects.forEach((obj) => {
        const { moveSpeed, rotationSpeed, floatOffset, floatSpeed, floatAmplitude, bounds } = obj.userData;

        // Continuous movement in 3D space
        obj.position.x += moveSpeed.x;
        obj.position.y += moveSpeed.y + Math.sin(time * floatSpeed + floatOffset) * 0.05;
        obj.position.z += moveSpeed.z;

        // Floating motion
        obj.position.y += Math.sin(time * floatSpeed + floatOffset) * 0.02 * floatAmplitude * 0.1;

        // Continuous rotation
        obj.rotation.x += rotationSpeed.x;
        obj.rotation.y += rotationSpeed.y;
        obj.rotation.z += rotationSpeed.z;

        // Wrap around when out of bounds
        if (obj.position.x > bounds.x) obj.position.x = -bounds.x;
        if (obj.position.x < -bounds.x) obj.position.x = bounds.x;
        if (obj.position.y > bounds.y) obj.position.y = -bounds.y;
        if (obj.position.y < -bounds.y) obj.position.y = bounds.y;
        if (obj.position.z > bounds.z) obj.position.z = -bounds.z;
        if (obj.position.z < -bounds.z) obj.position.z = bounds.z;

        // Mouse interaction - objects react to cursor
        if (interactive) {
          obj.position.x += mouseRef.current.x * 0.5;
          obj.position.y += mouseRef.current.y * 0.5;
        }
      });

      // Animate lights
      pointLight1.position.x = Math.cos(time * 0.5) * 40;
      pointLight1.position.z = Math.sin(time * 0.5) * 40;
      pointLight2.position.x = Math.cos(time * 0.3 + Math.PI) * 35;
      pointLight2.position.z = Math.sin(time * 0.3 + Math.PI) * 35;

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('mousemove', handleMouseMove);
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
  }, [type, count, color, secondaryColor, speed, spread, interactive, createGeometry]);

  return (
    <div 
      ref={containerRef}
      className={`floating-3d-elements ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: interactive ? 'auto' : 'none',
        overflow: 'hidden'
      }}
    />
  );
};

export default Floating3DElements;
