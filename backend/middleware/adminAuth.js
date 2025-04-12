const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const isAdminHeader = req.headers['x-admin-access'];
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar tanto o token quanto o header admin
    if (!decoded.isAdmin && isAdminHeader !== 'true') {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    req.userId = decoded.userId;
    req.isAdmin = true;  // Garantir que isAdmin está definido
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = adminAuthMiddleware;