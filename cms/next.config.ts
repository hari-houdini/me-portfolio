import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

/**
 * next.config.ts
 *
 * withPayload wraps the Next.js config to:
 *  - Ensure compatibility with Payload's dependencies (drizzle-kit, etc.)
 *  - Configure the @payload-config path alias for Next.js bundling
 *  - Enable the Payload admin panel via the (payload) app route group
 */
const nextConfig: NextConfig = {
	// output: 'standalone' produces a self-contained build suitable for Docker
	// and Railway deployment — no node_modules mount required.
	output: "standalone",
};

export default withPayload(nextConfig);
