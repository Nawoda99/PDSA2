const travelingSalesmanService = require("../services/travelingSalesman.service");

const generateMatrix = async (req, res, next) => {
  try {
    const { size = 10, minDist = 50, maxDist = 100 } = req.body;

    const matrix = travelingSalesmanService.genRandomDistanceMatrix(
      parseInt(size),
      parseInt(minDist),
      parseInt(maxDist)
    );

    const homeCity = Math.floor(Math.random() * size);

    res.json({
      success: true,
      message: "Distance matrix generated successfully",
      data: {
        matrix,
        homeCity,
      },
    });
  } catch (error) {
    next(error);
  }
};
const computeAlgorithms = async (req, res, next) => {
  try {
    const { matrix, home, selected } = req.body;

    if (!matrix || !Array.isArray(matrix)) {
      return res.status(400).json({
        success: false,
        message: "Invalid matrix provided",
      });
    }

    if (home === undefined || home < 0 || home >= matrix.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid home city",
      });
    }

    if (!Array.isArray(selected) || selected.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Must select at least one city",
      });
    }

    const results = await travelingSalesmanService.computeAlgorithms(
      matrix,
      home,
      selected
    );

    res.json({
      success: true,
      message: "Algorithms computed successfully",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const saveSession = async (req, res, next) => {
  try {
    const session = await travelingSalesmanService.saveTravelingSalesmanSession(
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Session saved successfully",
      data: session,
    });
  } catch (error) {
    next(error);
  }
};

const getPlayerStats = async (req, res, next) => {
  try {
    const { playerName } = req.params;

    if (!playerName || playerName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Player name must be at least 2 characters",
      });
    }

    const stats = await travelingSalesmanService.getPlayerStats(playerName);

    if (!stats) {
      return res.json({
        success: false,
        message: "No games found for this player",
        data: null,
      });
    }

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await travelingSalesmanService.getLeaderboard(limit);

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateMatrix,
  computeAlgorithms,
  saveSession,
  getPlayerStats,
  getLeaderboard,
};
