const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");

const TravelingSalesman = sequelize.define(
  "TravelingSalesman",
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
    homeCity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 9,
      },
    },
    selectedCities: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    distanceMatrix: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    primMSTDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    primMSTRoute: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    primMSTTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    dijkstraSPTDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    dijkstraSPTRoute: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    dijkstraSPTTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    greedyTSDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    greedyTSRoute: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    greedyTSTimeMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    bestAlgorithm: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bestDistance: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    tableName: "traveling_salesman",
    timestamps: true,
    indexes: [
      {
        fields: ["playerName"],
      },
      {
        fields: ["bestDistance"],
      },
    ],
  }
);

module.exports = TravelingSalesman;
