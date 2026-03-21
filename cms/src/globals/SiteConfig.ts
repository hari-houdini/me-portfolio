/**
 * SiteConfig.ts
 *
 * Singleton global — controls all heading copy and SEO metadata for the portfolio.
 *
 * REST API endpoint: GET /api/globals/site-config
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const SiteConfig: GlobalConfig = {
	slug: "site-config",
	label: "Site Configuration",
	admin: {
		description:
			"Portfolio title, tagline, section headings, and SEO metadata.",
	},
	access: {
		read: () => true,
		update: isAdmin,
	},
	fields: [
		// ---- Identity ---------------------------------------------------
		{
			name: "name",
			type: "text",
			required: true,
			defaultValue: "Hari Houdini",
			admin: {
				description: "Your full name — displayed as the 3D hero title.",
			},
		},
		{
			name: "tagline",
			type: "text",
			required: true,
			defaultValue: "Creative Technologist",
			admin: {
				description: "Your title or role — displayed below the hero name.",
			},
		},
		{
			name: "subtitle",
			type: "text",
			admin: {
				description: "Optional secondary line in the hero section.",
			},
		},
		// ---- Section titles ---------------------------------------------
		{
			name: "sectionTitles",
			type: "group",
			label: "Section Titles",
			fields: [
				{
					name: "hero",
					type: "text",
					defaultValue: "Hello, Universe",
				},
				{
					name: "about",
					type: "text",
					defaultValue: "About",
				},
				{
					name: "work",
					type: "text",
					defaultValue: "Work",
				},
				{
					name: "contact",
					type: "text",
					defaultValue: "Contact",
				},
			],
		},
		// ---- SEO --------------------------------------------------------
		{
			name: "seo",
			type: "group",
			label: "SEO",
			fields: [
				{
					name: "metaTitle",
					type: "text",
					defaultValue: "Hari Houdini — Creative Technologist",
				},
				{
					name: "metaDescription",
					type: "textarea",
					defaultValue:
						"Portfolio of Hari Houdini — immersive 3D experiences built at the intersection of art and engineering.",
				},
				{
					name: "ogImage",
					type: "upload",
					relationTo: "media",
					label: "OG Image",
					admin: {
						description:
							"Open Graph image shown when sharing on social media. Recommended: 1200×630.",
					},
				},
			],
		},
	],
};
