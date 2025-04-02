import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Box
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import React, { useState, memo, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
// Remover temporariamente esta importação
// import { useAuth } from '../contexts/AuthContext';

import { 
  Face,
  EmojiEmotions,
  Pets,
  Sports,
  LocalFlorist,
  Star,
  Favorite,
  Mood,
  MusicNote,
  Palette
} from '@mui/icons-material';

// Adicione isto antes do componente Navbar
const iconComponents = {
  Face: Face,
  EmojiEmotions: EmojiEmotions,
  Pets: Pets,
  Sports: Sports,
  LocalFlorist: LocalFlorist,
  Star: Star,
  Favorite: Favorite,
  Mood: Mood,
  MusicNote: MusicNote,
  Palette: Palette
};

const Navbar = memo(function Navbar({ toggleDrawer }) {
  const { user } = useUser();
  
  // Limitar o log para uma única vez quando o usuário mudar
  useEffect(() => {
    if (user) {
      console.log('Dados do usuário na Navbar:', user);
    }
  }, [user]);
  
  // Se não receber toggleDrawer como prop, criar uma função vazia
  const handleToggleDrawer = toggleDrawer || (() => {
    console.log('Função toggleDrawer não foi fornecida');
  });
  
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchor, setNotificationAnchor] = useState(null);
  
  // Adicionar um console.log para depuração
  console.log('Dados do usuário na Navbar:', user);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationClick = (event) => {
    setNotificationAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClose = () => {
    setNotificationAnchor(null);
  };
  
  const handleLogout = () => {
    // Implementação direta do logout sem depender do contexto
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    navigate('/login');
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          onClick={handleToggleDrawer}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          JuntaAi Bank {user?.name ? `- Olá, ${user.name}` : ''}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton color="inherit" onClick={handleNotificationClick}>
            <Badge badgeContent={3} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={handleProfileClick}>
            <Avatar 
              sx={{ 
                bgcolor: user?.avatarData?.color || 'secondary.main',
                width: 40,
                height: 40
              }}
            >
              {user?.avatarData?.iconName ? React.createElement(iconComponents[user.avatarData.iconName]) : (user?.name?.[0] || '?')}
            </Avatar>
          </IconButton>
        </Box>

        {/* Menu de Notificações */}
        <Menu
          anchorEl={notificationAnchor}
          open={Boolean(notificationAnchor)}
          onClose={handleNotificationClose}
        >
          <MenuItem>Nova solicitação de saque</MenuItem>
          <MenuItem>Depósito confirmado</MenuItem>
          <MenuItem>Novo membro no grupo</MenuItem>
        </Menu>

        {/* Menu do Perfil */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={() => navigate('/perfil')}>Meu Perfil</MenuItem>
          <MenuItem onClick={() => navigate('/configuracoes')}>Configurações</MenuItem>
          <MenuItem onClick={handleLogout}>Sair</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
});

export default Navbar;