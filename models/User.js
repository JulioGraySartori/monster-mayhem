const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  savedGame: [[String]]
});

module.exports = mongoose.model('User', userSchema);
