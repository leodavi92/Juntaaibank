import { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Avatar,
  LinearProgress,
  DialogContentText,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress
} from '@mui/material';
import { Add, Group as GroupIcon, AttachMoney, ContentCopy, Payment, Refresh } from '@mui/icons-material';
import { useTransactions } from '../contexts/TransactionContext';
import { useGroups } from '../contexts/GroupContext';  // Adicione este import

function Groups() {
  // Usar groups em vez de grupos para manter consistência com o contexto
  const { groups, loading, error, fetchGroups, criarGrupo } = useGroups();
  
  // Adicionar useEffect para debug
  useEffect(() => {
    console.log('Groups component - grupos recebidos do contexto:', groups);
  }, [groups]);
  
  // Adicione as funções de gerenciamento aqui
  const handleGerenciarOpen = (grupo) => {
    setGrupoSelecionado(grupo);
    setGerenciarOpen(true);
  };

  const handleGerenciarClose = () => {
    setGerenciarOpen(false);
    setGrupoSelecionado(null);
  };
  
  // Estados locais
  const [gerenciarOpen, setGerenciarOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [depositoOpen, setDepositoOpen] = useState(false);
  const [grupoSelecionado, setGrupoSelecionado] = useState(null);
  const [saqueOpen, setSaqueOpen] = useState(false);
  const [tipoSaque, setTipoSaque] = useState('individual');
  const [valorSaque, setValorSaque] = useState('');
  const [motivoSaque, setMotivoSaque] = useState('');
  const [novoGrupo, setNovoGrupo] = useState({
    nome: '',
    meta: '',
    descricao: ''
  });
  const [valorDeposito, setValorDeposito] = useState('');
  const [depositoStatus, setDepositoStatus] = useState('inicial');
  const [codigoPagamento, setCodigoPagamento] = useState('');
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateGroup = async () => {
    try {
      const novoGrupoData = {
        name: novoGrupo.nome,
        description: novoGrupo.descricao,
        goal: Number(novoGrupo.meta)
      };

      await criarGrupo(novoGrupoData);
      handleClose();
      setNovoGrupo({ nome: '', meta: '', descricao: '' });
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
    }
  };

  // Resto das funções de manipulação
  const handleSaque = (grupo) => {
    setGrupoSelecionado(grupo);
    setSaqueOpen(true);
  };

  const handleSaqueClose = () => {
    setSaqueOpen(false);
    setGrupoSelecionado(null);
    setTipoSaque('individual');
    setValorSaque('');
    setMotivoSaque('');
  };

  const solicitarSaque = () => {
    // Implementar lógica de saque com API
    console.log('Solicitando saque:', {
      grupoId: grupoSelecionado._id,
      valor: Number(valorSaque),
      tipo: tipoSaque,
      motivo: motivoSaque
    });
    
    // Fechar o diálogo após a solicitação
    handleSaqueClose();
    
    // Atualizar a lista de grupos
    fetchGroups();
  };

  const handleDeposito = (grupo) => {
    setGrupoSelecionado(grupo);
    setDepositoOpen(true);
  };

  const handleDepositoClose = () => {
    setDepositoOpen(false);
    setGrupoSelecionado(null);
  };

  const { addTransaction } = useTransactions();
  
  const realizarDeposito = () => {
    if (!valorDeposito || valorDeposito <= 0) {
      alert('Por favor, insira um valor válido');
      return;
    }
    
    const codigoPix = `PIX-${Math.random().toString(36).substr(2, 9)}`;
    setCodigoPagamento(codigoPix);
    setDepositoStatus('aguardando');
    
    // Adicionar a transação ao contexto
    addTransaction({
      type: 'deposit',
      amount: Number(valorDeposito),
      user: "Você",
      email: localStorage.getItem('userEmail') || "usuário atual",
      group: grupoSelecionado.name,
      pixCode: codigoPix
    });
  };

  // Função para atualizar manualmente os grupos
  const handleRefreshGroups = () => {
    fetchGroups();
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>Carregando grupos...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button 
          variant="contained" 
          startIcon={<Refresh />}
          onClick={handleRefreshGroups}
        >
          Tentar Novamente
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Meus Grupos</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />}
            onClick={handleRefreshGroups}
            sx={{ mr: 2 }}
          >
            Atualizar
          </Button>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={handleClickOpen}
          >
            Criar Novo Grupo
          </Button>
        </Box>
      </Box>

      {groups && groups.length > 0 ? (
        <Grid container spacing={3}>
          {groups.map((grupo) => (
            <Grid item xs={12} md={4} key={grupo._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {grupo.name}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Meta: R$ {grupo.goal || 0}
                    </Typography>
                    <Typography variant="body1" color="primary">
                      Saldo: R$ {grupo.balance || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {grupo.members && grupo.members.map((membro, index) => (
                      <Chip
                        key={membro.userId || index}
                        avatar={<Avatar>{membro.name ? membro.name[0] : '?'}</Avatar>}
                        label={`${membro.name || 'Membro'} - R$ ${membro.contribution || 0}`}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<AttachMoney />}
                    onClick={() => handleDeposito(grupo)}
                  >
                    Depositar
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<Payment />}
                    onClick={() => handleSaque(grupo)}
                  >
                    Sacar
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<GroupIcon />}
                    onClick={() => handleGerenciarOpen(grupo)}
                  >
                    Gerenciar
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você ainda não tem grupos. Crie um novo grupo para começar!
        </Alert>
      )}

      {/* Dialogs permanecem os mesmos */}
      {/* ... resto do código ... */}
    </Container>
  );
}

export default Groups;