
const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");

const HanoiTower = sequelize.define(
  "HanoiTower",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    disks: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 5,
        max: 10,
      },
    },
    pegs: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 3,
        max: 4,
      },
    },
    playerMoves: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    playerSequence: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    recursiveDistance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    recursiveSequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    recursiveTimeMs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    iterativeDistance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    iterativeSequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    iterativeTimeMs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    frameStewartDistance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    frameStewartSequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    frameStewartTimeMs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    simpleDistance: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    simpleSequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    simpleTimeMs: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    optimalMoves: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bestAlgorithm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "hanoi_tower",
    timestamps: true,
    indexes: [
      {
        fields: ["playerName"],
      },
      {
        fields: ["disks"],
      },
      {
        fields: ["pegs"],
      },
    ],
  }
);

module.exports = HanoiTower;