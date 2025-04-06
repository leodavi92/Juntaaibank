require('dotenv').config();
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Configurar opções de conexão para melhorar a resiliência
    const options = {
      serverSelectionTimeoutMS: 60000, // Timeout de seleção do servidor (60 segundos)
      socketTimeoutMS: 45000, // Timeout do socket (45 segundos)
      connectTimeoutMS: 45000, // Timeout de conexão (45 segundos)
      maxPoolSize: 10, // Tamanho máximo do pool de conexões
      retryWrites: true, // Tentar novamente operações de escrita
      retryReads: true // Tentar novamente operações de leitura
    };
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.yjbwzqm.mongodb.net/juntaaibank', options);
    console.log('Conectado ao MongoDB Atlas');
    
    // Configurar eventos de conexão para monitoramento
    mongoose.connection.on('error', (err) => {
      console.error('Erro na conexão MongoDB:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB desconectado, tentando reconectar...');
    });
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;