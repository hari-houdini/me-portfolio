/**
 * galaxy-generator.ts — procedural spiral galaxy geometry generator
 *
 * Pure TypeScript — no Three.js dependency. Generates flat arrays of
 * Float32 data suitable for direct upload to a WebGL BufferGeometry.
 *
 * Algorithm:
 *  Particles are distributed across N spiral arms using logarithmic spiral
 *  equations. Each particle's position is perturbed with a Gaussian-like
 *  scatter to give the arms natural thickness. Core density is higher;
 *  arm density falls off with distance from centre.
 *
 * Determinism:
 *  The generator accepts a seed for the PRNG so the galaxy layout is
 *  identical across every page load. The seeded PRNG is a simple mulberry32
 *  which is fast and has acceptable distribution for visual purposes.
 *
 * Usage:
 *  const { positions, colors, sizes } = generateGalaxy({ particleCount: 150_000 })
 */

export interface GalaxyConfig {
	/** Total number of particles. Default: 150_000 */
	particleCount?: number;
	/** Number of spiral arms. Default: 5 */
	armCount?: number;
	/** Galaxy radius in world units. Default: 40 */
	radius?: number;
	/** How tightly the arms wrap (higher = tighter). Default: 1.2 */
	spin?: number;
	/** Arm width scatter. Default: 0.25 */
	randomness?: number;
	/** Randomness power — higher = more concentrated along arm. Default: 2.5 */
	randomnessPower?: number;
	/** Seeded PRNG seed for deterministic output. Default: 42 */
	seed?: number;
}

export interface GalaxyGeometry {
	/** Float32Array of [x,y,z] position tuples — length = particleCount * 3 */
	positions: Float32Array;
	/** Float32Array of [r,g,b] colour tuples — length = particleCount * 3 */
	colors: Float32Array;
	/** Float32Array of per-particle size values — length = particleCount */
	sizes: Float32Array;
	/** The resolved config used to generate this geometry */
	config: Required<GalaxyConfig>;
}

// ---------------------------------------------------------------------------
// Mulberry32 seeded PRNG — fast, good distribution, deterministic
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
// Colour helpers
// ---------------------------------------------------------------------------

/** Linear interpolation between two [r,g,b] tuples */
function lerpColor(
	a: [number, number, number],
	b: [number, number, number],
	t: number,
): [number, number, number] {
	return [
		a[0] + (b[0] - a[0]) * t,
		a[1] + (b[1] - a[1]) * t,
		a[2] + (b[2] - a[2]) * t,
	];
}

/** Parse a CSS hex colour string to a [r,g,b] tuple in [0,1] range */
function hexToRgb(hex: string): [number, number, number] {
	const n = Number.parseInt(hex.replace("#", ""), 16);
	return [(n >> 16) / 255, ((n >> 8) & 0xff) / 255, (n & 0xff) / 255];
}

// Galaxy colour scheme — core (warm gold) → arm tip (cool violet)
const CORE_COLOR = hexToRgb("#ffd580");
const ARM_COLOR = hexToRgb("#6a35c9");

// ---------------------------------------------------------------------------
// Main generator
// ---------------------------------------------------------------------------

export function generateGalaxy(config: GalaxyConfig = {}): GalaxyGeometry {
	const resolved: Required<GalaxyConfig> = {
		particleCount: config.particleCount ?? 150_000,
		armCount: config.armCount ?? 5,
		radius: config.radius ?? 40,
		spin: config.spin ?? 1.2,
		randomness: config.randomness ?? 0.25,
		randomnessPower: config.randomnessPower ?? 2.5,
		seed: config.seed ?? 42,
	};

	const {
		particleCount,
		armCount,
		radius,
		spin,
		randomness,
		randomnessPower,
		seed,
	} = resolved;

	const positions = new Float32Array(particleCount * 3);
	const colors = new Float32Array(particleCount * 3);
	const sizes = new Float32Array(particleCount);

	const rand = mulberry32(seed);

	for (let i = 0; i < particleCount; i++) {
		const i3 = i * 3;

		// Radius from centre — bias towards core with square root distribution
		const r = Math.sqrt(rand()) * radius;

		// Arm angle — evenly distribute particles across arms
		const armAngle = ((i % armCount) / armCount) * Math.PI * 2;

		// Spin angle increases with distance from centre (logarithmic spiral)
		const spinAngle = r * spin;

		// Random scatter perpendicular to arm
		const rx =
			rand() ** randomnessPower * randomness * r * (rand() < 0.5 ? 1 : -1);
		const ry =
			rand() ** randomnessPower *
			randomness *
			r *
			0.3 *
			(rand() < 0.5 ? 1 : -1);
		const rz =
			rand() ** randomnessPower * randomness * r * (rand() < 0.5 ? 1 : -1);

		const angle = armAngle + spinAngle;

		positions[i3] = Math.cos(angle) * r + rx;
		positions[i3 + 1] = ry; // galaxy is mostly flat, slight vertical scatter
		positions[i3 + 2] = Math.sin(angle) * r + rz;

		// Colour: lerp from core gold to arm violet based on distance
		const distanceFraction = r / radius;
		const [cr, cg, cb] = lerpColor(CORE_COLOR, ARM_COLOR, distanceFraction);
		colors[i3] = cr;
		colors[i3 + 1] = cg;
		colors[i3 + 2] = cb;

		// Size: larger near core, smaller at edges
		sizes[i] = (1 - distanceFraction) * 2.5 + 0.5;
	}

	return { positions, colors, sizes, config: resolved };
}
