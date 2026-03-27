import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	// webpack rule: handles .glsl/.vert/.frag for production builds (next build always uses webpack).
	webpack: (config) => {
		config.module.rules.push({
			test: /\.(glsl|vert|frag)$/,
			use: "raw-loader",
		});
		return config;
	},

	// Turbopack rule: Next.js 16 defaults to Turbopack for `next dev`.
	// Turbopack became stable in Next.js 15.3 — config is top-level (not experimental).
	// Turbopack supports webpack-compatible loaders via this config.
	turbopack: {
		rules: {
			"*.glsl": { loaders: ["raw-loader"], as: "*.js" },
			"*.vert": { loaders: ["raw-loader"], as: "*.js" },
			"*.frag": { loaders: ["raw-loader"], as: "*.js" },
		},
	},
};

export default withPayload(nextConfig);
