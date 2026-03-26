/**
 * warp.generator.ts — cosmic highway warp tunnel geometry generator
 *
 * Pure TypeScript — no Three.js dependency. Generates flat arrays of
 * Float32 data and descriptive structs used by the warp scene components.
 *
 * The warp tunnel consists of four visual layers:
 *  1. Neon grid road — a perspective-converging grid of violet/cyan lines
 *     extending along the -Z axis from the camera eye position
 *  2. Star streaks — particles distributed in a cylinder around the camera,
 *     elongated along the Z axis to simulate warp-speed motion
 *  3. Light pods (cars) — abstract vehicle shapes in two lanes, represented
 *     as [x, y, z, speed, phase] tuples for GPU-side animation
 *  4. Nebula backdrop — a set of colour stops used by the background shader
 *
 * All output is deterministic when the same seed is provided.
 *
 * Usage:
 *  const geo = generateWarp({ seed: 42 })
 *  // geo.starPositions → Float32Array — upload to BufferGeometry
 *  // geo.lightPods    → LightPodData[] — animate in component
 */

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG — identical implementation to galaxy.generator.ts
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
// Public types
// ---------------------------------------------------------------------------

export interface WarpConfig {
	/** PRNG seed for deterministic output. Default: 42 */
	seed?: number;
	/** Number of star streak particles. Default: 15_000 */
	starCount?: number;
	/** Radius of the star streak cylinder around the camera. Default: 60 */
	tunnelRadius?: number;
	/** Depth of the star tunnel in world units. Default: 400 */
	tunnelDepth?: number;
	/** Number of light pod vehicles per lane (2 lanes). Default: 18 */
	podsPerLane?: number;
	/** Number of grid lines along X axis. Default: 12 */
	gridLinesX?: number;
	/** Number of grid lines along Z axis (depth subdivisions). Default: 30 */
	gridLinesZ?: number;
	/** Half-width of the road grid. Default: 8 */
	roadHalfWidth?: number;
	/** How far the grid extends along -Z. Default: 200 */
	roadDepth?: number;
}

export interface LightPodData {
	/** Lane index: 0 = left lane, 1 = right lane */
	lane: 0 | 1;
	/** X world position (within lane) */
	x: number;
	/** Y world position (above road) */
	y: number;
	/** Starting Z position */
	z: number;
	/** Travel speed in world units per second */
	speed: number;
	/** Phase offset in [0, 1] to stagger animation starts */
	phase: number;
	/** 'headlight' = white, 'taillight' = red */
	lightType: "headlight" | "taillight";
}

export interface WarpGeometry {
	/** Float32Array of [x,y,z] star positions — length = starCount * 3 */
	starPositions: Float32Array;
	/** Float32Array of per-star speed factor in [0.5, 1.5] — length = starCount */
	starSpeeds: Float32Array;
	/** All light pod descriptors for both lanes */
	lightPods: LightPodData[];
	/** Road grid vertices as line segment pairs [x0,y0,z0,x1,y1,z1, ...] */
	gridSegments: Float32Array;
	/** The resolved config used to generate this geometry */
	config: Required<WarpConfig>;
}

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateWarp(config: WarpConfig = {}): WarpGeometry {
	const resolved: Required<WarpConfig> = {
		seed: config.seed ?? 42,
		starCount: config.starCount ?? 15_000,
		tunnelRadius: config.tunnelRadius ?? 60,
		tunnelDepth: config.tunnelDepth ?? 400,
		podsPerLane: config.podsPerLane ?? 18,
		gridLinesX: config.gridLinesX ?? 12,
		gridLinesZ: config.gridLinesZ ?? 30,
		roadHalfWidth: config.roadHalfWidth ?? 8,
		roadDepth: config.roadDepth ?? 200,
	};

	const {
		seed,
		starCount,
		tunnelRadius,
		tunnelDepth,
		podsPerLane,
		gridLinesX,
		gridLinesZ,
		roadHalfWidth,
		roadDepth,
	} = resolved;

	const rand = mulberry32(seed);

	// -------------------------------------------------------------------------
	// 1. Star streak positions
	//    Distributed on a cylinder surface around the camera (eye at z=0)
	//    so the camera is always inside the star tunnel.
	// -------------------------------------------------------------------------
	const starPositions = new Float32Array(starCount * 3);
	const starSpeeds = new Float32Array(starCount);

	for (let i = 0; i < starCount; i++) {
		const i3 = i * 3;
		// Cylindrical distribution: random angle + radius jitter for depth
		const angle = rand() * Math.PI * 2;
		const rJitter = tunnelRadius * (0.7 + rand() * 0.3); // 70%–100% of radius
		starPositions[i3] = Math.cos(angle) * rJitter;
		starPositions[i3 + 1] = Math.sin(angle) * rJitter;
		// Z: distribute backward along the tunnel (-tunnelDepth to 0)
		starPositions[i3 + 2] = -(rand() * tunnelDepth);
		starSpeeds[i] = 0.5 + rand() * 1.0; // varied speed multiplier
	}

	// -------------------------------------------------------------------------
	// 2. Light pods (cars)
	//    Two lanes: left (x ≈ -2) and right (x ≈ +2), eye level (y = 1)
	//    Both headlight (oncoming) and taillight (same-direction) vehicles.
	// -------------------------------------------------------------------------
	const lightPods: LightPodData[] = [];
	const laneXs = [-2.5, 2.5] as const;

	for (let lane = 0; lane < 2; lane++) {
		const laneX = laneXs[lane];

		for (let p = 0; p < podsPerLane; p++) {
			const isOncoming = rand() > 0.4; // 60% oncoming headlights
			lightPods.push({
				lane: lane as 0 | 1,
				x: laneX + (rand() - 0.5) * 0.6, // slight lateral jitter
				y: 0.6 + rand() * 0.4, // ride height 0.6–1.0
				z: -(rand() * roadDepth), // scatter along tunnel depth
				speed: 20 + rand() * 60, // 20–80 world units/s
				phase: rand(), // stagger starts [0, 1]
				lightType: isOncoming ? "headlight" : "taillight",
			});
		}
	}

	// -------------------------------------------------------------------------
	// 3. Road grid segments
	//    Perspective-converging grid: lines along X (cross-lanes) and Z (along road)
	//    Stored as interleaved [x0,y0,z0, x1,y1,z1] pairs for LineSegments
	// -------------------------------------------------------------------------
	const segmentsPerX = gridLinesX + 1;
	const segmentsPerZ = gridLinesZ + 1;
	// Each Z line: 2 endpoints × 3 floats; each X line: 2 endpoints × 3 floats
	const gridBuffer = new Float32Array((segmentsPerX + segmentsPerZ) * 2 * 3);
	let gIdx = 0;

	// Lines running along Z (the road direction) — spaced across road width
	for (let i = 0; i <= gridLinesX; i++) {
		const x = -roadHalfWidth + (i / gridLinesX) * roadHalfWidth * 2;
		// Start at camera position (z=0), end at far depth
		gridBuffer[gIdx++] = x;
		gridBuffer[gIdx++] = 0; // y=0 (road surface)
		gridBuffer[gIdx++] = 0; // z near
		gridBuffer[gIdx++] = x;
		gridBuffer[gIdx++] = 0;
		gridBuffer[gIdx++] = -roadDepth; // z far
	}

	// Lines running across X (cross-road) at regular Z intervals
	for (let j = 0; j <= gridLinesZ; j++) {
		const z = -(j / gridLinesZ) * roadDepth;
		gridBuffer[gIdx++] = -roadHalfWidth;
		gridBuffer[gIdx++] = 0;
		gridBuffer[gIdx++] = z;
		gridBuffer[gIdx++] = roadHalfWidth;
		gridBuffer[gIdx++] = 0;
		gridBuffer[gIdx++] = z;
	}

	return {
		starPositions,
		starSpeeds,
		lightPods,
		gridSegments: gridBuffer,
		config: resolved,
	};
}
