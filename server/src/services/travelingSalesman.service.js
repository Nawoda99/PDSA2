function genRandomDistanceMatrix(n = 10, min = 50, max = 100) {
  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const distance = Math.floor(Math.random() * (max - min + 1)) + min;
      matrix[i][j] = distance;
      matrix[j][i] = distance;
    }
  }
  return matrix;
}

function pathDistance(matrix, path) {
  let sum = 0;
  for (let i = 0; i < path.length - 1; i++) {
    sum += matrix[path[i]][path[i + 1]];
  }
  return sum;
}

function primMST(matrix, home, selected) {
  try {
    if (!matrix || !Array.isArray(selected) || selected.length === 0) {
      throw new Error("Invalid input parameters");
    }

    const vertices = [home, ...selected.filter((c) => c !== home)];
    const n = vertices.length;

    if (n === 1) {
      return { distance: 0, route: [home, home], error: null };
    }

    const visited = Array(n).fill(false);
    const key = Array(n).fill(Infinity);
    const parent = Array(n).fill(-1);

    key[0] = 0;

    for (let count = 0; count < n; count++) {
      let u = -1;
      let minKey = Infinity;
      for (let v = 0; v < n; v++) {
        if (!visited[v] && key[v] < minKey) {
          minKey = key[v];
          u = v;
        }
      }

      if (u === -1) break;
      visited[u] = true;

      for (let v = 0; v < n; v++) {
        const cityU = vertices[u];
        const cityV = vertices[v];
        const weight = matrix[cityU][cityV];

        if (!visited[v] && weight > 0 && weight < key[v]) {
          key[v] = weight;
          parent[v] = u;
        }
      }
    }

    const adj = Array.from({ length: n }, () => []);
    for (let i = 1; i < n; i++) {
      if (parent[i] !== -1) {
        adj[parent[i]].push(i);
        adj[i].push(parent[i]);
      }
    }

    const tour = [];
    const visitedDFS = Array(n).fill(false);

    function dfs(node) {
      visitedDFS[node] = true;
      tour.push(vertices[node]);

      for (const neighbor of adj[node]) {
        if (!visitedDFS[neighbor]) {
          dfs(neighbor);
        }
      }
    }

    dfs(0);
    tour.push(home);

    const distance = pathDistance(matrix, tour);

    return { distance, route: tour, error: null };
  } catch (error) {
    return { distance: null, route: [], error: error.message };
  }
}

function dijkstraSPT(matrix, home, selected) {
  try {
    if (!matrix || !Array.isArray(selected) || selected.length === 0) {
      throw new Error("Invalid input parameters");
    }

    const vertices = [home, ...selected.filter((c) => c !== home)];
    const n = vertices.length;

    if (n === 1) {
      return { distance: 0, route: [home, home], error: null };
    }

    const dist = Array(matrix.length).fill(Infinity);
    const visited = Array(matrix.length).fill(false);

    dist[home] = 0;

    for (let count = 0; count < matrix.length; count++) {
      let u = -1;
      let minDist = Infinity;

      for (let v = 0; v < matrix.length; v++) {
        if (!visited[v] && dist[v] < minDist) {
          minDist = dist[v];
          u = v;
        }
      }

      if (u === -1) break;
      visited[u] = true;

      for (let v = 0; v < matrix.length; v++) {
        const weight = matrix[u][v];
        if (!visited[v] && weight > 0 && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight;
        }
      }
    }

    const sortedCities = selected
      .filter((c) => c !== home)
      .sort((a, b) => dist[a] - dist[b]);

    const route = [home, ...sortedCities, home];
    const distance = pathDistance(matrix, route);

    return { distance, route, error: null };
  } catch (error) {
    return { distance: null, route: [], error: error.message };
  }
}

function greedyTSP(matrix, home, selected) {
  try {
    if (!matrix || !Array.isArray(selected) || selected.length === 0) {
      throw new Error("Invalid input parameters");
    }

    if (selected.length === 0) {
      return { distance: 0, route: [home, home], error: null };
    }

    const unvisited = new Set(selected.filter((c) => c !== home));
    const route = [home];
    let current = home;

    while (unvisited.size > 0) {
      let next = null;
      let best = Infinity;

      unvisited.forEach((city) => {
        if (matrix[current][city] < best) {
          best = matrix[current][city];
          next = city;
        }
      });

      if (next === null) break;

      route.push(next);
      unvisited.delete(next);
      current = next;
    }

    route.push(home);
    const distance = pathDistance(matrix, route);

    return { route, distance, error: null };
  } catch (error) {
    return { distance: null, route: [], error: error.message };
  }
}

async function saveTravelingSalesmanSession(sessionData) {
  const TravelingSalesman = require("../models/travelingSalesman");

  try {
    const { playerName, homeCity, selectedCities, distanceMatrix, results } =
      sessionData;

    if (!playerName || playerName.trim().length < 2) {
      throw new Error("Player name must be at least 2 characters");
    }

    if (homeCity < 0 || homeCity > 9) {
      throw new Error("Invalid home city");
    }

    if (!Array.isArray(selectedCities) || selectedCities.length === 0) {
      throw new Error("Must select at least one city");
    }

    let bestAlgorithm = null;
    let bestDistance = Infinity;

    Object.entries(results).forEach(([algorithm, result]) => {
      if (result.distance && result.distance < bestDistance) {
        bestDistance = result.distance;
        bestAlgorithm = algorithm;
      }
    });

    const session = await TravelingSalesman.create({
      playerName: playerName.trim(),
      homeCity,
      selectedCities,
      distanceMatrix,
      primMSTDistance: results.primMST?.distance,
      primMSTRoute: results.primMST?.route,
      primMSTTimeMs: results.primMST?.timeMs,
      dijkstraSPTDistance: results.dijkstraSPT?.distance,
      dijkstraSPTRoute: results.dijkstraSPT?.route,
      dijkstraSPTTimeMs: results.dijkstraSPT?.timeMs,
      greedyTSDistance: results.greedyTSP?.distance,
      greedyTSRoute: results.greedyTSP?.route,
      greedyTSTimeMs: results.greedyTSP?.timeMs,
      bestAlgorithm,
      bestDistance,
    });

    return session;
  } catch (error) {
    throw new Error(`Failed to save session: ${error.message}`);
  }
}

async function getPlayerStats(playerName) {
  const TravelingSalesman = require("../models/travelingSalesman");
  const { Op } = require("sequelize");

  try {
    const sessions = await TravelingSalesman.findAll({
      where: {
        playerName: {
          [Op.like]: playerName.trim(),
        },
      },
      order: [["bestDistance", "ASC"]],
    });

    if (sessions.length === 0) {
      return null;
    }

    const totalGames = sessions.length;
    const bestSession = sessions[0];
    const avgDistance =
      sessions.reduce((sum, s) => sum + (s.bestDistance || 0), 0) / totalGames;

    return {
      totalGames,
      bestDistance: bestSession.bestDistance,
      bestAlgorithm: bestSession.bestAlgorithm,
      avgDistance: parseFloat(avgDistance.toFixed(2)),
      lastPlayed: sessions[sessions.length - 1].createdAt,
      primMSTTimeMs: bestSession.primMSTTimeMs,
      dijkstraSPTTimeMs: bestSession.dijkstraSPTTimeMs,
      greedyTSTimeMs: bestSession.greedyTSTimeMs,
    };
  } catch (error) {
    throw new Error(`Failed to get player stats: ${error.message}`);
  }
}

async function getLeaderboard(limit = 10) {
  const TravelingSalesman = require("../models/travelingSalesman");
  const { Op } = require("sequelize");

  try {
    const sessions = await TravelingSalesman.findAll({
      where: {
        bestDistance: {
          [Op.ne]: null,
        },
      },
      order: [
        ["bestDistance", "ASC"],
        ["createdAt", "DESC"],
      ],
      limit: parseInt(limit),
    });

    return sessions;
  } catch (error) {
    throw new Error(`Failed to get leaderboard: ${error.message}`);
  }
}
async function computeAlgorithms(matrix, home, selected) {
  try {
    const results = {};

    const t0 = performance.now();
    results.primMST = primMST(matrix, home, selected);
    results.primMST.timeMs = Math.round(performance.now() - t0);

    const t1 = performance.now();
    results.dijkstraSPT = dijkstraSPT(matrix, home, selected);
    results.dijkstraSPT.timeMs = Math.round(performance.now() - t1);

    const t2 = performance.now();
    results.greedyTSP = greedyTSP(matrix, home, selected);
    results.greedyTSP.timeMs = Math.round(performance.now() - t2);

    return results;
  } catch (error) {
    throw new Error(`Failed to compute algorithms: ${error.message}`);
  }
}
module.exports = {
  genRandomDistanceMatrix,
  primMST,
  dijkstraSPT,
  greedyTSP,
  computeAlgorithms,
  saveTravelingSalesmanSession,
  getPlayerStats,
  getLeaderboard,
  pathDistance,
};
