// Import models and modules
const GameStats = require('./models/GameStats');
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/monster-mayhem')
  .then(() => {
    console.log("✅ Connected to MongoDB");
    initializeGameStats(); // Ensure GameStats is initialized AFTER connection
  })
  .catch(err => console.error("❌ MongoDB connection error:", err));

// Ensure a GameStats document exists
async function initializeGameStats() {
  const count = await GameStats.countDocuments();
  if (count === 0) {
    await GameStats.create({ totalGames: 0 });
    console.log('✅ GameStats initialized');
  }
}

// Express + Socket.io setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from "public"
app.use(express.static(path.join(__dirname, 'public')));

// Game board (10x10)
let board = Array.from({ length: 10 }, () => Array(10).fill(''));

// Monster battle logic
function resolveBattle(existing, incoming) {
  const rules = {
    V: 'W', // Vampire beats Werewolf
    W: 'G', // Werewolf beats Ghost
    G: 'V'  // Ghost beats Vampire
  };

  if (existing === incoming) return 'both';
  if (rules[incoming] === existing) return 'incoming';
  if (rules[existing] === incoming) return 'existing';
  return 'none';
}

// Route to simulate game end
app.get('/endgame', async (req, res) => {
  const stats = await GameStats.findOne();
  if (stats) {
    stats.totalGames += 1;
    await stats.save();
    io.emit('totalGamesUpdate', stats.totalGames); // Notify all clients
    res.send(`Game ended. Total games: ${stats.totalGames}`);
  } else {
    res.status(500).send("GameStats not found");
  }
});

// WebSocket logic
io.on('connection', (socket) => {
  console.log('Client connected');

  socket.emit('boardUpdate', board);

  // Handle monster placement
  socket.on('placeMonster', ({ username, monsterType, x, y }) => {
    if (x < 0 || x > 9 || y < 0 || y > 9) return;

    const symbol = monsterType[0].toUpperCase();
    const existing = board[y][x];

    if (existing === '') {
      board[y][x] = symbol;
    } else {
      const result = resolveBattle(existing, symbol);
      if (result === 'incoming') board[y][x] = symbol;
      else if (result === 'both') board[y][x] = '';
    }

    io.emit('boardUpdate', board);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
