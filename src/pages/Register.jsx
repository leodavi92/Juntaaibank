import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Card, CardContent, Snackbar, Alert } from '@mui/material';
import axios from 'axios';

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageSeverity, setMessageSeverity] = useState('info');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('As senhas não coincidem.');
      setMessageSeverity('error');
      return;
    }
    try {
      // Substitua todas as ocorrências de http://192.168.1.102:3001 por http://localhost:3001
      // Por exemplo:
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      setMessage('Cadastro realizado com sucesso! Um email de verificação foi enviado para sua caixa de entrada.');
      setMessageSeverity('success');
      setTimeout(() => {
        navigate('/');
      }, 5000); // Aumentado para 5 segundos
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao cadastrar. Tente novamente.';
      setMessage(errorMessage);
      setMessageSeverity('error');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
              Cadastro
            </Typography>
            {message && (
              <Alert 
                severity={messageSeverity} 
                sx={{ 
                  mb: 2,
                  transition: 'opacity 0.5s',
                  opacity: 1,
                  animation: messageSeverity === 'success' ? 'fadeInOut 5s ease-in-out' : 'none'
                }}
              >
                {message}
              </Alert>
            )}
            <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Nome"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Senha"
                type="password"
                inputProps={{ minLength: 6 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Repetir Senha"
                type="password"
                inputProps={{ minLength: 6 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Cadastrar
              </Button>
              <Button
                fullWidth
                variant="outlined"
                sx={{ mt: 1 }}
                onClick={() => navigate('/')}
              >
                Voltar para Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default Register;

// Adicionar o estilo global para a animação
<style>
  {`
    @keyframes fadeInOut {
      0% { opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { opacity: 0; }
    }
  `}
</style>