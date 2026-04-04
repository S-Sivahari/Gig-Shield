import React from 'react';
import { Bell, Search } from 'lucide-react';
import './Header.css';

// ─── MOCK DATA — replace with API call later ───
const MOCK_ACTIVE_DISRUPTIONS = 4;

export const Header: React.FC = () => {
  const adminUser = localStorage.getItem('gigshield_admin_user') || 'Admin User';

  return (
    <header className="gs-admin-header">
      <div className="gs-header-search">
        <Search size={18} className="gs-search-icon" />
        <input type="text" placeholder="Search claims, users, or zones..." className="gs-search-input" />
      </div>

      <div className="gs-header-actions">
        <button className="gs-icon-button relative">
          <Bell size={20} />
          <span className="gs-notification-badge">{MOCK_ACTIVE_DISRUPTIONS}</span>
        </button>
        <div className="gs-admin-profile">
          <div className="gs-admin-avatar">A</div>
          <div className="gs-admin-info">
            <span className="gs-admin-name">{adminUser}</span>
            <span className="gs-admin-role">System Ops</span>
          </div>
        </div>
      </div>
    </header>
  );
};
