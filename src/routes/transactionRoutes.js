router.post('/transactions', auth, async (req, res) => {
  try {
    console.log('Dados recebidos no backend:', req.body);
    
    // Extrair explicitamente todos os campos
    const transactionData = {
      userId: req.user.id,
      groupId: req.body.groupId,
      type: req.body.type,
      amount: req.body.amount,
      status: req.body.status,
      pixCode: req.body.pixCode,
      accountHolderName: req.body.accountHolderName,
      bankName: req.body.bankName,
      motivo: req.body.motivo || '',
      withdrawalType: req.body.withdrawalType
    };

    console.log('Dados formatados para salvar:', transactionData);
    
    const transaction = new Transaction(transactionData);
    const savedTransaction = await transaction.save();
    
    // Verificar se os dados foram salvos corretamente
    const verifiedTransaction = await Transaction.findById(savedTransaction._id)
      .populate('userId', 'name email')
      .populate('groupId', 'name');
    
    console.log('Transação verificada após salvar:', verifiedTransaction);
    
    res.status(201).json(verifiedTransaction);
  } catch (error) {
    console.error('Erro detalhado ao criar transação:', error);
    res.status(500).json({ 
      message: 'Erro ao criar transação', 
      error: error.message,
      stack: error.stack 
    });
  }
});