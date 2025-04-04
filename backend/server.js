const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const connectDB = require('./config/database');
const User = require('./models/User');
const Verification = require('./models/Verification');
const nodemailer = require('nodemailer');
const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');
const adminRoutes = require('./routes/adminRoutes');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'lleandrodcampos@gmail.com',
    pass: 'xfqt blnk stbc vfev'
  }
});

// Connect to MongoDB
connectDB();

const app = express();

// No início do arquivo, ajuste a configuração do CORS
// Corrigir a configuração do CORS para usar as portas corretas
app.use(cors({
// Frontend na porta 3000
origin: ['http://192.168.1.102:3000'],
credentials: true,
methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

app.use(express.json());

// Todas as rotas da API devem vir ANTES do middleware de erro
// Na rota de registro
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    console.log('Dados recebidos:', { email, fullName });

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('Usuário já existe:', email);
      return res.status(400).json({
        success: false,
        message: 'Este email já está cadastrado'
      });
    }

    // Criar novo usuário
    const user = new User({
      fullName,
      email,
      password,
      isVerified: false
    });

    const savedUser = await user.save();
    console.log('Usuário salvo:', savedUser);

    // Gerar token de verificação (mais seguro que um código numérico)
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    
    const verification = new Verification({
      email,
      code: verificationToken
    });
    await verification.save();

    // Enviar email com link
    // Na rota de registro, onde o link é gerado
    const verificationLink = `http://192.168.1.102:3000/verify?token=${verificationToken}&email=${email}`;
    
    const mailResult = await transporter.sendMail({
      from: '"JuntaAI Bank" <lleandrodcampos@gmail.com>',
      to: email,
      subject: 'Verificação de Email - JuntaAI Bank',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1976d2; text-align: center;">Bem-vindo ao JuntaAI Bank!</h2>
          <p style="font-size: 16px;">Clique no botão abaixo para verificar seu email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #1976d2; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verificar Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Este link expira em 10 minutos.</p>
          <p style="color: #666; font-size: 14px;">Se você não solicitou esta verificação, ignore este email.</p>
        </div>
      `
    });

    console.log('Email enviado:', mailResult.messageId);
    
    res.json({
      success: true,
      message: 'Usuário registrado e email de verificação enviado'
    });
  } catch (error) {
    console.error('Erro detalhado:', error);
    res.status(500).json({
      success: false,
      message: `Erro ao registrar usuário: ${error.message}`
    });
  }
});

// Rota de teste GET
app.get('/api', (req, res) => {
  res.json({ message: 'API está funcionando!' });
});

// Rota de teste para login (apenas para desenvolvimento)
app.get('/api/login', (req, res) => {
  res.json({ 
    message: 'Esta rota aceita apenas método POST',
    exemplo: {
      method: 'POST',
      body: {
        email: 'admin@juntaai.com',
        password: 'admin123'
      }
    }
  });
});

// Rota de teste para check-user (apenas para desenvolvimento)
app.get('/api/check-user', (req, res) => {
  res.json({ 
    message: 'Esta rota aceita apenas método POST',
    exemplo: {
      method: 'POST',
      body: {
        email: 'teste@teste.com'
      }
    }
  });
});

// Login route
// Manter apenas um conjunto de imports no topo
// Remover este bloco de imports duplicados
// const express = require('express');
// const cors = require('cors');
// const jwt = require('jsonwebtoken');
// const connectDB = require('./config/database');
// const User = require('./models/User');
// const Verification = require('./models/Verification');
// const nodemailer = require('nodemailer');

// Manter apenas a definição da SECRET_KEY
const SECRET_KEY = 'sua_chave_secreta';

// Remover esta configuração duplicada do nodemailer
// const transporter = nodemailer.createTransport({...});

// Remover esta conexão duplicada
// connectDB();

// Remover estas configurações duplicadas do app
// const app = express();
// app.use(cors({...}));
// app.use(express.json());

// Adicione isso logo após as configurações do express
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  next();
});

// Adicione isso nas rotas de usuário
app.post('/api/login', async (req, res) => {
  console.log('Login attempt:', req.body.email);
  const { email, password } = req.body;
  console.log('DEBUG - Tentativa de login:', { email, password });

  try {
    const user = await User.findOne({ email });
    console.log('DEBUG - Usuário encontrado:', user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não cadastrado. Por favor, faça o cadastro primeiro.'
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta.'
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email não verificado. Por favor, verifique seu email.'
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      SECRET_KEY,
      { expiresIn: '24h' }
    );
    
    console.log('DEBUG - Login bem sucedido:', {
      userId: user._id,
      token: token
    });

    res.json({
      success: true,
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao realizar login.'
    });
  }
});

// Atualize o middleware de autenticação
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    console.log('DEBUG - Headers completos:', req.headers);
    console.log('DEBUG - Token recebido:', authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    console.log('DEBUG - Token extraído:', token);

    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('DEBUG - Token decodificado:', decoded);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('DEBUG - Erro na verificação do token:', error);
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}

// Update the profile route
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Corpo completo da requisição:', req.body);
    
    // Extrair todos os campos do corpo da requisição
    const { name, phone, avatar, gender } = req.body;
    
    // Buscar usuário atual para manter dados existentes
    const currentUser = await User.findById(req.user.userId);
    
    const updateData = {
      fullName: name || currentUser.fullName || '', // Manter nome existente se não houver novo
      phone: phone || currentUser.phone || '',
      avatar: avatar || currentUser.avatar || '',
      gender: gender || currentUser.gender || '',
      updatedAt: new Date()
    };

    console.log('Dados para atualização:', updateData);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('Usuário após atualização:', updatedUser);

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
        gender: updatedUser.gender,
        email: updatedUser.email
      }
    });
  } catch (error) {
    console.error('Erro detalhado ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro ao atualizar perfil do usuário' });
  }
});

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    console.log('Buscando perfil para usuário:', req.user.userId);
    
    const user = await User.findById(req.user.userId).select('-password');
    console.log('Dados completos do usuário encontrados:', user);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    // Garantir que todos os campos sejam retornados, mesmo que vazios
    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName || '',  // Garantir que retorne vazio se não existir
        phone: user.phone || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil do usuário.' });
  }
});

// Check user route
app.post('/api/check-user', async (req, res) => {
  const { email } = req.body;
  console.log('Checking user:', email); // Debug log

  try {
    const user = await User.findOne({ email });
    const exists = !!user; // Verifica se o usuário existe

    console.log('Usuário encontrado:', user); // Adicione este log para verificar o usuário encontrado

    res.json({ exists });
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({ message: 'Erro ao verificar usuário' });
  }
});

// Tratamento de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Algo deu errado!' 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log('Rotas disponíveis:');
  console.log('- GET  /api/test');
  console.log('- POST /api/login');
  console.log('- POST /api/check-user');
});


// Remover todas as rotas duplicadas e manter apenas estas duas rotas de verificação
app.get('/api/verify', async (req, res) => {
  try {
    const { email, token } = req.query;
    
    const verification = await Verification.findOne({ email, code: token });
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Link inválido ou expirado'
      });
    }

    // Atualizar status do usuário
    await User.findOneAndUpdate(
      { email },
      { isVerified: true }
    );

    // Remover token usado
    await verification.deleteOne();

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email'
    });
  }
});

// Remover estas linhas que estão causando o erro
// const verificationLink = `http://localhost:5173/verify?token=${verificationToken}&email=${email}`;
// app.post('/api/send-verification', async (req, res) => { ... });

// Remover a rota GET /api/verify e manter apenas esta rota de verificação
app.post('/api/verify-email', async (req, res) => {
  try {
    const { email, token } = req.body;
    
    const verification = await Verification.findOne({ email, code: token });
    
    if (!verification) {
      return res.status(400).json({
        success: false,
        message: 'Link inválido ou expirado'
      });
    }

    // Atualizar status do usuário
    await User.findOneAndUpdate(
      { email },
      { isVerified: true }
    );

    // Remover token usado
    await verification.deleteOne();

    res.json({
      success: true,
      message: 'Email verificado com sucesso'
    });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email'
    });
  }
});

// Adicionar as rotas do usuário (mova esta linha para antes do middleware de erro)
// Mova estas configurações para o TOPO do arquivo (apenas uma vez)
// No topo do arquivo, adicione:
require('dotenv').config();

// Atualize a configuração do CORS:
app.use(cors({
// E no link de verificação:
const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${verificationToken}&email=${email}`;
app.use(express.json());

// Rota do avatar com autenticação
// Adicione esta rota (certifique-se de que está antes do middleware de erro)
// Adicione isso logo após as configurações do CORS e express.json()
app.post('/api/users/:userId/avatar', authenticateToken, async (req, res) => {
    try {
        console.log('Requisição de avatar recebida');
        const { userId } = req.params;
        const { avatarData } = req.body;

        // Verificação de segurança
        if (req.user.userId !== userId) {
            return res.status(403).json({ message: 'Acesso não autorizado' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { avatar: avatarData },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        res.json({ 
            success: true,
            avatar: updatedUser.avatar 
        });
    } catch (error) {
        console.error('Erro ao atualizar avatar:', error);
        res.status(500).json({ message: 'Erro ao atualizar avatar' });
    }
});


// Middleware de erro DEVE ser o último
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Erro interno do servidor' });
});

// Na parte onde você gera o link de redefinição de senha
const resetPasswordLink = `http://localhost:5173/reset-password/${resetToken}`;

// Atualizar a rota de redefinição de senha
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    const passwordReset = await PasswordReset.findOne({ token });
    
    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Atualizar a senha do usuário
    const user = await User.findOne({ email: passwordReset.email });
    user.password = newPassword;
    await user.save();

    // Remover o token usado
    await passwordReset.deleteOne();

    res.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    console.error('Erro na redefinição de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao redefinir senha'
    });
  }
});