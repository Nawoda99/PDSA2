const { DataTypes } = require('sequelize');
const sequelize = require('../config/DB');
const SnakeGameRound = require('./snakeGameRound');

const SnakeAlgoPerformance = sequelize.define('SnakeAlgoPerformance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'perf_id' 
    },
    algorithmName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'algorithm_name'
    },
    timeTakenNanos: {
        type: DataTypes.BIGINT,
        allowNull: false,
        field: 'time_taken_nanos'
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
    tableName: 'snake_algo_performance',
    timestamps: false
});

SnakeGameRound.hasMany(SnakeAlgoPerformance, { foreignKey: 'roundId' });
SnakeAlgoPerformance.belongsTo(SnakeGameRound, { foreignKey: 'roundId' });

module.exports = SnakeAlgoPerformance;