const express = require("express");
const router = express.Router();
const trafficController = require("../controllers/trafficSimulation.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/generate", trafficController.generateNetwork);

router.post("/submit", authenticateToken, trafficController.submitAnswer);

router.post("/calculate", trafficController.calculateMaxFlow);

router.get(
  "/history/:playerId",
  authenticateToken,
  trafficController.getPlayerHistory
);

router.get("/leaderboard", trafficController.getLeaderboard);

router.get("/results", trafficController.getAllResults);

module.exports = router;
