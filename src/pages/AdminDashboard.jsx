import { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Adicionar este import
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
} from '@mui/icons-material';
import { useTransactions } from '../contexts/TransactionContext';
import { useGroups } from '../contexts/GroupContext';

function AdminDashboard() {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockReason, setBlockReason] = useState('');

  // Primeiro, remova setTransactions do useTransactions
  const { transactions, updateTransaction } = useTransactions();
  const { grupos, updateGroupBalance } = useGroups();

  const handleApproveTransaction = async (transactionId) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      
      if (transaction?.type === 'deposit') {
        const valorDeposito = Number(transaction.amount);
        
        // Atualizar grupo primeiro
        const success = await updateGroupBalance(
          transaction.group,
          valorDeposito,
          transaction.user
        );

        if (success) {
          // Atualizar transação
          await updateTransaction(transactionId, { status: 'approved' });
          
          // Atualizar o estado local das transações
          const updatedTransactions = transactions.map(t => 
            t.id === transactionId ? { ...t, status: 'approved' } : t
          );
          
          // Forçar uma re-renderização do componente
          setTabValue(tabValue);
        } else {
          alert('Erro ao atualizar o saldo do grupo');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar depósito');
    }
  };

  const [users, setUsers] = useState([
    { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'active', groups: 3, totalBalance: 1500 },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'active', groups: 2, totalBalance: 2500 }
  ]);

  const [systemStats, setSystemStats] = useState({
    totalUsers: 150,
    activeGroups: 45,
    totalTransactions: 1250,
    totalBalance: 75000
  });

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

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

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
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <Chip
                          label={transaction.type === 'deposit' ? 'Depósito' : 'Saque'}
                          color={transaction.type === 'deposit' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>R$ {transaction.amount}</TableCell>
                      <TableCell>{transaction.user}</TableCell>
                      <TableCell>{transaction.email}</TableCell>
                      <TableCell>{transaction.group}</TableCell>
                      <TableCell>{transaction.pixCode}</TableCell>
                      <TableCell>{transaction.date}</TableCell>
                      <TableCell>
                        <Button
                          startIcon={<Check />}
                          color="success"
                          variant="contained"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => handleApproveTransaction(transaction.id)}
                        >
                          Aprovar
                        </Button>
                        <Button
                          startIcon={<Close />}
                          color="error"
                          variant="outlined"
                          size="small"
                          onClick={() => handleRejectTransaction(transaction.id)}
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