import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { Check } from 'lucide-react';

export const Step6Success: React.FC = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [label, setLabel] = useState('Analysing zone risk...');

  useEffect(() => {
    // Simulate AI compuation progress
    const steps = [
      { p: 30, text: 'Analysing weather history...' },
      { p: 65, text: 'Validating work pattern...' },
      { p: 100, text: 'Computing GigScore...' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(steps[currentStep].p);
      setLabel(steps[currentStep].text);
      currentStep++;
      if (currentStep >= steps.length) clearInterval(interval);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="gs-step-form" style={{ alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
      
      <div className="gs-success-circle animate-scale-in">
        <Check size={48} color="#FFFFFF" />
      </div>

      <h1 className="gs-success-title">Registration successful!</h1>
      <p className="gs-success-subtitle">
        Your GigScore is being computed by our AI. This takes ~30 seconds.
      </p>

      <div className="gs-computation-box">
        <div className="gs-comp-progress-track">
          <div 
            className="gs-comp-progress-fill" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <p className="gs-comp-label">{label}</p>
      </div>

      <div style={{ marginTop: 'auto', width: '100%', paddingTop: '40px' }}>
        <Button 
          variant="primary" 
          onClick={() => navigate('/dashboard')}
          disabled={progress < 100}
        >
          Go to dashboard
        </Button>
      </div>
    </div>
  );
};
