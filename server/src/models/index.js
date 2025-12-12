const sequelize = require("../config/DB");
require("dotenv").config();

const User = require("./User");
const EightQueens = require("./eightQueens");
const HanoiTower = require("./hanoiTower");
const QueensPerformance = require("./queensPerformance");
const TrafficSimulation = require("./trafficeSimulations");

module.exports = {
  sequelize,
  User,
  EightQueens,
  QueensPerformance,
  TrafficSimulation,
  HanoiTower,
};
