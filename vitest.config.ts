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
		// Component tests (Phase 6+) opt in per-file with:
		//   // @vitest-environment jsdom
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
