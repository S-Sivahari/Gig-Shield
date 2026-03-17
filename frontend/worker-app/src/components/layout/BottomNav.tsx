import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shield, Map, CreditCard, User } from 'lucide-react';
import './BottomNav.css';

export const BottomNav: React.FC = () => {
  return (
    <nav className="gs-bottom-nav">
      <NavLink to="/dashboard" className={({ isActive }) => `gs-nav-item ${isActive ? 'gs-nav-item--active' : ''}`}>
        <Home size={24} className="gs-nav-icon" />
        <span className="gs-nav-label">Home</span>
      </NavLink>
      
      <NavLink to="/policy" className={({ isActive }) => `gs-nav-item ${isActive ? 'gs-nav-item--active' : ''}`}>
        <Shield size={24} className="gs-nav-icon" />
        <span className="gs-nav-label">Policy</span>
      </NavLink>

      <NavLink to="/zone" className={({ isActive }) => `gs-nav-item ${isActive ? 'gs-nav-item--active' : ''}`}>
        <Map size={24} className="gs-nav-icon" />
        <span className="gs-nav-label">Zone</span>
      </NavLink>

      <NavLink to="/payouts" className={({ isActive }) => `gs-nav-item ${isActive ? 'gs-nav-item--active' : ''}`}>
        <CreditCard size={24} className="gs-nav-icon" />
        <span className="gs-nav-label">Payouts</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) => `gs-nav-item ${isActive ? 'gs-nav-item--active' : ''}`}>
        <User size={24} className="gs-nav-icon" />
        <span className="gs-nav-label">Profile</span>
      </NavLink>
    </nav>
  );
};
