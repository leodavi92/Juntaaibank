import { Container, Paper, Typography, Switch, FormControlLabel, Box } from '@mui/material';

function Settings() {
  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>Configurações</Typography>
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Switch />}
            label="Receber notificações por email"
          />
        </Box>
      </Paper>
    </Container>
  );
}

export default Settings;