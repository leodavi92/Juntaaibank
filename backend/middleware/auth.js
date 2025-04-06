const authenticateUser = (req, res, next) => {
  const userId = req.headers['user-id']; // Ou extrair do token JWT
  if (!userId) {
    return res.status(401).json({ message: 'Não autorizado' });
  }
  req.userId = userId;
  next();
};

module.exports = authenticateUser;