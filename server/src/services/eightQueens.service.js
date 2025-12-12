const nQueensModel = require("../models/eightQueens");
const QueensPerformance = require("../models/queensPerformance");
const { ANSWERSTATUS } = require("../enums/enums");
const { Worker } = require("worker_threads");
const path = require("path");

async function generateBoard(boardSize = 8) {
  try {
    if (boardSize < 1 || boardSize > 20) {
      throw new Error("Board size must be between 1 and 20");
    }
    const board = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize).fill(0));
    return board;
  } catch (error) {
    throw new Error(`Failed to generate board: ${error.message}`);
  }
}

async function getSolutionsSequential(boardSize = 8) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  const board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(0)
  );
  const solutions = [];

  function isSafe(board, row, col) {
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) {
        return false;
      }
    }
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) {
        return false;
      }
    }
    for (let i = row, j = col; i >= 0 && j < board.length; i--, j++) {
      if (board[i][j] === 1) {
        return false;
      }
    }
    return true;
  }

  function backtrack(row) {
    if (row === board.length) {
      solutions.push(board.map((row) => row.slice()));
      return;
    }

    for (let col = 0; col < board.length; col++) {
      if (isSafe(board, row, col)) {
        board[row][col] = 1;
        backtrack(row + 1);
        board[row][col] = 0;
      }
    }
  }

  backtrack(0);

  const endTime = performance.now();
  const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;
  const executionTime = endTime - startTime;
  const memoryUsed = endMemory - startMemory;

  try {
    await QueensPerformance.create({
      algorithmType: "sequential",
      boardSize: boardSize,
      solutionsFound: solutions.length,
      executionTime: executionTime,
      threadCount: 1,
      memoryUsed: memoryUsed,
    });
  } catch (error) {
    console.error("Failed to save performance metrics:", error.message);
  }

  return {
    solutions,
    executionTime,
    memoryUsed,
    algorithmType: "sequential",
  };
}

async function getSolutionsThreaded(boardSize = 8) {
  const startTime = performance.now();
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;

  return new Promise((resolve, reject) => {
    const numThreads = Math.min(boardSize, 4);
    const solutionsPerThread = [];
    let completedThreads = 0;

    for (let col = 0; col < boardSize; col++) {
      const worker = new Worker(
        path.join(__dirname, "../utils/Functions/Eight-Queens/queensWorker.js"),
        {
          workerData: { boardSize, startCol: col },
        }
      );

      worker.on("message", (solutions) => {
        solutionsPerThread.push(...solutions);
        completedThreads++;

        if (completedThreads === boardSize) {
          const endTime = performance.now();
          const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;
          const executionTime = endTime - startTime;
          const memoryUsed = endMemory - startMemory;

          QueensPerformance.create({
            algorithmType: "threaded",
            boardSize: boardSize,
            solutionsFound: solutionsPerThread.length,
            executionTime: executionTime,
            threadCount: numThreads,
            memoryUsed: memoryUsed,
          })
            .then(() => {
              resolve({
                solutions: solutionsPerThread,
                executionTime,
                memoryUsed,
                algorithmType: "threaded",
                threadCount: numThreads,
              });
            })
            .catch((error) => {
              console.error(
                "Failed to save performance metrics:",
                error.message
              );
              resolve({
                solutions: solutionsPerThread,
                executionTime,
                memoryUsed,
                algorithmType: "threaded",
                threadCount: numThreads,
              });
            });
        }
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`));
        }
      });
    }
  });
}

async function getSolutions(boardSize = 8) {
  const result = await getSolutionsSequential(boardSize);
  return result.solutions;
}

async function compareAlgorithms(boardSize = 8) {
  try {
    console.log(
      `\nComparing algorithms for ${boardSize}x${boardSize} board...`
    );

    const sequentialResult = await getSolutionsSequential(boardSize);
    console.log(
      `Sequential: ${
        sequentialResult.solutions.length
      } solutions in ${sequentialResult.executionTime.toFixed(2)}ms`
    );

    let threadedResult = null;
    if (boardSize >= 4) {
      try {
        threadedResult = await getSolutionsThreaded(boardSize);
        console.log(
          `Threaded: ${
            threadedResult.solutions.length
          } solutions in ${threadedResult.executionTime.toFixed(2)}ms`
        );
      } catch (error) {
        console.error("Threaded execution failed:", error.message);
        console.log("Falling back to sequential results only");
      }
    }

    const comparison = {
      boardSize,
      sequential: {
        solutions: sequentialResult.solutions.length,
        time: sequentialResult.executionTime,
        memory: sequentialResult.memoryUsed,
      },
      threaded: threadedResult
        ? {
            solutions: threadedResult.solutions.length,
            time: threadedResult.executionTime,
            memory: threadedResult.memoryUsed,
            threads: threadedResult.threadCount,
            speedup: (
              sequentialResult.executionTime / threadedResult.executionTime
            ).toFixed(2),
          }
        : null,
    };

    return comparison;
  } catch (error) {
    throw new Error(`Algorithm comparison failed: ${error.message}`);
  }
}

async function isSafePosition(hint, board, row, col) {
  try {
    const size = board.length;
    let hints = hint || [];

    if (board[row][col] === 0) {
      if (row < 0 || row >= size || col < 0 || col >= size) {
        hints.push({ message: "Invalid position", isvalid: false });
      }

      for (let i = 0; i < size; i++) {
        if (board[row][i] === 1) {
          hints.push({
            message: "Queen in the same row",
            isvalid: false,
            cord: { row: row, col: i },
            cause: { row: row, col: col },
          });
        }
        if (board[i][col] === 1) {
          hints.push({
            message: "Queen in the same column",
            isvalid: false,
            cord: { row: i, col: col },
            cause: { row: row, col: col },
          });
        }
      }

      for (let i = 0; i < size; i++) {
        if (board[row - i] && board[row - i][col - i] === 1) {
          hints.push({
            message: "Queen in the same diagonal",
            isvalid: false,
            cord: { row: row - i, col: col - i },
            cause: { row: row, col: col },
          });
        }
        if (board[row - i] && board[row - i][col + i] === 1) {
          hints.push({
            message: "Queen in the same diagonal",
            isvalid: false,
            cord: { row: row - i, col: col + i },
            cause: { row: row, col: col },
          });
        }
        if (board[row + i] && board[row + i][col - i] === 1) {
          hints.push({
            message: "Queen in the same diagonal",
            isvalid: false,
            cord: { row: row + i, col: col - i },
            cause: { row: row, col: col },
          });
        }
        if (board[row + i] && board[row + i][col + i] === 1) {
          hints.push({
            message: "Queen in the same diagonal",
            isvalid: false,
            cord: { row: row + i, col: col + i },
            cause: { row: row, col: col },
          });
        }
      }
    } else {
      hints = hints.filter(
        (hint) =>
          !(hint.cause && hint.cause.row === row && hint.cause.col === col)
      );
    }

    return hints;
  } catch (error) {
    throw new Error(`Safety check failed: ${error.message}`);
  }
}

async function placeQueen(hint = [], board, row, col) {
  try {
    const data = {};
    const hints = await isSafePosition(hint, board, row, col);

    board[row][col] = board[row][col] === 0 ? 1 : 0;

    if (hints.length === 0) {
      data.message = "Queen placed successfully";
      data.board = board;
      data.hints = hints;
      data.answerstatus = ANSWERSTATUS.CORRECT;
    } else {
      data.answerstatus = ANSWERSTATUS.INCORRECT;
      data.board = board;
      data.hints = hints;
      data.message = "Invalid placement";
    }

    return data;
  } catch (error) {
    throw new Error(`Failed to place queen: ${error.message}`);
  }
}

async function checkSolutionWithBoard(board) {
  try {
    const n = board.length;

    let queenCount = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (board[i][j] === 1) queenCount++;
      }
    }

    if (queenCount !== n) {
      return false;
    }

    const solutions = await getSolutions(n);

    function areBoardsEqual(board1, board2) {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (board1[i][j] !== board2[i][j]) {
            return false;
          }
        }
      }
      return true;
    }

    for (const solution of solutions) {
      if (areBoardsEqual(board, solution)) {
        return true;
      }
    }

    return false;
  } catch (error) {
    throw new Error(`Solution validation failed: ${error.message}`);
  }
}

async function saveSolution(board, playerId, playerName, timeSpent = 0) {
  try {
    if (!board || !playerId || !playerName) {
      throw new Error("Missing required fields: board, playerId, playerName");
    }

    const isValid = await checkSolutionWithBoard(board);
    if (!isValid) {
      return {
        success: false,
        message: "Invalid solution. Please check your board configuration.",
        status: "error",
      };
    }

    const boardSize = board.length;

    const existingSolution = await nQueensModel.findOne({
      where: {
        solution: JSON.stringify(board),
      },
    });

    if (existingSolution) {
      return {
        success: false,
        message: `This solution has already been found by ${existingSolution.player}. Try a different solution!`,
        existingSolution,
        status: "duplicate",
      };
    }

    const allSolutions = await getSolutions(boardSize);
    const totalPossibleSolutions = allSolutions.length;

    const savedSolutionsCount = await nQueensModel.count({
      where: {
        solution: {
          [require("sequelize").Op.ne]: null,
        },
      },
    });

    if (savedSolutionsCount >= totalPossibleSolutions) {
      console.log(
        `All ${totalPossibleSolutions} solutions found! Resetting database...`
      );
      await nQueensModel.destroy({ where: {} });
    }

    let movesCount = 0;
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board[i][j] === 1) movesCount++;
      }
    }

    const newSolution = await nQueensModel.create({
      solution: board,
      playerId: playerId,
      player: playerName,
      movesCount: movesCount,
      timeSpent: timeSpent,
    });

    const updatedCount = await nQueensModel.count();

    return {
      success: true,
      message: "Congratulations! Your solution has been saved.",
      solution: newSolution,
      status: "success",
      progress: {
        found: updatedCount,
        total: totalPossibleSolutions,
        remaining: totalPossibleSolutions - updatedCount,
      },
    };
  } catch (error) {
    throw new Error(`Failed to save solution: ${error.message}`);
  }
}
async function getAllSavedSolutions() {
  try {
    const solutions = await nQueensModel.findAll({
      order: [["createdAt", "DESC"]],
    });

    return solutions;
  } catch (error) {
    throw new Error(`Failed to retrieve solutions: ${error.message}`);
  }
}

async function getPlayerSolutions(playerId) {
  try {
    const solutions = await nQueensModel.findAll({
      where: { playerId },
      order: [["createdAt", "DESC"]],
    });

    return solutions;
  } catch (error) {
    throw new Error(`Failed to retrieve player solutions: ${error.message}`);
  }
}

async function getLeaderboard() {
  try {
    const { Sequelize } = require("sequelize");

    const leaderboard = await nQueensModel.findAll({
      attributes: [
        "playerId",
        "player",
        [Sequelize.fn("COUNT", Sequelize.col("id")), "solutionsFound"],
        [Sequelize.fn("AVG", Sequelize.col("timeSpent")), "avgTimeSpent"],
        [Sequelize.fn("SUM", Sequelize.col("movesCount")), "totalMoves"],
      ],
      group: ["playerId", "player"],
      order: [[Sequelize.literal('"solutionsFound"'), "DESC"]],
      limit: 10,
    });

    return leaderboard;
  } catch (error) {
    throw new Error(`Failed to retrieve leaderboard: ${error.message}`);
  }
}

async function getPerformanceHistory(boardSize = null) {
  try {
    const where = boardSize ? { boardSize } : {};

    const history = await QueensPerformance.findAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: 50,
    });

    return history;
  } catch (error) {
    throw new Error(`Failed to retrieve performance history: ${error.message}`);
  }
}

async function getSolutionProgress(boardSize = 8) {
  try {
    const allSolutions = await getSolutions(boardSize);
    const totalPossible = allSolutions.length;
    const foundCount = await nQueensModel.count();

    return {
      total: totalPossible,
      found: foundCount,
      remaining: totalPossible - foundCount,
      percentage: ((foundCount / totalPossible) * 100).toFixed(2),
    };
  } catch (error) {
    throw new Error(`Failed to get solution progress: ${error.message}`);
  }
}

const isSafe = isSafePosition;

module.exports = {
  generateBoard,
  getSolutions,
  getSolutionsSequential,
  getSolutionsThreaded,
  compareAlgorithms,
  placeQueen,
  isSafe,
  isSafePosition,
  checkSolutionWithBoard,
  saveSolution,
  getAllSavedSolutions,
  getPlayerSolutions,
  getLeaderboard,
  getSolutionProgress,
  getPerformanceHistory,
};
