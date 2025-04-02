const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Ensure the User model is imported
const { authenticateToken } = require('../server'); // Ensure authenticateToken is imported correctly

router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId; // Extracted from JWT token
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário' });
  }
});

// Rota para atualizar o avatar
router.post('/api/users/:userId/avatar', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatarData } = req.body;

    // Verificar se o userId do token corresponde ao userId da rota
    if (req.user.userId !== userId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatarData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ 
      success: true,
      avatarData: updatedUser.avatarData 
    });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ message: 'Erro ao atualizar avatar' });
  }
});

// Adicione esta rota se não existir
router.post('/users/:userId/avatar', authenticateToken, async (req, res) => {
    console.log('Rota de avatar chamada!'); // Log para debug
    try {
        const { userId } = req.params;
        const { avatarData } = req.body;
        
        // Atualize no MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatarData },
            { new: true }
        );
        
        res.json({ success: true, avatarData: updatedUser.avatarData });
    } catch (error) {
        console.error('Erro ao atualizar avatar:', error);
        res.status(500).json({ message: 'Erro ao atualizar avatar' });
    }
});

module.exports = router;