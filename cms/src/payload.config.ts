/**
 * payload.config.ts
 *
 * Main Payload CMS configuration for harihoudini.dev.
 *
 * Architecture:
 *  - PostgreSQL via @payloadcms/db-postgres (Supabase free tier in production)
 *  - Lexical rich text editor for bio and project long descriptions
 *  - Sharp for server-side image resizing (thumbnail + og size variants)
 *  - CORS allow-list: portfolio origin + CMS origin
 *  - Telemetry disabled
 *
 * REST API base: {NEXT_PUBLIC_SERVER_URL}/api
 *   Globals: /api/globals/{slug}
 *   Collections: /api/{slug}
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";
import { Media } from "./collections/Media";
import { Projects } from "./collections/Projects";
import { Users } from "./collections/Users";
import { About } from "./globals/About";
import { Contact } from "./globals/Contact";
import { SiteConfig } from "./globals/SiteConfig";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	// ---- Server ---------------------------------------------------------
	serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001",

	// ---- Admin panel ----------------------------------------------------
	admin: {
		user: Users.slug,
		meta: {
			titleSuffix: "— harihoudini.dev CMS",
		},
	},

	// ---- Collections & Globals ------------------------------------------
	collections: [Users, Media, Projects],
	globals: [SiteConfig, About, Contact],

	// ---- Editor ---------------------------------------------------------
	// lexicalEditor() is the default rich text editor. Applied globally;
	// individual richText fields inherit this unless they override it.
	editor: lexicalEditor(),

	// ---- Auth -----------------------------------------------------------
	secret: process.env.PAYLOAD_SECRET ?? "",

	// ---- Database -------------------------------------------------------
	db: postgresAdapter({
		pool: {
			connectionString: process.env.DATABASE_URI ?? "",
		},
	}),

	// ---- Image processing -----------------------------------------------
	// sharp enables server-side cropping, focal-point selection, and the
	// imageSizes defined in the Media collection.
	sharp,

	// ---- CORS -----------------------------------------------------------
	// Allows the portfolio app to call the CMS REST API from the browser.
	cors: {
		origins: [
			// CMS itself (admin panel XHR)
			process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3001",
			// Portfolio app (client-side data fetching, if ever needed)
			process.env.PORTFOLIO_URL ?? "http://localhost:5173",
			// Production portfolio domain
			"https://harihoudini.dev",
		].filter(Boolean),
	},

	// ---- TypeScript type generation -------------------------------------
	typescript: {
		outputFile: path.resolve(dirname, "payload-types.ts"),
	},

	// ---- Telemetry ------------------------------------------------------
	telemetry: false,
});
