const crypto = require('crypto');
const ADMIN_SECRET = 'ucgg_super_secret_2024';

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  next();
}

module.exports = { authenticate };
