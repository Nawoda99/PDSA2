const User = require("../models/User");

class UserService {
  async findOrCreateUser(username) {
    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username });
      await user.save();
    }
    return user;
  }

  async findUserById(userId) {
    const user = await User.findById(userId);
    return user;
  }

  async findUserByUsername(username) {
    const user = await User.findOne({ username });
    return user;
  }

  async getAllUsers() {
    const users = await User.find().select("-__v").sort({ createdAt: -1 });
    return users;
  }

  async updateUser(userId, updateData) {
    const user = await User.findById(userId);

    if (!user) {
      return null;
    }

    if (updateData.username) user.username = updateData.username;
    if (typeof updateData.isActive !== "undefined")
      user.isActive = updateData.isActive;

    await user.save();
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);
    return user;
  }

  async checkUsernameExists(username) {
    const user = await User.findOne({ username });
    return !!user;
  }

  async getActiveUsersCount() {
    const count = await User.countDocuments({ isActive: true });
    return count;
  }
}

module.exports = new UserService();
