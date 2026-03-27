/**
 * vitest.config.ts
 *
 * Test runner configuration.
 *
 * Environment strategy:
 *  - Default: "node" — service layer tests, utility tests, pure TypeScript
 *  - "jsdom" via environmentMatchGlobs — React component tests (Phase 6+)
 *
 * Coverage:
 *  - Provider: v8 (native, no Babel transform needed)
 *  - Includes all app/ source files
 *  - Excludes test infrastructure, generated types, and route wrappers
 */

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		// Service and utility tests run in Node — no DOM required.
		// Component tests (HTML overlays, audio toggle) declare:
		//   // @vitest-environment jsdom
		// at the top of their file to opt in to the jsdom environment.
		environment: "node",
		setupFiles: ["./app/test/setup.ts"],
		coverage: {
			provider: "v8",
			include: ["app/**/*.{ts,tsx}"],
			exclude: [
				// Test infrastructure
				"app/test/**",
				"app/**/__tests__/**",
				"app/**/*.test.{ts,tsx}",
				"app/**/*.unit.test.{ts,tsx}",
				"app/**/*.component.test.{ts,tsx}",
				"app/**/*.integration.test.{ts,tsx}",
				// Generated files (react-router typegen)
				"app/routes/+types/**",
				// Route modules require the full RR7 server context to test.
				// Integration-tested via loader tests in Phase 6+.
				"app/routes/**",
				// Entry points that delegate to other modules
				"app/root.tsx",
				"app/routes.ts",
				// Welcome boilerplate — removed in Phase 3
				"app/welcome/**",
				// Three.js / R3F components — WebGL not available in Node/jsdom.
				// Verified manually in the browser per PRD §5.2.
				"app/features/experience/**",
				"app/features/galaxy/galaxy-particles.client.component.tsx",
				"app/features/galaxy/galaxy-scene.client.component.tsx",
				"app/features/galaxy/galaxy-title.client.component.tsx",
				// Warp tunnel R3F components — WebGL not available in Node/jsdom
				"app/features/warp/warp-stars.client.component.tsx",
				"app/features/warp/warp-road.client.component.tsx",
				"app/features/warp/warp-cars.client.component.tsx",
				"app/features/warp/warp-nebula.client.component.tsx",
				"app/features/warp/warp-scene.client.component.tsx",
				// Audio toggle uses browser APIs not available in full in Node
				"app/features/audio/audio-toggle.client.component.tsx",
				// Nav liquid-glass uses SVG filter + ResizeObserver — visual only
				"app/features/nav/liquid-glass.client.component.tsx",
				// Shared constants — trivially correct
				"app/shared/theme.util.ts",
			],
			reporter: ["text", "lcov"],
			thresholds: {
				// Targets will rise as more modules are built in later phases.
				lines: 60,
				functions: 60,
				branches: 55,
				statements: 60,
			},
		},
	},
});
