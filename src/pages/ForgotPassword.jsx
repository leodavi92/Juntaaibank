import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setMessage('Instruções de recuperação foram enviadas para seu email!');
      } else {
        throw new Error(data.message || 'Erro ao processar a solicitação');
      }
    } catch (error) {
      setError(error.message || 'Erro ao processar a solicitação');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>Recuperar Senha</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {!success ? (
        <>
          <TextField
            fullWidth
            margin="normal"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Enviar Instruções
          </Button>
        </>
      ) : (
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate('/')}
          sx={{ mt: 3 }}
        >
          Voltar para Login
        </Button>
      )}

      <Box sx={{ textAlign: 'center' }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
        >
          Voltar para Login
        </Link>
      </Box>
    </Box>
  );
};

export default ForgotPassword;