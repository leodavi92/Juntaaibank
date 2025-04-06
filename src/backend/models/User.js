const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone: String,
  cpf: String,
  birthDate: String,
  address: String,
  avatarData: {
    iconName: String,
    color: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);