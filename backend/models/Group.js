const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true
  },
  meta: {
    type: Number,
    required: true
  },
  descricao: String,
  saldoAtual: {
    type: Number,
    default: 0
  },
  criador: {
    type: String,
    required: true
  },
  membros: [{
    userId: {
      type: String,
      required: true
    },
    nome: String,
    contribuicao: {
      type: Number,
      default: 0
    }
  }]
}, { 
  timestamps: true,
  strict: true 
});

module.exports = mongoose.model('Group', groupSchema);