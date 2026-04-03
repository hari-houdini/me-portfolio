/**
 * posts.collection.ts
 *
 * Blog posts collection for harihoudini.dev.
 *
 * Fields: title, slug (auto-generated), body (Lexical rich text), excerpt,
 * coverImage (→ Media), tags (hasMany → Tags), publishedAt, status, metaTitle,
 * metaDescription.
 *
 * Slug is auto-generated from the title if not provided (beforeValidate hook).
 * publishedAt is auto-set to the current timestamp when status first changes to
 * "published" (beforeValidate hook).
 *
 * Access:
 *  - read:   public (filter to status=published at query level in the repository)
 *  - write:  admin only
 */

import type { CollectionConfig } from "payload";
import { isAdmin } from "../access/is-admin.access";

export const Posts: CollectionConfig = {
	slug: "posts",
	labels: { singular: "Post", plural: "Posts" },
	admin: {
		useAsTitle: "title",
		defaultColumns: ["title", "status", "publishedAt", "tags"],
		description: "Blog posts published on /blog.",
	},
	access: {
		// Public read — repository always filters by status=published for public pages.
		read: () => true,
		create: isAdmin,
		update: isAdmin,
		delete: isAdmin,
	},
	fields: [
		// ---- Core -----------------------------------------------------------
		{
			name: "title",
			type: "text",
			required: true,
		},
		{
			name: "slug",
			type: "text",
			required: true,
			unique: true,
			admin: {
				description:
					"URL path segment: /blog/[slug]. Auto-generated from title if left empty.",
			},
		},
		{
			name: "body",
			type: "richText",
			required: true,
			label: "Body",
			admin: {
				description:
					"Full post content. Supports headings, code blocks, links, and images.",
			},
		},
		{
			name: "excerpt",
			type: "textarea",
			admin: {
				description:
					"Short description shown on list cards and used as fallback meta description. If omitted, the first paragraph is used.",
			},
		},
		// ---- Media ----------------------------------------------------------
		{
			name: "coverImage",
			type: "upload",
			relationTo: "media",
			label: "Cover Image",
			admin: {
				description:
					"Used as the Open Graph image for social sharing. Recommended: 1200×630.",
			},
		},
		// ---- Classification -------------------------------------------------
		{
			name: "tags",
			type: "relationship",
			relationTo: "tags",
			hasMany: true,
			label: "Tags",
			admin: {
				description: "Select tags from the shared tag taxonomy.",
			},
		},
		// ---- Publishing -----------------------------------------------------
		{
			name: "publishedAt",
			type: "date",
			label: "Published At",
			admin: {
				date: { pickerAppearance: "dayAndTime" },
				description:
					"Auto-set when status changes to Published. Override manually if needed.",
				position: "sidebar",
			},
		},
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
				description: "Only published posts are shown on /blog.",
				position: "sidebar",
			},
		},
		// ---- Reading experience --------------------------------------------
		{
			name: "tracingBeam",
			type: "checkbox",
			label: "Tracing Beam",
			defaultValue: true,
			admin: {
				description:
					"Show a tracing beam on the left edge of this post as the reader scrolls. Disable for very short posts.",
				position: "sidebar",
			},
		},
		// ---- SEO (optional — fall back to title + excerpt) ------------------
		{
			name: "metaTitle",
			type: "text",
			label: "Meta Title",
			admin: {
				description:
					"SEO <title> override. Defaults to the post title if left empty.",
				position: "sidebar",
			},
		},
		{
			name: "metaDescription",
			type: "textarea",
			label: "Meta Description",
			admin: {
				description:
					"SEO meta description override. Defaults to the excerpt if left empty.",
				position: "sidebar",
			},
		},
	],
	hooks: {
		beforeValidate: [
			({ data }) => {
				// Auto-generate slug from title
				if (data && !data.slug && data.title) {
					data.slug = (data.title as string)
						.toLowerCase()
						.trim()
						.replace(/[^a-z0-9]+/g, "-")
						.replace(/^-+|-+$/g, "");
				}
				// Auto-set publishedAt when status changes to published
				if (data && data.status === "published" && !data.publishedAt) {
					data.publishedAt = new Date().toISOString();
				}
				return data;
			},
		],
	},
};
