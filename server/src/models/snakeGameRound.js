const { DataTypes } = require('sequelize');
const sequelize = require('../config/DB');

const SnakeGameRound = sequelize.define('SnakeGameRound', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'round_id' 
    },
    boardSize: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'board_size'
    },
    correctAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'correct_answer'
    },
    boardConfiguration: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'snake_game_rounds', 
    timestamps: false 
});

module.exports = SnakeGameRound;