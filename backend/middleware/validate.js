const logger = require('../utils/logger');

// Validate register input
const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];

  if (!username || username.trim().length < 3)
    errors.push('Username must be at least 3 characters.');
  if (username && username.length > 20)
    errors.push('Username cannot exceed 20 characters.');
  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push('A valid email is required.');
  if (!password || password.length < 6)
    errors.push('Password must be at least 6 characters.');

  if (errors.length > 0) {
    logger.warn(`Register validation failed: ${errors.join(' | ')}`);
    return res.status(400).json({ error: errors.join(' ') });
  }
  next();
};

// Validate login input
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !/^\S+@\S+\.\S+$/.test(email))
    errors.push('A valid email is required.');
  if (!password)
    errors.push('Password is required.');

  if (errors.length > 0) {
    logger.warn(`Login validation failed: ${errors.join(' | ')}`);
    return res.status(400).json({ error: errors.join(' ') });
  }
  next();
};

// Validate score submission
const validateScore = (req, res, next) => {
  const { language, mode, score, xpEarned, streak } = req.body;
  const errors = [];

  const validLanguages = ['asl', 'bsl', 'isl', 'gen'];
  const validModes     = ['quiz', 'reverse', 'type', 'speed'];

  if (!validLanguages.includes(language))
    errors.push(`Invalid language. Must be one of: ${validLanguages.join(', ')}.`);
  if (!validModes.includes(mode))
    errors.push(`Invalid mode. Must be one of: ${validModes.join(', ')}.`);
  if (typeof score !== 'number' || score < 0)
    errors.push('Score must be a non-negative number.');
  if (typeof xpEarned !== 'number' || xpEarned < 0)
    errors.push('xpEarned must be a non-negative number.');
  if (typeof streak !== 'number' || streak < 0)
    errors.push('Streak must be a non-negative number.');

  if (errors.length > 0) {
    logger.warn(`Score validation failed: ${errors.join(' | ')}`);
    return res.status(400).json({ error: errors.join(' ') });
  }
  next();
};

module.exports = { validateRegister, validateLogin, validateScore };