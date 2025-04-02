import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Card, CardContent, Snackbar, Alert } from '@mui/material';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUserAfterLogin } = useUser();

  // Adicionar useEffect para verificar parâmetros na URL e logs
  useEffect(() => {
    console.log("Login component mounted");
    
    // Verificar se há parâmetros na URL
    const params = new URLSearchParams(location.search);
    const verificationStatus = params.get('verified');
    
    if (verificationStatus === 'true') {
      console.log("Email verificado com sucesso via parâmetro URL");
      setMessage("Email verificado com sucesso! Faça login para continuar.");
      setMessageSeverity("success");
    }
    
    // Verificar se há um email salvo no localStorage para pré-preencher
    const savedEmail = localStorage.getItem('lastEmail');
    if (savedEmail) {
      console.log("Email pré-preenchido do localStorage:", savedEmail);
      setEmail(savedEmail);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log('Tentando fazer login com:', email);
      const response = await axios.post('http://localhost:3001/api/login', { email, password });
      
      // Verificar se o token está presente na resposta
      if (!response.data.token) {
        console.error('Token não encontrado na resposta:', response.data);
        setError('Erro no login: token não recebido');
        setMessage('Erro no login: token não recebido');
        setMessageSeverity('error');
        return;
      }
      
      // Armazenar token e informações do usuário
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);
      localStorage.setItem('userName', response.data.name);
      
      console.log('Login bem-sucedido. Token:', response.data.token);
      console.log('UserId:', response.data.userId);
      
      // Atualizar o contexto do usuário
      await updateUserAfterLogin();
      
      // Mostrar mensagem de sucesso
      setSnackbarMessage('Login realizado com sucesso!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Redirecionar para o dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Detalhes do erro:', error);
      
      // Verificar a mensagem específica de erro
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
        setMessage(error.response.data.message);
        setMessageSeverity('error');
      } else {
        setError('Erro ao fazer login. Tente novamente.');
        setMessage('Erro ao fazer login. Tente novamente.');
        setMessageSeverity('error');
      }
    }
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    // Resto do componente permanece o mesmo
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
              JuntaAIbank - Login
            </Typography>
            {message && (
              <Alert severity={messageSeverity} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Entrar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => navigate('/register')}
              >
                Cadastre-se
              </Button>
              <Button
                fullWidth
                variant="text"
                sx={{ mt: 1 }}
                onClick={() => navigate('/password-recovery')}
              >
                Recuperar Senha
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;