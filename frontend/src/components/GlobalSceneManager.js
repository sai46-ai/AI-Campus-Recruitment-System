/**
 * GlobalSceneManager.js
 * 
 * Singleton pattern to manage a single WebGL renderer shared across all 3D components.
 * This prevents WebGL context exhaustion (max ~8-16 contexts per browser).
 * 
 * Each 3D component registers its objects/scenes with this manager instead of
 * creating its own renderer.
 */

import * as THREE from 'three';

class GlobalSceneManagerClass {
    constructor() {
        this.renderer = null;
        this.mainScene = null;
        this.camera = null;
        this.animationId = null;
        this.isInitialized = false;
        this.container = null;
        this.registeredObjects = new Map();
        this.lights = [];
        this.clock = new THREE.Clock();
        this.mousePosition = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.callbacks = new Set();
        this.resizeCallbacks = new Set();
    }

    /**
     * Initialize the global scene manager with a container element
     */
    init(container) {
        if (this.isInitialized && this.container === container) {
            return this;
        }

        // Clean up existing if reinitializing
        if (this.isInitialized) {
            this.dispose();
        }

        this.container = container;

        // Create scene
        this.mainScene = new THREE.Scene();
        this.mainScene.fog = new THREE.FogExp2(0x020b18, 0.002);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            2000
        );
        this.camera.position.set(0, 0, 100);

        // Create renderer - SINGLE INSTANCE
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Style canvas
        Object.assign(this.renderer.domElement.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            zIndex: '-1',
            pointerEvents: 'none'
        });

        container.appendChild(this.renderer.domElement);

        // Setup default lighting
        this._setupLighting();

        // Event listeners
        this._setupEventListeners();

        // Start animation loop
        this._animate();

        this.isInitialized = true;
        return this;
    }

    _setupLighting() {
        // Ambient light
        const ambient = new THREE.AmbientLight(0x404060, 0.4);
        this.mainScene.add(ambient);
        this.lights.push(ambient);

        // Directional light
        const directional = new THREE.DirectionalLight(0xffffff, 0.6);
        directional.position.set(50, 100, 50);
        this.mainScene.add(directional);
        this.lights.push(directional);

        // Colored point lights
        const lightColors = [0x4dd0e1, 0x7c4dff, 0x00e676];
        lightColors.forEach((color, index) => {
            const light = new THREE.PointLight(color, 1, 150);
            light.userData = {
                orbitRadius: 60 + index * 20,
                orbitSpeed: 0.3 + index * 0.1,
                phase: (index / lightColors.length) * Math.PI * 2
            };
            this.mainScene.add(light);
            this.lights.push(light);
        });
    }

    _setupEventListeners() {
        // Mouse movement
        this._handleMouseMove = (e) => {
            this.mousePosition.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mousePosition.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        };

        // Resize
        this._handleResize = () => {
            if (!this.camera || !this.renderer) return;

            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);

            // Notify registered callbacks
            this.resizeCallbacks.forEach(cb => cb());
        };

        window.addEventListener('mousemove', this._handleMouseMove);
        window.addEventListener('resize', this._handleResize);
    }

    _animate = () => {
        if (!this.isInitialized) return;

        const time = this.clock.getElapsedTime();

        // Smooth mouse interpolation
        this.mousePosition.x += (this.mousePosition.targetX - this.mousePosition.x) * 0.05;
        this.mousePosition.y += (this.mousePosition.targetY - this.mousePosition.y) * 0.05;

        // Camera subtle movement from mouse
        this.camera.position.x += (this.mousePosition.x * 10 - this.camera.position.x) * 0.02;
        this.camera.position.y += (this.mousePosition.y * 8 - this.camera.position.y) * 0.02;
        this.camera.lookAt(0, 0, 0);

        // Animate point lights
        this.lights.forEach((light) => {
            if (light.userData && light.userData.orbitRadius) {
                const { orbitRadius, orbitSpeed, phase } = light.userData;
                light.position.x = Math.cos(time * orbitSpeed + phase) * orbitRadius;
                light.position.y = Math.sin(time * orbitSpeed * 0.5 + phase) * 30 + 20;
                light.position.z = Math.sin(time * orbitSpeed + phase) * orbitRadius;
            }
        });

        // Call registered animation callbacks
        this.callbacks.forEach(cb => cb(time, this.mousePosition));

        // Render
        this.renderer.render(this.mainScene, this.camera);
        this.animationId = requestAnimationFrame(this._animate);
    };

    /**
     * Register a 3D object or group to be added to the scene
     */
    registerObject(id, object, animationCallback = null) {
        if (!this.mainScene) return;

        // Remove existing if re-registering
        if (this.registeredObjects.has(id)) {
            this.unregisterObject(id);
        }

        this.mainScene.add(object);
        this.registeredObjects.set(id, { object, callback: animationCallback });

        if (animationCallback) {
            this.callbacks.add(animationCallback);
        }
    }

    /**
     * Unregister and remove a 3D object from the scene
     */
    unregisterObject(id) {
        const entry = this.registeredObjects.get(id);
        if (!entry) return;

        // Remove from scene
        this.mainScene.remove(entry.object);

        // Remove animation callback
        if (entry.callback) {
            this.callbacks.delete(entry.callback);
        }

        // Dispose geometry and materials
        entry.object.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });

        this.registeredObjects.delete(id);
    }

    /**
     * Register a resize callback
     */
    onResize(callback) {
        this.resizeCallbacks.add(callback);
        return () => this.resizeCallbacks.delete(callback);
    }

    /**
     * Get the current mouse position
     */
    getMousePosition() {
        return { ...this.mousePosition };
    }

    /**
     * Get camera reference
     */
    getCamera() {
        return this.camera;
    }

    /**
     * Get scene reference
     */
    getScene() {
        return this.mainScene;
    }

    /**
     * Check if manager is initialized
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Clean up all resources
     */
    dispose() {
        // Cancel animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Remove event listeners
        window.removeEventListener('mousemove', this._handleMouseMove);
        window.removeEventListener('resize', this._handleResize);

        // Unregister all objects
        for (const id of this.registeredObjects.keys()) {
            this.unregisterObject(id);
        }

        // Dispose scene
        if (this.mainScene) {
            this.mainScene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        }

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.container && this.renderer.domElement) {
                this.container.removeChild(this.renderer.domElement);
            }
        }

        // Clear references
        this.renderer = null;
        this.mainScene = null;
        this.camera = null;
        this.container = null;
        this.lights = [];
        this.callbacks.clear();
        this.resizeCallbacks.clear();
        this.isInitialized = false;
    }
}

// Export singleton instance
const GlobalSceneManager = new GlobalSceneManagerClass();
export default GlobalSceneManager;
