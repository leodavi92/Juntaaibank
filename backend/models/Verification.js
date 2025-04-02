const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // O documento será automaticamente deletado após 10 minutos
  }
});

module.exports = mongoose.model('Verification', verificationSchema);