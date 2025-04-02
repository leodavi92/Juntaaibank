import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

const Verify = () => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const email = params.get('email');

    console.log('Token:', token); // Debug
    console.log('Email:', email); // Debug

    if (!token || !email) {
      setStatus('error');
      setMessage('Link de verificação inválido');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('http://192.168.1.102:3001/api/verify-email', { // Ajuste para o endereço de rede
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ token, email })
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data); // Debug

        if (response.ok) {
          setStatus('success');
          setMessage('Email verificado com sucesso!');
          setTimeout(() => navigate('/'), 3000);
        } else {
          throw new Error(data.message || 'Erro ao verificar email');
        }
      } catch (error) {
        console.error('Erro:', error);
        setStatus('error');
        setMessage('Erro ao conectar com o servidor. Por favor, tente novamente.');
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      bgcolor: '#f5f5f5',
      p: 2
    }}>
      <Box sx={{ 
        maxWidth: 400, 
        width: '100%',
        p: 4,
        bgcolor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        textAlign: 'center'
      }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Verificação de Email</Typography>

        {status === 'loading' && (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography>Verificando seu email...</Typography>
          </>
        )}

        {status === 'success' && (
          <Alert severity="success">
            {message}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Redirecionando para o login...
            </Typography>
          </Alert>
        )}

        {status === 'error' && (
          <Alert severity="error">{message}</Alert>
        )}
      </Box>
    </Box>
  );
};

export default Verify;