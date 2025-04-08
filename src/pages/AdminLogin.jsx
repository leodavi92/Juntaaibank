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
import axios from 'axios';

function AdminLogin() {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Para teste, usando credenciais fixas
      if (credentials.email === 'admin@juntaai.com' && credentials.password === 'admin123') {
        localStorage.setItem('adminToken', 'admin-token-test');
        navigate('/admin/dashboard'); // Alterado para a rota correta
        return;
      }

      const response = await axios.post('http://localhost:3001/api/admin/login', credentials);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        navigate('/admin/dashboard'); // Alterado para a rota correta
      }
    } catch (error) {
      setError('Credenciais inválidas');
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