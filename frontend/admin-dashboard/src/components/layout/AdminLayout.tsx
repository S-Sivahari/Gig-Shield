import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  return (
    <div className="gs-admin-app-container">
      <Sidebar />
      <div className="gs-admin-main-wrapper">
        <Header />
        <main className="gs-admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
