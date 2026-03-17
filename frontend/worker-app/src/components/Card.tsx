import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'white' | 'blue';
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'white', 
  className = '',
  noPadding = false,
  onClick,
  style
}) => {
  return (
    <div 
      className={`gs-card gs-card--${variant} ${noPadding ? 'gs-card--no-padding' : ''} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
};
