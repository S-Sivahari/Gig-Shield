import React, { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

interface AdminLoginProps {
  onLogin: (username: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username.trim() || 'admin';
    onLogin(finalUsername);
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="gs-admin-login-page">
      <form className="gs-admin-login-card" onSubmit={handleSubmit}>
        <div className="gs-admin-login-brand">
          <ShieldAlert size={34} />
          <h1>GigShield Admin</h1>
          <p>Sign in to continue</p>
        </div>

        <label className="gs-admin-login-label">Username</label>
        <input
          className="gs-admin-login-input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter any username"
          required
        />

        <label className="gs-admin-login-label">Password</label>
        <input
          type="password"
          className="gs-admin-login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter any password"
          required
        />

        <button type="submit" className="gs-admin-login-btn">Login</button>
      </form>
    </div>
  );
};
