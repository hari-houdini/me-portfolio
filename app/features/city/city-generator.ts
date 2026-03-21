/**
 * city-generator.ts — procedural cyberpunk city geometry generator
 *
 * Pure TypeScript — no Three.js dependency. Generates flat arrays of data
 * suitable for Three.js InstancedMesh and BufferGeometry.
 *
 * The city is deterministic (seeded PRNG) so the layout is identical across
 * every page load and across test runs.
 *
 * City layout:
 *  - A square grid of N×N cells, each potentially containing a building
 *  - Buildings have variable height, footprint, and colour (neon accent)
 *  - Car routes follow a simple grid road network between blocks
 *  - Neon signs are positioned on the faces of tall buildings
 */

export interface CityConfig {
	/** Number of city blocks per axis (total blocks = gridSize²). Default: 20 */
	gridSize?: number;
	/** World-space size of each city block. Default: 8 */
	blockSize?: number;
	/** Minimum building height. Default: 4 */
	minHeight?: number;
	/** Maximum building height. Default: 60 */
	maxHeight?: number;
	/** Probability (0→1) that a given cell has a building. Default: 0.65 */
	density?: number;
	/** PRNG seed for deterministic output. Default: 42 */
	seed?: number;
}

export interface BuildingData {
	/** World-space X position of the building's centre */
	x: number;
	/** World-space Z position of the building's centre */
	z: number;
	/** Building height in world units */
	height: number;
	/** Building width (footprint X) in world units */
	width: number;
	/** Building depth (footprint Z) in world units */
	depth: number;
	/** Hex colour string for this building's neon accent */
	neonColor: string;
	/** True if this building should display a neon sign */
	hasNeonSign: boolean;
}

export interface CarRoute {
	/** Start point [x, z] */
	start: [number, number];
	/** End point [x, z] */
	end: [number, number];
	/** Whether this is a primary (wide) road */
	isPrimary: boolean;
}

export interface NeonSignData {
	x: number;
	y: number;
	z: number;
	/** Rotation around Y axis in radians */
	rotation: number;
	color: string;
	/** Intensity multiplier for bloom */
	intensity: number;
}

export interface CityGeometry {
	buildings: BuildingData[];
	carRoutes: CarRoute[];
	neonSigns: NeonSignData[];
	config: Required<CityConfig>;
}

// ---------------------------------------------------------------------------
// Neon colour palette for buildings
// ---------------------------------------------------------------------------

const NEON_COLORS = [
	"#00f5ff", // cyan
	"#ff0080", // pink
	"#9d00ff", // violet
	"#ff8c00", // amber
	"#39ff14", // green
] as const;

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG (same algorithm as galaxy-generator)
// ---------------------------------------------------------------------------

function mulberry32(seed: number): () => number {
	let s = seed;
	return () => {
		s |= 0;
		s = (s + 0x6d2b79f5) | 0;
		let z = Math.imul(s ^ (s >>> 15), 1 | s);
		z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
		return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
	};
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateCity(config: CityConfig = {}): CityGeometry {
	const resolved: Required<CityConfig> = {
		gridSize: config.gridSize ?? 20,
		blockSize: config.blockSize ?? 8,
		minHeight: config.minHeight ?? 4,
		maxHeight: config.maxHeight ?? 60,
		density: config.density ?? 0.65,
		seed: config.seed ?? 42,
	};

	const { gridSize, blockSize, minHeight, maxHeight, density, seed } = resolved;

	const rand = mulberry32(seed);

	const buildings: BuildingData[] = [];
	const neonSigns: NeonSignData[] = [];

	const halfGrid = (gridSize * blockSize) / 2;

	for (let gx = 0; gx < gridSize; gx++) {
		for (let gz = 0; gz < gridSize; gz++) {
			// Skip some cells to leave road space
			if (rand() > density) continue;

			const height = minHeight + rand() * (maxHeight - minHeight);
			const width = blockSize * (0.4 + rand() * 0.45);
			const depth = blockSize * (0.4 + rand() * 0.45);

			const x = gx * blockSize - halfGrid + blockSize / 2;
			const z = gz * blockSize - halfGrid + blockSize / 2;

			const neonColor = NEON_COLORS[Math.floor(rand() * NEON_COLORS.length)];
			const hasNeonSign = height > maxHeight * 0.5 && rand() > 0.4;

			buildings.push({ x, z, height, width, depth, neonColor, hasNeonSign });

			// Place neon sign on a random face of tall buildings
			if (hasNeonSign) {
				const face = Math.floor(rand() * 4);
				const rotations = [0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2];
				const offsets = [
					[0, depth / 2 + 0.1],
					[width / 2 + 0.1, 0],
					[0, -(depth / 2 + 0.1)],
					[-(width / 2 + 0.1), 0],
				];
				const [ox, oz] = offsets[face];
				neonSigns.push({
					x: x + ox,
					y: height * (0.5 + rand() * 0.35),
					z: z + oz,
					rotation: rotations[face],
					color: neonColor,
					intensity: 0.8 + rand() * 0.7,
				});
			}
		}
	}

	// Generate car routes along grid roads
	const carRoutes: CarRoute[] = [];
	const roadStep = blockSize;

	// Horizontal roads
	for (let gz = 0; gz <= gridSize; gz++) {
		const z = gz * roadStep - halfGrid;
		carRoutes.push({
			start: [-halfGrid, z],
			end: [halfGrid, z],
			isPrimary: gz % 4 === 0,
		});
	}

	// Vertical roads
	for (let gx = 0; gx <= gridSize; gx++) {
		const x = gx * roadStep - halfGrid;
		carRoutes.push({
			start: [x, -halfGrid],
			end: [x, halfGrid],
			isPrimary: gx % 4 === 0,
		});
	}

	return { buildings, carRoutes, neonSigns, config: resolved };
}
