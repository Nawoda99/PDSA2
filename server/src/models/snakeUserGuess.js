const { DataTypes } = require('sequelize');
const sequelize = require('../config/DB');
const SnakeGameRound = require('./snakeGameRound');

const SnakeUserGuess = sequelize.define('SnakeUserGuess', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'guess_id' 
    },
    userName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'user_name'
    },
    guessAnswer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'guess_answer'
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: 'is_correct'
    },
    roundId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'round_id',
        references: {
            model: SnakeGameRound,
            key: 'round_id'
        }
    }
}, {
    tableName: 'snake_user_guesses',
    timestamps: false
});

SnakeGameRound.hasMany(SnakeUserGuess, { foreignKey: 'roundId' });
SnakeUserGuess.belongsTo(SnakeGameRound, { foreignKey: 'roundId' });

module.exports = SnakeUserGuess;