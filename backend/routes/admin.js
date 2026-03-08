const router = require('express').Router();
const User   = require('../models/User');
const Score  = require('../models/Score');
const jwt    = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admins only' });
    req.user = decoded;
    next();
  } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Stats overview
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers  = await User.countDocuments();
    const totalScores = await Score.countDocuments();
    const bannedUsers = await User.countDocuments({ banned: true });
    const xpResult    = await Score.aggregate([{ $group: { _id: null, total: { $sum: '$xpEarned' } } }]);
    const totalXP     = xpResult[0]?.total || 0;
    const topScore    = await Score.findOne().sort({ score: -1 }).select('username score');
    res.json({ totalUsers, totalScores, bannedUsers, totalXP, topScore });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Score.deleteMany({ userId: req.params.id });
    res.json({ message: 'User and scores deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Ban / unban user
router.patch('/users/:id/ban', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.banned = !user.banned;
    await user.save();
    res.json({ message: user.banned ? 'User banned' : 'User unbanned', banned: user.banned });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all scores
router.get('/scores', adminAuth, async (req, res) => {
  try {
    const scores = await Score.find().sort({ playedAt: -1 }).limit(100);
    res.json(scores);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;