/**
 * mod.ts — public interface of the `experience` pod
 *
 * Exports:
 *  - Experience component (the root Three.js canvas)
 *  - ExperienceProps type
 *  - ScrollSection enum and SECTION_COUNT constant
 */

export type { ExperienceProps } from "./experience.client.component";
export { Experience } from "./experience.client.component";
export type { ScrollSection as ScrollSectionType } from "./scroll-section.util";
export {
	ScrollSection,
	SECTION_COUNT,
	SECTION_OFFSETS,
} from "./scroll-section.util";
