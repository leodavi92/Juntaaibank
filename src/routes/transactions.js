const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Rota para aprovar transação
router.put('/transactions/approve/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json({ message: 'Transação aprovada com sucesso', transaction });
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

module.exports = router;