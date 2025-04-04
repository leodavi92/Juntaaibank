import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, TextField, Button, Typography, Card, CardContent, Alert } from '@mui/material';
import axios from 'axios';

function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/reset-password', {
        token,
        newPassword
      });

      setMessage('Senha atualizada com sucesso!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Erro ao redefinir senha');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ marginTop: 8 }}>
        <Card>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" sx={{ mb: 2 }}>
              Redefinir Senha
            </Typography>
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                type="password"
                label="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Redefinir Senha
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default ResetPassword;