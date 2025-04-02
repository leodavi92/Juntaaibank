import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminRequired = false }) => {
  // Verificar se o usuário está autenticado
  const isAuthenticated = localStorage.getItem('userToken') !== null || 
                          localStorage.getItem('adminToken') !== null;
  
  // Verificar se é uma rota de admin e se o usuário é admin
  const isAdmin = localStorage.getItem('adminToken') !== null;
  
  if (!isAuthenticated) {
    // Redirecionar para a página de login se não estiver autenticado
    console.log("Usuário não autenticado, redirecionando para login");
    return <Navigate to="/" replace />;
  }
  
  if (adminRequired && !isAdmin) {
    // Redirecionar para o dashboard normal se não for admin
    console.log("Acesso de admin necessário, redirecionando para dashboard");
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export default ProtectedRoute;