import React from 'react';
import Card3D from './Card3D';
import './StatCard3D.css';

/**
 * StatCard3D - Animated 3D statistics card
 */
const StatCard3D = ({ icon, label, value, color = '#4dd0e1', trend, trendValue, delay = 0 }) => {
  return (
    <Card3D className="stat-card-3d" glowColor={color} intensity="medium">
      <div className="stat-card-wrapper" style={{ animationDelay: `${delay}s` }}>
        <div className="stat-icon" style={{ '--icon-color': color }}>
          {icon}
        </div>
        
        <div className="stat-content">
          <h3 className="stat-label">{label}</h3>
          <div className="stat-value-container">
            <span className="stat-value" style={{ color }}>{value}</span>
            {trend && (
              <span className={`stat-trend ${trend}`}>
                {trend === 'up' ? '↑' : '↓'} {trendValue}
              </span>
            )}
          </div>
        </div>
        
        {/* Animated background circles */}
        <div className="stat-bg-circle circle-1" style={{ borderColor: color }}></div>
        <div className="stat-bg-circle circle-2" style={{ borderColor: color }}></div>
      </div>
    </Card3D>
  );
};

export default StatCard3D;
