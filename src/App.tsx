/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import AuthPage from './pages/AuthPage';
import BodySelectionPage from './pages/BodySelectionPage';
import Dashboard from './pages/Dashboard';
import RealmsPage from './pages/RealmsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';
import SutrasPage from './pages/SutrasPage';
import ReviewPage from './pages/ReviewPage';
import Layout from './components/Layout';

export default function App() {
  const { login, setUser, isAuthenticated, userId, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetch('/api/auth/status').then((r) => r.json());
        if (data.user) {
          // Profile exists — auto-login if not already authenticated
          if (!isAuthenticated) {
            login(data.user);
          } else {
            setUser(data.user);
          }
        }
        // If no profile, App will redirect to /auth (setup page)
      } catch (error) {
        console.error('Failed to fetch auth status', error);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500">載入中...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!isAuthenticated ? <AuthPage /> : <Navigate to={user?.mainBodyTypeId ? '/' : '/body-selection'} />} />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/auth" />}>
          <Route index element={<Dashboard />} />
          <Route path="body-selection" element={<BodySelectionPage />} />
          <Route path="realms" element={<RealmsPage />} />
          <Route path="sutras" element={<SutrasPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
