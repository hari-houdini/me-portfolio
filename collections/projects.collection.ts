/**
 * projects.collection.ts
 *
 * Portfolio projects collection.
 *
 * PRD-001 §4.5 schema: title, description, thumbnail, tags, url, github,
 * featured, year, status (draft|published), order.
 *
 * Note on tags field:
 *   Payload's array field wraps each item in an object: [{id, tag: "React"}].
 *   The Zod schema in features/cms/cms.schema.ts handles this via a union
 *   transform that accepts both formats.
 *
 * Access:
 *  - read:   public (portfolio fetches published projects via Local API)
 *  - write:  admin only
 */

import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const Projects: CollectionConfig = {
	slug: "projects",
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "year", "status", "featured", "order"],
		description: "Portfolio projects shown in the work section.",
	},
	access: {
		read: () => true,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		// ---- Core -------------------------------------------------------
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "description",
			type: "textarea",
			required: true,
			admin: {
				description: "Short summary shown in the project card.",
			},
		},
		{
			name: "longDescription",
			type: "richText",
			label: "Long Description",
			admin: {
				description: "Full write-up. Supports rich text formatting.",
			},
		},
		// ---- Media ------------------------------------------------------
		{
			name: "thumbnail",
			type: "upload",
			relationTo: "media",
			label: "Thumbnail",
			admin: {
				description: "Displayed in the project card. Recommended: 800×600.",
			},
		},
		// ---- Classification ---------------------------------------------
		{
			name: "tags",
			type: "array",
			label: "Technology Tags",
			admin: {
				description: 'e.g. "React", "Three.js", "TypeScript"',
			},
			fields: [
				{
					name: "tag",
					type: "text",
					required: true,
				},
			],
		},
		{
			name: "year",
			type: "number",
			admin: {
				description: "Year the project was completed.",
			},
		},
		// ---- Links ------------------------------------------------------
		{
			name: "url",
			type: "text",
			label: "Live URL",
			admin: {
				description: "Link to the deployed project.",
			},
		},
		{
			name: "github",
			type: "text",
			label: "GitHub URL",
			admin: {
				description: "Link to the GitHub repository.",
			},
		},
		// ---- Display ----------------------------------------------------
		{
			name: "featured",
			type: "checkbox",
			label: "Featured",
			defaultValue: false,
			admin: {
				description:
					"Featured projects are pinned to the top of the work section.",
			},
		},
		{
			name: "order",
			type: "number",
			admin: {
				description: "Manual display order. Lower numbers appear first.",
			},
		},
		// ---- Status -----------------------------------------------------
		{
			name: "status",
			type: "select",
			required: true,
			defaultValue: "draft",
			options: [
				{ label: "Draft", value: "draft" },
				{ label: "Published", value: "published" },
			],
			admin: {
				description: "Only published projects are shown on the portfolio.",
				position: "sidebar",
			},
		},
	],
};
