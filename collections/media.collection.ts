/**
 * media.collection.ts
 *
 * Payload upload collection for all portfolio images.
 *
 * Storage strategy:
 *  - Development: local staticDir ("media/") — no AWS credentials needed locally
 *  - Production:  @payloadcms/storage-s3 plugin (configured in payload.config.ts)
 *
 * Image size variants:
 *  - thumbnail (400px wide) — used in project cards
 *  - og (1200×630)          — used for Open Graph / social share previews
 *
 * Access:
 *  - read:   public (images are served directly)
 *  - write:  admin only
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const Media: CollectionConfig = {
	slug: "media",
	admin: {
		useAsTitle: "filename",
		description: "Images and media assets used across the portfolio.",
	},
	access: {
		read: () => true,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	upload: {
		// Local filesystem storage for development.
		// @payloadcms/storage-s3 (in payload.config.ts) overrides this in production.
		staticDir: path.resolve(dirname, "../media"),
		imageSizes: [
			{
				name: "thumbnail",
				width: 400,
				// height is left undefined — aspect ratio is preserved
				position: "centre",
			},
			{
				name: "og",
				width: 1200,
				height: 630,
				position: "centre",
			},
		],
		adminThumbnail: "thumbnail",
		mimeTypes: ["image/*"],
	},
	fields: [
		{
			name: "alt",
			type: "text",
			label: "Alt Text",
			admin: {
				description:
					"Describe the image for screen readers. Leave empty for purely decorative images.",
			},
		},
	],
};
