/**
 * galaxy-generator.test.ts
 *
 * Tests for the pure TypeScript galaxy geometry generator.
 * Verifies observable output — particle counts, spatial bounds,
 * colour ranges, and determinism. No Three.js or WebGL involved.
 */

import { describe, expect, it } from "vitest";
import { generateGalaxy } from "../galaxy-generator";

describe("galaxy-generator: generateGalaxy()", () => {
	it("returns positions array with length = particleCount * 3", () => {
		const result = generateGalaxy({ particleCount: 100 });
		expect(result.positions.length).toBe(100 * 3);
	});

	it("returns colors array with length = particleCount * 3", () => {
		const result = generateGalaxy({ particleCount: 100 });
		expect(result.colors.length).toBe(100 * 3);
	});

	it("returns sizes array with length = particleCount", () => {
		const result = generateGalaxy({ particleCount: 100 });
		expect(result.sizes.length).toBe(100);
	});

	it("all particle positions fall within expected spatial bounds", () => {
		const radius = 40;
		const result = generateGalaxy({ particleCount: 1000, radius });

		for (let i = 0; i < result.positions.length; i += 3) {
			const x = result.positions[i];
			const z = result.positions[i + 2];
			// Each particle should be within radius + scatter margin
			const dist = Math.sqrt(x * x + z * z);
			expect(dist).toBeLessThan(radius * 1.8);
		}
	});

	it("all colour values are in [0, 1] range", () => {
		const result = generateGalaxy({ particleCount: 500 });

		for (let i = 0; i < result.colors.length; i++) {
			expect(result.colors[i]).toBeGreaterThanOrEqual(0);
			expect(result.colors[i]).toBeLessThanOrEqual(1);
		}
	});

	it("all size values are positive", () => {
		const result = generateGalaxy({ particleCount: 500 });

		for (let i = 0; i < result.sizes.length; i++) {
			expect(result.sizes[i]).toBeGreaterThan(0);
		}
	});

	it("is deterministic — same seed produces identical output", () => {
		const a = generateGalaxy({ particleCount: 200, seed: 42 });
		const b = generateGalaxy({ particleCount: 200, seed: 42 });

		expect(Array.from(a.positions)).toEqual(Array.from(b.positions));
		expect(Array.from(a.colors)).toEqual(Array.from(b.colors));
		expect(Array.from(a.sizes)).toEqual(Array.from(b.sizes));
	});

	it("different seeds produce different output", () => {
		const a = generateGalaxy({ particleCount: 200, seed: 1 });
		const b = generateGalaxy({ particleCount: 200, seed: 2 });

		expect(Array.from(a.positions)).not.toEqual(Array.from(b.positions));
	});

	it("resolves default config values correctly", () => {
		const result = generateGalaxy();
		expect(result.config.particleCount).toBe(150_000);
		expect(result.config.armCount).toBe(5);
		expect(result.config.radius).toBe(40);
		expect(result.config.seed).toBe(42);
	});

	it("respects custom particleCount", () => {
		const result = generateGalaxy({ particleCount: 42 });
		expect(result.positions.length).toBe(42 * 3);
	});

	it("galaxy is mostly flat — Y values much smaller than XZ extent", () => {
		const result = generateGalaxy({ particleCount: 1000, radius: 40 });
		const maxY = Math.max(
			...Array.from({ length: 1000 }, (_, i) =>
				Math.abs(result.positions[i * 3 + 1]),
			),
		);
		const maxXZ = Math.max(
			...Array.from({ length: 1000 }, (_, i) => {
				const x = result.positions[i * 3];
				const z = result.positions[i * 3 + 2];
				return Math.sqrt(x * x + z * z);
			}),
		);
		// The galaxy disk should be much wider than it is tall
		expect(maxY).toBeLessThan(maxXZ * 0.3);
	});
});
