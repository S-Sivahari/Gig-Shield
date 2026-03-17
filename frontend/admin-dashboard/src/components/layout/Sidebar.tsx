import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Users, Settings, LogOut } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className="gs-admin-sidebar">
      <div className="gs-admin-brand">
        <ShieldAlert size={28} className="gs-brand-icon" />
        <span className="gs-brand-name">GigShield Admin</span>
      </div>

      <nav className="gs-admin-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/fraud" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={20} />
          <span>Fraud Detection</span>
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Users</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
      </nav>

      <div className="gs-admin-sidebar-footer">
        <button className="gs-admin-nav-item gs-logout-btn">
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
