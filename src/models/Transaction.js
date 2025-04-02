const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: String,
  type: String,
  amount: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  userId: String,
  groupId: String,
  group: String,  // Nome do grupo
  user: String,   // Nome do usuário
  email: String,
  date: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

module.exports = mongoose.model('Transaction', transactionSchema);