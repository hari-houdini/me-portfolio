/**
 * payload.config.ts
 *
 * Root-level Payload CMS v3 configuration.
 * Embedded in the Next.js app — no separate CMS process.
 *
 * Storage strategy:
 *  - Development: local staticDir ("media/") — no AWS credentials needed locally.
 *  - Production:  @payloadcms/storage-s3 plugin — S3 bucket provisioned by SST.
 *
 * Database: Supabase PostgreSQL via @payloadcms/db-postgres.
 *   Use ?pgBouncer=true in DATABASE_URL for Lambda connection pooling.
 *
 * Types: auto-generated into payload-types.ts — NEVER edit that file directly.
 *   Run: pnpm payload:generate-types
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import { Media } from "./collections/media.collection";
import { Projects } from "./collections/projects.collection";
import { Users } from "./collections/users.collection";
import { About } from "./globals/about.global";
import { Contact } from "./globals/contact.global";
import { SiteConfig } from "./globals/site-config.global";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const isProduction = process.env.NODE_ENV === "production";

export default buildConfig({
	// Admin panel served at /admin via Next.js route group
	admin: {
		user: Users.slug,
	},

	collections: [Users, Media, Projects],

	globals: [SiteConfig, About, Contact],

	editor: lexicalEditor(),

	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URL,
		},
	}),

	// S3 in production, local filesystem in development
	plugins: isProduction
		? [
				s3Storage({
					collections: {
						media: {
							prefix: "media",
						},
					},
					bucket: process.env.S3_BUCKET ?? "",
					config: {
						region: process.env.S3_REGION ?? "us-east-1",
						// In Lambda, IAM role provides credentials automatically.
						// Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY only for local dev.
					},
				}),
			]
		: [],

	secret: process.env.PAYLOAD_SECRET ?? "",

	serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",

	// Auto-generated types file — never edit manually
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
});
