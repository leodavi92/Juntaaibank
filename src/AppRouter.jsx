import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';

function AppRouter() {
  // Função para verificar se o usuário já está logado
  const isLoggedIn = () => {
    return localStorage.getItem('userToken') !== null || 
           localStorage.getItem('adminToken') !== null;
  };

  return (
    <Router>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/" element={isLoggedIn() ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={<Register onLoginClick={() => window.location.href = '/'} />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Rotas protegidas */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        
        {/* Redirecionar rotas desconhecidas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;