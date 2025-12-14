// server/test/hanoiTower.test.js
const hanoiService = require("../src/services/hanoiTower.service");

describe("Hanoi Tower Service Tests", () => {
  describe("3-Peg Recursive Algorithm", () => {
    test("should solve for 5 disks correctly", () => {
      const moves = hanoiService.hanoiRecursive(5);
      expect(moves.length).toBe(31); // 2^5 - 1
      expect(moves[0]).toMatchObject({ disk: 1, from: "A" });
      expect(moves[moves.length - 1]).toMatchObject({
        disk: expect.any(Number),
        to: "D",
      });
    });

    test("should have all disks on destination", () => {
      const moves = hanoiService.hanoiRecursive(5);
      const validation = hanoiService.validateSolution(moves, 5, 3);
      expect(validation.valid).toBe(true);
    });
  });

  describe("3-Peg Iterative Algorithm", () => {
    test("should solve for 5 disks correctly", () => {
      const moves = hanoiService.hanoiIterative(5);
      expect(moves.length).toBe(31);
    });

    test("should produce valid solution", () => {
      const moves = hanoiService.hanoiIterative(6);
      const validation = hanoiService.validateSolution(moves, 6, 3);
      expect(validation.valid).toBe(true);
    });

    test("should match recursive result count", () => {
      const recursive = hanoiService.hanoiRecursive(7);
      const iterative = hanoiService.hanoiIterative(7);
      expect(iterative.length).toBe(recursive.length);
    });
  });

  describe("4-Peg Frame-Stewart Algorithm", () => {
    test("should solve for 5 disks", () => {
      const moves = hanoiService.frameStewart(5);
      expect(moves.length).toBeGreaterThan(0);
      expect(moves.length).toBeLessThan(31); // Should be better than 3-peg
    });

    test("should produce valid solution", () => {
      const moves = hanoiService.frameStewart(6);
      const validation = hanoiService.validateSolution(moves, 6, 4);
      expect(validation.valid).toBe(true);
    });

    test("should be optimal for 4 pegs", () => {
      const moves = hanoiService.frameStewart(8);
      const simple = hanoiService.hanoi4Simple(8);
      expect(moves.length).toBeLessThanOrEqual(simple.length);
    });
  });

  describe("4-Peg Simple Algorithm", () => {
    test("should solve for 5 disks", () => {
      const moves = hanoiService.hanoi4Simple(5);
      expect(moves.length).toBeGreaterThan(0);
    });

    test("should produce valid solution", () => {
      const moves = hanoiService.hanoi4Simple(7);
      const validation = hanoiService.validateSolution(moves, 7, 4);
      expect(validation.valid).toBe(true);
    });
  });

  describe("Solution Validation", () => {
    test("should validate correct 3-peg solution", () => {
      const moves = hanoiService.hanoiRecursive(5);
      const validation = hanoiService.validateSolution(moves, 5, 3);
      expect(validation.valid).toBe(true);
    });

    test("should reject invalid move (larger on smaller)", () => {
      const invalidMoves = [
        { disk: 2, from: "A", to: "B" },
        { disk: 3, from: "A", to: "B" }, // Invalid: 3 on 2
      ];
      const validation = hanoiService.validateSolution(invalidMoves, 3, 3);
      expect(validation.valid).toBe(false);
    });

    test("should reject incomplete solution", () => {
      const incompleteMoves = [{ disk: 1, from: "A", to: "D" }];
      const validation = hanoiService.validateSolution(incompleteMoves, 5, 3);
      expect(validation.valid).toBe(false);
    });
  });

  describe("Algorithm Comparison", () => {
    test("3-peg algorithms should produce equal moves", () => {
      const recursive = hanoiService.hanoiRecursive(6);
      const iterative = hanoiService.hanoiIterative(6);
      expect(recursive.length).toBe(iterative.length);
    });

    test("4-peg should be better than 3-peg", () => {
      const threePeg = hanoiService.hanoiRecursive(8);
      const fourPeg = hanoiService.frameStewart(8);
      expect(fourPeg.length).toBeLessThan(threePeg.length);
    });

    test("Frame-Stewart should be optimal for 4 pegs", () => {
      const frameStewart = hanoiService.frameStewart(10);
      const simple = hanoiService.hanoi4Simple(10);
      expect(frameStewart.length).toBeLessThanOrEqual(simple.length);
    });
  });

  describe("Performance Tests", () => {
    test("all algorithms should complete in reasonable time", () => {
      const disks = 10;

      const t0 = performance.now();
      hanoiService.hanoiRecursive(disks);
      const recursiveTime = performance.now() - t0;

      const t1 = performance.now();
      hanoiService.hanoiIterative(disks);
      const iterativeTime = performance.now() - t1;

      const t2 = performance.now();
      hanoiService.frameStewart(disks);
      const frameStewartTime = performance.now() - t2;

      const t3 = performance.now();
      hanoiService.hanoi4Simple(disks);
      const simpleTime = performance.now() - t3;

      expect(recursiveTime).toBeLessThan(1000);
      expect(iterativeTime).toBeLessThan(1000);
      expect(frameStewartTime).toBeLessThan(1000);
      expect(simpleTime).toBeLessThan(1000);
    });
  });
});
