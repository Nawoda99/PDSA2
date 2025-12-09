const sequelize = require("../config/DB");
require("dotenv").config();

const User = require("./User");
const EightQueens = require("./eightQueens");

module.exports = {
  sequelize,
  User,
  EightQueens,
};
