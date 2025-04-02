const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    default: ''  // Mudando de required para default
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  avatarData: {
    iconName: String,
    color: String
  },
});

module.exports = mongoose.model('User', userSchema);