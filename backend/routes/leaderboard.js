const router = require('express').Router();
const Score  = require('../models/Score');
const logger = require('../utils/logger');

// GET /api/leaderboard — top 10 overall
router.get('/', async (req, res) => {
  try {
    const top = await Score.find()
      .sort({ score: -1 })
      .limit(10)
      .select('username score language mode streak playedAt');

    logger.info('Leaderboard fetched — overall');
    res.json(top);
  } catch (err) {
    logger.error(`Leaderboard error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

// GET /api/leaderboard/:language — top 10 per language
router.get('/:language', async (req, res) => {
  try {
    const validLangs = ['asl', 'bsl', 'isl', 'gen'];
    const lang = req.params.language.toLowerCase();

    if (!validLangs.includes(lang)) {
      return res.status(400).json({
        error: `Invalid language. Must be one of: ${validLangs.join(', ')}`
      });
    }

    const top = await Score.find({ language: lang })
      .sort({ score: -1 })
      .limit(10)
      .select('username score streak mode playedAt');

    logger.info(`Leaderboard fetched — ${lang}`);
    res.json(top);
  } catch (err) {
    logger.error(`Leaderboard error: ${err.message}`);
    res.status(500).json({ error: 'Failed to fetch leaderboard.' });
  }
});

module.exports = router;