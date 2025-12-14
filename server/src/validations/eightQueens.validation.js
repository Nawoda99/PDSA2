const validationRules = {
  placeQueen: {
    required: ["board", "row", "col"],
    optionalFields: ["hints"],
  },
  createGame: {
    optionalFields: ["size"],
    defaults: { size: 8 },
    constraints: { size: { min: 1, max: 20 } },
  },
  getSolutions: {
    optionalFields: ["size", "algorithm"],
    defaults: { size: 8, algorithm: "sequential" },
    constraints: { size: { min: 1, max: 20 } },
    validAlgorithms: ["sequential", "threaded"],
  },
  compareAlgorithms: {
    optionalFields: ["size"],
    defaults: { size: 8 },
    constraints: { size: { min: 1, max: 20 } },
  },
  checkSolution: {
    required: ["board"],
  },
  saveSolution: {
    required: ["board", "playerId", "playerName"],
    optionalFields: ["timeSpent"],
    defaults: { timeSpent: 0 },
  },
  getPlayerSolutions: {
    required: ["playerId"],
    source: "params",
  },
  getSolutionProgress: {
    optionalFields: ["size"],
    defaults: { size: 8 },
    source: "query",
  },
  getPerformanceHistory: {
    optionalFields: ["size"],
    source: "query",
  },
};

function validateRequired(data, requiredFields) {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return {
        isValid: false,
        error: `Missing required field: ${field}`,
      };
    }
  }
  return { isValid: true };
}

function validatePlaceQueen(body) {
  const { board, row, col } = body;

  if (!board) {
    return { isValid: false, error: "Board is required" };
  }

  if (row === undefined || row === null) {
    return { isValid: false, error: "Row is required" };
  }

  if (col === undefined || col === null) {
    return { isValid: false, error: "Column is required" };
  }

  if (!Array.isArray(board)) {
    return { isValid: false, error: "Board must be a 2D array" };
  }

  if (typeof row !== "number" || typeof col !== "number") {
    return { isValid: false, error: "Row and column must be numbers" };
  }

  if (row < 0 || col < 0 || row >= board.length || col >= board[0].length) {
    return { isValid: false, error: "Position out of board bounds" };
  }

  return { isValid: true };
}

function validateCreateGame(body) {
  const { size = 8 } = body;

  if (typeof size !== "number") {
    return { isValid: false, error: "Board size must be a number" };
  }

  if (size < 1 || size > 20) {
    return { isValid: false, error: "Board size must be between 1 and 20" };
  }

  return { isValid: true };
}

function validateGetSolutions(body) {
  const { size = 8, algorithm = "sequential" } = body;

  if (typeof size !== "number" || size < 1 || size > 20) {
    return { isValid: false, error: "Board size must be between 1 and 20" };
  }

  const validAlgorithms = ["sequential", "threaded"];
  if (!validAlgorithms.includes(algorithm)) {
    return {
      isValid: false,
      error: `Algorithm must be one of: ${validAlgorithms.join(", ")}`,
    };
  }

  return { isValid: true };
}

function validateCheckSolution(body) {
  const { board } = body;

  if (!board) {
    return { isValid: false, error: "Board is required" };
  }

  if (!Array.isArray(board)) {
    return { isValid: false, error: "Board must be a 2D array" };
  }

  return { isValid: true };
}

function validateSaveSolution(body) {
  const { board, playerId, playerName, timeSpent } = body;

  if (!board) {
    return { isValid: false, error: "Board is required" };
  }

  if (!Array.isArray(board)) {
    return { isValid: false, error: "Board must be a 2D array" };
  }

  if (!playerId) {
    return { isValid: false, error: "Player ID is required" };
  }

  if (typeof playerId !== "number") {
    return { isValid: false, error: "Player ID must be a number" };
  }

  if (!playerName) {
    return { isValid: false, error: "Player name is required" };
  }

  if (typeof playerName !== "string" || playerName.trim().length === 0) {
    return { isValid: false, error: "Player name must be a non-empty string" };
  }

  if (timeSpent !== undefined && typeof timeSpent !== "number") {
    return { isValid: false, error: "Time spent must be a number" };
  }

  return { isValid: true };
}

function validateGetPlayerSolutions(params) {
  const { playerId } = params;

  if (!playerId) {
    return { isValid: false, error: "Player ID is required" };
  }

  if (isNaN(playerId)) {
    return { isValid: false, error: "Player ID must be a valid number" };
  }

  return { isValid: true };
}

function validateGetSolutionProgress(query) {
  const { size = 8 } = query;
  const numSize = parseInt(size);

  if (isNaN(numSize) || numSize < 1 || numSize > 20) {
    return { isValid: false, error: "Board size must be between 1 and 20" };
  }

  return { isValid: true };
}

function validateGetPerformanceHistory(query) {
  const { size } = query;

  if (size !== undefined) {
    const numSize = parseInt(size);
    if (isNaN(numSize) || numSize < 1 || numSize > 20) {
      return { isValid: false, error: "Board size must be between 1 and 20" };
    }
  }

  return { isValid: true };
}

module.exports = {
  validationRules,
  validateRequired,
  validatePlaceQueen,
  validateCreateGame,
  validateGetSolutions,
  validateCheckSolution,
  validateSaveSolution,
  validateGetPlayerSolutions,
  validateGetSolutionProgress,
  validateGetPerformanceHistory,
};
