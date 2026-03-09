const logger = require('../utils/logger');

// Simple in-memory rate limiter (no extra packages needed)
const requestCounts = {};

const rateLimit = ({ windowMs = 60000, max = 20, message = 'Too many requests.' } = {}) => {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const key  = `${ip}:${req.path}`;

    if (!requestCounts[key]) {
      requestCounts[key] = { count: 1, start: now };
    } else {
      const elapsed = now - requestCounts[key].start;
      if (elapsed > windowMs) {
        // Reset window
        requestCounts[key] = { count: 1, start: now };
      } else {
        requestCounts[key].count++;
        if (requestCounts[key].count > max) {
          logger.warn(`Rate limit hit → IP: ${ip} → ${req.path}`);
          return res.status(429).json({
            error: message,
            retryAfter: Math.ceil((windowMs - elapsed) / 1000) + 's'
          });
        }
      }
    }
    next();
  };
};

// Pre-configured limiters for different routes
const authLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 10,  message: 'Too many login attempts. Try again in 15 minutes.' });
const scoreLimiter = rateLimit({ windowMs: 60 * 1000,      max: 30,  message: 'Too many score submissions.' });
const apiLimiter   = rateLimit({ windowMs: 60 * 1000,      max: 100, message: 'Too many requests. Slow down.' });

module.exports = { rateLimit, authLimiter, scoreLimiter, apiLimiter };