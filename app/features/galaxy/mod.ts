/**
 * mod.ts — public interface of the `galaxy` pod
 *
 * Exports:
 *  - GalaxyScene component (the full particle system + 3D titles)
 *  - GalaxyParticles component (particles only, for composition)
 *  - GalaxyTitle component (3D text, for composition)
 *  - generateGalaxy utility (pure TS, used in tests)
 *  - GALAXY_PARTICLE_COUNT constant
 *  - GalaxyConfig and GalaxyGeometry types
 */

export type { GalaxyConfig, GalaxyGeometry } from "./galaxy.generator";
export { generateGalaxy } from "./galaxy.generator";
export {
	GALAXY_PARTICLE_COUNT,
	GalaxyParticles,
} from "./galaxy-particles.client.component";
export { GalaxyScene } from "./galaxy-scene.client.component";
export { GalaxyTitle } from "./galaxy-title.client.component";
