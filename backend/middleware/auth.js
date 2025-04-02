const jwt = require('jsonwebtoken');
const SECRET_KEY = 'sua_chave_secreta';

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, SECRET_KEY);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return res.status(403).json({ message: 'Token inválido ou expirado' });
  }
}

module.exports = authenticateToken;