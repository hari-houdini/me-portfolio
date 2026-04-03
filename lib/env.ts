/**
 * lib/env.ts
 *
 * Single source of truth for all environment variables consumed by the Next.js
 * app and Payload config. Validated with Zod at module load time — any missing
 * or malformed secret causes a loud ZodError at startup, listing every offending
 * variable by name, before a single HTTP request is served.
 *
 * Rules:
 *  - Import `env` from this file instead of accessing `process.env` directly.
 *  - Never import this file in client components — browser bundles must not
 *    expose server secrets. Use `NEXT_PUBLIC_*` env vars for public values.
 *  - Optional vars use `.optional()` — the app degrades gracefully without them.
 *  - DATABASE_URL and PAYLOAD_SECRET are optional here (absent in CI build step)
 *    because `next build` runs without a database connection. Runtime failures
 *    will surface clearly when Payload tries to connect.
 */

import { z } from "zod";

const EnvSchema = z.object({
	NODE_ENV: z
		.enum(["development", "test", "production"])
		.default("development"),

	// Database — required at runtime, intentionally absent during `next build` in CI.
	DATABASE_URL: z.string().url().optional(),

	// Payload CMS JWT signing secret — min 32 chars enforced by Payload itself.
	PAYLOAD_SECRET: z.string().min(32).optional(),

	// Public canonical server URL — used by Payload for media URL construction.
	// Safe to expose in the browser; prefixed with NEXT_PUBLIC_.
	NEXT_PUBLIC_SERVER_URL: z.string().url().default("http://localhost:3000"),

	// S3 media storage — production only. Absent in development (local staticDir).
	S3_BUCKET: z.string().optional(),
	S3_REGION: z.string().default("us-east-1"),

	// AWS credentials — local dev only. In Lambda, IAM role provides these.
	AWS_ACCESS_KEY_ID: z.string().optional(),
	AWS_SECRET_ACCESS_KEY: z.string().optional(),
});

// parse() throws a ZodError listing all invalid/missing fields if validation fails.
export const env = EnvSchema.parse(process.env);
