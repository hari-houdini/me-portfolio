import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		environment: "jsdom",
		globals: true,
		passWithNoTests: true,
		setupFiles: ["./features/test/setup.ts"],
		coverage: {
			provider: "v8",
			thresholds: {
				lines: 60,
				functions: 60,
				branches: 55,
				statements: 60,
			},
		},
	},
});
