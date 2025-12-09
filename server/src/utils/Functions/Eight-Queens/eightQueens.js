const nQueensModel = require("../../db-models/nQueensModel");
const { ANSWERSTATUS } = require("../../enums/enums");

async function generateBoard(bordsize = 8) {
  const board = Array(bordsize)
    .fill(null)
    .map(() => Array(bordsize).fill(0));
  return board;
}

async function getSolutions(bordsize = 8) {
  const board = Array.from({ length: bordsize }, () => Array(bordsize).fill(0));
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
  return solutions;
}

async function placeQueen(hint = [], board, row, col) {
  const data = {};
  const hints = await isSafe(hint, board, row, col);
  board[row][col] = board[row][col] === 0 ? 1 : 0;
  if (hints.length === 0) {
    data.message = "Queen placed successfully";
    data.board = board;
    data.hints = hints;
    data.answerstatus = ANSWERSTATUS.CORRECT;
    return data;
  } else {
    data.answerstatus = ANSWERSTATUS.INCORRECT;
    data.board = board;
    data.hints = hints;
    return data;
  }
}

async function isSafe(hint, board, row, col) {
  const size = board.length;
  let hints = hint || [];
  if (board[row][col] === 0) {
    // Check if the position is valid
    if (row < 0 || row >= size || col < 0 || col >= size) {
      hints.push({ message: "Invalid position", isvalid: false });
    }

    // Check if there's a queen in the same row or column
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

    // Check diagonals
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
      (hint) => !(hint.cause.row === row && hint.cause.col === col)
    );
  }
  return hints;
}

async function checkSolutionWithBoard(board) {
  const n = board.length;
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
}

async function saveSolution(board, player) {
  const allSolutions = await getSolutions(board.length);

  const allSolutionsInDb = await nQueensModel.find();
  if (allSolutionsInDb.length === allSolutions.length) {
    await nQueensModel.deleteMany();
  }

  const answer = await nQueensModel.findOne({ solution: board });

  if (answer) {
    return {
      message: "Unfortunately solution already exists",
      answer,
      status: "error",
    };
  }

  const newAnswer = new nQueensModel({
    n: board.length,
    solution: board,
    player,
  });
  return await newAnswer.save();
}

module.exports = {
  isSafe,
  placeQueen,
  generateBoard,
  getSolutions,
  checkSolutionWithBoard,
  saveSolution,
};
