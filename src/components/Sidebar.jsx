import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Box, Toolbar, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Group as GroupIcon, 
  AccountBalance, 
  Settings, 
  Logout 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adicionar esta importação
import React from 'react'; // Adicionar para usar React.createElement

const drawerWidth = 240;

function Sidebar({ open, toggleDrawer }) {
  const navigate = useNavigate();
  const { user, logout: authLogout } = useAuth(); // Obter usuário e função de logout do contexto
  
  const handleClose = () => {
    toggleDrawer();
  };

  const handleNavigation = (path) => {
    navigate(path);
    toggleDrawer();
  };

  const handleLogout = () => {
    // Usar a função de logout do contexto de autenticação
    authLogout();
    toggleDrawer();
    navigate('/');
  };

  // No array menuItems, adicione:
  const menuItems = [
    { text: 'Início', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Grupos', icon: <GroupIcon />, path: '/groups' },
    { text: 'Finanças', icon: <AccountBalance />, path: '/financas' },
    { text: 'Configurações', icon: <Settings />, path: '/configuracoes' },
  ];

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={handleClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <List>
          {menuItems.map((item) => (
            <ListItemButton 
              key={item.text}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <Logout sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Sair" sx={{ color: 'error.main' }} />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;