import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Personal } from './Step1Personal';
import { Step2Identity } from './Step2Identity';
import { Step3WorkProfile } from './Step3WorkProfile';
import { Step4Income } from './Step4Income';
import { Step5Payment } from './Step5Payment';
import { Step6Success } from './Step6Success';
import './Registration.css';

const TOTAL_STEPS = 6;

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Registration Data State - Load from localStorage if exists
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('gigshield_user_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return {
          fullName: '', age: '', gender: '', email: '',
          aadhaarNumber: '', dlNumber: '', aadhaarFile: null, dlFile: null,
          platform: '', avgHours: '', primaryZone: '', experienceMonths: '',
          weeklyIncome: '', workingDays: '6', coveragePercent: '70%',
          upiId: '', accountNo: '', ifscCode: '',
          loginId: '', password: '', confirmPassword: ''
        };
      }
    }
    return {
      fullName: '', age: '', gender: '', email: '',
      aadhaarNumber: '', dlNumber: '', aadhaarFile: null, dlFile: null,
      platform: '', avgHours: '', primaryZone: '', experienceMonths: '',
      weeklyIncome: '', workingDays: '6', coveragePercent: '70%',
      upiId: '', accountNo: '', ifscCode: '',
      loginId: '', password: '', confirmPassword: ''
    };
  });

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      // Save to localStorage whenever data updates
      localStorage.setItem('gigshield_user_data', JSON.stringify(updated));
      return updated;
    });
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
    else navigate(-1); // Go back if on first step
  };

  // Step headers
  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal details';
      case 2: return 'Identity verification';
      case 3: return 'Work profile';
      case 4: return 'Income declaration';
      case 5: return 'Payment & account setup';
      case 6: return 'Registration successful!';
      default: return '';
    }
  };

  return (
    <div className="gs-auth-page">
      <div className="gs-reg-page-wrapper animate-stagger">
        {currentStep < 6 && (
          <div className="gs-reg-header animate-stagger-item" style={{ animationDelay: '0ms' }}>
            <button className="gs-back-button" onClick={prevStep}>
              ←
            </button>
            <div className="gs-reg-title-block">
              <h1 className="gs-reg-title">{getStepTitle()}</h1>
              <p className="gs-reg-subtitle">Step {currentStep} of {TOTAL_STEPS}</p>
            </div>
            
            <div className="gs-reg-progress">
              {Array.from({ length: TOTAL_STEPS - 1 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`gs-reg-progress-segment ${idx < currentStep ? 'gs-reg-progress-segment--done' : ''}`}
                />
              ))}
            </div>
          </div>
        )}

        <div className="gs-reg-content animate-stagger-item" style={{ animationDelay: '100ms' }} key={currentStep}>
          {currentStep === 1 && <Step1Personal data={formData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 2 && <Step2Identity data={formData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 3 && <Step3WorkProfile data={formData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 4 && <Step4Income data={formData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 5 && <Step5Payment data={formData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 6 && <Step6Success />}
        </div>
      </div>
    </div>
  );
};
