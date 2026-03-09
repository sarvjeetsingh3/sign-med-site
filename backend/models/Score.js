const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true
  },
  language: {
    type: String,
    enum: {
      values: ['asl', 'bsl', 'isl', 'gen'],
      message: '{VALUE} is not a supported language'
    },
    required: [true, 'Language is required']
  },
  mode: {
    type: String,
    enum: {
      values: ['quiz', 'reverse', 'type', 'speed'],
      message: '{VALUE} is not a supported mode'
    },
    required: [true, 'Game mode is required']
  },
  score:    { type: Number, required: true, min: [0, 'Score cannot be negative'] },
  xpEarned: { type: Number, default: 0,    min: [0, 'XP cannot be negative'] },
  streak:   { type: Number, default: 0,    min: [0, 'Streak cannot be negative'] },
  playedAt: { type: Date, default: Date.now }
}, { timestamps: true });

scoreSchema.index({ language: 1, score: -1 });
scoreSchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.models.Score || mongoose.model('Score', scoreSchema);