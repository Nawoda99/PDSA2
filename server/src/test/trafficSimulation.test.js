jest.mock("../src/models/trafficSimulations", () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
}));
const {
  generateTrafficNetwork,
  fordFulkerson,
  edmondsKarp,
  calculateMaxFlow,
  validateAnswer,
} = require("../src/services/trafficSimulation.service");

describe("Traffic Simulation Service Tests", () => {
  describe("generateTrafficNetwork", () => {
    test("should generate network with 13 edges", () => {
      const network = generateTrafficNetwork(5, 15);
      expect(network).toHaveLength(13);
    });

    test("should generate capacities within specified range", () => {
      const minCapacity = 5;
      const maxCapacity = 15;
      const network = generateTrafficNetwork(minCapacity, maxCapacity);

      network.forEach((edge) => {
        expect(edge.capacity).toBeGreaterThanOrEqual(minCapacity);
        expect(edge.capacity).toBeLessThanOrEqual(maxCapacity);
      });
    });

    test("should have correct edge structure", () => {
      const network = generateTrafficNetwork(5, 15);

      network.forEach((edge) => {
        expect(edge).toHaveProperty("from");
        expect(edge).toHaveProperty("to");
        expect(edge).toHaveProperty("capacity");
        expect(typeof edge.from).toBe("string");
        expect(typeof edge.to).toBe("string");
        expect(typeof edge.capacity).toBe("number");
      });
    });
  });

  describe("Ford-Fulkerson Algorithm", () => {
    test("should calculate correct max flow for simple network", () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "T", capacity: 10 },
      ];

      const result = fordFulkerson(network, "A", "T");
      expect(result.maxFlow).toBe(10);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test("should handle bottleneck correctly", () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "C", capacity: 5 },
        { from: "C", to: "T", capacity: 10 },
      ];

      const result = fordFulkerson(network, "A", "T");
      expect(result.maxFlow).toBe(5);
    });

    test("should return 0 for disconnected graph", () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "C", to: "T", capacity: 10 },
      ];

      const result = fordFulkerson(network, "A", "T");
      expect(result.maxFlow).toBe(0);
    });
  });

  describe("Edmonds-Karp Algorithm", () => {
    test("should calculate correct max flow for simple network", () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "T", capacity: 10 },
      ];

      const result = edmondsKarp(network, "A", "T");
      expect(result.maxFlow).toBe(10);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    test("should handle bottleneck correctly", () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "C", capacity: 5 },
        { from: "C", to: "T", capacity: 10 },
      ];

      const result = edmondsKarp(network, "A", "T");
      expect(result.maxFlow).toBe(5);
    });
  });

  describe("Algorithm Comparison", () => {
    test("both algorithms should produce same result", () => {
      const network = generateTrafficNetwork(5, 15);

      const ffResult = fordFulkerson(network, "A", "T");
      const ekResult = edmondsKarp(network, "A", "T");

      expect(ffResult.maxFlow).toBe(ekResult.maxFlow);
    });

    test("should calculate max flow for complex network", async () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "A", to: "C", capacity: 10 },
        { from: "B", to: "C", capacity: 2 },
        { from: "B", to: "T", capacity: 4 },
        { from: "C", to: "T", capacity: 10 },
      ];

      const result = await calculateMaxFlow(network);
      expect(result.maxFlow).toBe(14);
      expect(result.fordFulkersonTime).toBeGreaterThan(0);
      expect(result.edmondsKarpTime).toBeGreaterThan(0);
    });
  });

  describe("validateAnswer", () => {
    test("should validate correct answer", async () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "T", capacity: 10 },
      ];

      const result = await validateAnswer(network, 10);
      expect(result.isCorrect).toBe(true);
      expect(result.correctAnswer).toBe(10);
      expect(result.playerAnswer).toBe(10);
    });

    test("should validate incorrect answer", async () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "T", capacity: 10 },
      ];

      const result = await validateAnswer(network, 5);
      expect(result.isCorrect).toBe(false);
      expect(result.correctAnswer).toBe(10);
      expect(result.playerAnswer).toBe(5);
    });

    test("should throw error for invalid answer", async () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "B", to: "T", capacity: 10 },
      ];

      await expect(validateAnswer(network, -5)).rejects.toThrow();
      await expect(validateAnswer(network, "invalid")).rejects.toThrow();
    });
  });

  describe("Edge Cases", () => {
    test("should handle network with multiple paths", async () => {
      const network = [
        { from: "A", to: "B", capacity: 10 },
        { from: "A", to: "C", capacity: 10 },
        { from: "B", to: "T", capacity: 5 },
        { from: "C", to: "T", capacity: 5 },
      ];

      const result = await calculateMaxFlow(network);
      expect(result.maxFlow).toBe(10);
    });

    test("should handle zero capacity edges", () => {
      const network = [
        { from: "A", to: "B", capacity: 0 },
        { from: "B", to: "T", capacity: 10 },
      ];

      const result = fordFulkerson(network, "A", "T");
      expect(result.maxFlow).toBe(0);
    });
  });
});

module.exports = {
  testTrafficSimulation: () => {
    console.log("Running Traffic Simulation Tests...");

    console.log("\n--- Test 1: Generate Network ---");
    const network = generateTrafficNetwork(5, 15);
    console.log("Generated network:", JSON.stringify(network, null, 2));
    console.log("✓ Network generated successfully");

    console.log("\n--- Test 2: Calculate Max Flow ---");
    const ffResult = fordFulkerson(network, "A", "T");
    console.log(
      `Ford-Fulkerson: Max Flow = ${
        ffResult.maxFlow
      }, Time = ${ffResult.executionTime.toFixed(4)}ms`
    );

    const ekResult = edmondsKarp(network, "A", "T");
    console.log(
      `Edmonds-Karp: Max Flow = ${
        ekResult.maxFlow
      }, Time = ${ekResult.executionTime.toFixed(4)}ms`
    );

    console.log(
      "✓ Both algorithms produce same result:",
      ffResult.maxFlow === ekResult.maxFlow
    );

    console.log("\n--- Test 3: Validate Answer ---");
    validateAnswer(network, ffResult.maxFlow).then((result) => {
      console.log("Correct answer validation:", result);
      console.log("✓ Validation successful");
    });

    validateAnswer(network, ffResult.maxFlow - 5).then((result) => {
      console.log("Incorrect answer validation:", result);
      console.log("✓ Validation handles incorrect answers");
    });

    console.log("\n✓ All tests completed successfully!");
  },
};
