
const express = require("express");
const router = express.Router();
const hanoiController = require("../controllers/hanoiTower.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");

router.get("/generate", hanoiController.generateGame);
router.post("/compute", hanoiController.computeSolutions);
router.post("/validate", hanoiController.validateSolution);
router.get("/stats/:playerName", hanoiController.getPlayerStats);


router.post("/submit", authenticateToken, hanoiController.submitGame);

module.exports = router;