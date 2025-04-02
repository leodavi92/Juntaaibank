const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.102:3000', 'http://192.168.1.102:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB Atlas connection
const MONGODB_URI = 'mongodb+srv://juntaaibank:juntaaibank@cluster0.mongodb.net/juntaaibank?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Adicione antes das rotas
app.use((req, res, next) => {
  console.log('=== Nova Requisição ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('IP:', req.ip);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('===================');
  next();
});

// Rotas
app.use('/api/transactions', transactionRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ status: 'API is working' });
});

// 404 handler with detailed logging
app.use((req, res) => {
  const error = {
    status: 404,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  };
  console.error('404 Error:', error);
  res.status(404).json(error);
});

// Debug middleware melhorado
app.use((req, res, next) => {
  console.log('\n=== Nova Requisição ===');
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Query Params:', req.query);
  console.log('Route Params:', req.params);
  console.log('Body:', req.body);
  console.log('===================\n');
  next();
});

const PORT = 3001; // Mudando para porta 3001 para não conflitar com o Vite
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\nServidor rodando em http://localhost:${PORT}`);
  console.log(`Servidor também acessível em http://192.168.1.102:${PORT}`);
  console.log('\nRotas disponíveis:');
  console.log(`- GET    /api/transactions`);
  console.log(`- GET    /api/transactions/:id`);
  console.log(`- PUT    /api/transactions/:id/approve`);
  console.log(`- GET    /api/test`);
  console.log('\n===================\n');
});