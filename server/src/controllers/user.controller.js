const userService = require("../services/user.service");
const jwt = require("jsonwebtoken");

class UserController {
  async loginOrRegister(req, res) {
    try {
      const { username } = req.body;

      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }

      const user = await userService.findOrCreateUser(username);

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: "User account is deactivated",
        });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      const isNewUser = user.createdAt.getTime() === user.updatedAt.getTime();

      res.status(200).json({
        success: true,
        message: isNewUser
          ? "User registered successfully"
          : "Login successful",
        data: {
          user: {
            id: user.id,
            username: user.username,
            createdAt: user.createdAt,
          },
          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserById(req, res) {
    try {
      const user = await userService.findUserById(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUserByUsername(req, res) {
    try {
      const user = await userService.findUserByUsername(req.params.username);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async updateUser(req, res) {
    try {
      const { username, isActive } = req.body;

      const user = await userService.updateUser(req.params.id, {
        username,
        isActive,
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteUser(req, res) {
    try {
      const user = await userService.deleteUser(req.params.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProfile(req, res) {
    try {
      const user = await userService.findUserById(req.user.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new UserController();
