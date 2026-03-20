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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user has registered data in localStorage
    const userData = localStorage.getItem('gigshield_user_data');
    
    if (userData) {
      // User has registered, go directly to dashboard
      navigate('/dashboard');
    } else {
      // New user, go to OTP verification
      if (phone.length === 10) {
        // Save phone number for demo purposes
        const demoUserData = {
          phone: phone,
          fullName: 'Demo User',
          loginMethod: 'phone'
        };
        localStorage.setItem('gigshield_user_data', JSON.stringify(demoUserData));
        navigate('/otp');
      } else if (loginId && password) {
        // Save login credentials for demo purposes
        const demoUserData = {
          loginId: loginId,
          fullName: loginId.charAt(0).toUpperCase() + loginId.slice(1),
          loginMethod: 'credentials'
        };
        localStorage.setItem('gigshield_user_data', JSON.stringify(demoUserData));
        navigate('/dashboard');
      }
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

        <form onSubmit={handleLogin} className="gs-login-form animate-stagger-item" style={{ animationDelay: '100ms' }}>
          
          <div className="gs-phone-input-group">
            <div className="gs-phone-prefix">+91</div>
            <input 
              type="tel" 
              className="gs-phone-input"
              placeholder="Enter mobile number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
              maxLength={10}
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
            Login
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
