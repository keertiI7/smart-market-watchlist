import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { WatchlistsPage } from './pages/WatchlistsPage';
import { ChangeFeedPage } from './pages/ChangeFeedPage';
import { StockDetailsPage } from './pages/StockDetailsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/watchlists" element={<WatchlistsPage />} />
            <Route path="/changes" element={<ChangeFeedPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/stocks/:symbol" element={<StockDetailsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </AuthProvider>
  );
}