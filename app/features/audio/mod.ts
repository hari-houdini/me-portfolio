/**
 * mod.ts — public interface of the `audio` pod
 *
 * Exports:
 *  - AudioToggle component
 *  - createAudioService factory (used in tests)
 *  - AudioState and AudioService types
 */

export type { AudioService, AudioState } from "./audio.service";
export { createAudioService } from "./audio.service";
export { AudioToggle } from "./audio-toggle.client.component";
