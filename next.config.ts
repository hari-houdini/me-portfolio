import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // webpack rule: handles .glsl/.vert/.frag for production builds (next build always uses webpack).
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
    rules: {
      "*.glsl": { loaders: ["raw-loader"], as: "*.js" },
      "*.vert": { loaders: ["raw-loader"], as: "*.js" },
      "*.frag": { loaders: ["raw-loader"], as: "*.js" },
    },
  },
};

export default nextConfig;
