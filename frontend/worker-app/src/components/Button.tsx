import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'pill';
  fullWidth?: boolean;
  selected?: boolean; // For pill variant
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = true,
  selected = false,
  className = '', 
  children, 
  ...props 
}) => {
  const baseClass = 'gs-button';
  const variantClass = `gs-button--${variant}`;
  const widthClass = fullWidth && variant !== 'pill' ? 'gs-button--full-width' : '';
  const selectedClass = selected ? 'gs-button--selected' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${widthClass} ${selectedClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
