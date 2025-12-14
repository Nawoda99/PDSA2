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

const {
  validatePlaceQueen,
  validateCreateGame,
  validateGetSolutions,
  validateCheckSolution,
  validateSaveSolution,
  validateGetPlayerSolutions,
  validateGetSolutionProgress,
  validateGetPerformanceHistory,
} = require("../validations/eightQueens.validation");

async function placeQueenController(req, res) {
  try {
    const validation = validatePlaceQueen(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { hints, board, row, col } = req.body;
    const result = await placeQueen(hints || [], board, row, col);

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function createGame(req, res) {
  try {
    const validation = validateCreateGame(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { size = 8 } = req.body;
    const board = await generateBoard(size);

    res.json({ success: true, data: board });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getSolutionsController(req, res) {
  try {
    const validation = validateGetSolutions(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { size = 8, algorithm = "sequential" } = req.body;

    let result;
    if (algorithm === "threaded") {
      result = await getSolutionsThreaded(size);
    } else {
      result = await getSolutionsSequential(size);
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function compareAlgorithmsController(req, res) {
  try {
    const { size = 8 } = req.body;

    const comparison = await compareAlgorithms(size);
    res.json({ success: true, data: comparison });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function checkSolution(req, res) {
  try {
    const validation = validateCheckSolution(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { board } = req.body;
    const isValid = await checkSolutionWithBoard(board);

    res.json({ success: true, data: { isValid } });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function saveSolutionController(req, res) {
  try {
    const validation = validateSaveSolution(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { board, playerId, playerName, timeSpent } = req.body;
    const result = await saveSolution(board, playerId, playerName, timeSpent);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getPlayerSolutionsController(req, res) {
  try {
    const validation = validateGetPlayerSolutions(req.params);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { playerId } = req.params;
    const solutions = await getPlayerSolutions(playerId);

    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getAllSolutions(req, res) {
  try {
    const solutions = await getAllSavedSolutions();
    res.json({ success: true, data: solutions });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getLeaderboardController(req, res) {
  try {
    const leaderboard = await getLeaderboard();
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getSolutionProgressController(req, res) {
  try {
    const validation = validateGetSolutionProgress(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { size = 8 } = req.query;
    const progress = await getSolutionProgress(parseInt(size));

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

async function getPerformanceHistoryController(req, res) {
  try {
    const validation = validateGetPerformanceHistory(req.query);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
        code: "INVALID_REQUEST",
      });
    }

    const { size } = req.query;
    const history = await getPerformanceHistory(size ? parseInt(size) : null);

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      code: "INTERNAL_SERVER_ERROR",
    });
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
