import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';

// Auth Flows
import { Login } from './pages/auth/Login';
import { OTPVerification } from './pages/auth/OTP';
import { Registration } from './pages/auth/Registration';

// Main Flows
import { Dashboard } from './pages/main/Dashboard';
import { GigScoreScreen } from './pages/main/GigScore';
import { PolicyScreen } from './pages/main/Policy';
import { PremiumSimulator } from './pages/main/PremiumSimulator';
import { LiveZoneScreen } from './pages/main/LiveZone';

// Support & Profile Flows
import { PayoutsScreen } from './pages/support/Payouts';
import { TriggerLogScreen } from './pages/support/TriggerLog';
import { NotificationScreen } from './pages/support/Notification';
import { CoverageCalendar } from './pages/support/CoverageCalendar';
import { PaymentsScreen } from './pages/support/Payments';
import { ProfileScreen } from './pages/support/Profile';
import { ClaimsHistoryScreen } from './pages/support/ClaimsHistory';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/otp" element={<OTPVerification />} />
        <Route path="/register" element={<Registration />} />
        
        {/* Hidden / Demo Routes */}
        <Route path="/notification" element={<NotificationScreen />} />
        <Route path="/simulator" element={<PremiumSimulator />} />
        <Route path="/trigger-log" element={<TriggerLogScreen />} />
        <Route path="/calendar" element={<CoverageCalendar />} />

        {/* Main App Routes (with BottomNav) */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/policy" element={<PolicyScreen />} />
          <Route path="/zone" element={<LiveZoneScreen />} />
          <Route path="/payouts" element={<PayoutsScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/gigscore" element={<GigScoreScreen />} />
          <Route path="/payments" element={<PaymentsScreen />} />
          <Route path="/claims-history" element={<ClaimsHistoryScreen />} />
        </Route>

        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
