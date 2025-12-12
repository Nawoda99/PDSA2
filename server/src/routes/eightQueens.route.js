const express = require("express");
const router = express.Router();
const eightQueensController = require("../controllers/eightQueens.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/createboard", eightQueensController.createGame);
router.post("/placequeen", eightQueensController.placeQueen);

router.post("/getsolutions", eightQueensController.getSolutions);
router.post("/compare", eightQueensController.compareAlgorithms);
router.post("/checksolution", eightQueensController.checkSolution);

router.post(
  "/saveSolution",
  authenticateToken,
  eightQueensController.saveSolution
);

router.get("/progress", eightQueensController.getSolutionProgress);
router.get("/performance", eightQueensController.getPerformanceHistory);
router.get("/leaderboard", eightQueensController.getLeaderboard);
router.get("/all", eightQueensController.getAllSolutions);
router.get(
  "/player/:playerId",
  authenticateToken,
  eightQueensController.getPlayerSolutions
);

module.exports = router;
