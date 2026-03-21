/**
 * mod.ts — public interface of the `warp` pod
 *
 * Exports:
 *  - WarpScene component (the full warp tunnel environment)
 *  - generateWarp utility (pure TS, used in tests)
 *  - WarpConfig, WarpGeometry, LightPodData types
 */

export type { LightPodData, WarpConfig, WarpGeometry } from "./warp.generator";
export { generateWarp } from "./warp.generator";
export { WarpScene } from "./warp-scene.client.component";
