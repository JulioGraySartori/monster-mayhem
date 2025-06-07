const mongoose = require('mongoose');

const GameStatsSchema = new mongoose.Schema({
  totalGames: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('GameStats', GameStatsSchema);
