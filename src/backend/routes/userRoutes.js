const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

// Log middleware
router.use((req, res, next) => {
  console.log('Requisição recebida em userRoutes:', {
    método: req.method,
    caminho: req.path,
    params: req.params,
    body: req.body,
    token: req.headers.authorization
  });
  next();
});

// Rota de atualização de informações pessoais
router.put('/users/:userId/personal-info', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { phone, cpf, birthDate, address } = req.body;

    console.log('Dados recebidos no backend:', {
      userId,
      dados: { phone, cpf, birthDate, address }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          phone,
          cpf,
          birthDate,
          address
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro na atualização:', error);
    res.status(500).json({ message: 'Erro ao atualizar usuário' });
  }
});

module.exports = router;