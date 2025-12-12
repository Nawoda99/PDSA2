const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");

const QueensPerformance = sequelize.define(
  "QueensPerformance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    algorithmType: {
      type: DataTypes.ENUM("sequential", "threaded"),
      allowNull: false,
    },
    boardSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 8,
    },
    solutionsFound: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    executionTime: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    threadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    memoryUsed: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "queens_performance",
    timestamps: true,
    indexes: [
      {
        fields: ["algorithmType"],
      },
      {
        fields: ["boardSize"],
      },
    ],
  }
);

module.exports = QueensPerformance;
