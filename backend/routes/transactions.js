const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const authenticateUser = require('../middleware/auth');

router.get('/', authenticateUser, async (req, res) => {
  try {
    const isAdmin = req.headers['x-admin-access'] === 'true';
    console.log('Headers recebidos:', req.headers); // Debug
    console.log('Admin request:', isAdmin);
    console.log('User ID:', req.userId);
    console.log('Is Admin:', req.isAdmin);
    
    if (isAdmin && !req.isAdmin) {
      return res.status(403).json({ message: 'Acesso administrativo necessário' });
    }

    if (isAdmin) {
      const transactions = await Transaction.find()
        .populate('userId', 'name email')
        .populate('groupId', 'name');
      console.log('Transações encontradas:', transactions.length);
      res.json(transactions);
    } else {
      const transactions = await Transaction.find({ userId: req.userId })
        .populate('groupId', 'name');
      console.log('Transações do usuário encontradas:', transactions.length);
      res.json(transactions);
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({ message: 'Erro ao buscar transações', error: error.message });
  }
});

// Rota para criar transação
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { groupId, type, amount, pixCode } = req.body;
    
    console.log('Dados recebidos no backend:', req.body);

    // Validar groupId
    try {
      const objectId = new mongoose.Types.ObjectId(groupId);
      
      const transaction = new Transaction({
        userId: req.userId,
        groupId: objectId,
        type,
        amount,
        pixCode,
        status: 'pending'
      });

      const savedTransaction = await transaction.save();
      const populatedTransaction = await Transaction.findById(savedTransaction._id)
        .populate('userId', 'name email')
        .populate('groupId', 'name');

      console.log('Transação salva:', populatedTransaction);
      res.status(201).json(populatedTransaction);
    } catch (error) {
      return res.status(400).json({
        message: 'ID do grupo inválido',
        received: groupId,
        error: error.message
      });
    }
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({ 
      message: 'Erro ao criar transação',
      error: error.message 
    });
  }
});

// Rota para atualizar transação
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Verificar se é um admin
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Acesso administrativo necessário' });
    }

    // Validar ID da transação
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de transação inválido' });
    }

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name email').populate('groupId', 'name');

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({ message: 'Erro ao atualizar transação', error: error.message });
  }
});

module.exports = router;