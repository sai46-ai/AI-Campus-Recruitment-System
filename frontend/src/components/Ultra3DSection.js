import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

/**
 * Ultra3DSection - A wrapper for page sections with 3D animations
 * Provides scroll-based 3D transformations and entrance animations
 */
const Ultra3DSection = ({ 
  children, 
  className = '', 
  delay = 0,
  direction = 'up' // up, down, left, right
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const directionVariants = {
    up: {
      initial: { opacity: 0, y: 100, rotateX: -30, scale: 0.9 },
      animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 }
    },
    down: {
      initial: { opacity: 0, y: -100, rotateX: 30, scale: 0.9 },
      animate: { opacity: 1, y: 0, rotateX: 0, scale: 1 }
    },
    left: {
      initial: { opacity: 0, x: -100, rotateY: 30, scale: 0.9 },
      animate: { opacity: 1, x: 0, rotateY: 0, scale: 1 }
    },
    right: {
      initial: { opacity: 0, x: 100, rotateY: -30, scale: 0.9 },
      animate: { opacity: 1, x: 0, rotateY: 0, scale: 1 }
    }
  };

  const variant = directionVariants[direction];

  return (
    <motion.div
      ref={ref}
      className={`ultra-3d-section ${className}`}
      initial={variant.initial}
      animate={isInView ? variant.animate : variant.initial}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay: delay,
        duration: 0.8
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '2000px'
      }}
      whileHover={{
        scale: 1.02,
        z: 20,
        transition: { duration: 0.3 }
      }}
    >
      {children}
    </motion.div>
  );
};

export default Ultra3DSection;
