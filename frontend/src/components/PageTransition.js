import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import './PageTransition.css';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 60,
    z: -200,
    rotateX: -20,
    rotateY: -10,
    scale: 0.9,
    filter: 'blur(10px)'
  },
  in: {
    opacity: 1,
    y: 0,
    z: 0,
    rotateX: 0,
    rotateY: 0,
    scale: 1,
    filter: 'blur(0px)'
  },
  out: {
    opacity: 0,
    y: -60,
    z: -200,
    rotateX: 20,
    rotateY: 10,
    scale: 0.9,
    filter: 'blur(10px)'
  }
};

const pageTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 0.8,
  duration: 0.6
};

const PageTransition = ({ children }) => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="page-transition-wrapper"
        style={{ 
          transformStyle: 'preserve-3d',
          willChange: 'transform, opacity'
        }}
      >
        <motion.div
          className="page-3d-border"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransition;
