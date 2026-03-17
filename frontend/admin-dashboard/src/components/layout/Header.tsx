import React from 'react';
import { Bell, Search } from 'lucide-react';
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="gs-admin-header">
      <div className="gs-header-search">
        <Search size={18} className="gs-search-icon" />
        <input type="text" placeholder="Search claims, users, or zones..." className="gs-search-input" />
      </div>

      <div className="gs-header-actions">
        <button className="gs-icon-button relative">
          <Bell size={20} />
          <span className="gs-notification-badge">3</span>
        </button>
        <div className="gs-admin-profile">
          <div className="gs-admin-avatar">A</div>
          <div className="gs-admin-info">
            <span className="gs-admin-name">Admin User</span>
            <span className="gs-admin-role">System Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
};
