import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className={`gs-input-container ${className}`}>
        {label && <label className="gs-input-label">{label}</label>}
        <div className="gs-input-wrapper">
          {icon && <span className="gs-input-icon">{icon}</span>}
          <input
            ref={ref}
            className={`gs-input ${icon ? 'gs-input--with-icon' : ''} ${error ? 'gs-input--error' : ''}`}
            {...props}
          />
        </div>
        {error && <span className="gs-input-error-text">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
