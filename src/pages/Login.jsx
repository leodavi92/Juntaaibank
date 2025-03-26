import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography 
} from '@mui/material';

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Credenciais do administrador
    if (credentials.email === 'admin@juntaai.com' && credentials.password === 'admin123') {
      localStorage.setItem('adminToken', 'seu_token_seguro');
      navigate('/admin/dashboard');
      return;
    }

    // Login normal para usuários
    if (credentials.email && credentials.password) {
      navigate('/dashboard');
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          JuntaAIBank
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            name="email"
            margin="normal"
            required
            fullWidth
            label="Email"
            autoFocus
            type="email"
            autoComplete="email"
            value={credentials.email}
            onChange={handleChange}
          />
          <TextField
            name="password"
            margin="normal"
            required
            fullWidth
            label="Senha"
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={handleChange}
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

export default Login;