const sequelize = require("../config/DB");
require("dotenv").config();

const User = require("./User");
const EightQueens = require("./eightQueens");
const TrafficSimulation = require("./trafficeSimulations");

module.exports = {
  sequelize,
  User,
  EightQueens,
  TrafficSimulation,
};
