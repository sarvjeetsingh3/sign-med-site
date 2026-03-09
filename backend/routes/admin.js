const router = require('express').Router();
const User   = require('../models/User');
const Score  = require('../models/Score');
const logger = require('../utils/logger');
const { adminOnly } = require('../middleware/auth');

// All routes require admin
router.use(adminOnly);

// GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalScores, bannedUsers, xpResult, topScore] = await Promise.all([
      User.countDocuments(),
      Score.countDocuments(),
      User.countDocuments({ banned: true }),
      Score.aggregate([{ $group: { _id: null, total: { $sum: '$xpEarned' } } }]),
      Score.findOne().sort({ score: -1 }).select('username score language')
    ]);

    res.json({
      totalUsers,
      totalScores,
      bannedUsers,
      totalXP: xpResult[0]?.total || 0,
      topScore
    });
  } catch (err) {
    logger.error(`Admin stats error: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users — with search + pagination
router.get('/users', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 20);
    const search = req.query.search || '';

    const query = search
      ? { $or: [
          { username: { $regex: search, $options: 'i' } },
          { email:    { $regex: search, $options: 'i' } }
        ]}
      : {};

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({ users, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/scores — recent scores
router.get('/scores', async (req, res) => {
  try {
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const scores = await Score.find()
      .sort({ playedAt: -1 })
      .limit(limit);
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    await Score.deleteMany({ userId: req.params.id });
    logger.warn(`Admin deleted user: ${user.username}`);
    res.json({ message: `User ${user.username} and all their scores deleted.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/users/:id/ban — toggle ban
router.patch('/users/:id/ban', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot ban an admin.' });

    user.banned = !user.banned;
    await user.save();

    logger.warn(`Admin ${user.banned ? 'banned' : 'unbanned'} user: ${user.username}`);
    res.json({
      message: `${user.username} has been ${user.banned ? 'banned' : 'unbanned'}.`,
      banned: user.banned
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;