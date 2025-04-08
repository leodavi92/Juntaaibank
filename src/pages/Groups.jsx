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
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
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
    console.log('Grupo recebido:', grupo);
    setGrupoSelecionado(grupo);
    setDepositoOpen(true);
  };

  const handleDepositoClose = () => {
    // Primeiro fechamos o diálogo
    setDepositoOpen(false);
    // Depois de um pequeno delay, resetamos os outros estados
    setTimeout(() => {
      setGrupoSelecionado(null);
      setValorDeposito('');
      setDepositoStatus('inicial');
      setCodigoPagamento('');
    }, 200);
  };

  const { addTransaction } = useTransactions();
  
  const realizarDeposito = async () => {
    try {
      if (!valorDeposito || valorDeposito <= 0) {
        alert('Por favor, insira um valor válido');
        return;
      }

      if (!grupoSelecionado || !grupoSelecionado._id) {
        console.log('Grupo selecionado:', grupoSelecionado);
        alert('Erro: Grupo não selecionado corretamente');
        return;
      }
      
      const codigoPix = `PIX-${Math.random().toString(36).substr(2, 9)}`;
      
      const dadosTransacao = {
        type: 'deposit',
        amount: Number(valorDeposito),
        groupId: grupoSelecionado._id.toString(),
        pixCode: codigoPix,
        status: 'pending'
      };

      const resultado = await addTransaction(dadosTransacao);
      console.log('Resultado da transação:', resultado);

      if (resultado && resultado._id) {
        setCodigoPagamento(codigoPix);
        setDepositoStatus('aguardando');
        // Removido o fetchGroups daqui
      } else {
        throw new Error('Erro ao processar a transação: resposta inválida do servidor');
      }
    } catch (error) {
      console.error('Erro ao realizar depósito:', error);
      alert(`Erro ao realizar depósito: ${error.message || 'Erro desconhecido'}`);
      setDepositoStatus('inicial');
    }
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

      {/* Diálogo para criar novo grupo */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Criar Novo Grupo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Crie um grupo para compartilhar despesas e economizar com amigos, família ou colegas.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Grupo"
            fullWidth
            variant="outlined"
            value={novoGrupo.nome}
            onChange={(e) => setNovoGrupo({...novoGrupo, nome: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Meta (R$)"
            type="number"
            fullWidth
            variant="outlined"
            value={novoGrupo.meta}
            onChange={(e) => setNovoGrupo({...novoGrupo, meta: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={novoGrupo.descricao}
            onChange={(e) => setNovoGrupo({...novoGrupo, descricao: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleCreateGroup} variant="contained">Criar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para depósito */}
      <Dialog open={depositoOpen} onClose={handleDepositoClose}>
        <DialogTitle>Depositar no Grupo</DialogTitle>
        <DialogContent>
          {depositoStatus === 'inicial' ? (
            <>
              <DialogContentText>
                Quanto você deseja depositar no grupo {grupoSelecionado?.name}?
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                label="Valor (R$)"
                type="number"
                fullWidth
                variant="outlined"
                value={valorDeposito}
                onChange={(e) => setValorDeposito(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
            </>
          ) : (
            <>
              <DialogContentText>
                Use o código PIX abaixo para realizar o depósito:
              </DialogContentText>
              <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={codigoPagamento}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <IconButton onClick={() => {
                  navigator.clipboard.writeText(codigoPagamento);
                  alert('Código copiado para a área de transferência!');
                }}>
                  <ContentCopy />
                </IconButton>
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Após realizar o pagamento, o saldo do grupo será atualizado automaticamente.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          {depositoStatus === 'inicial' ? (
            <>
              <Button onClick={handleDepositoClose}>Cancelar</Button>
              <Button onClick={realizarDeposito} variant="contained">Gerar Código PIX</Button>
            </>
          ) : (
            <>
              <Button onClick={handleDepositoClose}>Fechar</Button>
              <Button 
                variant="contained" 
                onClick={async () => {
                  await fetchGroups(); // Espera a atualização terminar
                  handleDepositoClose(); // Só fecha depois
                }}
              >
                Concluído
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Diálogo para saque */}
      <Dialog open={saqueOpen} onClose={handleSaqueClose}>
        <DialogTitle>Sacar do Grupo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Quanto você deseja sacar do grupo {grupoSelecionado?.name}?
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Valor (R$)"
            type="number"
            fullWidth
            variant="outlined"
            value={valorSaque}
            onChange={(e) => setValorSaque(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start">R$</InputAdornment>,
            }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={tipoSaque === 'grupo'}
                onChange={(e) => setTipoSaque(e.target.checked ? 'grupo' : 'individual')}
              />
            }
            label="Saque para todo o grupo"
          />
          <TextField
            margin="dense"
            label="Motivo do saque"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={motivoSaque}
            onChange={(e) => setMotivoSaque(e.target.value)}
          />
          {tipoSaque === 'grupo' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              O valor será dividido igualmente entre todos os membros do grupo.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaqueClose}>Cancelar</Button>
          <Button onClick={solicitarSaque} variant="contained">Sacar</Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para gerenciar grupo */}
      <Dialog open={gerenciarOpen} onClose={handleGerenciarClose} maxWidth="md" fullWidth>
        <DialogTitle>Gerenciar Grupo: {grupoSelecionado?.name}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>Informações do Grupo</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nome do Grupo"
                  value={grupoSelecionado?.name || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Meta (R$)"
                  value={grupoSelecionado?.goal || 0}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Descrição"
                  value={grupoSelecionado?.description || ''}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>Membros do Grupo</Typography>
            <List>
              {grupoSelecionado?.members?.map((membro, index) => (
                <ListItem key={membro.userId || index}>
                  <ListItemAvatar>
                    <Avatar>{membro.name ? membro.name[0] : '?'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={membro.name || 'Membro'} 
                    secondary={`Contribuição: R$ ${membro.contribution || 0}`} 
                  />
                </ListItem>
              ))}
            </List>

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Convidar por e-mail"
                placeholder="Digite o e-mail do usuário"
                variant="outlined"
                // Implementar lógica de convite
              />
              <Button 
                variant="outlined" 
                sx={{ mt: 1 }}
                startIcon={<Add />}
              >
                Convidar
              </Button>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box>
            <Typography variant="h6" gutterBottom>Histórico de Transações</Typography>
            {/* Aqui você pode adicionar uma lista de transações do grupo */}
            <Alert severity="info">
              Funcionalidade de histórico de transações em desenvolvimento.
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGerenciarClose}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Groups;