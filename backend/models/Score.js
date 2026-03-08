const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username:  { type: String, required: true },
  language:  { type: String, enum: ['asl','bsl','isl','gen'], required: true },
  mode:      { type: String, enum: ['quiz','reverse','type'], required: true },
  score:     { type: Number, required: true },
  xpEarned:  { type: Number, default: 0 },
  streak:    { type: Number, default: 0 },
  playedAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', scoreSchema);