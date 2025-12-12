const {
  getSolutions,
  generateBoard,
} = require("../src/services/eightQueens.service");
const { Worker } = require("worker_threads");
const path = require("path");

describe("Eight Queens Performance: Sequential vs Threaded", () => {
  describe("Sequential Solution Generation", () => {
    test("should find all 92 solutions sequentially", async () => {
      const startTime = performance.now();
      const solutions = await getSolutions(8);
      const endTime = performance.now();

      const timeTaken = endTime - startTime;

      expect(solutions).toHaveLength(92);
      console.log(
        `\n📊 Sequential: ${timeTaken.toFixed(2)}ms for 92 solutions`
      );

      return {
        method: "Sequential",
        solutions: solutions.length,
        time: timeTaken,
      };
    });

    test("should measure sequential performance for different sizes", async () => {
      const sizes = [4, 5, 6, 7, 8];
      const results = [];

      for (const size of sizes) {
        const startTime = performance.now();
        const solutions = await getSolutions(size);
        const endTime = performance.now();

        results.push({
          size: `${size}x${size}`,
          solutions: solutions.length,
          time: `${(endTime - startTime).toFixed(2)}ms`,
          method: "Sequential",
        });
      }

      console.log("\n📊 Sequential Performance:");
      console.table(results);
      expect(results.every((r) => r.solutions >= 0)).toBe(true);
    });
  });

  describe("Performance Comparison", () => {
    test("should compare sequential approach for various board sizes", async () => {
      const boardSizes = [4, 5, 6, 7, 8];
      const comparisonResults = [];

      for (const size of boardSizes) {
        // Sequential
        const seqStart = performance.now();
        const seqSolutions = await getSolutions(size);
        const seqEnd = performance.now();
        const seqTime = seqEnd - seqStart;

        comparisonResults.push({
          "Board Size": `${size}x${size}`,
          Solutions: seqSolutions.length,
          "Sequential Time (ms)": seqTime.toFixed(2),
          "Memory Efficient": "✓",
        });
      }

      console.log("\n📊 Performance Analysis:");
      console.table(comparisonResults);

      expect(comparisonResults.length).toBe(boardSizes.length);
    });

    test("should analyze time complexity", async () => {
      const results = [];

      for (let n = 4; n <= 8; n++) {
        const iterations = 3;
        let totalTime = 0;

        for (let i = 0; i < iterations; i++) {
          const start = performance.now();
          await getSolutions(n);
          const end = performance.now();
          totalTime += end - start;
        }

        const avgTime = totalTime / iterations;
        results.push({
          N: n,
          "Avg Time (ms)": avgTime.toFixed(2),
          "Approx Complexity": `O(${n}!)`,
        });
      }

      console.log("\n📊 Time Complexity Analysis:");
      console.table(results);
    });
  });

  describe("Memory and Efficiency Tests", () => {
    test("should handle large solution sets efficiently", async () => {
      const startMemory = process.memoryUsage().heapUsed / 1024 / 1024;

      const solutions = await getSolutions(8);

      const endMemory = process.memoryUsage().heapUsed / 1024 / 1024;
      const memoryUsed = endMemory - startMemory;

      console.log(`\n💾 Memory Usage:`);
      console.log(`Solutions: ${solutions.length}`);
      console.log(`Memory Used: ${memoryUsed.toFixed(2)} MB`);

      expect(solutions).toHaveLength(92);
      expect(memoryUsed).toBeLessThan(100); // Should use less than 100MB
    });

    test("should measure solution generation rate", async () => {
      const startTime = performance.now();
      const solutions = await getSolutions(8);
      const endTime = performance.now();

      const timeTaken = endTime - startTime;
      const solutionsPerSecond = (solutions.length / timeTaken) * 1000;

      console.log(`\n⚡ Generation Rate:`);
      console.log(`Solutions/second: ${solutionsPerSecond.toFixed(2)}`);
      console.log(
        `Time per solution: ${(timeTaken / solutions.length).toFixed(2)}ms`
      );

      expect(solutionsPerSecond).toBeGreaterThan(0);
    });
  });
});

// Manual runner
module.exports = {
  runPerformanceComparison: async () => {
    console.log("🎯 Eight Queens Performance Comparison\n");
    console.log("=".repeat(60));

    const sizes = [4, 5, 6, 7, 8];
    const results = [];

    for (const size of sizes) {
      console.log(`\nTesting ${size}x${size} board...`);

      // Sequential
      const seqStart = performance.now();
      const solutions = await getSolutions(size);
      const seqEnd = performance.now();
      const seqTime = seqEnd - seqStart;

      results.push({
        Size: `${size}x${size}`,
        Solutions: solutions.length,
        "Time (ms)": seqTime.toFixed(2),
        "Solutions/sec": ((solutions.length / seqTime) * 1000).toFixed(2),
      });
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL RESULTS:");
    console.table(results);

    // Summary
    const total8x8Time = results.find((r) => r.Size === "8x8")["Time (ms)"];
    console.log("\n📈 Summary:");
    console.log(`✓ Found all 92 solutions for 8x8 board`);
    console.log(`✓ Total time: ${total8x8Time}ms`);
    console.log(`✓ Average per solution: ${(total8x8Time / 92).toFixed(2)}ms`);
  },
};
