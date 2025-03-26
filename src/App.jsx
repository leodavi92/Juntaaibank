import { Box, Toolbar } from '@mui/material';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from './theme';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import { useState } from 'react';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import { TransactionProvider } from './contexts/TransactionContext';
import { GroupProvider } from './contexts/GroupContext';

function App() {
  return (
    <GroupProvider>
      <TransactionProvider>
        <ThemeProvider theme={theme}>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </TransactionProvider>
    </GroupProvider>
  );
}

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const isLoginPage = location.pathname === '/';
  const isAdminPage = location.pathname.startsWith('/admin'); // Adicione esta linha

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      {!isLoginPage && !isAdminPage && <Navbar toggleDrawer={toggleDrawer} />}
      {!isLoginPage && !isAdminPage && <Sidebar open={drawerOpen} setDrawerOpen={setDrawerOpen} />}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {!isLoginPage && !isAdminPage && <Toolbar />}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grupos" element={<Groups />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } 
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;