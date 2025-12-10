const express = require("express");
const router = express.Router();
const eightQueensController = require("../controllers/eightQueens.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/createboard", eightQueensController.createGame);
router.post("/placequeen", eightQueensController.placeQueen);
router.post("/getsolutions", eightQueensController.getSolutions);
router.post("/checksolution", eightQueensController.checkSolution);

router.post(
  "/saveSolution",
  authenticateToken,
  eightQueensController.saveSolution
);

router.get("/player/:playerId", eightQueensController.getPlayerSolutions);
router.get("/all", eightQueensController.getAllSolutions);
router.get("/leaderboard", eightQueensController.getLeaderboard);

module.exports = router;
