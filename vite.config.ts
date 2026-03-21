import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [
		tailwindcss(),
		reactRouter(),
		tsconfigPaths(),
		glsl({
			// Import .glsl, .vert, .frag files as typed string constants.
			// Enables colocated shader files inside each 3D feature pod.
			include: ["**/*.glsl", "**/*.vert", "**/*.frag"],
			minify: false,
		}),
	],
});
