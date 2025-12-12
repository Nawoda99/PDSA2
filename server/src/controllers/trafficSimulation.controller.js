const trafficService = require("../services/trafficSimulation.service");

async function generateNetwork(req, res) {
  try {
    const { minCapacity = 5, maxCapacity = 15 } = req.body;

    if (minCapacity < 1 || maxCapacity > 100 || minCapacity >= maxCapacity) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid capacity range. Min should be less than Max and within 1-100.",
      });
    }

    const network = trafficService.generateTrafficNetwork(
      minCapacity,
      maxCapacity
    );

    res.json({
      success: true,
      data: network,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function submitAnswer(req, res) {
  try {
    const { playerId, playerName, network, playerAnswer, timeTaken } = req.body;

    if (!playerId || !playerName || !network || playerAnswer === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: playerId, playerName, network, playerAnswer",
      });
    }

    if (!Array.isArray(network) || network.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid network format",
      });
    }

    const validation = await trafficService.validateAnswer(
      network,
      playerAnswer
    );

    let savedResult = null;
    if (validation.isCorrect) {
      savedResult = await trafficService.saveGameResult({
        playerId,
        playerName,
        network,
        playerAnswer: validation.playerAnswer,
        correctAnswer: validation.correctAnswer,
        isCorrect: validation.isCorrect,
        fordFulkersonTime: validation.fordFulkersonTime,
        edmondsKarpTime: validation.edmondsKarpTime,
        timeTaken,
      });
    }

    res.json({
      success: true,
      data: {
        isCorrect: validation.isCorrect,
        playerAnswer: validation.playerAnswer,
        correctAnswer: validation.correctAnswer,
        fordFulkersonTime: validation.fordFulkersonTime,
        edmondsKarpTime: validation.edmondsKarpTime,
        saved: validation.isCorrect,
        gameResult: savedResult?.data || null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getPlayerHistory(req, res) {
  try {
    const { playerId } = req.params;

    if (!playerId) {
      return res.status(400).json({
        success: false,
        message: "Player ID is required",
      });
    }

    const history = await trafficService.getPlayerHistory(playerId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await trafficService.getLeaderboard();

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function getAllResults(req, res) {
  try {
    const results = await trafficService.getAllGameResults();

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

async function calculateMaxFlow(req, res) {
  try {
    const { network } = req.body;

    if (!network || !Array.isArray(network)) {
      return res.status(400).json({
        success: false,
        message: "Invalid network format",
      });
    }

    const result = await trafficService.calculateMaxFlow(network);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  generateNetwork,
  submitAnswer,
  getPlayerHistory,
  getLeaderboard,
  getAllResults,
  calculateMaxFlow,
};
