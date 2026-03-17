import React, { useState } from 'react';
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

  // Registration Data State
  const [formData, setFormData] = useState({
    fullName: '', age: '', gender: '', email: '',
    aadhaarNumber: '', dlNumber: '',
    platform: '', avgHours: '', primaryZone: '', experienceMonths: '',
    weeklyIncome: '', workingDays: '6', coveragePercent: '70%',
    upiId: '', accountNo: '', ifscCode: '',
    loginId: '', password: '', confirmPassword: ''
  });

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
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
    <div className="gs-reg-page animate-fade-in">
      {currentStep < 6 && (
        <div className="gs-reg-header">
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

      <div className="gs-reg-content animate-slide-up" key={currentStep}>
        {currentStep === 1 && <Step1Personal data={formData} updateData={updateFormData} onNext={nextStep} />}
        {currentStep === 2 && <Step2Identity data={formData} updateData={updateFormData} onNext={nextStep} />}
        {currentStep === 3 && <Step3WorkProfile data={formData} updateData={updateFormData} onNext={nextStep} />}
        {currentStep === 4 && <Step4Income data={formData} updateData={updateFormData} onNext={nextStep} />}
        {currentStep === 5 && <Step5Payment data={formData} updateData={updateFormData} onNext={nextStep} />}
        {currentStep === 6 && <Step6Success />}
      </div>
    </div>
  );
};
