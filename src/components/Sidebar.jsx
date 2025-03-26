import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Toolbar, Divider } from '@mui/material';
import { 
  Dashboard as DashboardIcon, 
  Group as GroupIcon, 
  AccountBalance, 
  Settings, 
  Logout 
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

function Sidebar({ open, setDrawerOpen }) {
  const navigate = useNavigate();

  const handleClose = () => {
    setDrawerOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  const handleLogout = () => {
    // Adicione aqui qualquer lógica de logout necessária (limpar tokens, etc)
    setDrawerOpen(false);
    navigate('/');
  };

  // No array menuItems, adicione:
  const menuItems = [
    { text: 'Início', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Grupos', icon: <GroupIcon />, path: '/grupos' },
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
            <ListItem 
              button 
              key={item.text}
              onClick={() => handleNavigation(item.path)} // Usa a nova função
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Divider />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <Logout sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Sair" sx={{ color: 'error.main' }} />
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
}

export default Sidebar;