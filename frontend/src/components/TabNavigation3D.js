import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './TabNavigation3D.css';

/**
 * TabNavigation3D - Ultra 3D Tab Navigation Component
 * Provides smooth 3D transitions between different content panels
 */
const TabNavigation3D = ({ tabs, defaultTab = 0 }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const tabVariants = {
    initial: { 
      opacity: 0, 
      y: 50, 
      rotateX: -20,
      scale: 0.9,
      filter: 'blur(10px)'
    },
    animate: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      filter: 'blur(0px)'
    },
    exit: { 
      opacity: 0, 
      y: -50, 
      rotateX: 20,
      scale: 0.9,
      filter: 'blur(10px)'
    }
  };

  return (
    <div className="tab-navigation-3d">
      {/* Tab Headers */}
      <div className="tab-headers-3d">
        {tabs.map((tab, index) => (
          <motion.button
            key={index}
            className={`tab-header-btn ${activeTab === index ? 'active' : ''}`}
            onClick={() => setActiveTab(index)}
            whileHover={{ scale: 1.05, z: 10 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            <span className="tab-label">{tab.label}</span>
            {activeTab === index && (
              <motion.div
                className="tab-indicator"
                layoutId="tabIndicator"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>

      {/* Tab Content with 3D Transitions */}
      <div className="tab-content-3d">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 20,
              duration: 0.6
            }}
            className="tab-panel-3d"
          >
            {tabs[activeTab].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 3D Background Effect */}
      <div className="tab-bg-effect">
        <motion.div
          className="tab-glow-orb"
          animate={{
            x: activeTab * 100,
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            x: { type: 'spring', stiffness: 100, damping: 20 },
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
      </div>
    </div>
  );
};

export default TabNavigation3D;
