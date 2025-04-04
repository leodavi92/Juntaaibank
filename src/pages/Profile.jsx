import { Container, Paper, Typography, Box, Avatar, Grid, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useState, useEffect } from 'react';
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
import { useUser } from '../contexts/UserContext';

// Alterar a linha de importação do contexto
function Profile() {
  // Mudar de updateUser para updateUserAfterLogin
  const { user, updateUserAfterLogin } = useUser();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Adicionar a definição do iconComponents aqui
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

  // Adicionar a definição do avatarOptions aqui
  const avatarOptions = [
    { iconName: 'Face', icon: <Face />, color: '#FF6B6B' },
    { iconName: 'EmojiEmotions', icon: <EmojiEmotions />, color: '#4ECDC4' },
    { iconName: 'Pets', icon: <Pets />, color: '#45B7D1' },
    { iconName: 'Sports', icon: <Sports />, color: '#96CEB4' },
    { iconName: 'LocalFlorist', icon: <LocalFlorist />, color: '#FFAD60' },
    { iconName: 'Star', icon: <Star />, color: '#FFD93D' },
    { iconName: 'Favorite', icon: <Favorite />, color: '#FF8B8B' },
    { iconName: 'Mood', icon: <Mood />, color: '#98DFD6' },
    { iconName: 'MusicNote', icon: <MusicNote />, color: '#B983FF' },
    { iconName: 'Palette', icon: <Palette />, color: '#FF9F9F' }
  ];

  // Adicionar useEffect para carregar dados do usuário se não estiverem disponíveis
  // No useEffect, alterar a linha do token
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Verificar se já temos os dados do usuário
        if (user?.name && user?.email) {
          console.log('Dados do usuário já carregados:', user);
          return;
        }
        
        setLoading(true);
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token'); // Alterado de 'userToken' para 'token'
        
        if (!userId || !token) {
          console.error('Usuário não autenticado');
          return;
        }
        
        console.log('Buscando dados do usuário do servidor...');
        const response = await fetch(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }
        
        const userData = await response.json();
        console.log('Dados recebidos do servidor:', userData);
        
        // Remover chamada duplicada e usar apenas updateUserAfterLogin
        await updateUserAfterLogin();
        
        // Atualizar localStorage com os dados necessários
        localStorage.setItem('userName', userData.name);
        localStorage.setItem('userData', JSON.stringify({
          email: userData.email,
          avatarData: userData.avatarData
        }));
        
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao carregar dados do perfil',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user, updateUserAfterLogin]);

  const handleAvatarSelect = async (avatar) => {
    try {
      setLoading(true);
      
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('token'); // Alterado de 'userToken' para 'token'
      
      console.log('Dados de autenticação:', { userId, token }); // Log para debug
      
      if (!userId || !token) {
        console.error('Dados ausentes:', { userId: !!userId, token: !!token });
        throw new Error('Usuário não autenticado');
      }
      
      const avatarData = {
        iconName: avatar.iconName,
        color: avatar.color
      };
      
      const response = await fetch(`http://localhost:3001/api/users/${userId}/avatar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ avatarData })
      });
  
      if (!response.ok) {
        throw new Error('Erro ao atualizar avatar');
      }
  
      const updatedUser = await response.json();
      
      // Usar apenas updateUserAfterLogin aqui também
      await updateUserAfterLogin();
      
      setSnackbar({
        open: true,
        message: 'Avatar atualizado com sucesso!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Erro ao atualizar avatar:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar avatar',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para renderizar o ícone do usuário
  const renderUserAvatar = () => {
    if (user?.avatarData?.iconName) {
      const IconComponent = iconComponents[user.avatarData.iconName];
      return IconComponent ? <IconComponent /> : user.name?.[0] || '?';
    }
    return user?.name?.[0] || '?';
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4, position: 'relative' }}>
        {loading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            zIndex: 1
          }}>
            <CircularProgress />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              mr: 3, 
              bgcolor: user?.avatarData?.color || 'secondary.main'
            }}
          >
            {renderUserAvatar()}
          </Avatar>
          <Box>
            <Typography variant="h4">{user?.name || 'Carregando...'}</Typography>
            <Typography color="text.secondary">{user?.email || 'Carregando...'}</Typography>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 2 }}>Escolha seu avatar</Typography>
        <Grid container spacing={2}>
          {avatarOptions.map((avatar, index) => (
            <Grid item key={index}>
              <Avatar
                sx={{ 
                  width: 60, 
                  height: 60, 
                  cursor: 'pointer',
                  bgcolor: avatar.color,
                  border: user?.avatarData?.color === avatar.color ? '2px solid #1976d2' : 'none',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s'
                  }
                }}
                onClick={() => handleAvatarSelect(avatar)}
              >
                {avatar.icon}
              </Avatar>
            </Grid>
          ))}
        </Grid>
      </Paper>
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Profile;