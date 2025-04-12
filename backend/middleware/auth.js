const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const isAdminRequest = req.headers['x-admin-access'] === 'true';
    
    console.log('=== Verificação de Autenticação ===');
    console.log('Headers completos:', req.headers);
    console.log('Token presente:', !!authHeader);
    console.log('Requisição Admin:', isAdminRequest);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ Token não fornecido ou formato inválido');
      return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    console.log('Token decodificado:', {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin
    });

    // Verificação específica para rotas admin
    if (isAdminRequest && !decoded.isAdmin) {
      console.log('❌ Tentativa de acesso admin não autorizada');
      return res.status(403).json({ 
        message: 'Acesso administrativo necessário',
        details: 'Usuário não tem permissões de administrador'
      });
    }

    // Adicionar informações ao request
    req.userId = decoded.userId;
    req.isAdmin = decoded.isAdmin;
    console.log('✅ Autenticação bem sucedida');
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ 
      message: 'Token inválido ou expirado',
      details: error.message 
    });
  }
};

module.exports = authenticateUser;