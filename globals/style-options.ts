/**
 * style-options.ts
 *
 * Shared Payload select options for UI style pickers used across globals.
 * Centralised here to avoid duplication between site-config, about, contact,
 * and work-config globals.
 */

export const BACKGROUND_OPTIONS = [
	{ label: "None (flat)", value: "none" },
	{ label: "Aurora", value: "aurora" },
	{ label: "Starfield / Particles", value: "particles" },
	{ label: "Waves", value: "waves" },
	{ label: "Meteor Shower", value: "meteors" },
	{ label: "Grid", value: "grid" },
	{ label: "Noise / Grain", value: "noise" },
	{ label: "Light Beams", value: "beams" },
	{ label: "Vortex", value: "vortex" },
	{ label: "Floating Orbs", value: "orbs" },
	{ label: "Ripple", value: "ripple" },
];

export const TITLE_EFFECT_OPTIONS = [
	{ label: "None (plain)", value: "none" },
	{ label: "Typewriter", value: "typewriter" },
	{ label: "Glitch", value: "glitch" },
	{ label: "Gradient", value: "gradient" },
	{ label: "Shimmer", value: "shimmer" },
];

export type BackgroundVariant =
	| "none"
	| "aurora"
	| "particles"
	| "waves"
	| "meteors"
	| "grid"
	| "noise"
	| "beams"
	| "vortex"
	| "orbs"
	| "ripple";

export type TitleEffectVariant =
	| "none"
	| "typewriter"
	| "glitch"
	| "gradient"
	| "shimmer";

export type ProjectCardStyle =
	| "glow"
	| "spotlight"
	| "tilt"
	| "flip"
	| "glassmorphism"
	| "border-beam";
