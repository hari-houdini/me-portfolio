/**
 * Media.ts
 *
 * Payload upload collection for all portfolio images.
 *
 * Image size variants:
 *  - thumbnail (400px wide) — used in project cards
 *  - og (1200×630)          — used for Open Graph / social share previews
 *
 * Access:
 *  - read:   public (images are served directly)
 *  - write:  admin only
 */

import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

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
		// staticDir is relative to the project root — served at /media/**
		staticDir: "media",
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
		// Which size to display as the preview image in the admin panel
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
					'Describe the image for screen readers. Leave empty for purely decorative images and add role="presentation" in the component.',
			},
		},
	],
};
