const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Middleware de autenticação
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Headers recebidos:', req.headers);

    if (!authHeader) {
      console.log('Token não fornecido');
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token inválido');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
      req.userId = decoded.userId;
      
      // Buscar informações do usuário para mostrar o email
      const User = mongoose.model('User');
      const user = await User.findById(req.userId);
      if (user) {
        console.log(`Usuário autenticado: ${req.userId} (${user.email})`);
        console.log(`Nome do usuário: ${user.name}`);
      } else {
        console.log(`Usuário autenticado: ${req.userId} (usuário não encontrado)`);
      }
      
      next();
    } catch (jwtError) {
      console.error('Erro na verificação do JWT:', jwtError);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Erro na autenticação' });
  }
};

// Rota para atualizar o perfil do usuário
router.put('/test-update-profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;

    console.log('=== ROTA /api/test-update-profile (PUT) ACESSADA ===');
    console.log('Headers:', req.headers);
    console.log('Body:', updateData);
    console.log('Buscando usuário com ID:', userId);

    // Obter o modelo User
    const User = mongoose.model('User');

    // Primeiro, buscar o usuário para verificar o estado atual
    const userBefore = await User.findById(userId);
    if (!userBefore) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('Usuário atual:', userBefore);
    console.log('Dados para atualização:', updateData);

    // Método 1: Atualizar diretamente usando findByIdAndUpdate
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          phone: updateData.phone || '',
          cpf: updateData.cpf || '',
          birthDate: updateData.birthDate || '',
          address: updateData.address || '',
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    console.log('Usuário após atualização:', updatedUser);

    // Verificar se os campos foram atualizados
    if (updatedUser) {
      console.log('Campos atualizados:', {
        phone: updatedUser.phone,
        cpf: updatedUser.cpf,
        birthDate: updatedUser.birthDate,
        address: updatedUser.address
      });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil', error: error.message });
  }
});

module.exports = router;