import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import axios from 'axios';
import { Container, Paper, Typography, Avatar, Box, CircularProgress, Alert, Button } from '@mui/material';
import { Person, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, loading: contextLoading } = useUser();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Verificar se temos token e userId no localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        console.log('Token disponível:', !!token);
        console.log('UserId disponível:', !!userId);
        
        if (!token || !userId) {
          console.log('Token ou userId não encontrados no localStorage');
          setError('Usuário não autenticado. Faça login novamente.');
          setLoading(false);
          return;
        }
        
        console.log('Buscando perfil do usuário:', userId);
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Dados do perfil recebidos:', response.data);
        setProfileData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar perfil:', err);
        
        // Verificar se é um erro de autenticação
        if (err.response && err.response.status === 401) {
          console.log('Token expirado ou inválido');
          setError('Sessão expirada. Por favor, faça login novamente.');
          // Limpar dados de autenticação
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        } else {
          setError('Erro ao carregar dados do perfil: ' + (err.response?.data?.message || err.message));
        }
        
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    window.location.reload();
  };

  if (loading || contextLoading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Carregando perfil...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleLogin}
          >
            Fazer Login
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={handleRefresh}
          >
            Tentar Novamente
          </Button>
        </Box>
      </Container>
    );
  }

  // Usar dados do profileData (API) ou fallback para user do contexto
  const userData = profileData || user;

  if (!userData) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="warning">Usuário não encontrado</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', mb: 2 }}>
            <Person fontSize="large" />
          </Avatar>
          <Typography variant="h4" gutterBottom>
            {userData.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {userData.email}
          </Typography>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Informações da Conta
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">ID da Conta:</Typography>
            <Typography variant="body1" color="text.secondary">
              {userData._id}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">Status:</Typography>
            <Typography 
              variant="body1" 
              color={userData.verified ? "success.main" : "error.main"}
            >
              {userData.verified ? "Verificado" : "Não verificado"}
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Profile;