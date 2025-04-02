import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

function EmailVerified() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("EmailVerified component mounted");
    console.log("Token from params:", token);
    
    const params = new URLSearchParams(location.search);
    const successParam = params.get('success');
    console.log("Success param from URL:", successParam);
    
    // Se já temos o parâmetro success=true na URL, não precisamos fazer a requisição
    if (successParam === 'true') {
      console.log("Verificação já realizada com sucesso via parâmetro URL");
      setSuccess(true);
      setLoading(false);
      return;
    }
    
    async function verifyEmail() {
      // Se temos um token nos parâmetros, precisamos verificar o email
      if (token) {
        console.log("Verificando token:", token);
        try {
          // Fazer a requisição para verificar o email
          const response = await axios.get(`http://localhost:3001/api/verify-email/${token}`);
          console.log("Resposta da verificação:", response.data);
          setSuccess(true);
        } catch (error) {
          console.error("Erro na verificação:", error);
          if (error.response) {
            console.log("Status do erro:", error.response.status);
            console.log("Dados do erro:", error.response.data);
            setError(error.response.data.message || 'Erro ao verificar email');
          } else {
            setError('Erro ao verificar email. Tente novamente mais tarde.');
          }
        }
      } else {
        // Caso contrário, algo está errado
        console.log("Nenhum token ou parâmetro de sucesso encontrado");
        setError('Link de verificação inválido ou expirado');
      }
      
      setLoading(false);
    }
    
    verifyEmail();
  }, [token, location]);

  const handleGoToLogin = () => {
    console.log("Redirecionando para login");
    navigate('/login?verified=true');
  };

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Verificando seu email...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {success ? (
          <>
            <Typography variant="h4" color="primary" gutterBottom>
              Email Verificado!
            </Typography>
            <Typography variant="body1" paragraph>
              Seu email foi verificado com sucesso. Agora você pode fazer login na sua conta.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGoToLogin}
              sx={{ mt: 2 }}
            >
              Ir para Login
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" color="error" gutterBottom>
              Erro na Verificação
            </Typography>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || 'Ocorreu um erro ao verificar seu email.'}
            </Alert>
            <Typography variant="body1" paragraph>
              Por favor, tente novamente ou entre em contato com o suporte.
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleGoToLogin}
              sx={{ mt: 2 }}
            >
              Ir para Login
            </Button>
          </>
        )}
      </Paper>
    </Container>
  );
}

export default EmailVerified;