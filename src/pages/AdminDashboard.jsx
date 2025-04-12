import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Switch,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar as MuiToolbar,
  IconButton,
} from '@mui/material';
import {
  Check,
  Close,
  Warning,
  Block,
  Person,
  AttachMoney,
  Refresh,
  History,
  ExitToApp,
  Group,
  AccountBalance,
  PendingActions,
  ContentCopy, // Adicione esta importação
} from '@mui/icons-material';
// Verifique se a importação está correta
import { useTransactions } from '../contexts/TransactionContext';
import { useGroups } from '../contexts/GroupContext';
import api from '../services/api';

function AdminDashboard() {
  const navigate = useNavigate();
  
  // Declare todos os estados uma única vez
  // Corrigir a declaração duplicada de systemStats
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [blockReason, setBlockReason] = useState('');
    const [systemStats, setSystemStats] = useState({
      totalUsers: 0,
      activeGroups: 0,
      totalTransactions: 0,
      totalBalance: 0,
      pendingTransactions: 0,
      totalGroups: 0
    });
    const [users, setUsers] = useState([
      { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'active', groups: 3, totalBalance: 1500 },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'active', groups: 2, totalBalance: 2500 }
    ]);
    
    const { transactions, fetchTransactions, updateTransaction } = useTransactions();
    const { groups, fetchGroups, updateGroupBalance } = useGroups();

  // Função para buscar estatísticas
  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      if (response.data) {
        setSystemStats(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Adicione a função handleLogout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
    
    delete api.defaults.headers.common['Authorization'];
    delete api.defaults.headers.common['x-admin-access'];
    
    // Corrigir a URL de redirecionamento
    navigate('/admin-login');
  };

  // Adicione a função handleApproveTransaction
  // Modificar a função handleApproveTransaction
  const handleApproveTransaction = async (transactionId) => {
    try {
      const transaction = transactions.find(t => t._id === transactionId);
      
      console.log('Transação completa encontrada:', transaction);
      
      if (!transaction) {
        console.error('Transação não encontrada com ID:', transactionId);
        alert('Erro: Transação não encontrada');
        return;
      }
      
      if (transaction?.type === 'deposit') {
        const valorDeposito = Number(transaction.amount);
        
        // Verificar se o groupId é válido
        if (!transaction.groupId) {
          console.error('ID do grupo não encontrado na transação:', transaction);
          alert('Erro: ID do grupo não encontrado na transação');
          return;
        }
        
        console.log('Dados para atualização do grupo:', {
          groupId: transaction.groupId,
          valorDeposito,
          userId: transaction.userId,
          transactionId: transaction._id
        });
        
        // Atualizar grupo primeiro, passando o ID da transação
        const success = await updateGroupBalance(
          transaction.groupId,
          valorDeposito,
          transaction.userId,
          localStorage.getItem('token'),
          transaction._id
        );

        // Na função handleApproveTransaction
        if (success) {
          try {
            // Atualizar o status da transação usando a função updateTransaction do contexto
            console.log('Atualizando o status da transação:', transactionId);
            
            // Usar a função updateTransaction que já está disponível do contexto
            await updateTransaction(transactionId, { status: 'approved' });
            
            // Atualizar lista de transações
            await fetchTransactions(false);
            
            alert('Depósito aprovado com sucesso!');
          } catch (updateError) {
            console.error('Erro ao atualizar status da transação:', updateError);
            
            // Mesmo com erro, considerar a operação bem-sucedida
            // já que o saldo do grupo foi atualizado
            console.log('Ignorando erro de atualização de status e considerando operação bem-sucedida');
            alert('Depósito aprovado com sucesso! (O saldo foi atualizado, mas houve um erro ao atualizar o status da transação)');
          }
        } else {
          throw new Error('Falha ao atualizar o saldo do grupo');
        }
      }
    } catch (error) {
      console.error('Erro completo:', error);
      alert('Erro ao processar depósito: ' + error.message);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRejectTransaction = async (transactionId) => {
    await updateTransaction(transactionId, { status: 'rejected' });
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const confirmBlockUser = () => {
    setUsers(users.map(u => 
      u.id === selectedUser.id ? { ...u, status: 'blocked' } : u
    ));
    setOpenDialog(false);
    setSelectedUser(null);
    setBlockReason('');
  };

  // useEffect para autenticação
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin');
        
        if (!token || isAdmin !== 'true') {
          navigate('/admin/login');
          return;
        }
        
        // Verificação do perfil
        const adminProfile = await api.get('/auth/admin/profile');
        
        if (adminProfile.data?.isAdmin) {
          setIsAuthenticated(true);
          setIsLoading(false);
          await fetchAdminStats();
          await fetchTransactions();
        }
      } catch (error) {
        console.error('Erro no Dashboard:', error);
        navigate('/admin/login');
      }
    };

    checkAdminAuth();
  }, []);

  // Resto do componente permanece igual...
  
  return (
    <>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <MuiToolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">JuntaAI - Painel Administrativo</Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <ExitToApp />
          </IconButton>
        </MuiToolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        {/* Dashboard Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'primary.light', 
              color: 'white',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Group sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Usuários Totais</Typography>
                </Box>
                <Typography variant="h4">{systemStats.totalUsers}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'success.light', 
              color: 'white',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccountBalance sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Saldo Total</Typography>
                </Box>
                <Typography variant="h4">R$ {systemStats.totalBalance}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              bgcolor: 'warning.light', 
              color: 'white',
              transition: '0.3s',
              '&:hover': { transform: 'translateY(-5px)' }
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <PendingActions sx={{ fontSize: 40, mr: 2 }} />
                  <Typography variant="h6">Transações Pendentes</Typography>
                </Box>
                <Typography variant="h4">
                  {transactions.filter(t => t.status === 'pending').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ 
          bgcolor: 'background.paper', 
          borderRadius: 1,
          p: 3,
          boxShadow: 3
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            sx={{ 
              mb: 3,
              '& .MuiTab-root': { fontSize: '1rem' }
            }}
          >
            <Tab 
              label="Transações Pendentes" 
              icon={<PendingActions />} 
              iconPosition="start"
            />
            <Tab 
              label="Gerenciar Usuários" 
              icon={<Person />} 
              iconPosition="start"
            />
            <Tab 
              label="Histórico" 
              icon={<History />} 
              iconPosition="start"
            />
          </Tabs>

          {/* Tabelas existentes com novo estilo */}
          {tabValue === 0 && (
            <Table sx={{ 
              bgcolor: 'white',
              '& .MuiTableCell-root': { fontSize: '1rem' }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Usuário</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Código PIX</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions
                  .filter(transaction => transaction.status === 'pending')
                  .map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>
                        <Chip
                          label={transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          color={transaction.type === 'deposit' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>R$ {transaction.amount?.toFixed(2)}</TableCell>
                      <TableCell>
                        {/* Corrigido para acessar a propriedade name do objeto user */}
                        {transaction.userId?.name || transaction.userId || 'N/A'}
                      </TableCell>
                      <TableCell>{transaction.userEmail || 'N/A'}</TableCell>
                      <TableCell>
                        {/* Corrigido para acessar a propriedade name do objeto group */}
                        {transaction.groupId?.name || transaction.groupId || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {transaction.pixCode || 'N/A'}
                          {transaction.pixCode && (
                            <IconButton 
                              size="small" 
                              onClick={() => {
                                navigator.clipboard.writeText(transaction.pixCode);
                              }}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <Button
                          startIcon={<Check />}
                          color="success"
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleApproveTransaction(transaction._id)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          startIcon={<Close />}
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() => handleRejectTransaction(transaction._id)}
                        >
                          Rejeitar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}

          {/* Gerenciar Usuários */}
          {tabValue === 1 && (
            <Table sx={{ 
              bgcolor: 'white',
              '& .MuiTableCell-root': { fontSize: '1rem' }
            }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Grupos</TableCell>
                  <TableCell>Saldo Total</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.status === 'active' ? 'Ativo' : 'Bloqueado'}
                        color={user.status === 'active' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{user.groups}</TableCell>
                    <TableCell>R$ {user.totalBalance}</TableCell>
                    <TableCell>
                      <Button
                        startIcon={<Block />}
                        color="error"
                        variant="contained"
                        size="small"
                        onClick={() => handleBlockUser(user)}
                        disabled={user.status === 'blocked'}
                      >
                        Bloquear
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Dialog de confirmação de bloqueio */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
            <DialogTitle>Bloquear Usuário</DialogTitle>
            <DialogContent>
              <Typography gutterBottom>
                Tem certeza que deseja bloquear {selectedUser?.name}?
              </Typography>
              <TextField
                fullWidth
                label="Motivo do bloqueio"
                multiline
                rows={4}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                sx={{ mt: 2 }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
              <Button onClick={confirmBlockUser} color="error" variant="contained">
                Confirmar Bloqueio
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Container>
    </>
  );
}

export default AdminDashboard;