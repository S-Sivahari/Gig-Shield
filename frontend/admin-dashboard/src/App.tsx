import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminDashboard } from './pages/AdminDashboard';
import { Disruptions } from './pages/Disruptions';
import { Claims } from './pages/Claims';
import { Payouts } from './pages/Payouts';
import { PoolHealth } from './pages/PoolHealth';
import { ZoneMap } from './pages/ZoneMap';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';
import { AdminLogin } from './pages/AdminLogin';

const ADMIN_AUTH_KEY = 'gigshield_admin_auth';
const ADMIN_USER_KEY = 'gigshield_admin_user';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => localStorage.getItem(ADMIN_AUTH_KEY) === '1');

  const handleLogin = (username: string) => {
    localStorage.setItem(ADMIN_AUTH_KEY, '1');
    localStorage.setItem(ADMIN_USER_KEY, username);
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<AdminLogin onLogin={handleLogin} />} />

        <Route element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/disruptions" element={<Disruptions />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/pool-health" element={<PoolHealth />} />
          <Route path="/zone-map" element={<ZoneMap />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
