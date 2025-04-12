const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const adminAuth = require('../middleware/adminAuth');

// Note que agora a rota será /auth/admin/login no total
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Tentativa de login admin:', email);

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      console.log('Admin não encontrado:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(password, admin.password);
    if (!senhaValida) {
      console.log('Senha inválida para:', email);
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { 
        userId: admin._id,
        isAdmin: true
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token admin gerado com sucesso');
    res.json({ token, message: 'Login admin realizado com sucesso' });
  } catch (error) {
    console.error('Erro no login admin:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Rota para obter o perfil do admin
router.get('/admin/profile', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Administrador não encontrado' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Erro ao buscar perfil do admin:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do administrador' });
  }
});

// Rota para verificar autenticação do admin
router.get('/admin/login/check', adminAuth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.userId);
    if (!admin) {
      return res.status(403).json({ isValid: false });
    }
    res.json({ isValid: true });
  } catch (error) {
    console.error('Erro na verificação admin:', error);
    res.status(500).json({ isValid: false });
  }
});

module.exports = router; // Importante: certifique-se que está exportando o router