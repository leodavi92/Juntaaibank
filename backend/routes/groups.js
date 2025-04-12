const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const authenticateUser = require('../middleware/auth');

// Rota para listar grupos
router.get('/', authenticateUser, async (req, res) => {
  try {
    const groups = await Group.find({
      $or: [
        { userId: req.userId },
        { 'members.userId': req.userId }
      ]
    }).populate({
      path: 'members.userId',
      select: 'name avatar email'
    }).populate('createdBy', 'name avatar email');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar grupos' });
  }
});

// Rota para criar grupo
router.post('/', authenticateUser, async (req, res) => {
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

// Add balance update route
router.put('/:groupId/balance', authenticateUser, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { amount } = req.body;

    // Verify admin access
    if (!req.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Update balance
    group.balance = (group.balance || 0) + Number(amount);
    await group.save();

    res.json({ 
      success: true, 
      message: 'Balance updated successfully',
      newBalance: group.balance 
    });
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update group balance' 
    });
  }
});

module.exports = router;