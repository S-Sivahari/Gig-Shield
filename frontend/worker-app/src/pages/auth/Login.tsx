import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useInsurance } from '../../context/InsuranceContext';
import './Login.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { registrationData, updateRegistrationData, updateWorkerProfile } = useInsurance();
  const [phone, setPhone] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  const handleDemoLogin = () => {
    const names = ['Ramesh Kumar', 'Priya Sharma', 'Arjun Das', 'Sneha Reddy', 'Karthik Nair', 'Aman Verma'];
    const cities = ['Bangalore', 'Mumbai', 'Chennai', 'Delhi', 'Hyderabad', 'Pune'];
    const zones = ['Koramangala', 'Andheri', 'Anna Nagar', 'Dwarka', 'Madhapur', 'Kothrud'];
    const platforms = ['Swiggy', 'Zomato', 'Blinkit', 'Zepto', 'Amazon'];
    const personas = ['courier', 'shopper', 'rideshare'] as const;
    const vehicleOptions = ['2-wheeler', '4-wheeler'] as const;
    const planOptions = ['basic', 'shield_plus', 'elite'] as const;

    const random = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
    const fullName = random(names);
    const city = random(cities);
    const primaryZone = `${random(zones)}, ${city}`;
    const vehicleType = random(vehicleOptions);
    const selectedPlan = random(planOptions);
    const weeklyIncome = String(3500 + Math.floor(Math.random() * 5500));
    const persona = random(personas);
    const safetyGearBool = Math.random() > 0.5;
    const coveragePercent = selectedPlan === 'elite' ? '90%' : selectedPlan === 'basic' ? '50%' : '70%';
    const planName = selectedPlan === 'elite' ? 'Elite' : selectedPlan === 'basic' ? 'Basic' : 'Shield+';
    const demoPhone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;

    updateRegistrationData({
      fullName,
      phone: demoPhone,
      email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@demo.gigshield.local`,
      city,
      primaryZone,
      platform: random(platforms),
      vehicleType,
      weeklyIncome,
      selectedPlan,
      planName,
      coveragePercent,
      persona,
      safetyGearBool,
      workingDays: String(5 + Math.floor(Math.random() * 2)),
      loginMethod: 'demo',
    });

    updateWorkerProfile({
      income: Number(weeklyIncome),
      city,
      zone: primaryZone,
      vehicle: vehicleType,
      persona,
      safetyGearBool,
    });

    navigate('/dashboard');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const hasExistingUser = Boolean(registrationData.fullName || registrationData.loginId);

    if (hasExistingUser) {
      navigate('/dashboard');
    } else {
      if (phone.length === 10) {
        updateRegistrationData({
          phone: phone,
          fullName: 'Demo User',
          loginMethod: 'phone',
          city: 'Mumbai',
          weeklyIncome: '5000',
          vehicleType: '2-wheeler',
          selectedPlan: 'shield_plus',
          planName: 'Shield+',
          coveragePercent: '70%',
        });
        navigate('/otp');
      } else if (loginId && password) {
        updateRegistrationData({
          loginId: loginId,
          fullName: loginId.charAt(0).toUpperCase() + loginId.slice(1),
          loginMethod: 'credentials',
          city: 'Mumbai',
          weeklyIncome: '5000',
          vehicleType: '2-wheeler',
          selectedPlan: 'shield_plus',
          planName: 'Shield+',
          coveragePercent: '70%',
        });
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

          <Button type="button" variant="outline" className="gs-demo-login-btn" onClick={handleDemoLogin}>
            Demo Worker Login
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
