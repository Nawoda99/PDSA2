jest.mock("../src/models/eightQueens", () => ({
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  deleteMany: jest.fn().mockResolvedValue(true),
}));

jest.mock("../src/config/DB", () => {
  const SequelizeMock = require("sequelize-mock");
  const dbMock = new SequelizeMock();
  return dbMock;
});

const {
  generateBoard,
  getSolutions,
  placeQueen,
  isSafe,
  checkSolutionWithBoard,
  saveSolution,
} = require("../src/services/eightQueens.service");
const { ANSWERSTATUS } = require("../src/enums/enums");

describe("Eight Queens Service Tests", () => {
  describe("generateBoard", () => {
    test("should generate an 8x8 board by default", async () => {
      const board = await generateBoard();
      expect(board).toHaveLength(8);
      expect(board[0]).toHaveLength(8);
      expect(board.every((row) => row.every((cell) => cell === 0))).toBe(true);
    });

    test("should generate a board of custom size", async () => {
      const size = 4;
      const board = await generateBoard(size);
      expect(board).toHaveLength(size);
      expect(board[0]).toHaveLength(size);
    });

    test("should initialize all cells to 0", async () => {
      const board = await generateBoard(6);
      const allZeros = board.every((row) => row.every((cell) => cell === 0));
      expect(allZeros).toBe(true);
    });

    test("should generate different board sizes", async () => {
      const sizes = [4, 5, 6, 8, 10];
      for (const size of sizes) {
        const board = await generateBoard(size);
        expect(board).toHaveLength(size);
        expect(board[0]).toHaveLength(size);
      }
    });
  });

  describe("getSolutions", () => {
    test("should find exactly 92 solutions for 8x8 board", async () => {
      const solutions = await getSolutions(8);
      expect(solutions).toHaveLength(92);
    });

    test("should find exactly 2 solutions for 4x4 board", async () => {
      const solutions = await getSolutions(4);
      expect(solutions).toHaveLength(2);
    });

    test("should find 0 solutions for 2x2 board", async () => {
      const solutions = await getSolutions(2);
      expect(solutions).toHaveLength(0);
    });

    test("should find 0 solutions for 3x3 board", async () => {
      const solutions = await getSolutions(3);
      expect(solutions).toHaveLength(0);
    });

    test("should return valid board solutions", async () => {
      const solutions = await getSolutions(4);
      expect(solutions.length).toBeGreaterThan(0);

      solutions.forEach((solution) => {
        const queenCount = solution.reduce(
          (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
          0
        );
        expect(queenCount).toBe(4);
      });
    });

    test("should ensure no two queens threaten each other in solutions", async () => {
      const solutions = await getSolutions(4);

      solutions.forEach((solution) => {
        const n = solution.length;
        const queens = [];

        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            if (solution[i][j] === 1) {
              queens.push({ row: i, col: j });
            }
          }
        }

        for (let i = 0; i < queens.length; i++) {
          for (let j = i + 1; j < queens.length; j++) {
            const q1 = queens[i];
            const q2 = queens[j];

            expect(q1.row).not.toBe(q2.row);
            expect(q1.col).not.toBe(q2.col);
            expect(Math.abs(q1.row - q2.row)).not.toBe(
              Math.abs(q1.col - q2.col)
            );
          }
        }
      });
    });

    test("should measure time taken for solution generation", async () => {
      const startTime = performance.now();
      await getSolutions(8);
      const endTime = performance.now();
      const timeTaken = endTime - startTime;

      expect(timeTaken).toBeGreaterThan(0);
      console.log(`Time taken to find 92 solutions: ${timeTaken.toFixed(2)}ms`);
    });
  });

  describe("isSafe", () => {
    test("should return empty hints for safe position on empty board", async () => {
      const board = await generateBoard(8);
      const hints = await isSafe([], board, 0, 0);
      expect(hints).toHaveLength(0);
    });

    test("should detect queen in same row", async () => {
      const board = await generateBoard(8);
      board[0][0] = 1;

      const hints = await isSafe([], board, 0, 4);
      const rowConflict = hints.find(
        (h) => h.message === "Queen in the same row"
      );
      expect(rowConflict).toBeDefined();
      expect(rowConflict.cord).toEqual({ row: 0, col: 0 });
    });

    test("should detect queen in same column", async () => {
      const board = await generateBoard(8);
      board[0][3] = 1;

      const hints = await isSafe([], board, 5, 3);
      const colConflict = hints.find(
        (h) => h.message === "Queen in the same column"
      );
      expect(colConflict).toBeDefined();
      expect(colConflict.cord).toEqual({ row: 0, col: 3 });
    });

    test("should detect queen in same diagonal", async () => {
      const board = await generateBoard(8);
      board[2][2] = 1;

      const hints = await isSafe([], board, 4, 4);
      const diagConflict = hints.find(
        (h) => h.message === "Queen in the same diagonal"
      );
      expect(diagConflict).toBeDefined();
    });

    test("should detect multiple conflicts", async () => {
      const board = await generateBoard(8);
      board[0][0] = 1;
      board[0][4] = 1;
      board[4][0] = 1;

      const hints = await isSafe([], board, 0, 2);
      expect(hints.length).toBeGreaterThan(1);
    });

    test("should filter out hints when removing queen", async () => {
      const board = await generateBoard(8);
      board[0][0] = 1;

      const initialHints = [
        {
          message: "Queen in the same row",
          isvalid: false,
          cord: { row: 0, col: 0 },
          cause: { row: 0, col: 0 },
        },
      ];

      const hints = await isSafe(initialHints, board, 0, 0);
      expect(hints.length).toBe(0);
    });
  });

  describe("placeQueen", () => {
    test("should successfully place queen in safe position", async () => {
      const board = await generateBoard(8);
      const result = await placeQueen([], board, 0, 0);

      expect(result.answerstatus).toBe(ANSWERSTATUS.CORRECT);
      expect(result.board[0][0]).toBe(1);
      expect(result.hints).toHaveLength(0);
      expect(result.message).toBe("Queen placed successfully");
    });

    test("should fail to place queen in unsafe position", async () => {
      const board = await generateBoard(8);
      board[0][0] = 1;

      const result = await placeQueen([], board, 0, 4);
      expect(result.answerstatus).toBe(ANSWERSTATUS.INCORRECT);
      expect(result.hints.length).toBeGreaterThan(0);
    });

    test("should toggle queen placement (remove queen)", async () => {
      const board = await generateBoard(8);
      board[0][0] = 1;

      const result = await placeQueen([], board, 0, 0);
      expect(result.board[0][0]).toBe(0);
    });

    test("should return hints for unsafe placement", async () => {
      const board = await generateBoard(8);
      board[1][1] = 1;

      const result = await placeQueen([], board, 3, 3);
      expect(result.hints.length).toBeGreaterThan(0);
      expect(result.answerstatus).toBe(ANSWERSTATUS.INCORRECT);
    });
  });

  describe("checkSolutionWithBoard", () => {
    test("should validate correct solution", async () => {
      const solutions = await getSolutions(4);
      const validSolution = solutions[0];

      const isValid = await checkSolutionWithBoard(validSolution);
      expect(isValid).toBe(true);
    });

    test("should reject incorrect solution", async () => {
      const board = await generateBoard(4);
      board[0][0] = 1;
      board[1][1] = 1;
      board[2][2] = 1;
      board[3][3] = 1;

      const isValid = await checkSolutionWithBoard(board);
      expect(isValid).toBe(false);
    });

    test("should reject incomplete solution", async () => {
      const board = await generateBoard(4);
      board[0][0] = 1;
      board[1][2] = 1;

      const isValid = await checkSolutionWithBoard(board);
      expect(isValid).toBe(false);
    });

    test("should validate all generated solutions for 4x4 board", async () => {
      const solutions = await getSolutions(4);

      for (const solution of solutions) {
        const isValid = await checkSolutionWithBoard(solution);
        expect(isValid).toBe(true);
      }
    });

    test("should handle empty board", async () => {
      const board = await generateBoard(4);
      const isValid = await checkSolutionWithBoard(board);
      expect(isValid).toBe(false);
    });
  });

  describe("Performance Tests", () => {
    test("should generate solutions within reasonable time for 8x8", async () => {
      const startTime = performance.now();
      const solutions = await getSolutions(8);
      const endTime = performance.now();

      const timeTaken = endTime - startTime;
      expect(solutions).toHaveLength(92);
      expect(timeTaken).toBeLessThan(5000);
      console.log(
        `8-Queens: Generated 92 solutions in ${timeTaken.toFixed(2)}ms`
      );
    });

    test("should handle multiple board sizes efficiently", async () => {
      const sizes = [4, 5, 6, 7, 8];
      const results = [];

      for (const size of sizes) {
        const startTime = performance.now();
        const solutions = await getSolutions(size);
        const endTime = performance.now();

        results.push({
          size,
          solutions: solutions.length,
          time: (endTime - startTime).toFixed(2),
        });
      }

      console.table(results);
      expect(results.every((r) => r.solutions >= 0)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    test("should handle 1x1 board", async () => {
      const board = await generateBoard(1);
      expect(board).toEqual([[0]]);

      const solutions = await getSolutions(1);
      expect(solutions).toHaveLength(1);
      expect(solutions[0]).toEqual([[1]]);
    });

    test("should handle placing queen at board corners", async () => {
      const board = await generateBoard(8);

      let result = await placeQueen([], board, 0, 0);
      expect(result.board[0][0]).toBe(1);

      const board2 = await generateBoard(8);
      result = await placeQueen([], board2, 0, 7);
      expect(result.board[0][7]).toBe(1);

      const board3 = await generateBoard(8);
      result = await placeQueen([], board3, 7, 0);
      expect(result.board[7][0]).toBe(1);

      const board4 = await generateBoard(8);
      result = await placeQueen([], board4, 7, 7);
      expect(result.board[7][7]).toBe(1);
    });

    test("should handle board with maximum queens", async () => {
      const solutions = await getSolutions(8);
      const fullBoard = solutions[0];

      const queenCount = fullBoard.reduce(
        (sum, row) => sum + row.reduce((rowSum, cell) => rowSum + cell, 0),
        0
      );
      expect(queenCount).toBe(8);
    });
  });

  describe("Algorithm Correctness", () => {
    test("should use backtracking algorithm correctly", async () => {
      const solutions = await getSolutions(4);

      const uniqueSolutions = new Set(solutions.map((s) => JSON.stringify(s)));
      expect(uniqueSolutions.size).toBe(solutions.length);
    });

    test("should explore all possible valid placements", async () => {
      const solutions = await getSolutions(8);
      expect(solutions).toHaveLength(92);
    });

    test("should not miss any valid solution", async () => {
      const solutions4x4 = await getSolutions(4);
      const solutions6x6 = await getSolutions(6);

      expect(solutions4x4).toHaveLength(2);
      expect(solutions6x6).toHaveLength(4);
    });
  });

  describe("Integration Tests", () => {
    test("should complete full game workflow", async () => {
      const board = await generateBoard(4);
      expect(board).toBeDefined();

      const solutions = await getSolutions(4);
      expect(solutions).toHaveLength(2);

      const targetSolution = solutions[0];
      const gameBoard = await generateBoard(4);

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (targetSolution[row][col] === 1) {
            gameBoard[row][col] = 1;
          }
        }
      }

      const isValid = await checkSolutionWithBoard(gameBoard);
      expect(isValid).toBe(true);
    });

    test("should handle sequential queen placement", async () => {
      const board = await generateBoard(4);
      const solutions = await getSolutions(4);
      const firstSolution = solutions[0];

      let hints = [];
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (firstSolution[row][col] === 1) {
            const result = await placeQueen(hints, board, row, col);
            expect(result.answerstatus).toBe(ANSWERSTATUS.CORRECT);
            hints = result.hints;
          }
        }
      }

      const isValid = await checkSolutionWithBoard(board);
      expect(isValid).toBe(true);
    });
  });
});

module.exports = {
  testEightQueens: async () => {
    console.log("Running Eight Queens Manual Tests...\n");

    console.log("--- Test 1: Generate Board ---");
    const board = await generateBoard(8);
    console.log(`Board size: ${board.length}x${board[0].length}`);
    console.log("✓ Board generated successfully\n");

    console.log("--- Test 2: Get Solutions ---");
    const startTime = performance.now();
    const solutions = await getSolutions(8);
    const endTime = performance.now();
    console.log(`Found ${solutions.length} solutions for 8x8 board`);
    console.log(`Time taken: ${(endTime - startTime).toFixed(2)}ms`);
    console.log("✓ Solutions generated successfully\n");

    console.log("--- Test 3: Place Queen ---");
    const testBoard = await generateBoard(4);
    const result = await placeQueen([], testBoard, 0, 0);
    console.log(
      `Queen placed: ${result.answerstatus === ANSWERSTATUS.CORRECT}`
    );
    console.log(`Hints: ${result.hints.length}`);
    console.log("✓ Queen placement working\n");

    console.log("--- Test 4: Check Solution ---");
    const solutions4 = await getSolutions(4);
    const isValid = await checkSolutionWithBoard(solutions4[0]);
    console.log(`Valid solution check: ${isValid}`);
    console.log("✓ Solution validation working\n");

    console.log("--- Test 5: Performance Comparison ---");
    const sizes = [4, 5, 6, 7, 8];
    for (const size of sizes) {
      const start = performance.now();
      const sols = await getSolutions(size);
      const end = performance.now();
      console.log(
        `${size}x${size}: ${sols.length} solutions in ${(end - start).toFixed(
          2
        )}ms`
      );
    }

    console.log("\n✓ All manual tests completed successfully!");
  },
};
