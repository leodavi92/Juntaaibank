const Transaction = require('../models/Transaction');
const Group = require('../models/Group');

const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Aprovando transação:', id);

    const transaction = await Transaction.findById(id);

    if (!transaction) {
      return res.status(404).json({ message: 'Transação não encontrada' });
    }

    if (transaction.type === 'deposit') {
      // Atualizar a contribuição do membro no grupo
      const group = await Group.findById(transaction.groupId);
      if (!group) {
        return res.status(404).json({ message: 'Grupo não encontrado' });
      }

      const memberIndex = group.members.findIndex(
        member => member.userId.toString() === transaction.userId.toString()
      );

      if (memberIndex !== -1) {
        // Converter os valores para número antes da soma
        const currentContribution = Number(group.members[memberIndex].contribution) || 0;
        const transactionAmount = Number(transaction.amount) || 0;
        
        group.members[memberIndex].contribution = currentContribution + transactionAmount;
        group.balance = Number(group.balance) + transactionAmount;
        await group.save();
      }
    }

    if (transaction.type === 'withdrawal') {
      const group = await Group.findById(transaction.groupId);
      if (!group) {
        return res.status(404).json({ message: 'Grupo não encontrado' });
      }
    
      const memberIndex = group.members.findIndex(
        member => member.userId.toString() === transaction.userId.toString()
      );
    
      if (memberIndex !== -1) {
        const currentContribution = Number(group.members[memberIndex].contribution) || 0;
        const transactionAmount = Number(transaction.amount) || 0;
    
        group.members[memberIndex].contribution = currentContribution - transactionAmount;
        group.balance = Number(group.balance) - transactionAmount;
        await group.save();
      }
    }

    transaction.status = 'approved';
    await transaction.save();

    res.json({ success: true, transaction });
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
};

module.exports = {
  approveTransaction
};