const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Importar a SECRET_KEY do arquivo principal
const SECRET_KEY = 'sua_chave_secreta';

// Middleware de autenticação para as rotas de perfil
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}

// Rota para atualizar perfil
// Adicione logs detalhados para debug
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('=== ROTA /api/profile (PUT) ACESSADA ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('User do token:', req.user);
    
    // Extrair todos os campos do corpo da requisição
    const { name, phone, avatar, gender, cpf, birthDate, address } = req.body;
    
    // Buscar usuário atual para manter dados existentes
    const currentUser = await User.findById(req.user.userId);
    
    if (!currentUser) {
      console.log('Usuário não encontrado:', req.user.userId);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    console.log('Usuário atual:', currentUser);
    
    const updateData = {
      fullName: name || currentUser.fullName || '',
      phone: phone || currentUser.phone || '',
      gender: gender || currentUser.gender || '',
      cpf: cpf || currentUser.cpf || '',
      birthDate: birthDate || currentUser.birthDate || '',
      address: address || currentUser.address || '',
      updatedAt: new Date()
    };
    
    // Se avatar for fornecido, atualize-o
    if (avatar) {
      updateData.avatar = avatar;
    }

    console.log('Dados para atualização:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado após atualização' });
    }

    console.log('Usuário após atualização:', updatedUser);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        gender: updatedUser.gender,
        email: updatedUser.email,
        cpf: updatedUser.cpf || '',
        birthDate: updatedUser.birthDate || '',
        address: updatedUser.address || ''
      }
    });
  } catch (error) {
    console.error('=== ERRO NA ROTA /api/profile (PUT) ===');
    console.error(error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário' });
  }
});

// Rota para obter perfil
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Buscando perfil para usuário:', req.user.userId);
    
    const user = await User.findById(req.user.userId).select('-password');
    console.log('Dados completos do usuário encontrados:', user);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Garantir que todos os campos sejam retornados, mesmo que vazios
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
        email: user.email,
        cpf: user.cpf || '',
        birthDate: user.birthDate || '',
        address: user.address || ''
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário.' });
  }
});

module.exports = router;