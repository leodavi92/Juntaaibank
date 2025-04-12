import { useState, useEffect } from 'react';
import { Box, Container, Grid, Paper, Typography, Button, Card, CardContent, Avatar, Tooltip } from '@mui/material';
import { Group, AccountBalance, TrendingUp, Add } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { API_URLS } from '../config/api';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [grupos, setGrupos] = useState([]);
  const [saldoTotal, setSaldoTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const carregarGrupos = async () => {
      try {
        // Corrigindo a forma de obter o token (localStorage.getItem('token') em vez de 'userToken')
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        console.log('Token:', token);
        console.log('UserId:', userId);
        
        if (!token) {
          console.log('Token não encontrado, redirecionando para login');
          navigate('/login');
          return;
        }

        console.log('Fazendo requisição para buscar grupos');
        const response = await axios.get('http://localhost:3001/api/groups', {
          headers: { 
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Dentro da função carregarGrupos
        console.log('Resposta da API:', response.data);
        console.log('Estrutura do primeiro grupo:', response.data[0]);
        console.log('Membros do primeiro grupo:', response.data[0]?.members);
        
        if (response.data) {
          setGrupos(response.data);
          // Verificando se o grupo tem a propriedade balance antes de somar
          const total = response.data.reduce((acc, grupo) => {
            const balance = grupo.balance || 0;
            return acc + balance;
          }, 0);
          setSaldoTotal(total);
        }
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar grupos:', error);
        if (error.response && error.response.status === 401) {
          console.log('Token inválido ou expirado, redirecionando para login');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          navigate('/login');
        }
        setError('Erro ao carregar grupos. Por favor, tente novamente.');
        setLoading(false);
      }
    };

    carregarGrupos();
  }, [navigate]);

  const handleCriarGrupo = () => {
    navigate('/criar-grupo');
  };

  const handleVerDetalhes = (grupoId) => {
    navigate(`/grupo/${grupoId}`);
  };

  // Removendo a função fetchGroups duplicada que não está sendo usada
  
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mt: 2 }}
        >
          Tentar novamente
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Olá, {user?.name || localStorage.getItem('userName') || 'Usuário'}!
      </Typography>
      
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
              onClick={handleCriarGrupo}
            >
              Criar Novo Grupo
            </Button>
          </Paper>
        </Grid>

        {/* Lista de Grupos atualizada */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mb: 2 }}>Meus Grupos</Typography>
          {grupos.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
              Você ainda não tem grupos. Crie um novo grupo para começar!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {grupos.map((grupo) => (
                <Grid item xs={12} md={4} key={grupo._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {grupo.name}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Saldo: R$ {(grupo.balance || 0).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Membros: {grupo.members.length}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                        {grupo.members.map((member, index) => {
                          console.log('Dados do membro:', member);
                          // Usar os dados do usuário atual se o ID corresponder
                          const isCurrentUser = member.userId === user?._id;
                          const memberName = isCurrentUser ? user.name : 'Usuário';
                          const avatarColor = isCurrentUser && user.avatarData?.color;
                          
                          return (
                            <Tooltip key={index} title={memberName}>
                              <Avatar
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: avatarColor || 'primary.main' 
                                }}
                              >
                                {memberName.charAt(0)}
                              </Avatar>
                            </Tooltip>
                          );
                        })}
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{ mt: 2 }}
                        onClick={() => handleVerDetalhes(grupo._id)}
                      >
                        Ver Detalhes
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;