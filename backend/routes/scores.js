const router  = require('express').Router();
const Score   = require('../models/Score');
const User    = require('../models/User');
const logger  = require('../utils/logger');
const { protect }       = require('../middleware/auth');
const { validateScore } = require('../middleware/validate');
const { scoreLimiter }  = require('../middleware/rateLimit');

// POST /api/scores — save a game score
router.post('/', protect, scoreLimiter, validateScore, async (req, res) => {
  try {
    const { language, mode, score, xpEarned, streak } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.banned) return res.status(403).json({ error: 'Account suspended.' });

    const entry = await Score.create({
      userId: user._id,
      username: user.username,
      language,
      mode,
      score,
      xpEarned,
      streak
    });

    // Update user XP and streak
    user.xp += xpEarned;
    if (streak > user.streak) user.streak = streak;
    user.lastSeen = new Date();
    await user.save();

    logger.info(`Score saved: ${user.username} → ${score} pts [${language}/${mode}]`);
    res.status(201).json({
      message: 'Score saved!',
      entry,
      totalXP: user.xp,
      bestStreak: user.streak
    });

  } catch (err) {
    logger.error(`Score save error: ${err.message}`);
    res.status(500).json({ error: 'Failed to save score.' });
  }
});

// GET /api/scores/me — personal score history with pagination
router.get('/me', protect, async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip  = (page - 1) * limit;

    const [scores, total] = await Promise.all([
      Score.find({ userId: req.user.id })
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(limit),
      Score.countDocuments({ userId: req.user.id })
    ]);

    res.json({
      scores,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/scores/stats — personal stats summary
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Score.aggregate([
      { $match: { userId: req.user.id } },
      {
        $group: {
          _id: null,
          totalGames:  { $sum: 1 },
          totalXP:     { $sum: '$xpEarned' },
          bestScore:   { $max: '$score' },
          avgScore:    { $avg: '$score' },
          bestStreak:  { $max: '$streak' }
        }
      }
    ]);

    res.json(stats[0] || {
      totalGames: 0, totalXP: 0,
      bestScore: 0, avgScore: 0, bestStreak: 0
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;