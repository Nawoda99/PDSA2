const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");
const User = require("./User");

const TrafficSimulation = sequelize.define(
  "TrafficSimulation",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    playerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    playerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    networkGraph: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    playerAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    correctAnswer: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    algorithm1Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Ford-Fulkerson",
    },
    algorithm1Time: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    algorithm2Name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "Edmonds-Karp",
    },
    algorithm2Time: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    timeTaken: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "traffic_simulations",
    timestamps: true,
    indexes: [
      {
        fields: ["playerId"],
      },
      {
        fields: ["isCorrect"],
      },
    ],
  }
);

TrafficSimulation.belongsTo(User, {
  foreignKey: "playerId",
  as: "player",
});

User.hasMany(TrafficSimulation, {
  foreignKey: "playerId",
  as: "trafficGames",
});

module.exports = TrafficSimulation;
