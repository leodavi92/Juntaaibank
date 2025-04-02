// Rota para listar transações
app.get('/api/transactions', authenticateUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações' });
  }
});

// Rota para criar transação
app.post('/api/transactions', authenticateUser, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      userId: req.userId
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar transação' });
  }
});