import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import './OTP.css';

export const OTPVerification: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [activeOtpIndex, setActiveOtpIndex] = useState<number>(0);
  const [timer, setTimer] = useState<number>(28);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus active input
  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOtpIndex]);

  // Handle countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    // Allow only last char
    const currentVal = value.substring(value.length - 1);
    newOtp[index] = currentVal;
    setOtp(newOtp);

    // Move to next input if filled
    if (currentVal && index < 5) {
      setActiveOtpIndex(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      if (!newOtp[index] && index > 0) {
        // if empty, move to previous
        setActiveOtpIndex(index - 1);
      }
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.join('').length === 6) {
      navigate('/register'); // Mock route to registration flow
    }
  };

  return (
    <div className="gs-auth-page">
      <div className="gs-auth-content animate-stagger">
        
        <div className="gs-otp-header animate-stagger-item" style={{ animationDelay: '0ms' }}>
          <h1 className="gs-otp-title">OTP verification</h1>
          <p className="gs-otp-subtitle">Enter the 6-digit code sent to<br /><b>+91 99****8291</b></p>
        </div>

        <div className="gs-auto-read-banner animate-stagger-item" style={{ animationDelay: '100ms' }}>
          Auto-reading OTP from SMS...
        </div>

        <form onSubmit={handleVerify} className="gs-otp-form animate-stagger-item" style={{ animationDelay: '200ms' }}>
          
          <div className="gs-otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={index === activeOtpIndex ? inputRef : null}
                className={`gs-otp-input ${index === activeOtpIndex || digit ? 'gs-otp-input--active' : ''}`}
                type="number"
                pattern="\d*"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                onClick={() => setActiveOtpIndex(index)}
              />
            ))}
          </div>

          <Button type="submit" variant="primary">
            Verify & continue
          </Button>

          <div className="gs-resend-container">
            {timer > 0 ? (
              <span className="gs-text-muted">Resend OTP in <span className="gs-timer-text">{timer}s</span></span>
            ) : (
              <button 
                type="button" 
                className="gs-resend-button"
                onClick={() => setTimer(30)}
              >
                Resend OTP
              </button>
            )}
          </div>

        </form>
      </div>
    </div>
  );
};
