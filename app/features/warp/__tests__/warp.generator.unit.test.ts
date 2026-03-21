/**
 * warp.generator.unit.test.ts
 *
 * Tests for the pure TypeScript warp tunnel geometry generator.
 * Verifies star positions, light pod data, grid segments, and determinism.
 * No Three.js, WebGL, or DOM involved.
 */

import { describe, expect, it } from "vitest";
import { generateWarp } from "../warp.generator";

describe("warp.generator: generateWarp()", () => {
	// -------------------------------------------------------------------------
	// Star positions
	// -------------------------------------------------------------------------

	it("returns starPositions Float32Array with length = starCount * 3", () => {
		const result = generateWarp({ starCount: 100 });
		expect(result.starPositions.length).toBe(100 * 3);
	});

	it("returns starSpeeds Float32Array with length = starCount", () => {
		const result = generateWarp({ starCount: 100 });
		expect(result.starSpeeds.length).toBe(100);
	});

	it("all star speed values are in the expected range [0.5, 1.5]", () => {
		const result = generateWarp({ starCount: 500 });
		for (let i = 0; i < result.starSpeeds.length; i++) {
			expect(result.starSpeeds[i]).toBeGreaterThanOrEqual(0.5);
			expect(result.starSpeeds[i]).toBeLessThanOrEqual(1.5);
		}
	});

	it("all star Z values are within [-tunnelDepth, 0]", () => {
		const depth = 300;
		const result = generateWarp({ starCount: 500, tunnelDepth: depth });
		for (let i = 0; i < result.starPositions.length; i += 3) {
			const z = result.starPositions[i + 2];
			expect(z).toBeLessThanOrEqual(0);
			expect(z).toBeGreaterThanOrEqual(-depth);
		}
	});

	it("stars are distributed in a cylinder — XY distance ≤ tunnelRadius", () => {
		const radius = 50;
		const result = generateWarp({ starCount: 500, tunnelRadius: radius });
		for (let i = 0; i < result.starPositions.length; i += 3) {
			const x = result.starPositions[i];
			const y = result.starPositions[i + 1];
			const dist = Math.sqrt(x * x + y * y);
			// Stars have a jitter factor (0.7–1.0 × radius)
			expect(dist).toBeLessThanOrEqual(radius * 1.01);
		}
	});

	// -------------------------------------------------------------------------
	// Light pods (cars)
	// -------------------------------------------------------------------------

	it("generates podsPerLane * 2 light pods (two lanes)", () => {
		const podsPerLane = 10;
		const result = generateWarp({ podsPerLane });
		expect(result.lightPods.length).toBe(podsPerLane * 2);
	});

	it("all light pod lightType values are 'headlight' or 'taillight'", () => {
		const result = generateWarp();
		for (const pod of result.lightPods) {
			expect(["headlight", "taillight"]).toContain(pod.lightType);
		}
	});

	it("all light pod lane values are 0 or 1", () => {
		const result = generateWarp();
		for (const pod of result.lightPods) {
			expect([0, 1]).toContain(pod.lane);
		}
	});

	it("light pod speeds are within the expected range [20, 80]", () => {
		const result = generateWarp();
		for (const pod of result.lightPods) {
			expect(pod.speed).toBeGreaterThanOrEqual(20);
			expect(pod.speed).toBeLessThanOrEqual(80);
		}
	});

	it("light pod phase values are in [0, 1]", () => {
		const result = generateWarp();
		for (const pod of result.lightPods) {
			expect(pod.phase).toBeGreaterThanOrEqual(0);
			expect(pod.phase).toBeLessThanOrEqual(1);
		}
	});

	// -------------------------------------------------------------------------
	// Grid segments
	// -------------------------------------------------------------------------

	it("gridSegments Float32Array has a non-zero length", () => {
		const result = generateWarp();
		expect(result.gridSegments.length).toBeGreaterThan(0);
	});

	it("gridSegments length is divisible by 6 (pairs of [x0,y0,z0, x1,y1,z1])", () => {
		const result = generateWarp();
		expect(result.gridSegments.length % 6).toBe(0);
	});

	it("all grid Y values are 0 (road is flat on the XZ plane)", () => {
		const result = generateWarp();
		for (let i = 1; i < result.gridSegments.length; i += 3) {
			expect(result.gridSegments[i]).toBeCloseTo(0);
		}
	});

	// -------------------------------------------------------------------------
	// Determinism and config
	// -------------------------------------------------------------------------

	it("is deterministic — same seed produces identical starPositions", () => {
		const a = generateWarp({ seed: 77, starCount: 200 });
		const b = generateWarp({ seed: 77, starCount: 200 });
		expect(Array.from(a.starPositions)).toEqual(Array.from(b.starPositions));
	});

	it("different seeds produce different starPositions", () => {
		const a = generateWarp({ seed: 1, starCount: 200 });
		const b = generateWarp({ seed: 2, starCount: 200 });
		expect(Array.from(a.starPositions)).not.toEqual(
			Array.from(b.starPositions),
		);
	});

	it("resolves default config values correctly", () => {
		const result = generateWarp();
		expect(result.config.seed).toBe(42);
		expect(result.config.starCount).toBe(15_000);
		expect(result.config.tunnelRadius).toBe(60);
		expect(result.config.podsPerLane).toBe(18);
		expect(result.config.gridLinesX).toBe(12);
		expect(result.config.roadDepth).toBe(200);
	});
});
