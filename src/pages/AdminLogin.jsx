import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material';
import api from '../services/api';  // Corrija a importação do api

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('=== Iniciando processo de login admin ===');
      const response = await api.post('/auth/admin/login', credentials);
      console.log('Resposta do login:', response.data);
      
      const { token } = response.data;
      
      if (token) {
        const tokenParts = token.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const userId = payload.userId;
        
        console.log('Dados extraídos do token:', {
          userId,
          isAdmin: payload.isAdmin,
          exp: new Date(payload.exp * 1000).toLocaleString()
        });
        
        // Limpar localStorage antes de adicionar novos dados
        localStorage.clear();
        
        // Salvar dados no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userType', 'admin');
        localStorage.setItem('userId', userId);
        
        // Configurar headers globais do axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        api.defaults.headers.common['x-admin-access'] = 'true';
        
        console.log('Verificando localStorage após salvamento:', {
          token: !!localStorage.getItem('token'),
          isAdmin: localStorage.getItem('isAdmin'),
          userId: localStorage.getItem('userId'),
          userType: localStorage.getItem('userType')
        });

        // Verificar perfil admin
        try {
          console.log('Verificando perfil admin...');
          const userResponse = await api.get('/auth/admin/profile');
          console.log('Perfil admin carregado:', userResponse.data);
          
          if (userResponse.data) {
            console.log('✅ Login bem sucedido, redirecionando...');
            // Usar navigate ao invés de window.location
            navigate('/admin/dashboard');
          } else {
            throw new Error('Dados do perfil vazios');
          }
        } catch (profileError) {
          console.error('Erro ao carregar perfil:', {
            erro: profileError,
            status: profileError.response?.status,
            data: profileError.response?.data
          });
          throw profileError;
        }
      }
    } catch (error) {
      console.error('Erro no processo de login:', error);
      setError(error.response?.data?.message || 'Erro ao realizar login');
      // Limpar localStorage em caso de erro
      localStorage.clear();
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        mt: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography variant="h4" gutterBottom>
          Admin Login
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleLogin} sx={{ width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            autoFocus
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Entrar
          </Button>
        </Box>
      </Box>
    </Container>
  );
}

export default AdminLogin;