import React, { useEffect, useRef } from 'react';
import './Page3DWrapper.css';

/**
 * Page3DWrapper - Wraps page content with ultra-dynamic 3D effects
 * - Mouse parallax effects
 * - Tilt interactions
 * - Smooth scroll animations
 * - Interactive particles
 */
const Page3DWrapper = ({ children, className = '' }) => {
  const wrapperRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Mouse move parallax effect
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      
      const x = (clientX / innerWidth - 0.5) * 2;
      const y = (clientY / innerHeight - 0.5) * 2;
      
      mouseRef.current = { x, y };
      
      // Apply tilt effect
      const tiltX = y * 5;
      const tiltY = -x * 5;
      
      wrapper.style.transform = `
        perspective(1000px) 
        rotateX(${tiltX}deg) 
        rotateY(${tiltY}deg) 
        scale3d(1.02, 1.02, 1.02)
      `;
    };

    // Reset tilt on mouse leave
    const handleMouseLeave = () => {
      wrapper.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    // Scroll animations
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const elements = wrapper.querySelectorAll('.animate-on-scroll');
      
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const inView = rect.top < window.innerHeight * 0.8;
        
        if (inView) {
          el.classList.add('in-view');
        }
      });
    };

    wrapper.addEventListener('mousemove', handleMouseMove);
    wrapper.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll);
    
    // Initial scroll check
    handleScroll();

    return () => {
      wrapper.removeEventListener('mousemove', handleMouseMove);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`page-3d-wrapper ${className}`}>
      {/* Decorative 3D elements */}
      <div className="page-3d-bg">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
      </div>
      
      {/* Page content */}
      <div className="page-3d-content">
        {children}
      </div>
      
      {/* Interactive grid overlay */}
      <div className="grid-overlay"></div>
    </div>
  );
};

export default Page3DWrapper;
