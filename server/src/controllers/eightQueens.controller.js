const {
  generateBoard,
  placeQueen,
  getSolutions,
  checkSolutionWithBoard,
  saveSolution,
} = require("../services/eightQueens.service");
const nQueensModel = require("../models/eightQueens");
require("dotenv").config();

async function placeQueenController(req, res) {
  res.send(
    await placeQueen(req.body.hints, req.body.board, req.body.row, req.body.col)
  );
}

async function createGame(req, res) {
  res.send(await generateBoard(req.body.size));
}

async function getSolutionsController(req, res) {
  let solutions = [];
  solutions = await getSolutions(req.body.size);
  res.send(solutions);
}

async function checkSolution(req, res) {
  res.send(await checkSolutionWithBoard(req.body.board));
}

async function saveSolutionController(req, res) {
  res.send(await saveSolution(req.body.board, req.body.player));
}

async function getPlayerSolutions(req, res) {
  try {
    const solutions = await nQueensModel.find({ player: req.params.playerId });
    res.send(solutions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

async function getAllSolutions(req, res) {
  try {
    const solutions = await nQueensModel.find();
    res.send(solutions);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await nQueensModel.aggregate([
      {
        $group: {
          _id: "$player",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
    res.send(leaderboard);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

module.exports = {
  getSolutions: getSolutionsController,
  placeQueen: placeQueenController,
  createGame: createGame,
  checkSolution: checkSolution,
  saveSolution: saveSolutionController,
  getPlayerSolutions: getPlayerSolutions,
  getAllSolutions: getAllSolutions,
  getLeaderboard: getLeaderboard,
};
