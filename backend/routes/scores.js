const router  = require('express').Router();
const Score   = require('../models/Score');
const User    = require('../models/User');
const jwt     = require('jsonwebtoken');

// Middleware: verify JWT
function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Save a score after game ends
router.post('/', auth, async (req, res) => {
  try {
    const { language, mode, score, xpEarned, streak } = req.body;
    const user = await User.findById(req.user.id);
    const entry = await Score.create({
      userId: user._id,
      username: user.username,
      language,
      mode,
      score,
      xpEarned,
      streak
    });
    // Add XP to user profile
    user.xp += xpEarned;
    if (streak > user.streak) user.streak = streak;
    await user.save();
    res.json({ message: 'Score saved!', entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user's score history
router.get('/me', auth, async (req, res) => {
  try {
    const scores = await Score
      .find({ userId: req.user.id })
      .sort({ playedAt: -1 })
      .limit(20);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;