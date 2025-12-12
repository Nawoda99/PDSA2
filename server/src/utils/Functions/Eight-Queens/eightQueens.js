const { parentPort, workerData } = require("worker_threads");

function solveNQueens(boardSize, startCol) {
  const board = Array.from({ length: boardSize }, () =>
    Array(boardSize).fill(0)
  );
  const solutions = [];

  function isSafe(board, row, col) {
    // Check column
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 1) {
        return false;
      }
    }
    // Check upper left diagonal
    for (let i = row, j = col; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 1) {
        return false;
      }
    }
    // Check upper right diagonal
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

    // For first row, only try the assigned starting column
    if (row === 0) {
      if (isSafe(board, row, startCol)) {
        board[row][startCol] = 1;
        backtrack(row + 1);
        board[row][startCol] = 0;
      }
    } else {
      for (let col = 0; col < board.length; col++) {
        if (isSafe(board, row, col)) {
          board[row][col] = 1;
          backtrack(row + 1);
          board[row][col] = 0;
        }
      }
    }
  }

  backtrack(0);
  return solutions;
}

const { boardSize, startCol } = workerData;
const solutions = solveNQueens(boardSize, startCol);
parentPort.postMessage(solutions);
