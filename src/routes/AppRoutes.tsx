import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../state/auth';
import DashboardPage from '../pages/DashboardPage';
import CommunityPage from '../pages/CommunityPage';
import CommunityMembersPage from '../pages/CommunityMembersPage';
import ItemsPage from '../pages/ItemsPage';
import JoinPage from '../pages/JoinPage';
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import MePage from '../pages/MePage';
import RecoveryPage from '../pages/RecoveryPage';
import RegisterPage from '../pages/RegisterPage';
import RequestsPage from '../pages/RequestsPage';
import RequestDetailsPage from '../pages/RequestDetailsPage';
import ResetPage from '../pages/ResetPage';
import VerifyPage from '../pages/VerifyPage';

const RequireAuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <AppLayout />;
};

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/recovery" element={<RecoveryPage />} />
    <Route path="/reset" element={<ResetPage />} />
    <Route path="/verify" element={<VerifyPage />} />
    <Route path="/join" element={<JoinPage />} />

    <Route element={<RequireAuthLayout />}>
      {/* Route index removed since it's handled by root LandingPage */}
      {/* If user navigates to /dashboard manually while logged in, it works */}
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/community" element={<CommunityPage />} />
      <Route path="/community/:id/members" element={<CommunityMembersPage />} />
      <Route path="/requests" element={<RequestsPage />} />
      <Route path="/requests/:id" element={<RequestDetailsPage />} />
      <Route path="/items" element={<ItemsPage />} />
      <Route path="/me" element={<MePage />} />
    </Route>

    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
