const mongoose = require('mongoose');

// Certifique-se de que o modelo inclui os campos necessários
const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  pixCode: {
    type: String
  },
  accountHolderName: {
    type: String
  },
  bankName: {
    type: String
  },
  motivo: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});