import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Card, CardContent, Alert } from '@mui/material';

function PasswordRecovery() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRecovery = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://192.168.1.102:3001/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: 'Email de recuperação enviado! Verifique sua caixa de entrada.'
        });
        setTimeout(() => navigate('/'), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.message || 'Erro ao enviar email de recuperação'
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao conectar com o servidor'
      });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ minWidth: 275, boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
              Recuperar Senha
            </Typography>
            {message.text && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}
            <Box component="form" onSubmit={handleRecovery} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                label="Email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Recuperar Senha
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

export default PasswordRecovery;