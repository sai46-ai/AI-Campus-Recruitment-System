/**
 * ScrollAnimations.js
 * GSAP-powered scroll animations utility
 * Provides hooks and components for scroll-triggered animations
 */

import { useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';

// Custom hook for scroll-triggered fade in animations
export const useScrollAnimation = (options = {}) => {
  const elementRef = useRef(null);
  
  const {
    animation = 'fadeUp', // fadeUp, fadeLeft, fadeRight, scale, rotate
    duration = 0.8,
    delay = 0,
    stagger = 0.1,
    threshold = 0.2,
    once = true
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Initial state based on animation type
    const initialState = {
      fadeUp: { opacity: 0, y: 60 },
      fadeDown: { opacity: 0, y: -60 },
      fadeLeft: { opacity: 0, x: -60 },
      fadeRight: { opacity: 0, x: 60 },
      scale: { opacity: 0, scale: 0.8 },
      rotate: { opacity: 0, rotation: -10, scale: 0.9 }
    };

    const targetState = {
      fadeUp: { opacity: 1, y: 0 },
      fadeDown: { opacity: 1, y: 0 },
      fadeLeft: { opacity: 1, x: 0 },
      fadeRight: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
      rotate: { opacity: 1, rotation: 0, scale: 1 }
    };

    gsap.set(element, initialState[animation]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(element, {
              ...targetState[animation],
              duration,
              delay,
              ease: 'power3.out',
              stagger: element.children?.length > 1 ? stagger : 0
            });
            if (once) observer.unobserve(element);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [animation, duration, delay, stagger, threshold, once]);

  return elementRef;
};

// Hook for parallax scroll effect
export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const rate = scrolled * speed;
      
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        gsap.to(element, {
          y: rate * 0.1,
          duration: 0.1,
          ease: 'none'
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);

  return elementRef;
};

// Hook for staggered children animation
export const useStaggerAnimation = (options = {}) => {
  const containerRef = useRef(null);
  
  const {
    childSelector = '> *',
    animation = 'fadeUp',
    duration = 0.6,
    stagger = 0.08,
    delay = 0,
    threshold = 0.1
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const children = container.querySelectorAll(childSelector);
    if (!children.length) return;

    const initialState = {
      fadeUp: { opacity: 0, y: 40 },
      fadeLeft: { opacity: 0, x: -40 },
      fadeRight: { opacity: 0, x: 40 },
      scale: { opacity: 0, scale: 0.85 }
    };

    const targetState = {
      fadeUp: { opacity: 1, y: 0 },
      fadeLeft: { opacity: 1, x: 0 },
      fadeRight: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 }
    };

    gsap.set(children, initialState[animation]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(children, {
              ...targetState[animation],
              duration,
              delay,
              stagger,
              ease: 'power3.out'
            });
            observer.unobserve(container);
          }
        });
      },
      { threshold }
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [childSelector, animation, duration, stagger, delay, threshold]);

  return containerRef;
};

// Initialize GSAP animations on page load
export const initPageAnimations = () => {
  // Animate elements with data-animate attribute
  const animatedElements = document.querySelectorAll('[data-animate]');
  
  animatedElements.forEach((element) => {
    const animation = element.dataset.animate || 'fadeUp';
    const delay = parseFloat(element.dataset.animateDelay) || 0;
    const duration = parseFloat(element.dataset.animateDuration) || 0.8;

    const initialStates = {
      fadeUp: { opacity: 0, y: 60 },
      fadeDown: { opacity: 0, y: -60 },
      fadeLeft: { opacity: 0, x: -60 },
      fadeRight: { opacity: 0, x: 60 },
      scale: { opacity: 0, scale: 0.8 },
      blur: { opacity: 0, filter: 'blur(10px)' }
    };

    const targetStates = {
      fadeUp: { opacity: 1, y: 0 },
      fadeDown: { opacity: 1, y: 0 },
      fadeLeft: { opacity: 1, x: 0 },
      fadeRight: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
      blur: { opacity: 1, filter: 'blur(0px)' }
    };

    gsap.set(element, initialStates[animation]);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(element, {
              ...targetStates[animation],
              duration,
              delay,
              ease: 'power3.out'
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(element);
  });
};

// Magnetic hover effect for buttons
export const useMagneticHover = (strength = 0.3) => {
  const elementRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    gsap.to(element, {
      x: deltaX,
      y: deltaY,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    const element = elementRef.current;
    if (!element) return;

    gsap.to(element, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)'
    });
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return elementRef;
};

// Text reveal animation
export const useTextReveal = (options = {}) => {
  const elementRef = useRef(null);
  
  const {
    duration = 1,
    delay = 0,
    stagger = 0.03
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const text = element.textContent;
    element.innerHTML = '';
    
    // Wrap each character in a span
    text.split('').forEach((char) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(100%)';
      element.appendChild(span);
    });

    const chars = element.querySelectorAll('span');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.to(chars, {
              opacity: 1,
              y: 0,
              duration,
              delay,
              stagger,
              ease: 'power3.out'
            });
            observer.unobserve(element);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [duration, delay, stagger]);

  return elementRef;
};

const ScrollAnimations = {
  useScrollAnimation,
  useParallax,
  useStaggerAnimation,
  initPageAnimations,
  useMagneticHover,
  useTextReveal
};

export default ScrollAnimations;
