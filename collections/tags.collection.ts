/**
 * tags.collection.ts
 *
 * Shared tag taxonomy used by both Posts and Projects collections.
 *
 * Tags are defined once here and referenced via `relationship` fields on other
 * collections. This ensures consistent spelling (e.g. "React" not "react" or
 * "ReactJS") and enables tag archive pages at /blog/tag/[slug].
 *
 * Slug is auto-generated from the label if not provided (beforeValidate hook).
 *
 * Access:
 *  - read:   public
 *  - write:  admin only
 */

import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const Tags: CollectionConfig = {
	slug: "tags",
	labels: { singular: "Tag", plural: "Tags" },
	admin: {
		useAsTitle: "label",
		defaultColumns: ["label", "slug", "description"],
		description: "Shared taxonomy for blog posts and projects.",
	},
	access: {
		read: () => true,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		{
			name: "label",
			type: "text",
			required: true,
			admin: {
				description:
					'Display name shown on cards and filter chips. e.g. "React"',
			},
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			admin: {
				description:
					"URL-safe identifier used in /blog/tag/[slug]. Auto-generated from label if left empty.",
			},
		},
		{
			name: "description",
			type: "textarea",
			admin: {
				description: "Optional description shown on the tag archive page.",
			},
		},
	],
	hooks: {
		beforeValidate: [
			({ data }) => {
				if (data && !data.slug && data.label) {
					data.slug = (data.label as string)
						.toLowerCase()
						.trim()
						.replace(/[^a-z0-9]+/g, "-")
						.replace(/^-+|-+$/g, "");
				}
				return data;
			},
		],
	},
};
