import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  progress: number; // 0 to 100
  colorVariant?: 'green' | 'amber' | 'red' | 'blue';
  label?: string;
  valueText?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  colorVariant = 'blue',
  label,
  valueText
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="gs-progress-container">
      {(label || valueText) && (
        <div className="gs-progress-header">
          {label && <span className="gs-progress-label">{label}</span>}
          {valueText && (
            <span className={`gs-progress-value gs-progress-value--${colorVariant}`}>
              {valueText}
            </span>
          )}
        </div>
      )}
      <div className="gs-progress-track">
        <div 
          className={`gs-progress-fill gs-progress-fill--${colorVariant}`}
          style={{ width: `${normalizedProgress}%` }}
        />
      </div>
    </div>
  );
};
