const router = require('express').Router();
const Score  = require('../models/Score');

// Top 10 scores for a specific language
router.get('/:language', async (req, res) => {
  try {
    const top = await Score
      .find({ language: req.params.language })
      .sort({ score: -1 })
      .limit(10)
      .select('username score streak mode playedAt');
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top 10 scores across all languages
router.get('/', async (req, res) => {
  try {
    const top = await Score
      .find()
      .sort({ score: -1 })
      .limit(10)
      .select('username score language mode streak playedAt');
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;