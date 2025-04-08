const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token não fornecido ou formato inválido' });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;
    
    if (!jwtSecret) {
      console.error('JWT_SECRET não está definido');
      return res.status(500).json({ message: 'Erro de configuração do servidor' });
    }

    const decoded = jwt.verify(token, jwtSecret);
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Erro de autenticação:', error);
    return res.status(401).json({ message: 'Não autorizado' });
  }
};

module.exports = authenticateUser;