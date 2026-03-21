/**
 * city-generator.test.ts
 *
 * Tests for the pure TypeScript city geometry generator.
 * Verifies building counts, spatial bounds, route generation,
 * and determinism. No Three.js or WebGL involved.
 */

import { describe, expect, it } from "vitest";
import { generateCity } from "../city.generator";

describe("city-generator: generateCity()", () => {
	it("generates a non-zero number of buildings for default config", () => {
		const result = generateCity();
		expect(result.buildings.length).toBeGreaterThan(0);
	});

	it("building count respects density — higher density = more buildings", () => {
		const low = generateCity({ gridSize: 10, density: 0.1, seed: 1 });
		const high = generateCity({ gridSize: 10, density: 0.9, seed: 1 });
		expect(high.buildings.length).toBeGreaterThan(low.buildings.length);
	});

	it("all building heights fall within [minHeight, maxHeight]", () => {
		const min = 5;
		const max = 50;
		const result = generateCity({ minHeight: min, maxHeight: max });

		for (const building of result.buildings) {
			expect(building.height).toBeGreaterThanOrEqual(min);
			expect(building.height).toBeLessThanOrEqual(max);
		}
	});

	it("all building widths and depths are positive", () => {
		const result = generateCity();
		for (const building of result.buildings) {
			expect(building.width).toBeGreaterThan(0);
			expect(building.depth).toBeGreaterThan(0);
		}
	});

	it("building positions are within expected grid bounds", () => {
		const gridSize = 10;
		const blockSize = 8;
		const halfGrid = (gridSize * blockSize) / 2;
		const result = generateCity({ gridSize, blockSize });

		for (const building of result.buildings) {
			expect(building.x).toBeGreaterThanOrEqual(-halfGrid);
			expect(building.x).toBeLessThanOrEqual(halfGrid);
			expect(building.z).toBeGreaterThanOrEqual(-halfGrid);
			expect(building.z).toBeLessThanOrEqual(halfGrid);
		}
	});

	it("generates car routes — horizontal + vertical roads", () => {
		const gridSize = 5;
		const result = generateCity({ gridSize });
		// Expected: (gridSize+1) horizontal + (gridSize+1) vertical routes
		expect(result.carRoutes.length).toBe((gridSize + 1) * 2);
	});

	it("car routes have distinct start and end points", () => {
		const result = generateCity({ gridSize: 5 });
		for (const route of result.carRoutes) {
			const [sx, sz] = route.start;
			const [ex, ez] = route.end;
			const isSame = sx === ex && sz === ez;
			expect(isSame).toBe(false);
		}
	});

	it("neon signs only appear on tall buildings", () => {
		const maxHeight = 50;
		const result = generateCity({ maxHeight });

		for (const sign of result.neonSigns) {
			// Sign Y position should be above ground
			expect(sign.y).toBeGreaterThan(0);
		}

		// Verify no sign is placed on a very short building
		const buildingsWithSigns = result.buildings.filter((b) => b.hasNeonSign);
		for (const b of buildingsWithSigns) {
			expect(b.height).toBeGreaterThan(maxHeight * 0.5);
		}
	});

	it("is deterministic — same seed produces identical output", () => {
		const a = generateCity({ seed: 99 });
		const b = generateCity({ seed: 99 });

		expect(a.buildings.length).toBe(b.buildings.length);
		expect(a.buildings[0]).toEqual(b.buildings[0]);
		expect(a.carRoutes.length).toBe(b.carRoutes.length);
	});

	it("different seeds produce different layouts", () => {
		const a = generateCity({ seed: 1 });
		const b = generateCity({ seed: 2 });

		// Different seeds should produce different building heights/positions
		const aHeights = a.buildings.map((b) => b.height).join(",");
		const bHeights = b.buildings.map((b) => b.height).join(",");
		expect(aHeights).not.toBe(bHeights);
	});

	it("resolves default config values correctly", () => {
		const result = generateCity();
		expect(result.config.gridSize).toBe(20);
		expect(result.config.blockSize).toBe(8);
		expect(result.config.minHeight).toBe(4);
		expect(result.config.maxHeight).toBe(60);
		expect(result.config.seed).toBe(42);
	});

	it("all neon sign colours are valid hex strings", () => {
		const result = generateCity();
		const hexPattern = /^#[0-9a-fA-F]{6}$/;
		for (const sign of result.neonSigns) {
			expect(sign.color).toMatch(hexPattern);
		}
	});
});
