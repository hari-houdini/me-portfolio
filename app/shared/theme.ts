/**
 * theme.ts — shared colour constants for the 3D experience
 *
 * All values mirror the CSS custom properties defined in app.css.
 * Three.js accepts hex strings directly — no conversion needed.
 *
 * Usage pattern:
 *   import { THEME } from '~/shared/theme'
 *   new THREE.Color(THEME.galaxyCore)
 *
 * These constants are used by:
 *   - galaxy particle shader uniforms
 *   - city building and neon sign colours
 *   - post-processing tone-mapping parameters
 */

export const THEME = {
	// ---- Background ----
	void: "#000005",
	deepNavy: "#020210",

	// ---- Neon accents ----
	neonCyan: "#00f5ff",
	neonPink: "#ff0080",
	neonViolet: "#9d00ff",
	neonAmber: "#ff8c00",

	// ---- Galaxy ----
	galaxyCore: "#ffd580",
	galaxyArm: "#6a35c9",

	// ---- UI text ----
	textPrimary: "#f0f0f5",
	textMuted: "#7a7a9a",
	textSubtle: "#3a3a5a",

	// ---- Surfaces ----
	surface1: "#0a0a1a",
	surface2: "#12121f",
	border: "#1e1e35",
} as const;

export type ThemeKey = keyof typeof THEME;
