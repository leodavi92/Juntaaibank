const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Rota para listar transações
router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para aprovar transação - CORRIGIDA
router.put('/admin/approve-transaction', async (req, res) => {
  try {
    const { _id, groupId, amount, type, user } = req.body;
    console.log('Dados recebidos para aprovação:', { _id, groupId, amount, type, user });

    // Buscar a transação usando o ID correto
    const transaction = await Transaction.findOne({ 
      $or: [
        { _id: _id },
        { id: _id }
      ]
    });
    
    if (!transaction) {
      console.log('Transação não encontrada:', _id);
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }

    // Atualizar status
    transaction.status = 'approved';
    transaction.updatedAt = new Date();
    const updatedTransaction = await transaction.save();

    // Atualizar o grupo (se existir)
    if (groupId) {
      const Group = require('../models/Group');
      const group = await Group.findOne({ nome: groupId });
      
      if (group) {
        console.log('Grupo encontrado:', group);
        console.log('Saldo atual:', group.saldoAtual);
        console.log('Valor a adicionar:', Number(amount));
        
        const novoSaldo = (group.saldoAtual || 0) + Number(amount);
        group.saldoAtual = novoSaldo;
        
        // Atualizar contribuição do membro
        if (group.membros && group.membros.length > 0) {
          group.membros = group.membros.map(membro => {
            if (membro.nome === user) {
              const novaContribuicao = (membro.contribuicao || 0) + Number(amount);
              return { ...membro, contribuicao: novaContribuicao };
            }
            return membro;
          });
        }
        
        await group.save();
        console.log('Grupo atualizado com novo saldo:', group.saldoAtual);
      } else {
        console.log('Grupo não encontrado:', groupId);
      }
    }

    console.log('Transação aprovada com sucesso:', updatedTransaction);
    res.json({
      success: true,
      message: 'Transação aprovada com sucesso',
      transaction: updatedTransaction
    });

  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao aprovar transação',
      error: error.message
    });
  }
});

// Rota para obter uma transação específica
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Rota para atualizar o status de uma transação
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    console.log('Atualizando status da transação:', req.params.id, 'para:', status);
    
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false,
        message: 'Transação não encontrada' 
      });
    }
    
    transaction.status = status;
    transaction.updatedAt = new Date();
    
    const updatedTransaction = await transaction.save();
    
    console.log('Transação atualizada com sucesso:', updatedTransaction);
    
    res.json({
      success: true,
      message: 'Status da transação atualizado com sucesso',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Erro ao atualizar status da transação:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erro ao atualizar status da transação',
      error: error.message
    });
  }
});

module.exports = router;