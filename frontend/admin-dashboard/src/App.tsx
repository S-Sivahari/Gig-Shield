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

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/disruptions" element={<Disruptions />} />
          <Route path="/claims" element={<Claims />} />
          <Route path="/payouts" element={<Payouts />} />
          <Route path="/pool-health" element={<PoolHealth />} />
          <Route path="/zone-map" element={<ZoneMap />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
