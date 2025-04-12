const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authenticateToken = require('../middleware/auth');

// Buscar grupos do usuário
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('Verificando grupos existentes...');
    const allGroups = await Group.find({}).lean();
    console.log('Total de grupos no banco:', allGroups.length);
    console.log('Grupos:', JSON.stringify(allGroups, null, 2));

    const userGroups = await Group.find({
      'members.userId': req.user.userId
    }).populate('members.userId', 'name email avatarData').lean();
    
    console.log('Grupos do usuário:', {
      userId: req.user.userId,
      totalGrupos: userGroups.length,
      grupos: userGroups
    });

    res.json({ groups: userGroups });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ message: 'Erro ao buscar grupos' });
  }
});

// Criar novo grupo
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId.toString();
    console.log('Dados recebidos:', {
      userId,
      body: req.body
    });
    
    const group = new Group({
      nome: req.body.nome,
      meta: req.body.meta,
      descricao: req.body.descricao,
      saldoAtual: 0,
      criador: userId,
      membros: [{
        userId: userId,
        nome: req.body.membros[0].nome,
        contribuicao: 0
      }]
    });

    const savedGroup = await group.save();
    console.log('Grupo salvo:', JSON.stringify(savedGroup.toObject(), null, 2));
    
    res.status(201).json(savedGroup);
  } catch (error) {
    console.error('Erro detalhado na criação:', error);
    res.status(500).json({ message: 'Erro ao criar grupo' });
  }
});

// Rota para deletar um grupo
router.delete('/groups/:id', async (req, res) => {
  try {
    const groupId = req.params.id;
    const result = await Group.findByIdAndDelete(groupId);
    
    if (!result) {
      return res.status(404).json({ message: 'Grupo não encontrado' });
    }
    
    res.status(200).json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar grupo:', error);
    res.status(500).json({ message: 'Erro ao deletar grupo' });
  }
});

module.exports = router;