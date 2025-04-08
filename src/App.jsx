import { Box, Toolbar } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import { useState, useEffect } from 'react'; // Adicionando useEffect
// Remover esta linha duplicada
// import { Routes, Route } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { GroupProvider } from './contexts/GroupContext';
import { TransactionProvider } from './contexts/TransactionContext';
import PasswordRecovery from './pages/PasswordRecovery';
import Register from './pages/Register';
import EmailVerified from './pages/EmailVerified';
import ResetPassword from './pages/ResetPassword';
import { UserProvider } from './contexts/UserContext';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
// Remover a importação duplicada do UserProvider

function App() {
  return (
    <BrowserRouter>
      <ThemeContextProvider>
        <UserProvider>
          <AuthProvider>
            <GroupProvider>
              <TransactionProvider>
                <Routes>
                  {/* Rotas Admin */}
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route 
                    path="/admin/dashboard" 
                    element={
                      <ProtectedAdminRoute>
                        <AdminDashboard />
                      </ProtectedAdminRoute>
                    } 
                  />
                  
                  {/* Rotas do Usuário */}
                  <Route path="/*" element={<AppContent />} />
                </Routes>
              </TransactionProvider>
            </GroupProvider>
          </AuthProvider>
        </UserProvider>
      </ThemeContextProvider>
    </BrowserRouter>
  );
}

// Novo componente para o layout admin
function AdminLayout() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/dashboard" element={
        <ProtectedAdminRoute>
          <AdminDashboard />
        </ProtectedAdminRoute>
      } />
    </Routes>
  );
}

// AppContent agora só contém rotas de usuário
function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  
  const isAuthPage = [
    '/login', 
    '/register', 
    '/password-recovery', 
    '/email-verified',
  ].includes(location.pathname) || 
    location.pathname.startsWith('/verify-email/') ||
    location.pathname.startsWith('/reset-password/');

  // Adicionar um efeito para lidar com redirecionamentos da API
  useEffect(() => {
    // Verificar se há um parâmetro de verificação na URL
    const params = new URLSearchParams(location.search);
    if (params.get('success') === 'true') {
      // Se o email foi verificado, mostrar mensagem de sucesso
      // Não precisamos redirecionar aqui, pois já estamos na página correta
      console.log('Email verificado com sucesso!');
    }
  }, [location]);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {!isAuthPage && <Navbar toggleDrawer={toggleDrawer} />}
      {!isAuthPage && <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} />}
      
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {!isAuthPage && <Toolbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-recovery" element={<PasswordRecovery />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<EmailVerified />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/perfil" element={<Profile />} />
          <Route path="/configuracoes" element={<Settings />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Box>
    </Box>
  );
}

// Remover o componente AdminRoute antigo pois agora usamos o ProtectedAdminRoute

export default App;