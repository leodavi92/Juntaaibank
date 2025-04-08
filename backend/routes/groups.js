// Rota para listar grupos
app.get('/api/groups', authenticateUser, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { userId: req.userId },
        { members: req.userId }
      ]
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar grupos' });
  }
});

// Rota para criar grupo
app.post('/api/groups', authenticateUser, async (req, res) => {
  try {
    const group = new Group({
      ...req.body,
      userId: req.userId,
      members: [req.userId]
    });
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar grupo' });
  }
});