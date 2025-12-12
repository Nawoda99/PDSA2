const {
  generateBoard,
  getSolutions,
  getSolutionsSequential,
  getSolutionsThreaded,
  compareAlgorithms,
  placeQueen,
  checkSolutionWithBoard,
  saveSolution,
  getAllSavedSolutions,
  getPlayerSolutions,
  getLeaderboard,
  getSolutionProgress,
  getPerformanceHistory,
} = require("../services/eightQueens.service");

async function placeQueenController(req, res) {
  try {
    const { hints, board, row, col } = req.body;

    if (!board || row === undefined || col === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: board, row, col",
      });
    }

    const result = await placeQueen(hints || [], board, row, col);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createGame(req, res) {
  try {
    const { size = 8 } = req.body;
    const board = await generateBoard(size);
    res.json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getSolutionsController(req, res) {
  try {
    const { size = 8, algorithm = "sequential" } = req.body;

    let result;
    if (algorithm === "threaded") {
      result = await getSolutionsThreaded(size);
    } else {
      result = await getSolutionsSequential(size);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function compareAlgorithmsController(req, res) {
  try {
    const { size = 8 } = req.body;
    const comparison = await compareAlgorithms(size);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function checkSolution(req, res) {
  try {
    const { board } = req.body;

    if (!board) {
      return res.status(400).json({
        success: false,
        message: "Board is required",
      });
    }

    const isValid = await checkSolutionWithBoard(board);
    res.json({ success: true, data: { isValid } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function saveSolutionController(req, res) {
  try {
    const { board, playerId, playerName, timeSpent } = req.body;

    if (!board || !playerId || !playerName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: board, playerId, playerName",
      });
    }

    const result = await saveSolution(board, playerId, playerName, timeSpent);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getPlayerSolutionsController(req, res) {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: "Player ID is required",
      });
    }

    const solutions = await getPlayerSolutions(playerId);
    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getAllSolutions(req, res) {
  try {
    const solutions = await getAllSavedSolutions();
    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getLeaderboardController(req, res) {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getSolutionProgressController(req, res) {
  try {
    const { size = 8 } = req.query;
    const progress = await getSolutionProgress(parseInt(size));
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function getPerformanceHistoryController(req, res) {
  try {
    const { size } = req.query;
    const history = await getPerformanceHistory(size ? parseInt(size) : null);
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  placeQueen: placeQueenController,
  createGame,
  getSolutions: getSolutionsController,
  compareAlgorithms: compareAlgorithmsController,
  checkSolution,
  saveSolution: saveSolutionController,
  getPlayerSolutions: getPlayerSolutionsController,
  getAllSolutions,
  getLeaderboard: getLeaderboardController,
  getSolutionProgress: getSolutionProgressController,
  getPerformanceHistory: getPerformanceHistoryController,
};
