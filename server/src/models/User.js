const { DataTypes } = require("sequelize");
const sequelize = require("../config/DB");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 20],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    timestamps: true, // adds createdAt and updatedAt
    indexes: [
      {
        unique: true,
        fields: ["username"],
      },
    ],
  }
);

module.exports = User;
