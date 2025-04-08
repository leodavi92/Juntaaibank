const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authenticateUser = require('../middleware/auth');
const Transaction = require('../models/Transaction');

// Rota para listar transações
router.get('/', authenticateUser, async (req, res) => {
  try {
    const isAdmin = req.headers.isadmin === 'true';
    
    let transactions;
    if (isAdmin) {
      // Admin vê todas as transações
      transactions = await Transaction.find()
        .populate('userId', 'name email')
        .populate('groupId', 'name');
    } else {
      // Usuário normal vê apenas suas transações
      transactions = await Transaction.find({ userId: req.userId });
    }
    
    res.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: 'Erro ao buscar transações' });
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

module.exports = router;