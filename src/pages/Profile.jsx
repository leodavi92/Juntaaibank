import { 
  Container, Paper, Typography, Box, Avatar, Grid, Snackbar, Alert, CircularProgress,
  TextField, Button, Divider
} from '@mui/material';
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
import { useTheme } from '../contexts/ThemeContext';
import { NumericFormat, PatternFormat } from 'react-number-format';
import axios from 'axios';
import API_BASE_URL from '../config/api';

function Profile() {
  // Modificar esta linha para incluir updateUserProfile
  const { user, updateUserAfterLogin, updateUserProfile } = useUser();
  const { setPrimaryColor } = useTheme();
  
  // Adicionar os novos estados
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // Atualizar o estado personalInfo
  const [personalInfo, setPersonalInfo] = useState({
    phone: user?.phone || '',
    cpf: user?.cpf || '',
    birthDate: user?.birthDate || '',
    address: user?.address || ''
  });
  
  // Função para validar CPF
  const validateCPF = (cpf) => {
    // Remover caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');
    
    // Verificar se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = sum % 11;
    let digit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cpf.charAt(9)) !== digit) return false;
    
    // Validação do segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = sum % 11;
    digit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cpf.charAt(10)) !== digit) return false;
    
    return true;
  };
  
  // Adicionar a função que faltava
  // Na função handleUpdatePersonalInfo, modifique para:
  // In your Profile.jsx file, replace the handleUpdatePersonalInfo function with:
  
  const handleUpdatePersonalInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar se os dados são válidos
      if (!validateCPF(personalInfo.cpf)) {
        setError('CPF inválido. Por favor, verifique.');
        setLoading(false);
        return;
      }
      
      // Enviar dados para o servidor
      const updatedUser = await updateUserProfile({
        phone: personalInfo.phone,
        cpf: personalInfo.cpf,
        birthDate: personalInfo.birthDate,
        address: personalInfo.address
      });
      
      // Atualizar o estado local com os dados atualizados
      setPersonalInfo({
        phone: updatedUser.phone || '',
        cpf: updatedUser.cpf || '',
        birthDate: updatedUser.birthDate || '',
        address: updatedUser.address || ''
      });
      
      setSuccess('Informações pessoais atualizadas com sucesso!');
      
      // Aqui está o problema - linha 88 aproximadamente
      // Verificar se updatedUser é válido antes de acessar suas propriedades
      if (!updatedUser) {
        throw new Error('Resposta do servidor não contém dados do usuário');
      }
      
    } catch (error) {
      console.log('=== ERRO DETALHADO ===');
      console.log('Mensagem:', error.message);
      console.log('Stack:', error.stack);
      setError('Erro ao atualizar informações pessoais. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Na parte do JSX, substituir a Grid da biografia por endereço
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        label="Telefone"
        value={personalInfo.phone}
        onChange={(e) => setPersonalInfo({...personalInfo, phone: e.target.value})}
        disabled={!editing}
      />
    </Grid>
    <Grid item xs={12} sm={6}>
      <TextField
        fullWidth
        type="date"
        label="Data de Nascimento"
        value={personalInfo.birthDate}
        onChange={(e) => setPersonalInfo({...personalInfo, birthDate: e.target.value})}
        disabled={!editing}
        InputLabelProps={{ shrink: true }}
      />
    </Grid>
    <Grid item xs={12}>
      <TextField
        fullWidth
        label="Endereço"
        value={personalInfo.address}
        onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
        disabled={!editing}
        placeholder="Rua, número, complemento, cidade, estado"
      />
    </Grid>
  </Grid>
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Modificar este useEffect para carregar a cor do localStorage primeiro
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      const { avatarData } = JSON.parse(savedUserData);
      if (avatarData?.color) {
        setPrimaryColor(avatarData.color);
      }
    }
  }, []); // Este efeito roda apenas uma vez ao montar o componente
  
  // Remover o primeiro useEffect e manter apenas este
  useEffect(() => {
    if (user?.avatarData?.color) {
      setPrimaryColor(user.avatarData.color);
    }
  }, [user, setPrimaryColor]);
  
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

  // Remover esta primeira definição de avatarOptions e manter apenas a segunda
  // const avatarOptions = [
  //   { iconName: 'Face', icon: <Face />, color: '#8A05BE' }, // Avatar padrão Nubank
  //   { iconName: 'EmojiEmotions', icon: <EmojiEmotions />, color: '#FF6B6B' },
  //   { iconName: 'Pets', icon: <Pets />, color: '#45B7D1' },
  //   { iconName: 'Sports', icon: <Sports />, color: '#96CEB4' },
  //   { iconName: 'LocalFlorist', icon: <LocalFlorist />, color: '#FFAD60' },
  //   { iconName: 'Star', icon: <Star />, color: '#FFD93D' },
  //   { iconName: 'Favorite', icon: <Favorite />, color: '#FF8B8B' },
  //   { iconName: 'Mood', icon: <Mood />, color: '#98DFD6' },
  //   { iconName: 'MusicNote', icon: <MusicNote />, color: '#B983FF' },
  //   { iconName: 'Palette', icon: <Palette />, color: '#FF9F9F' }
  // ];
  
  // Manter apenas esta definição com cores mais vibrantes
  const avatarColors = [
    '#8A05BE', // Roxo do avatar padrão (mantido como está)
    '#d42626', // Vermelho mais intenso (atualizado)
    '#00C853', // Verde mais vibrante
    '#FF6D00', // Laranja mais intenso
    '#1605ff', // Azul mais vibrante (atualizado)
    '#ff0d63', // Rosa mais intenso (atualizado)
    '#FFEA00', // Amarelo mais vibrante
    '#00BFA5', // Verde-água mais intenso
    '#AA00FF', // Roxo mais intenso
    '#0d9fde', // Azul índigo mais intenso (atualizado)
  ];
  
  // Manter apenas esta definição de avatarOptions
  const avatarOptions = [
    { iconName: 'Face', icon: <Face />, color: '#8A05BE' }, // Avatar padrão Nubank (mantido)
    { iconName: 'EmojiEmotions', icon: <EmojiEmotions />, color: '#d42626' }, // Atualizado
    { iconName: 'Pets', icon: <Pets />, color: '#1605ff' }, // Atualizado
    { iconName: 'Sports', icon: <Sports />, color: '#00C853' },
    { iconName: 'LocalFlorist', icon: <LocalFlorist />, color: '#FF6D00' },
    { iconName: 'Star', icon: <Star />, color: '#FFEA00' },
    { iconName: 'Favorite', icon: <Favorite />, color: '#ff0d63' }, // Atualizado
    { iconName: 'Mood', icon: <Mood />, color: '#00BFA5' },
    { iconName: 'MusicNote', icon: <MusicNote />, color: '#AA00FF' },
    { iconName: 'Palette', icon: <Palette />, color: '#0d9fde' } // Atualizado
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
        const token = localStorage.getItem('token');
        
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
      const token = localStorage.getItem('token');
      
      if (!userId || !token) {
        throw new Error('Usuário não autenticado');
      }
      
      const avatarData = {
        iconName: avatar.iconName,
        color: avatar.color
      };
      
      // Salvar no MongoDB Atlas
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
      
      // Atualizar o contexto do usuário
      await updateUserAfterLogin();
      
      // Atualizar o tema
      setPrimaryColor(avatar.color);
      
      // Atualizar localStorage mantendo outros dados existentes
      const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...currentUserData,
        avatarData: avatarData
      }));
  
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
              bgcolor: user?.avatarData?.color || 'secondary.main',
              border: '3px solid #000000' // Adicionando borda preta
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
                  border: user?.avatarData?.color === avatar.color 
                    ? '3px solid #000000' 
                    : '2px solid rgba(0, 0, 0, 0.12)',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                    boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                  }
                }}
                onClick={() => handleAvatarSelect(avatar)}
              >
                {avatar.icon}
              </Avatar>
            </Grid>
          ))}
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Informações Pessoais</Typography>
            <Button 
              variant={editing ? "contained" : "outlined"}
              onClick={() => editing ? handleUpdatePersonalInfo() : setEditing(true)}
              color="primary"
            >
              {editing ? "Salvar" : "Editar"}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <PatternFormat
                format="###.###.###-##"
                customInput={TextField}
                value={personalInfo.cpf}
                onValueChange={(values) => setPersonalInfo({...personalInfo, cpf: values.value})}
                disabled={!editing}
                fullWidth
                label="CPF"
                placeholder="000.000.000-00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PatternFormat
                format="(##) #####-####"
                customInput={TextField}
                value={personalInfo.phone}
                onValueChange={(values) => setPersonalInfo({...personalInfo, phone: values.value})}
                disabled={!editing}
                fullWidth
                label="Telefone"
                placeholder="(00) 00000-0000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="Data de Nascimento"
                value={personalInfo.birthDate}
                onChange={(e) => setPersonalInfo({...personalInfo, birthDate: e.target.value})}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Endereço Completo"
                value={personalInfo.address}
                onChange={(e) => setPersonalInfo({...personalInfo, address: e.target.value})}
                disabled={!editing}
                placeholder="Rua, número, complemento, bairro, cidade, estado"
              />
            </Grid>
          </Grid>
        </Box>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default Profile;