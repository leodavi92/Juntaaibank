const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    // Verificar se é um token de admin válido
    if (token !== process.env.ADMIN_TOKEN) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = adminAuthMiddleware;