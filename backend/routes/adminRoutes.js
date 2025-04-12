const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const Group = require('../models/Group');

// Usar o middleware de autenticação específico para admin em todas as rotas admin
router.use(adminAuth);

router.get('/dashboard', async (req, res) => {
  try {
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
    
    // Resto da lógica do dashboard
    res.json({
      success: true,
      message: 'Dashboard do administrador acessado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao acessar dashboard:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Rota para atualizar saldo do grupo
router.put('/groups/:groupId/balance', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { amount, userId } = req.body;

    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }

    // Atualizar saldo
    group.balance = (group.balance || 0) + Number(amount);
    
    // Verificar se o campo goal existe, se não, definir um valor padrão
    if (!group.goal) {
      group.goal = 0; // Definir um valor padrão para o campo goal
    }
    
    await group.save();

    res.json({ 
      success: true, 
      message: 'Saldo atualizado com sucesso',
      newBalance: group.balance 
    });
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Falha ao atualizar saldo do grupo' 
    });
  }
});

module.exports = router;