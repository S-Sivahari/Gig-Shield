import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Step1Personal } from './Step1Personal';
import { Step2Identity } from './Step2Identity';
import { Step3WorkProfile } from './Step3WorkProfile';
import { Step4Income } from './Step4Income';
import { Step5Payment } from './Step5Payment';
import { useInsurance } from '../../context/InsuranceContext';
import './Registration.css';

const TOTAL_STEPS = 5;

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { registrationData, updateRegistrationData, updateWorkerProfile } = useInsurance();
  const [currentStep, setCurrentStep] = useState(1);

  const updateFormData = (newData: any) => {
    updateRegistrationData(newData);

    updateWorkerProfile({
      income: Number(newData.weeklyIncome ?? registrationData.weeklyIncome) || 0,
      city: String(newData.city ?? registrationData.city),
      zone: String(newData.primaryZone ?? registrationData.primaryZone ?? newData.city ?? registrationData.city),
      vehicle: (newData.vehicleType ?? registrationData.vehicleType) as '2-wheeler' | '4-wheeler' | '',
      persona: String(newData.persona ?? registrationData.persona ?? 'courier'),
      safetyGearBool: Boolean(newData.safetyGearBool ?? registrationData.safetyGearBool ?? false),
    });
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step completed — go to dashboard
      navigate('/dashboard');
    }
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
      default: return '';
    }
  };

  return (
    <div className="gs-auth-page">
      <div className="gs-reg-page-wrapper animate-stagger">
        {(
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
          {currentStep === 1 && <Step1Personal data={registrationData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 2 && <Step2Identity data={registrationData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 3 && <Step3WorkProfile data={registrationData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 4 && <Step4Income data={registrationData} updateData={updateFormData} onNext={nextStep} />}
          {currentStep === 5 && <Step5Payment data={registrationData} updateData={updateFormData} onNext={nextStep} />}
        </div>
      </div>
    </div>
  );
};
