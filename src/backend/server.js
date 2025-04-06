const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

// Conexão MongoDB Atlas
mongoose.connect('sua_url_do_mongodb_atlas', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Conectado ao MongoDB Atlas com sucesso!');
})
.catch((err) => {
  console.error('Erro na conexão com MongoDB:', err);
});

// Monitora eventos de conexão
mongoose.connection.on('error', err => {
  console.error('Erro na conexão:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB desconectado');
});

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));