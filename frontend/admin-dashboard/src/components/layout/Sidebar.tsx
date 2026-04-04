import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShieldAlert, Users, Settings, LogOut, Zap, FileText, Wallet, PiggyBank, Map } from 'lucide-react';
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('gigshield_admin_auth');
    localStorage.removeItem('gigshield_admin_user');
    window.location.assign('/login');
  };

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

        <NavLink to="/users" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Users</span>
        </NavLink>
        
        <NavLink to="/settings" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

        <NavLink to="/disruptions" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Zap size={20} />
          <span>Disruptions</span>
        </NavLink>

        <NavLink to="/claims" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Claims</span>
        </NavLink>

        <NavLink to="/payouts" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={20} />
          <span>Payouts</span>
        </NavLink>

        <NavLink to="/pool-health" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <PiggyBank size={20} />
          <span>Pool Health</span>
        </NavLink>

        <NavLink to="/zone-map" className={({ isActive }) => `gs-admin-nav-item ${isActive ? 'active' : ''}`}>
          <Map size={20} />
          <span>Zone Map</span>
        </NavLink>
      </nav>

      <div className="gs-admin-sidebar-footer">
        <button className="gs-admin-nav-item gs-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
