const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Corrigir o caminho para o módulo de rotas
const testProfileRoutes = require('./routes/testProfileRoutes');
const transactionRoutes = require('./routes/transactions');

require('dotenv').config();

const app = express();

// Configuração CORS atualizada
app.use(cors({
  origin: '*', // Permite todas as origens
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Headers',
    'user-id'
  ],
  credentials: true
}));

app.use(express.json());

// Use routes
app.use('/api', testProfileRoutes);
app.use('/api/transactions', transactionRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 60000, // Aumenta o tempo limite para 60 segundos
  socketTimeoutMS: 45000, // Timeout para operações de socket
  connectTimeoutMS: 60000, // Timeout para conexão inicial
  heartbeatFrequencyMS: 30000, // Frequência de heartbeat
  retryWrites: true,
  w: 'majority'
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => {
  console.error('Erro de conexão com MongoDB:', err);
  console.error('URI de conexão:', process.env.MONGO_URI.replace(/:[^:]*@/, ':****@')); // Oculta a senha
});

// Adicionar índices para melhor performance
// Definir schemas antes de usar
const groupSchema = new mongoose.Schema({
  name: String,
  balance: { type: Number, default: 0 },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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
  pixCode: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// User Schema (adicionar antes dos outros schemas)
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  verified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  avatarData: {
    iconName: String,
    color: String
  },
  // Adicionar novos campos para o perfil do usuário com valores padrão
  phone: { type: String, default: '' },
  cpf: { type: String, default: '' },
  birthDate: { type: String, default: '' },
  address: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// First define all models
// Verificar se o modelo já foi definido
const User = mongoose.models.User || mongoose.model('User', userSchema);
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

// Then create indexes
Group.collection.createIndex({ userId: 1 });
Group.collection.createIndex({ members: 1 });

// Configuração do Nodemailer com logs detalhados
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  },
  debug: true, // Ativa logs detalhados
  logger: true // Ativa logger
});

// Testar a conexão do email
transporter.verify(function(error, success) {
  if (error) {
    console.log('Erro na configuração do email:', error);
  } else {
    console.log('Servidor de email pronto para enviar mensagens');
  }
});

// Na rota de registro
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Verificar se o usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }

    // Criar novo usuário
    const user = new User({
      name,
      email,
      password,
      verified: false
    });

    // Salvar usuário antes de tentar enviar o email
    await user.save();

    try {
      // Configuração do email
      // Na rota de registro, atualize o template do email
      const mailOptions = {
      from: `"JuntaAi Bank" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Bem-vindo ao JuntaAi Bank! Confirme seu cadastro',
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
      <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h1 style="color: #1976d2; text-align: center; margin-bottom: 20px;">JuntaAi Bank</h1>
      
      <h2 style="color: #333; margin-bottom: 15px;">Olá, ${name}!</h2>
      
      <p style="font-size: 16px; line-height: 1.5; color: #444; margin-bottom: 15px;">
      Bem-vindo ao JuntaAi Bank! Por favor, confirme seu email clicando no botão abaixo:
      </p>
      
      <div style="text-align: center; margin: 25px 0;">
      <a href="http://localhost:5173/verify-email/${user._id}" 
      style="background-color: #1976d2; color: white; padding: 12px 25px; 
      text-decoration: none; border-radius: 5px; font-weight: bold;
      font-size: 16px; display: inline-block;">
      Confirmar meu email
      </a>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px; text-align: center;">
      Se o botão não funcionar, copie e cole este link no seu navegador:
      <br>
      <a href="http://localhost:5173/verify-email/${user._id}" style="color: #1976d2; word-break: break-all;">
      http://localhost:5176/verify-email/${user._id}
      </a>
      </p>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px; text-align: center;">
      Este link é válido por 24 horas.
      </p>
      </div>
      </div>
      `
      };
      // Enviar email com tratamento de erro específico
      const info = await transporter.sendMail(mailOptions);
      console.log('Email enviado com sucesso:', info.response);
      
      res.status(201).json({ 
        message: 'Usuário cadastrado com sucesso. Verifique seu email.',
        emailSent: true
      });
    } catch (emailError) {
      console.error('Erro ao enviar email:', emailError);
      // Se falhar o envio do email, ainda retornamos sucesso no cadastro
      res.status(201).json({ 
        message: 'Usuário cadastrado, mas houve um problema ao enviar o email de verificação. Tente fazer login mais tarde.',
        emailSent: false
      });
    }
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro ao cadastrar usuário' });
  }
});

// Rota de verificação de email
app.get('/api/verify-email/:token', async (req, res) => {
  try {
    const token = req.params.token;
    console.log('Token recebido:', token);
    
    const user = await User.findById(token);
    if (!user) {
      console.log('Usuário não encontrado para o token:', token);
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    user.verified = true;
    await user.save();
    console.log('Usuário verificado com sucesso:', user.email);
    
    // Em vez de redirecionar, retornamos um status de sucesso
    res.status(200).json({ 
      success: true, 
      message: 'Email verificado com sucesso',
      email: user.email
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ message: 'Erro ao verificar email' });
  }
});

// Na rota de registro, onde o email é enviado
// const mailOptions = {
//   from: `"JuntaAi Bank" <${process.env.GMAIL_USER}>`,
//   to: email,
//   subject: 'Bem-vindo ao JuntaAi Bank! Confirme seu cadastro',
//   html: `...`
// };
// 
// const info = await transporter.sendMail(mailOptions);
// console.log('Email enviado com sucesso:', info.response);
// 
// res.status(201).json({ 
//   message: 'Usuário cadastrado com sucesso. Verifique seu email.',
//   emailSent: true
// });
// } catch (emailError) {
// console.error('Erro ao enviar email:', emailError);
// // Se falhar o envio do email, ainda retornamos sucesso no cadastro
// res.status(201).json({ 
//   message: 'Usuário cadastrado, mas houve um problema ao enviar o email de verificação. Tente fazer login mais tarde.',
//   emailSent: false
// });
// }
// } catch (error) {
// console.error('Erro no registro:', error);
// res.status(500).json({ message: 'Erro ao cadastrar usuário' });
// }
// });

// Na rota de login (linha ~310)
// Na rota de login, vamos modificar para dar uma mensagem mais clara
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`Tentativa de login para: ${email}`);
    
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Usuário não encontrado: ${email}`);
      return res.status(401).json({ message: 'Email não encontrado' });
    }

    if (user.password !== password) {
      console.log(`Senha incorreta para: ${email}`);
      return res.status(401).json({ message: 'Senha incorreta' });
    }

    // Verificar se o usuário está verificado usando o campo correto
    console.log(`Status de verificação para ${email}: ${user.verified}`);
    
    if (!user.verified) {
      console.log(`Usuário não verificado: ${email}`);
      return res.status(401).json({ message: 'Conta não verificada. Por favor, verifique seu email para ativar sua conta.' });
    }

    // Gerar um token JWT real
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não está definido');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log(`Login bem-sucedido para: ${email}`);

    res.json({ 
      token,
      userId: user._id,
      name: user.name,
      email: user.email,
      verified: true 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor' });
  }
});

// Remove this duplicate mailOptions configuration
// const mailOptions = {
//   from: process.env.GMAIL_USER,
//   to: email,
//   subject: 'Verifique seu email - JuntaAi Bank',
//   html: `
//     <h1>Bem-vindo ao JuntaAi Bank, ${name}!</h1>
//     <p>Por favor, clique no link abaixo para verificar seu email:</p>
//     <a href="http://192.168.1.102:3001/api/verify-email?token=${user._id}">Verificar Email</a>
//   `
// };

// Mover a rota de recuperação de senha ANTES do app.listen
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Solicitação de recuperação para:', email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Email não encontrado' });
    }

    // Generate reset token
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send recovery email
    const mailOptions = {
      from: `"JuntaAi Bank" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Recuperação de Senha - JuntaAi Bank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h1 style="color: #1976d2; text-align: center; margin-bottom: 30px;">JuntaAi Bank</h1>
            
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${user.name}!</h2>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 20px;">
              Recebemos sua solicitação para redefinir sua senha.
            </p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 30px;">
              Clique no botão abaixo para criar uma nova senha:
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="http://localhost:5173/reset-password/${resetToken}" 
                 style="background-color: #1976d2; color: white; padding: 15px 30px; 
                        text-decoration: none; border-radius: 5px; font-weight: bold;
                        font-size: 16px; display: inline-block;">
                Redefinir minha senha
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
              Este link é válido por 1 hora. Se você não solicitou esta recuperação,
              por favor, ignore este email.
            </p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ 
      message: 'Email de recuperação enviado com sucesso',
      success: true 
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({ 
      message: 'Erro ao processar a solicitação',
      success: false 
    });
  }
});

// Adicionar esta rota antes do app.listen()
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    console.log('Tentando redefinir senha com token:', token);

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('Token inválido ou expirado');
      return res.status(400).json({ 
        message: 'Link de recuperação inválido ou expirado' 
      });
    }

    // Atualizar a senha
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    console.log('Senha atualizada com sucesso para:', user.email);

    res.json({ 
      message: 'Senha atualizada com sucesso! Você já pode fazer login.',
      success: true 
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({ 
      message: 'Erro ao redefinir senha. Tente novamente.',
      success: false 
    });
  }
});

// Configuração CORS já definida no início do arquivo

// Atualizar o middleware de autenticação para mostrar o email do usuário
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log('Headers recebidos:', req.headers);

    if (!authHeader) {
      console.log('Token não fornecido');
      return res.status(401).json({ message: 'Token de autenticação não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token inválido');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sua-chave-secreta');
      req.userId = decoded.userId;
      
      // Buscar informações do usuário para mostrar o email
      const user = await User.findById(req.userId);
      if (user) {
        console.log(`Usuário autenticado: ${req.userId} (${user.email})`);
        console.log(`Nome do usuário: ${user.name}`);
      } else {
        console.log(`Usuário autenticado: ${req.userId} (usuário não encontrado)`);
      }
      
      next();
    } catch (jwtError) {
      console.error('Erro na verificação do JWT:', jwtError);
      return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(401).json({ message: 'Erro na autenticação' });
  }
};

// Rota para buscar grupos
// No início do arquivo, após os requires

// Adicionar o middleware de autenticação
// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Token não fornecido' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    req.user = user;
    next();
  });
};

// Rota para buscar grupos
app.get('/api/groups', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const groups = await Group.find({ 'members.userId': userId }); // Corrigido para buscar corretamente
    res.json(groups);
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erro ao buscar grupos',
      error: error.message 
    });
  }
});

app.post('/api/groups', authenticateUser, async (req, res) => {
  try {
    const { name, description, goal } = req.body;
    const group = new Group({
      name,
      description,
      goal,
      createdBy: req.userId,
      members: [{
        userId: req.userId,
        role: 'admin',
        contribution: 0
      }]
    });
    
    await group.save();
    res.status(201).json(group);
  } catch (error) {
    console.error('Erro ao criar grupo:', error);
    res.status(500).json({ message: 'Erro ao criar grupo' });
  }
});

// Rota para buscar perfil do usuário
app.get('/api/users/:userId', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Remover completamente esta rota duplicada
// app.get('/api/groups', authenticateUser, async (req, res) => {
//   try {
//     const groups = await Group.find({
//       'members.userId': req.userId
//     });
//     res.json(groups);
//   } catch (error) {
//     res.status(500).json({ message: 'Erro ao buscar grupos' });
//   }
// });

app.post('/api/transactions', authenticateUser, async (req, res) => {
  try {
    const { groupId, type, amount, pixCode } = req.body;
    
    // Verificar se o usuário é membro do grupo
    const group = await Group.findOne({
      _id: groupId,
      'members.userId': req.userId
    });
    
    if (!group) {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const transaction = new Transaction({
      userId: req.userId,
      groupId,
      type,
      amount,
      pixCode
    });
    
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar transação' });
  }
});

// Adicione esta rota ao seu servidor.js
// Corrigir a rota de verificação
app.post('/api/check-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email é obrigatório' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.json({ exists: false, verified: false });
    }
    
    res.json({ 
      exists: true, 
      verified: user.verified || false // Corrigido de isVerified para verified
    });
    
  } catch (error) {
    console.error('Erro ao verificar status do email:', error);
    res.status(500).json({ message: 'Erro ao verificar status do email' });
  }
});

// Adicionar esta rota para verificar manualmente o status de um usuário:
// Adicionar esta rota para verificar o status do usuário
app.get('/api/check-user/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.json({
      email: user.email,
      verified: user.verified,
      id: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar usuário' });
  }
});

// Adicionar esta rota para forçar a verificação de um usuário
app.get('/api/force-verify/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    user.verified = true;
    await user.save();
    
    res.json({
      message: 'Usuário verificado com sucesso',
      email: user.email,
      verified: user.verified
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao verificar usuário' });
  }
});

// Adicionar esta nova rota para atualização do avatar
app.put('/api/users/:userId/avatar', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatarData } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { avatarData } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({
      email: user.email,
      _id: user._id,
      name: user.name,
      avatarData: user.avatarData
    });
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    res.status(500).json({ message: 'Erro ao atualizar avatar' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Rotas duplicadas foram removidas

// Código comentado - rotas duplicadas foram removidas

// Código comentado - rotas duplicadas foram removidas
