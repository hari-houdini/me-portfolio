/**
 * mod.ts — public interface of the `city` pod
 *
 * Exports:
 *  - CityScene component (the full city environment)
 *  - generateCity utility (pure TS, used in tests)
 *  - CityConfig, CityGeometry, BuildingData, CarRoute, NeonSignData types
 */

export type {
	BuildingData,
	CarRoute,
	CityConfig,
	CityGeometry,
	NeonSignData,
} from "./city.generator";
export { generateCity } from "./city.generator";
export { CityScene } from "./city-scene.client.component";
