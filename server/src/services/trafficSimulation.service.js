const TrafficSimulationModel = require("../models/trafficeSimulations");

function generateTrafficNetwork(minCapacity = 5, maxCapacity = 15) {
  const edges = [
    { from: "A", to: "B" },
    { from: "A", to: "C" },
    { from: "A", to: "D" },
    { from: "B", to: "E" },
    { from: "B", to: "F" },
    { from: "C", to: "E" },
    { from: "C", to: "F" },
    { from: "D", to: "F" },
    { from: "E", to: "G" },
    { from: "E", to: "H" },
    { from: "F", to: "H" },
    { from: "G", to: "T" },
    { from: "H", to: "T" },
  ];

  const network = edges.map((edge) => ({
    ...edge,
    capacity:
      Math.floor(Math.random() * (maxCapacity - minCapacity + 1)) + minCapacity,
  }));

  return network;
}

function fordFulkerson(network, source, sink) {
  const startTime = performance.now();

  const graph = {};
  const nodes = new Set();

  network.forEach(({ from, to, capacity }) => {
    nodes.add(from);
    nodes.add(to);
    if (!graph[from]) graph[from] = {};
    if (!graph[to]) graph[to] = {};
    graph[from][to] = capacity;
    graph[to][from] = 0; // Reverse edge
  });

  const residualGraph = JSON.parse(JSON.stringify(graph));

  function dfs(current, sink, visited, minCapacity) {
    if (current === sink) return minCapacity;

    visited.add(current);

    for (let neighbor in residualGraph[current]) {
      if (!visited.has(neighbor) && residualGraph[current][neighbor] > 0) {
        const bottleneck = Math.min(
          minCapacity,
          residualGraph[current][neighbor]
        );
        const flow = dfs(neighbor, sink, visited, bottleneck);

        if (flow > 0) {
          residualGraph[current][neighbor] -= flow;
          residualGraph[neighbor][current] += flow;
          return flow;
        }
      }
    }

    return 0;
  }

  let maxFlow = 0;
  let flow;

  do {
    const visited = new Set();
    flow = dfs(source, sink, visited, Infinity);
    maxFlow += flow;
  } while (flow > 0);

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return { maxFlow, executionTime };
}

function edmondsKarp(network, source, sink) {
  const startTime = performance.now();

  const graph = {};
  const nodes = new Set();

  network.forEach(({ from, to, capacity }) => {
    nodes.add(from);
    nodes.add(to);
    if (!graph[from]) graph[from] = {};
    if (!graph[to]) graph[to] = {};
    graph[from][to] = capacity;
    graph[to][from] = 0;
  });

  const residualGraph = JSON.parse(JSON.stringify(graph));

  function bfs(source, sink) {
    const queue = [source];
    const visited = new Set([source]);
    const parent = {};

    while (queue.length > 0) {
      const current = queue.shift();

      for (let neighbor in residualGraph[current]) {
        if (!visited.has(neighbor) && residualGraph[current][neighbor] > 0) {
          visited.add(neighbor);
          parent[neighbor] = current;
          queue.push(neighbor);

          if (neighbor === sink) {
            let minCapacity = Infinity;
            let node = sink;

            while (node !== source) {
              const prev = parent[node];
              minCapacity = Math.min(minCapacity, residualGraph[prev][node]);
              node = prev;
            }

            node = sink;
            while (node !== source) {
              const prev = parent[node];
              residualGraph[prev][node] -= minCapacity;
              residualGraph[node][prev] += minCapacity;
              node = prev;
            }

            return minCapacity;
          }
        }
      }
    }

    return 0;
  }

  let maxFlow = 0;
  let flow;

  do {
    flow = bfs(source, sink);
    maxFlow += flow;
  } while (flow > 0);

  const endTime = performance.now();
  const executionTime = endTime - startTime;

  return { maxFlow, executionTime };
}

async function calculateMaxFlow(network) {
  const source = "A";
  const sink = "T";

  const fordFulkersonResult = fordFulkerson(network, source, sink);
  const edmondsKarpResult = edmondsKarp(network, source, sink);

  return {
    maxFlow: fordFulkersonResult.maxFlow,
    fordFulkersonTime: fordFulkersonResult.executionTime,
    edmondsKarpTime: edmondsKarpResult.executionTime,
  };
}

async function validateAnswer(network, playerAnswer) {
  if (typeof playerAnswer !== "number" || playerAnswer < 0) {
    throw new Error("Invalid answer. Please provide a positive number.");
  }

  const { maxFlow, fordFulkersonTime, edmondsKarpTime } =
    await calculateMaxFlow(network);

  const isCorrect = playerAnswer === maxFlow;

  return {
    isCorrect,
    correctAnswer: maxFlow,
    playerAnswer,
    fordFulkersonTime,
    edmondsKarpTime,
  };
}

async function saveGameResult(data) {
  try {
    const {
      playerId,
      playerName,
      network,
      playerAnswer,
      correctAnswer,
      isCorrect,
      fordFulkersonTime,
      edmondsKarpTime,
      timeTaken,
    } = data;

    const gameResult = await TrafficSimulationModel.create({
      playerId,
      playerName,
      networkGraph: network,
      playerAnswer,
      correctAnswer,
      isCorrect,
      algorithm1Name: "Ford-Fulkerson",
      algorithm1Time: fordFulkersonTime,
      algorithm2Name: "Edmonds-Karp",
      algorithm2Time: edmondsKarpTime,
      timeTaken: timeTaken || 0,
    });

    return {
      success: true,
      message: "Game result saved successfully",
      data: gameResult,
    };
  } catch (error) {
    throw new Error(`Failed to save game result: ${error.message}`);
  }
}

async function getPlayerHistory(playerId) {
  try {
    const history = await TrafficSimulationModel.findAll({
      where: { playerId },
      order: [["createdAt", "DESC"]],
    });

    return history;
  } catch (error) {
    throw new Error(`Failed to retrieve player history: ${error.message}`);
  }
}

async function getLeaderboard() {
  try {
    const { Sequelize } = require("sequelize");

    const leaderboard = await TrafficSimulationModel.findAll({
      attributes: [
        "playerId",
        "playerName",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "totalGames"],
        [
          Sequelize.fn(
            "SUM",
            Sequelize.literal('CASE WHEN "isCorrect" = true THEN 1 ELSE 0 END')
          ),
          "correctAnswers",
        ],
        [
          Sequelize.fn("AVG", Sequelize.col("algorithm1Time")),
          "avgFordFulkersonTime",
        ],
        [
          Sequelize.fn("AVG", Sequelize.col("algorithm2Time")),
          "avgEdmondsKarpTime",
        ],
      ],
      group: ["playerId", "playerName"],
      order: [[Sequelize.literal('"correctAnswers"'), "DESC"]],
      limit: 10,
    });

    return leaderboard;
  } catch (error) {
    throw new Error(`Failed to retrieve leaderboard: ${error.message}`);
  }
}

async function getAllGameResults() {
  try {
    const results = await TrafficSimulationModel.findAll({
      order: [["createdAt", "DESC"]],
      limit: 100,
    });

    return results;
  } catch (error) {
    throw new Error(`Failed to retrieve game results: ${error.message}`);
  }
}

module.exports = {
  generateTrafficNetwork,
  calculateMaxFlow,
  validateAnswer,
  saveGameResult,
  getPlayerHistory,
  getLeaderboard,
  getAllGameResults,
  fordFulkerson,
  edmondsKarp,
};
