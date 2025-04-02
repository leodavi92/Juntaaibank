import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { API_URL } from '../config/api';

function EmailVerification({ open, onClose, email, onVerified }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async () => {
    try {
      const response = await fetch(`${API_URL}/api/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified();
        onClose();
      } else {
        setError('Código inválido');
      }
    } catch (error) {
      setError('Erro ao verificar código');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Verificação de Email</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom>
            Um código de verificação foi enviado para {email}
          </Typography>
          <TextField
            fullWidth
            label="Código de Verificação"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mt: 2 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleVerify} variant="contained" color="primary">
          Verificar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EmailVerification;