import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length === 10) {
      navigate('/otp'); // Mock routing to OTP page
    }
  };

  return (
    <div className="gs-auth-page">
      <div className="gs-auth-content animate-stagger">
        <div className="gs-login-header animate-stagger-item" style={{ animationDelay: '0ms' }}>
          <div className="gs-logo-container">
            <Shield className="gs-logo-icon" size={32} />
            <h1 className="gs-logo-text">GigShield</h1>
          </div>
          <p className="gs-tagline">Income protection for delivery partners</p>
        </div>

        <form onSubmit={handleSendOTP} className="gs-login-form animate-stagger-item" style={{ animationDelay: '100ms' }}>
          
          <div className="gs-phone-input-group">
            <div className="gs-phone-prefix">+91</div>
            <input 
              type="tel" 
              className="gs-phone-input"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
              maxLength={10}
              required
            />
          </div>

          <div className="gs-divider">
            <span className="gs-divider-text">or login with</span>
          </div>

          <Input 
            type="text"
            placeholder="Login ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />
          
          <Input 
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button type="submit" variant="primary" style={{ marginTop: '8px' }}>
            Send OTP
          </Button>

          <div className="gs-register-link">
            <span className="gs-text-muted">New user? </span>
            <button 
              type="button" 
              className="gs-link-button"
              onClick={() => navigate('/register')}
            >
              Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
