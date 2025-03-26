import { useState } from 'react';
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
  Alert
} from '@mui/material';
import { Add, Group as GroupIcon, AttachMoney, ContentCopy, Payment } from '@mui/icons-material';
import { useTransactions } from '../contexts/TransactionContext';
import { useGroups } from '../contexts/GroupContext';

function Groups() {
  const { grupos, setGrupos } = useGroups();
  const { transactions, addTransaction } = useTransactions(); // Certifique-se de que esta linha está presente apenas uma vez

  // Remova qualquer declaração duplicada de transactions ou addTransaction
  // Não deve haver outra linha como esta: const { transactions, addTransaction } = useTransactions();

  const handleGerenciarOpen = (grupo) => {
    setGrupoSelecionado(grupo);
    setGerenciarOpen(true);
  };

  const handleGerenciarClose = () => {
    setGerenciarOpen(false);
    setGrupoSelecionado(null);
  };

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

  const handleClickOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleCreateGroup = () => {
    const grupo = {
      id: grupos.length + 1,
      ...novoGrupo,
      saldoAtual: 0,
      membros: [{ id: 1, nome: "Você", contribuicao: 0 }],
      admin: true,
      saquesPendentes: []
    };
    setGrupos([...grupos, grupo]);
    handleClose();
    setNovoGrupo({ nome: '', meta: '', descricao: '' });
  };

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
    const gruposAtualizados = grupos.map(grupo => {
      if (grupo.id === grupoSelecionado.id) {
        if (tipoSaque === 'individual') {
          // Verifica se o valor não excede a contribuição individual
          const meuSaldo = grupo.membros.find(m => m.nome === "Você")?.contribuicao || 0;
          if (Number(valorSaque) > meuSaldo) {
            alert('Valor excede sua contribuição individual!');
            return grupo;
          }
          // Processa saque individual imediatamente
          return {
            ...grupo,
            saldoAtual: grupo.saldoAtual - Number(valorSaque),
            membros: grupo.membros.map(membro => 
              membro.nome === "Você"
                ? { ...membro, contribuicao: membro.contribuicao - Number(valorSaque) }
                : membro
            )
          };
        } else {
          // Adiciona solicitação de saque coletivo
          return {
            ...grupo,
            saquesPendentes: [...grupo.saquesPendentes, {
              id: Date.now(),
              valor: Number(valorSaque),
              motivo: motivoSaque,
              solicitante: "Você",
              aprovacoes: 0,
              totalMembros: grupo.membros.length,
              status: 'pendente'
            }]
          };
        }
      }
      return grupo;
    });

    setGrupos(gruposAtualizados);
    handleSaqueClose();
  };

  const handleDeposito = (grupo) => {
    const depositoPendente = transactions.find(t => 
      t.status === 'pending' && 
      t.type === 'deposit' && 
      t.group === grupo.nome &&
      t.user === "Você"
    );

    if (depositoPendente) {
      setGrupoSelecionado(grupo);
      setValorDeposito(depositoPendente.amount);
      setCodigoPagamento(depositoPendente.pixCode);
      setDepositoStatus('aguardando');
      setDepositoOpen(true);
      return;
    }

    setGrupoSelecionado(grupo);
    setDepositoOpen(true);
    setDepositoStatus('inicial');
    setValorDeposito('');
    setCodigoPagamento('');
  };

  const realizarDeposito = () => {
      if (!valorDeposito || valorDeposito <= 0) {
          alert('Por favor, insira um valor válido');
          return;
      }
      
      const hasPendingDeposit = transactions.some(t => 
          t.status === 'pending' && 
          t.type === 'deposit' && 
          t.group === grupoSelecionado.nome &&
          t.user === "Você"
      );
  
      if (hasPendingDeposit) {
          alert('Você já tem um depósito pendente. Aguarde a confirmação.');
          return;
      }
  
      const codigoPix = `PIX-${Math.random().toString(36).substr(2, 9)}`;
      setCodigoPagamento(codigoPix);
      setDepositoStatus('aguardando');
      
      addTransaction({
          type: 'deposit',
          amount: Number(valorDeposito),
          user: "Você",
          email: "teste@teste.com",
          group: grupoSelecionado.nome,
          pixCode: codigoPix,
          status: 'pending'
      });
  };

  const handleDepositoClose = () => {
    setDepositoOpen(false);
    setGrupoSelecionado(null);
  };

  const [valorDeposito, setValorDeposito] = useState('');

  const [depositoStatus, setDepositoStatus] = useState('inicial');
  const [codigoPagamento, setCodigoPagamento] = useState('');
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Meus Grupos</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={handleClickOpen}
        >
          Criar Novo Grupo
        </Button>
      </Box>

      <Grid container spacing={3}>
        {grupos.map((grupo) => (
          <Grid item xs={12} md={4} key={grupo.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {grupo.nome}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Meta: R$ {grupo.meta}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    Saldo: R$ {grupo.saldoAtual}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {grupo.membros.map((membro) => (
                    <Chip
                      key={membro.id}
                      avatar={<Avatar>{membro.nome[0]}</Avatar>}
                      label={`${membro.nome} - R$ ${membro.contribuicao}`}
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

      <Dialog 
        open={gerenciarOpen} 
        onClose={handleGerenciarClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Gerenciar Grupo
          {grupoSelecionado && ` - ${grupoSelecionado.nome}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Informações Gerais</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Meta</Typography>
                <Typography>R$ {grupoSelecionado?.meta}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Saldo Atual</Typography>
                <Typography>R$ {grupoSelecionado?.saldoAtual}</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle2">Progresso</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(grupoSelecionado?.saldoAtual / grupoSelecionado?.meta) * 100} 
                  sx={{ mt: 1 }}
                />
              </Grid>
            </Grid>
      
            <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Histórico de Transações</Typography>
            <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
              {/* Aqui você pode adicionar uma tabela com o histórico */}
            </Box>

            {grupoSelecionado?.saquesPendentes?.length > 0 && (
              <>
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>Saques Pendentes</Typography>
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {grupoSelecionado.saquesPendentes.map(saque => (
                    <Alert 
                      key={saque.id}
                      severity="warning"
                      sx={{ mb: 1 }}
                    >
                      Solicitação de {saque.solicitante}: R$ {saque.valor}
                      <br />
                      Motivo: {saque.motivo}
                    </Alert>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleGerenciarClose}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={depositoOpen} onClose={handleDepositoClose}>
        <DialogTitle>Realizar Depósito</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Informe o valor que deseja depositar no grupo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Valor do Depósito"
            type="number"
            fullWidth
            value={valorDeposito}
            onChange={(e) => setValorDeposito(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDepositoClose}>Cancelar</Button>
          <Button onClick={realizarDeposito}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={saqueOpen} onClose={handleSaqueClose}>
        <DialogTitle>Realizar Saque</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Informe o valor e o motivo do saque.
          </DialogContentText>
          <FormControlLabel
            control={
              <Switch
                checked={tipoSaque === 'coletivo'}
                onChange={(e) => setTipoSaque(e.target.checked ? 'coletivo' : 'individual')}
              />
            }
            label="Saque Coletivo"
          />
          <TextField
            margin="dense"
            label="Valor do Saque"
            type="number"
            fullWidth
            value={valorSaque}
            onChange={(e) => setValorSaque(e.target.value)}
          />
          {tipoSaque === 'coletivo' && (
            <TextField
              margin="dense"
              label="Motivo do Saque"
              fullWidth
              value={motivoSaque}
              onChange={(e) => setMotivoSaque(e.target.value)}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaqueClose}>Cancelar</Button>
          <Button onClick={solicitarSaque}>Confirmar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Criar Novo Grupo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Preencha as informações para criar um novo grupo.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Grupo"
            fullWidth
            value={novoGrupo.nome}
            onChange={(e) => setNovoGrupo({ ...novoGrupo, nome: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Meta (R$)"
            type="number"
            fullWidth
            value={novoGrupo.meta}
            onChange={(e) => setNovoGrupo({ ...novoGrupo, meta: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            value={novoGrupo.descricao}
            onChange={(e) => setNovoGrupo({ ...novoGrupo, descricao: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleCreateGroup}>Criar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={depositoStatus === 'aguardando'}>
        <DialogTitle>Confirmação de Depósito</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Importante: Guarde o código PIX para rastreamento do seu depósito.
          </Alert>
          <Alert severity="warning" sx={{ mb: 2 }}>
            O valor será creditado após a confirmação do pagamento.
          </Alert>
          <DialogContentText>
            Use o código PIX abaixo para realizar o depósito:
          </DialogContentText>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <TextField
              fullWidth
              value={codigoPagamento}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => navigator.clipboard.writeText(codigoPagamento)}>
                      <ContentCopy />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Valor do depósito: R$ {valorDeposito}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDepositoStatus('inicial');
            handleDepositoClose();
            setValorDeposito('');
          }}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default Groups;