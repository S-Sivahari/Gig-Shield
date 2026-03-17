import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
  return (
    <div className="gs-main-layout">
      <div className="gs-main-content">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};
