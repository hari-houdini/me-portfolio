/**
 * site-config.global.ts
 *
 * Singleton global — controls all heading copy and SEO metadata for the portfolio.
 *
 * Access:
 *  - read:   public
 *  - update: admin only
 */

import type { GlobalConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";
import { BACKGROUND_OPTIONS, TITLE_EFFECT_OPTIONS } from "./style-options";

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
				description: "Your full name — displayed as the hero title.",
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
		// ---- Hero style -------------------------------------------------
		{
			name: "heroStyle",
			type: "group",
			label: "Hero Style",
			fields: [
				{
					name: "background",
					type: "select",
					label: "Section Background",
					options: BACKGROUND_OPTIONS,
					defaultValue: "none",
					admin: {
						description:
							"Animated background rendered behind the Hero section.",
					},
				},
				{
					name: "titleEffect",
					type: "select",
					label: "Heading Effect",
					options: TITLE_EFFECT_OPTIONS,
					defaultValue: "none",
					admin: {
						description: "Animation effect applied to the hero heading.",
					},
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
					required: true,
					defaultValue: "Hari Houdini — Creative Technologist",
				},
				{
					name: "metaDescription",
					type: "textarea",
					required: true,
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
