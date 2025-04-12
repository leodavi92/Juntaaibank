const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    const adminExists = await Admin.findOne({ email: 'admin@juntaai.com' });
    
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({
        email: 'admin@juntaai.com',
        password: hashedPassword,
        isAdmin: true
      });
      
      await admin.save();
      console.log('Usuário admin criado com sucesso!');
    } else {
      console.log('Usuário admin já existe!');
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Erro ao criar admin:', error);
  }
}

createAdminUser();