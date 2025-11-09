const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticateToken } = require("../middlewares/auth.middleware");
const { validateUsername } = require("../validations/user.validation");

router.post("/login", validateUsername, userController.loginOrRegister);
router.get("/profile", authenticateToken, userController.getProfile);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.get("/username/:username", userController.getUserByUsername);
router.put("/:id", authenticateToken, userController.updateUser);
router.delete("/:id", authenticateToken, userController.deleteUser);

module.exports = router;
