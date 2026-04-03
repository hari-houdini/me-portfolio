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
 *
 * Environment variables: all access goes through lib/env.ts (Zod-validated).
 * SST Resource bindings provide a secondary fallback for Lambda runtime values.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Resource } from "sst";
import { Media } from "./collections/media.collection";
import { Posts } from "./collections/posts.collection";
import { Projects } from "./collections/projects.collection";
import { Tags } from "./collections/tags.collection";
import { Users } from "./collections/users.collection";
import { About } from "./globals/about.global";
import { Contact } from "./globals/contact.global";
import { SiteConfig } from "./globals/site-config.global";
import { UIConfig } from "./globals/ui-config.global";
import { WorkConfig } from "./globals/work-config.global";
import { env } from "./lib/env";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Safely access SST v4 Resource values.
// Returns undefined when SST links are not active (local `next dev`, CI builds).
// In Lambda, SST injects resource bindings so Resource.* always resolves.
function sst<T>(accessor: () => T): T | undefined {
	try {
		return accessor();
	} catch {
		return undefined;
	}
}

export default buildConfig({
	// Admin panel served at /admin via Next.js route group
	admin: {
		user: Users.slug,
	},

	collections: [Users, Media, Projects, Tags, Posts],

	globals: [SiteConfig, About, Contact, WorkConfig, UIConfig],

	editor: lexicalEditor(),

	db: postgresAdapter({
		pool: {
			// SST v4 resource access:
			//   local dev → env.DATABASE_URL from .env.local (via lib/env.ts)
			//   Lambda    → Resource.DatabaseUrl.value from SST link
			//   CI build  → undefined (build skips DB — keep `pnpm build` out of CI)
			connectionString:
				env.DATABASE_URL ?? sst(() => Resource.DatabaseUrl.value),
		},
	}),

	sharp,

	// S3 in production, local filesystem in development
	plugins:
		env.NODE_ENV === "production"
			? [
					s3Storage({
						collections: {
							media: {
								prefix: "media",
							},
						},
						bucket: env.S3_BUCKET ?? sst(() => Resource.MediaBucket.name) ?? "",
						config: {
							region: env.S3_REGION,
							// In Lambda, IAM role provides credentials automatically.
							// Set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY only for local dev.
						},
					}),
				]
			: [],

	secret: env.PAYLOAD_SECRET ?? sst(() => Resource.PayloadSecret.value) ?? "",

	serverURL:
		env.NEXT_PUBLIC_SERVER_URL ??
		sst(() => Resource.ServerUrl.value) ??
		"http://localhost:3000",

	// Auto-generated types file — never edit manually
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},
});
