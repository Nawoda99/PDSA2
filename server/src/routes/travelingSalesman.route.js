const express = require("express");
const router = express.Router();
const travelingSalesmanController = require("../controllers/travelingSalesman.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.post("/generate", travelingSalesmanController.generateMatrix);
router.post("/compute", travelingSalesmanController.computeAlgorithms);
router.get("/leaderboard", travelingSalesmanController.getLeaderboard);
router.get("/stats/:playerName", travelingSalesmanController.getPlayerStats);

router.post(
  "/sessions",
  authenticateToken,
  travelingSalesmanController.saveSession
);

module.exports = router;
