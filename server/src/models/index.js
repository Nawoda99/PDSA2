const { connectDB } = require("../config/DB");
require("dotenv").config();

const User = require("./User");

module.exports = {
  connectDB,
  User,
};
