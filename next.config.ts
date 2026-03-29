import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const nextConfig: NextConfig = {
	webpack: (config) => {
		config.module.rules.push({
			test: /\.(glsl|vert|frag)$/,
			use: "raw-loader",
		});
		return config;
	},

	// Turbopack: active when NOT using --no-server-fast-refresh (which we pass in `dev`).
	// @payloadcms/next exports "./css" without the "style" condition Turbopack requires,
	// so resolveAlias points directly at the CSS file (resolved from turbopack.root).
	turbopack: {
		root: path.resolve(dirname),
		resolveAlias: {
			"@payloadcms/next/css":
				"./node_modules/@payloadcms/next/dist/prod/styles.css",
		},
		rules: {
			"*.glsl": { loaders: ["raw-loader"], as: "*.js" },
			"*.vert": { loaders: ["raw-loader"], as: "*.js" },
			"*.frag": { loaders: ["raw-loader"], as: "*.js" },
		},
	},
};

// devBundleServerPackages: false — prevents withPayload from injecting webpack-only
// server aliases that conflict with Turbopack's resolver (required for Payload >= 3.73).
export default withPayload(nextConfig, { devBundleServerPackages: false });
