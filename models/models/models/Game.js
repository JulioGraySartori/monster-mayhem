const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  boardState: { type: [[String]], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Game', GameSchema);
