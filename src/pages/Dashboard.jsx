import { Box, Container, Grid, Paper, Typography, Button, Card, CardContent } from '@mui/material';
import { Group, AccountBalance, TrendingUp, Add } from '@mui/icons-material';

function Dashboard() {
  // Dados mockados para exemplo
  const saldoTotal = 5000.00;
  const meusGrupos = [
    { id: 1, nome: "Viagem Família", saldo: 2500.00, membros: 4 },
    { id: 2, nome: "Reforma Casa", saldo: 1500.00, membros: 2 },
    { id: 3, nome: "Festa Formatura", saldo: 1000.00, membros: 8 }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Saldo Total */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AccountBalance sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">Saldo Total</Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              R$ {saldoTotal.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        {/* Botão Novo Grupo */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ width: '100%', height: '100%', minHeight: '100px' }}
            >
              Criar Novo Grupo
            </Button>
          </Paper>
        </Grid>

        {/* Total de Grupos */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Group sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6">Total de Grupos</Typography>
            <Typography variant="h4" sx={{ color: 'primary.main' }}>
              {meusGrupos.length}
            </Typography>
          </Paper>
        </Grid>

        {/* Lista de Grupos */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>Meus Grupos</Typography>
          <Grid container spacing={2}>
            {meusGrupos.map((grupo) => (
              <Grid item xs={12} md={4} key={grupo.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {grupo.nome}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Saldo: R$ {grupo.saldo.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Membros: {grupo.membros}
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                    >
                      Ver Detalhes
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;