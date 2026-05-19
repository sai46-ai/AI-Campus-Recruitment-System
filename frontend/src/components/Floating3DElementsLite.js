/**
 * Floating3DElementsLite.js
 * 
 * Lightweight version using CSS 3D transforms instead of WebGL.
 * This prevents WebGL context exhaustion while still providing
 * visually appealing floating 3D effects.
 * 
 * Use this for decorative backgrounds where full WebGL isn't needed.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import './Floating3DElementsLite.css';

const SHAPES = {
    geometric: ['octahedron', 'cube', 'pyramid', 'diamond'],
    abstract: ['sphere', 'torus', 'pill', 'ring'],
    mixed: ['octahedron', 'sphere', 'cube', 'torus', 'diamond', 'ring']
};

const Floating3DElementsLite = ({
    type = 'mixed',
    count = 8,
    color = '#4dd0e1',
    secondaryColor = '#7c4dff',
    speed = 1,
    size = 1,
    interactive = true,
    className = ''
}) => {
    const containerRef = useRef(null);
    const [elements, setElements] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Generate random elements on mount
    useEffect(() => {
        const shapes = SHAPES[type] || SHAPES.mixed;
        const newElements = [];

        for (let i = 0; i < count; i++) {
            newElements.push({
                id: i,
                shape: shapes[i % shapes.length],
                x: Math.random() * 100,
                y: Math.random() * 100,
                z: Math.random() * 100 - 50,
                scale: (0.5 + Math.random() * 1) * size,
                rotationSpeed: (0.5 + Math.random()) * speed,
                floatSpeed: (2 + Math.random() * 3) / speed,
                floatDelay: Math.random() * 5,
                color: i % 2 === 0 ? color : secondaryColor,
                isWireframe: i % 3 === 0,
                orbitRadius: 30 + Math.random() * 40,
                orbitSpeed: (0.02 + Math.random() * 0.03) * speed,
                orbitOffset: Math.random() * Math.PI * 2
            });
        }

        setElements(newElements);
    }, [type, count, color, secondaryColor, speed, size]);

    // Mouse interaction
    const handleMouseMove = useCallback((e) => {
        if (!interactive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setMousePos({ x: x * 20, y: y * 20 });
    }, [interactive]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || !interactive) return;

        container.addEventListener('mousemove', handleMouseMove);
        return () => container.removeEventListener('mousemove', handleMouseMove);
    }, [interactive, handleMouseMove]);

    const renderShape = (element) => {
        const baseStyle = {
            '--float-duration': `${element.floatSpeed}s`,
            '--float-delay': `${element.floatDelay}s`,
            '--rotation-speed': `${10 / element.rotationSpeed}s`,
            '--element-color': element.color,
            '--element-scale': element.scale,
            '--orbit-radius': `${element.orbitRadius}px`,
            '--orbit-duration': `${20 / element.orbitSpeed}s`,
            '--orbit-delay': `${element.orbitOffset}s`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `
        translate(-50%, -50%)
        translateX(${mousePos.x * (element.z / 100)}px)
        translateY(${mousePos.y * (element.z / 100)}px)
        translateZ(${element.z}px)
      `
        };

        const shapeClass = `floating-shape shape-${element.shape} ${element.isWireframe ? 'wireframe' : ''}`;

        return (
            <div
                key={element.id}
                className={shapeClass}
                style={baseStyle}
            >
                <div className="shape-inner">
                    {element.shape === 'octahedron' && (
                        <div className="octahedron-faces">
                            <div className="face face-1"></div>
                            <div className="face face-2"></div>
                            <div className="face face-3"></div>
                            <div className="face face-4"></div>
                            <div className="face face-5"></div>
                            <div className="face face-6"></div>
                            <div className="face face-7"></div>
                            <div className="face face-8"></div>
                        </div>
                    )}
                    {element.shape === 'cube' && (
                        <div className="cube-faces">
                            <div className="face front"></div>
                            <div className="face back"></div>
                            <div className="face left"></div>
                            <div className="face right"></div>
                            <div className="face top"></div>
                            <div className="face bottom"></div>
                        </div>
                    )}
                    {element.shape === 'pyramid' && (
                        <div className="pyramid-faces">
                            <div className="face base"></div>
                            <div className="face side-1"></div>
                            <div className="face side-2"></div>
                            <div className="face side-3"></div>
                            <div className="face side-4"></div>
                        </div>
                    )}
                    {element.shape === 'diamond' && (
                        <div className="diamond-shape"></div>
                    )}
                    {element.shape === 'sphere' && (
                        <div className="sphere-shape"></div>
                    )}
                    {element.shape === 'torus' && (
                        <div className="torus-shape"></div>
                    )}
                    {element.shape === 'ring' && (
                        <div className="ring-shape"></div>
                    )}
                    {element.shape === 'pill' && (
                        <div className="pill-shape"></div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className={`floating-3d-lite ${className}`}
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                perspective: '1000px',
                perspectiveOrigin: '50% 50%',
                pointerEvents: interactive ? 'auto' : 'none'
            }}
        >
            <div className="floating-scene" style={{
                transform: `
          rotateX(${mousePos.y * 0.5}deg)
          rotateY(${mousePos.x * 0.5}deg)
        `
            }}>
                {elements.map(renderShape)}
            </div>
        </div>
    );
};

export default Floating3DElementsLite;
