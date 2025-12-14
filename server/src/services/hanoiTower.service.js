function hanoiRecursive(n, from = "A", to = "D", aux = "B", moves = []) {
  if (n === 0) return moves;

  hanoiRecursive(n - 1, from, aux, to, moves);

  moves.push({ disk: n, from, to });

  hanoiRecursive(n - 1, aux, to, from, moves);

  return moves;
}

function hanoiIterative(n, from = "A", to = "D", aux = "B") {
  const pegs = { [from]: [], [aux]: [], [to]: [] };

  for (let i = n; i >= 1; i--) {
    pegs[from].push(i);
  }

  const moves = [];
  const totalMoves = Math.pow(2, n) - 1;

  const pegOrder =
    n % 2 === 0
      ? [
          [from, aux],
          [from, to],
          [aux, to],
        ]
      : [
          [from, to],
          [from, aux],
          [aux, to],
        ];

  for (let i = 0; i < totalMoves; i++) {
    const [src, dst] = pegOrder[i % 3];
    const srcStack = pegs[src];
    const dstStack = pegs[dst];

    if (srcStack.length === 0) {
      const disk = dstStack.pop();
      srcStack.push(disk);
      moves.push({ disk, from: dst, to: src });
    } else if (dstStack.length === 0) {
      const disk = srcStack.pop();
      dstStack.push(disk);
      moves.push({ disk, from: src, to: dst });
    } else if (srcStack[srcStack.length - 1] > dstStack[dstStack.length - 1]) {
      const disk = dstStack.pop();
      srcStack.push(disk);
      moves.push({ disk, from: dst, to: src });
    } else {
      const disk = srcStack.pop();
      dstStack.push(disk);
      moves.push({ disk, from: src, to: dst });
    }
  }

  return moves;
}

const fsMemo = new Map();

function frameStewart(n, from = "A", to = "D", aux = ["B", "C"], moves = []) {
  if (n === 0) return moves;
  if (n === 1) {
    moves.push({ disk: 1, from, to });
    return moves;
  }

  const key = `${n}-${from}-${to}-${aux.join(",")}`;
  if (fsMemo.has(key)) {
    return [...fsMemo.get(key)];
  }

  if (aux.length === 1) {
    hanoiRecursive(n, from, to, aux[0], moves);
  } else {
    const k = Math.ceil(n - Math.sqrt(2 * n + 1) + 1);

    frameStewart(k, from, aux[0], [to, ...aux.slice(1)], moves);

    frameStewart(n - k, from, to, aux.slice(1), moves);

    frameStewart(k, aux[0], to, [from, ...aux.slice(1)], moves);
  }

  fsMemo.set(key, [...moves]);
  return moves;
}
function hanoi4Simple(
  n,
  from = "A",
  to = "D",
  aux1 = "B",
  aux2 = "C",
  moves = []
) {
  if (n === 0) return moves;
  if (n === 1) {
    moves.push({ disk: 1, from, to });
    return moves;
  }

  hanoi4Simple(n - 1, from, aux1, aux2, to, moves);

  moves.push({ disk: n, from, to });

  hanoi4Simple(n - 1, aux1, to, from, aux2, moves);

  return moves;
}

function calculateOptimalMoves(disks, pegs) {
  if (pegs === 3) {
    return Math.pow(2, disks) - 1;
  } else if (pegs === 4) {
    let total = 0;
    for (let k = 1; k <= disks; k++) {
      const moves =
        2 * calculateOptimalMoves(k, 4) + calculateOptimalMoves(disks - k, 3);
      if (k === 1 || moves < total) {
        total = moves;
      }
    }
    return total;
  }
  return -1;
}

function validateSolution(playerSequence, disks, pegs) {
  try {
    const pegNames = pegs === 3 ? ["A", "B", "D"] : ["A", "B", "C", "D"];
    const state = {};
    pegNames.forEach((peg) => (state[peg] = []));

    for (let i = disks; i >= 1; i--) {
      state["A"].push(i);
    }

    for (const move of playerSequence) {
      const { from, to, disk } = move;

      if (!pegNames.includes(from) || !pegNames.includes(to)) {
        return { valid: false, error: "Invalid peg name" };
      }

      const fromStack = state[from];
      if (fromStack.length === 0) {
        return { valid: false, error: `No disk on peg ${from}` };
      }

      const topDisk = fromStack[fromStack.length - 1];

      if (disk !== undefined && topDisk !== disk) {
        return { valid: false, error: `Disk mismatch on peg ${from}` };
      }

      const toStack = state[to];
      if (toStack.length > 0 && topDisk > toStack[toStack.length - 1]) {
        return {
          valid: false,
          error: "Cannot place larger disk on smaller disk",
        };
      }

      toStack.push(fromStack.pop());
    }

    const destPeg = pegs === 3 ? "D" : "D";
    const allOnDest = state[destPeg].length === disks;

    if (!allOnDest) {
      return { valid: false, error: "Not all disks moved to destination" };
    }

    for (let i = 0; i < disks; i++) {
      if (state[destPeg][i] !== disks - i) {
        return { valid: false, error: "Disks not in correct order" };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function computeAlgorithms(disks, pegs) {
  try {
    const results = {};

    if (pegs === 3) {
      const t0 = performance.now();
      const recursiveMoves = hanoiRecursive(disks);
      const recursiveTime = performance.now() - t0;

      results.recursive = {
        moves: recursiveMoves.length,
        sequence: recursiveMoves,
        timeMs: recursiveTime.toFixed(4),
      };

      const t1 = performance.now();
      const iterativeMoves = hanoiIterative(disks);
      const iterativeTime = performance.now() - t1;

      results.iterative = {
        moves: iterativeMoves.length,
        sequence: iterativeMoves,
        timeMs: iterativeTime.toFixed(4),
      };

      results.optimalMoves = Math.pow(2, disks) - 1;
      results.bestAlgorithm = "Both Equal (Optimal)";
    } else if (pegs === 4) {
      fsMemo.clear();
      const t2 = performance.now();
      const frameStewartMoves = frameStewart(disks);
      const frameStewartTime = performance.now() - t2;

      results.frameStewart = {
        moves: frameStewartMoves.length,
        sequence: frameStewartMoves,
        timeMs: frameStewartTime.toFixed(4),
      };

      const t3 = performance.now();
      const simpleMoves = hanoi4Simple(disks);
      const simpleTime = performance.now() - t3;

      results.simple = {
        moves: simpleMoves.length,
        sequence: simpleMoves,
        timeMs: simpleTime.toFixed(4),
      };

      results.optimalMoves = frameStewartMoves.length;
      results.bestAlgorithm =
        frameStewartMoves.length < simpleMoves.length
          ? "Frame-Stewart"
          : frameStewartMoves.length === simpleMoves.length
          ? "Both Equal"
          : "Simple";
    }

    return results;
  } catch (error) {
    throw new Error(`Failed to compute algorithms: ${error.message}`);
  }
}

async function saveHanoiSession(sessionData) {
  const HanoiTower = require("../models/hanoiTower");

  try {
    const { playerName, disks, pegs, moves, time, playerMoves } = sessionData;

    if (!playerName || playerName.trim().length < 2) {
      throw new Error("Player name must be at least 2 characters");
    }

    if (disks < 3 || disks > 10) {
      throw new Error("Disks must be between 3 and 10");
    }

    if (pegs < 3 || pegs > 4) {
      throw new Error("Pegs must be 3 or 4");
    }

    if (!Array.isArray(playerMoves) || playerMoves.length === 0) {
      throw new Error("Player moves are required");
    }

    const playerSequence = playerMoves.map((moveStr, index) => {
      if (typeof moveStr === "string") {
        const [from, to] = moveStr.split("->");
        return { from, to, disk: index + 1 };
      }
      return moveStr;
    });

    const validation = validateSolution(playerSequence, disks, pegs);

    const algorithms = await computeAlgorithms(disks, pegs);

    const session = await HanoiTower.create({
      playerName: playerName.trim(),
      disks,
      pegs,
      playerMoves: moves,
      playerTime: time,
      playerSequence,
      isCorrect: validation.valid,
      recursiveDistance: algorithms.recursive?.moves,
      recursiveSequence: algorithms.recursive?.sequence,
      recursiveTimeMs: algorithms.recursive?.timeMs,
      iterativeDistance: algorithms.iterative?.moves,
      iterativeSequence: algorithms.iterative?.sequence,
      iterativeTimeMs: algorithms.iterative?.timeMs,
      optimalMoves: algorithms.optimalMoves,
      bestAlgorithm: algorithms.bestAlgorithm,
    });

    return { session, validation };
  } catch (error) {
    throw new Error(`Failed to save session: ${error.message}`);
  }
}

function generateGame() {
  const disks = Math.floor(Math.random() * 6) + 5;
  const pegs = Math.random() > 0.5 ? 4 : 3;

  return { disks, pegs };
}

async function getPlayerGames(playerName) {
  try {
    const games = await HanoiTowerModel.findAll({
      where: {
        player: playerName,
      },
      order: [["createdAt", "DESC"]],
    });
    return games;
  } catch (error) {
    console.error("getPlayerGames error:", error);
    throw new Error(`Failed to get player games: ${error.message}`);
  }
}

module.exports = {
  hanoiRecursive,
  hanoiIterative,
  frameStewart,
  hanoi4Simple,
  calculateOptimalMoves,
  validateSolution,
  computeAlgorithms,
  saveHanoiSession,
  generateGame,
  getPlayerGames,
};
