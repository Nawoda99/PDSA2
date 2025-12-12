const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");
const User = require("./User");

const EightQueens = sequelize.define(
  "EightQueens",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    solution: {
      type: DataTypes.JSON, // stores 8x8 board as JSON
      allowNull: false,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    player: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    movesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in seconds
      defaultValue: 0,
    },
  },
  {
    tableName: "eight_queens",
    timestamps: true,
    indexes: [
      {
        fields: ["playerId"],
      },
    ],
  }
);

// Define association
EightQueens.belongsTo(User, {
  foreignKey: "playerId",
  as: "userDetails",
});

module.exports = EightQueens;
