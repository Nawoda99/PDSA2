const express = require('express');
const router = express.Router();
const snakeGameController = require('../controllers/snakeGameController');

// 1. Start Game Endpoint
// URL: http://localhost:3000/api/game/start?n=10
router.get('/start', snakeGameController.startGame);

// 2. Submit Guess Endpoint
// URL: http://localhost:3000/api/game/guess
router.post('/guess', snakeGameController.submitGuess);

module.exports = router; 