const { verifyAccessToken } = require('../utils/tokens');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token topilmadi' });
  }

  const token = header.split(' ')[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Yaroqsiz yoki muddati tugagan token' });
  }
}

function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Faqat admin uchun' });
  }
  return next();
}

module.exports = {
  authMiddleware,
  adminMiddleware
};
