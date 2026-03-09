const router   = require('express').Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const User     = require('../models/User');
const logger   = require('../utils/logger');
const { validateRegister, validateLogin } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

// POST /api/auth/register
router.post('/register', authLimiter, validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(409).json({ error: 'Email already registered.' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(409).json({ error: 'Username already taken.' });

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ username, email, password: hashed });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.success(`New user registered: ${username}`);
    res.status(201).json({ token, username: user.username, role: user.role, xp: 0 });

  } catch (err) {
    logger.error(`Register error: ${err.message}`);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(404).json({ error: 'No account found with this email.' });

    if (user.banned) return res.status(403).json({ error: 'This account has been suspended.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Incorrect password.' });

    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.info(`User logged in: ${user.username}`);
    res.json({ token, username: user.username, role: user.role, xp: user.xp, streak: user.streak });

  } catch (err) {
    logger.error(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;