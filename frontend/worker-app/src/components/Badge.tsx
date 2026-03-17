import React from 'react';
import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'blue' | 'neutral';
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral',
  className = '',
  icon
}) => {
  return (
    <span className={`gs-badge gs-badge--${variant} ${className}`}>
      {icon && <span className="gs-badge-icon">{icon}</span>}
      {children}
    </span>
  );
};
