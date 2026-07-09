import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';

import { useAuthStore } from './store';
import { connectSocket, disconnectSocket } from './utils/socket';
import api from './utils/api';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import LobbyPage from './pages/LobbyPage';
import GamePage from './pages/GamePage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';
import SupportPage from './pages/SupportPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

import './styles/global.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useAuthStore();
  if (!isAuthenticated || !token) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route wrapper
const AdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('whotnaija_admin_token');
  if (!adminToken) return <Navigate to="/masteradmin" replace />;
  return children;
};

// Public only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { token, isAuthenticated, refreshUser } = useAuthStore();

  useEffect(() => {
    // Restore auth header
    const storedToken = localStorage.getItem('whotnaija_token');
    if (storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      connectSocket(token);
      refreshUser();
    } else {
      disconnectSocket();
    }

    return () => {};
  }, [isAuthenticated, token]);

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12122A',
            border: '1px solid rgba(255,255,255,0.06)',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
          success: { iconTheme: { primary: '#00D084', secondary: '#fff' } },
          error: { iconTheme: { primary: '#FF4444', secondary: '#fff' } },
        }}
      />

      <AnimatePresence mode="wait">
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
          <Route path="/reset-password/:token" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

          {/* Protected user routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/lobby" element={<ProtectedRoute><LobbyPage /></ProtectedRoute>} />
          <Route path="/game/:roomId" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/referral" element={<ProtectedRoute><ReferralPage /></ProtectedRoute>} />
          <Route path="/support" element={<ProtectedRoute><SupportPage /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/masteradmin" element={<AdminLoginPage />} />
          <Route path="/masteradmin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  );
}

export default App;
