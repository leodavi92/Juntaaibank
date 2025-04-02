const Transaction = require('../models/Transaction');

const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Aprovando transação:', id);

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  approveTransaction
};