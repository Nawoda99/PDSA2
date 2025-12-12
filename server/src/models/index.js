const sequelize = require("../config/DB");
require("dotenv").config();

const User = require("./User");
const EightQueens = require("./eightQueens");
const QueensPerformance = require("./queensPerformance");
const TrafficSimulation = require("./trafficeSimulations");
const TravelingSalesman = require("./travelingSalesman");

module.exports = {
  sequelize,
  User,
  EightQueens,
  QueensPerformance,
  TrafficSimulation,
  TravelingSalesman,
};
