const hanoiService = require("../services/hanoiTower.service");


const generateGame = async (req, res, next) => {
  try {
    const game = hanoiService.generateGame();
    
    res.json({
      success: true,
      message: "Game generated successfully",
      data: game,
    });
  } catch (error) {
    next(error);
  }
};


const computeSolutions = async (req, res, next) => {
  try {
    const { disks, pegs } = req.body;

    if (!disks || !pegs) {
      return res.status(400).json({
        success: false,
        message: "Disks and pegs are required",
      });
    }

    if (disks < 5 || disks > 10) {
      return res.status(400).json({
        success: false,
        message: "Disks must be between 5 and 10",
      });
    }

    if (pegs < 3 || pegs > 4) {
      return res.status(400).json({
        success: false,
        message: "Pegs must be 3 or 4",
      });
    }

    const results = await hanoiService.computeAlgorithms(
      parseInt(disks),
      parseInt(pegs)
    );

    res.json({
      success: true,
      message: "Solutions computed successfully",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};


const validateSolution = async (req, res, next) => {
  try {
    const { disks, pegs, playerSequence } = req.body;

    if (!disks || !pegs || !playerSequence) {
      return res.status(400).json({
        success: false,
        message: "Disks, pegs, and player sequence are required",
      });
    }

    if (!Array.isArray(playerSequence)) {
      return res.status(400).json({
        success: false,
        message: "Player sequence must be an array",
      });
    }

    const validation = hanoiService.validateSolution(
      playerSequence,
      parseInt(disks),
      parseInt(pegs)
    );

    res.json({
      success: validation.valid,
      message: validation.valid ? "Solution is correct!" : validation.error,
      data: validation,
    });
  } catch (error) {
    next(error);
  }
};


const submitGame = async (req, res, next) => {
  console.log("hit");
  
  try {
    const result = await hanoiService.saveHanoiSession(req.body);

    res.status(201).json({
      success: true,
      message: result.validation.valid 
        ? "Correct! Game saved successfully" 
        : "Incorrect solution, but saved",
      data: {
        session: result.session,
        validation: result.validation,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPlayerStats = async (req, res, next) => {
  try {
    const { playerName } = req.params;
    const HanoiTower = require("../models/hanoiTower");
    const { Op } = require("sequelize");

    const sessions = await HanoiTower.findAll({
      where: {
        playerName: {
          [Op.like]: playerName.trim(),
        },
      },
      order: [["createdAt", "DESC"]],
    });

    if (sessions.length === 0) {
      return res.json({
        success: false,
        message: "No games found for this player",
        data: null,
      });
    }

    const totalGames = sessions.length;
    const correctGames = sessions.filter(s => s.isCorrect).length;
    const avgMoves = sessions.reduce((sum, s) => sum + s.playerMoves, 0) / totalGames;

    res.json({
      success: true,
      data: {
        totalGames,
        correctGames,
        successRate: ((correctGames / totalGames) * 100).toFixed(2),
        avgMoves: avgMoves.toFixed(2),
        recentGames: sessions.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateGame,
  computeSolutions,
  validateSolution,
  submitGame,
  getPlayerStats,
};