const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// Verify any logged-in user
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.warn(`Unauthorized access attempt → ${req.originalUrl}`);
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    logger.warn(`Invalid token attempt → ${req.originalUrl}`);
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Admin only
const adminOnly = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    logger.warn(`Admin access denied — no token → ${req.originalUrl}`);
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      logger.warn(`Non-admin tried to access admin route → ${req.originalUrl}`);
      return res.status(403).json({ error: 'Forbidden. Admins only.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = { protect, adminOnly };