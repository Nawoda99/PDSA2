const User = require("../models/User");

class UserService {
  async findOrCreateUser(username) {
    const [user, created] = await User.findOrCreate({
      where: { username },
      defaults: { username },
    });
    return user;
  }

  async findUserById(userId) {
    const user = await User.findByPk(userId);
    return user;
  }

  async findUserByUsername(username) {
    const user = await User.findOne({ where: { username } });
    return user;
  }

  async getAllUsers() {
    const users = await User.findAll({
      order: [["createdAt", "DESC"]],
    });
    return users;
  }

  async updateUser(userId, updateData) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    if (updateData.username) user.username = updateData.username;
    if (typeof updateData.isActive !== "undefined")
      user.isActive = updateData.isActive;

    await user.save();
    return user;
  }

  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) return null;

    await user.destroy();
    return user;
  }

  async checkUsernameExists(username) {
    const user = await User.findOne({ where: { username } });
    return !!user;
  }

  async getActiveUsersCount() {
    const count = await User.count({ where: { isActive: true } });
    return count;
  }
}

module.exports = new UserService();
