import React from 'react';
import './Toggle.css';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false
}) => {
  return (
    <div className="gs-toggle-container">
      {label && <span className="gs-toggle-label">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={`gs-toggle ${checked ? 'gs-toggle--checked' : ''} ${disabled ? 'gs-toggle--disabled' : ''}`}
        onClick={() => !disabled && onChange(!checked)}
      >
        <span className={`gs-toggle-thumb ${checked ? 'gs-toggle-thumb--checked' : ''}`} />
      </button>
    </div>
  );
};
