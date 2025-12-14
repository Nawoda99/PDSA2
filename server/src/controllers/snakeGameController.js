const snakeGameService = require("../services/snakeGameService");
const SnakeGameRound = require("../models/snakeGameRound");
const SnakeUserGuess = require("../models/snakeUserGuess");
const SnakeAlgoPerformance = require("../models/snakeAlgoPerformance");

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const startGame = async (req, res) => {
  try {
    console.log("Starting New Game");

    // Get 'n' from Query Params (Default 10)
    const n = parseInt(req.query.n) || 10;
    const boardSize = n * n;

    let board;
    let bfsAnswer = -1;
    let timeTakenBfs = 0;
    let attempts = 0;

    // Solvability Loop
    do {
      // Board Generate
      board = snakeGameService.generateBoard(n);

      // BFS Run
      const startBfs = process.hrtime();
      bfsAnswer = snakeGameService.solveWithBFS(board, boardSize);
      const endBfs = process.hrtime(startBfs);

      // Convert time to nanoseconds (seconds * 1e9 + nanoseconds)
      timeTakenBfs = endBfs[0] * 1e9 + endBfs[1];

      attempts++;
    } while (bfsAnswer === -1 && attempts < 100);

    console.log(
      `DEBUG: Generated Solvable Board in ${attempts} attempts. Answer: ${bfsAnswer}`
    );

    // Game Round Save
    const savedGameRound = await SnakeGameRound.create({
      boardSize: boardSize,
      correctAnswer: bfsAnswer,
      boardConfiguration: board,
    });

    // Save BFS Performance
    await SnakeAlgoPerformance.create({
      algorithmName: "BFS",
      timeTakenNanos: timeTakenBfs,
      roundId: savedGameRound.id,
    });

    // Dijkstra Run & Save
    const startDijkstra = process.hrtime();
    snakeGameService.solveWithDijkstra(board, boardSize);
    const endDijkstra = process.hrtime(startDijkstra);
    const timeTakenDijkstra = endDijkstra[0] * 1e9 + endDijkstra[1];

    await SnakeAlgoPerformance.create({
      algorithmName: "Dijkstra",
      timeTakenNanos: timeTakenDijkstra,
      roundId: savedGameRound.id,
    });

    // Generate Choices (1 Correct, 2 Wrong)
    const choices = [bfsAnswer];

    while (choices.length < 3) {
      const deviation = getRandomInt(1, 4); // 1, 2, or 3
      // Randomly add or subtract deviation
      const wrongOption =
        Math.random() < 0.5 ? bfsAnswer + deviation : bfsAnswer - deviation;

      // Check validity: must be > 0 and not already in choices
      if (wrongOption > 0 && !choices.includes(wrongOption)) {
        choices.push(wrongOption);
      } else {
        // Fallback logic
        const fallback = bfsAnswer + choices.length + 1;
        if (!choices.includes(fallback)) {
          choices.push(fallback);
        }
      }
    }

    // Shuffle choices
    shuffleArray(choices);

    // Send Response
    res.status(200).json({
      gameRoundId: savedGameRound.id,
      choices: choices,
      board: board,
    });
  } catch (error) {
    console.error("Error in startGame:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

// submit guess
const submitGuess = async (req, res) => {
  try {
    console.log("Submitting Guess");

    // Request Body Data)
    const { gameRoundId, userName, guessAnswer } = req.body;

    console.log(`DEBUG: Request Game ID: ${gameRoundId}`);
    console.log(`DEBUG: User Answer: ${guessAnswer}`);

    // Database GameRound
    const gameRound = await SnakeGameRound.findByPk(gameRoundId);

    if (!gameRound) {
      return res.status(404).json({
        isCorrect: false,
        message: "System Error: Game not found",
        correctAnswer: 0,
      });
    }

    const actualAnswer = gameRound.correctAnswer;
    console.log(`DEBUG: Database Correct Answer: ${actualAnswer}`);

    const isCorrect = actualAnswer === parseInt(guessAnswer);
    console.log(`DEBUG: Is Correct? ${isCorrect}`);

    // User Guess Database Save
    await SnakeUserGuess.create({
      userName: userName,
      guessAnswer: guessAnswer,
      isCorrect: isCorrect,
      roundId: gameRoundId,
    });

    // Response Message
    const message = isCorrect ? "Correct! Well done!" : "Wrong guess!";

    res.status(200).json({
      isCorrect: isCorrect,
      message: message,
      correctAnswer: actualAnswer,
    });
  } catch (error) {
    console.error("Error in submitGuess:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
const getPlayerStats = async (req, res) => {
  try {
    const { playerName } = req.params;

    if (!playerName) {
      return res
        .status(400)
        .json({ success: false, message: "playerName is required" });
    }

    const games = await SnakeUserGuess.findAll({
      where: { userName: playerName },
    });

    return res.status(200).json({ success: true, data: games });
  } catch (error) {
    console.error("getPlayerStats error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  startGame,
  submitGuess,
  getPlayerStats,
};
