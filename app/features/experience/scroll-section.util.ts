/**
 * scroll-section.ts — scroll section enumeration
 *
 * The three discrete camera positions in the portfolio experience.
 * The camera interpolates between these states driven by scroll progress.
 *
 * GALAXY_ANGLED  Section 1 — spiral galaxy seen at ~30° angle (hero view)
 * GALAXY_TOP     Section 2 — same galaxy from directly above (about view)
 * CITY           Section 3 — cyberpunk mega-city aerial view (work + contact)
 */

export const ScrollSection = {
	GALAXY_ANGLED: 0,
	GALAXY_TOP: 1,
	CITY: 2,
} as const;

export type ScrollSection = (typeof ScrollSection)[keyof typeof ScrollSection];

/**
 * Normalised scroll offsets at which each section begins.
 * These are the snap anchor points used by GSAP ScrollTrigger.
 */
export const SECTION_OFFSETS = [0, 0.33, 0.66] as const;

/**
 * Number of discrete scroll sections.
 */
export const SECTION_COUNT = 3 as const;
