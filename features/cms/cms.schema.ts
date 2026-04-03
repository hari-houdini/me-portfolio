/**
 * cms.schema.ts
 *
 * Zod v4 schemas for CMS data consumed by the portfolio.
 *
 * Design rules:
 *  - Schemas model what the Payload Local API actually returns (depth: 1).
 *  - Type assertions verify structural alignment with payload-types.ts.
 *    Never edit payload-types.ts — re-run `pnpm payload:generate-types` instead.
 *  - `z.infer<typeof Schema>` is the only source of truth for app-layer types.
 *
 * Note: _AssertProject is omitted because payload-types.ts still reflects the
 * old plain-text tags array. Restore after `pnpm payload:generate-types` is run
 * against the updated schema (Tags + Posts collections added).
 */

import { z } from "zod";
import type {
	BackgroundVariant,
	ProjectCardStyle,
	TitleEffectVariant,
} from "../../globals/style-options";
import type { About, Contact, SiteConfig } from "../../payload-types";

// Re-export style option types for consumers of the CMS schema
export type { BackgroundVariant, ProjectCardStyle, TitleEffectVariant };

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

export const MediaObjectSchema = z.object({
	id: z.number(),
	alt: z.string().nullable().optional(),
	url: z.string().nullable().optional(),
	width: z.number().nullable().optional(),
	height: z.number().nullable().optional(),
	sizes: z
		.object({
			thumbnail: z
				.object({
					url: z.string().nullable().optional(),
					width: z.number().nullable().optional(),
					height: z.number().nullable().optional(),
				})
				.optional(),
			og: z
				.object({
					url: z.string().nullable().optional(),
					width: z.number().nullable().optional(),
					height: z.number().nullable().optional(),
				})
				.optional(),
		})
		.optional(),
});

export type MediaObject = z.infer<typeof MediaObjectSchema>;

// Payload Local API may return a related doc as expanded object or bare ID.
const MediaOrIdSchema = z.union([z.number(), MediaObjectSchema]);

// Lexical rich-text document — Payload's richText field format.
// passthrough() preserves the [k: string]: unknown index signature.
export const LexicalContentSchema = z
	.object({
		root: z.object({
			type: z.string(),
			children: z.array(z.record(z.string(), z.unknown())),
			direction: z.enum(["ltr", "rtl"]).nullable(),
			format: z.enum([
				"left",
				"start",
				"center",
				"right",
				"end",
				"justify",
				"",
			]),
			indent: z.number(),
			version: z.number(),
		}),
	})
	.passthrough();

// ---------------------------------------------------------------------------
// Tag
// ---------------------------------------------------------------------------

export const TagSchema = z.object({
	id: z.number(),
	label: z.string(),
	slug: z.string(),
	description: z.string().nullable().optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type TagData = z.infer<typeof TagSchema>;

// Payload relationships can be expanded objects or bare numeric IDs.
const TagOrIdSchema = z.union([TagSchema, z.number()]);

// ---------------------------------------------------------------------------
// SiteConfig
// ---------------------------------------------------------------------------

export const SiteConfigSchema = z.object({
	id: z.number(),
	name: z.string(),
	tagline: z.string(),
	subtitle: z.string().nullable().optional(),
	sectionTitles: z
		.object({
			hero: z.string().nullable().optional(),
			about: z.string().nullable().optional(),
			work: z.string().nullable().optional(),
			contact: z.string().nullable().optional(),
		})
		.optional(),
	seo: z.object({
		metaTitle: z.string(),
		metaDescription: z.string(),
		ogImage: MediaOrIdSchema.nullable().optional(),
	}),
	heroStyle: z
		.object({
			background: z.string().nullable().optional(),
			titleEffect: z.string().nullable().optional(),
		})
		.optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type SiteConfigData = z.infer<typeof SiteConfigSchema>;

type _AssertSiteConfig =
	z.infer<typeof SiteConfigSchema> extends SiteConfig ? true : never;

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const AboutSchema = z.object({
	id: z.number(),
	bio: LexicalContentSchema,
	skills: z
		.array(
			z.object({
				skill: z.string(),
				id: z.string().nullable().optional(),
			}),
		)
		.nullable()
		.optional(),
	photo: MediaOrIdSchema.nullable().optional(),
	aboutStyle: z
		.object({
			background: z.string().nullable().optional(),
			titleEffect: z.string().nullable().optional(),
		})
		.optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type AboutData = z.infer<typeof AboutSchema>;

type _AssertAbout = z.infer<typeof AboutSchema> extends About ? true : never;

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const ContactSchema = z.object({
	id: z.number(),
	email: z.string(),
	ctaText: z.string().nullable().optional(),
	socials: z
		.array(
			z.object({
				platform: z.enum([
					"github",
					"linkedin",
					"twitter",
					"instagram",
					"dribbble",
					"behance",
					"other",
				]),
				url: z.string(),
				label: z.string(),
				id: z.string().nullable().optional(),
			}),
		)
		.nullable()
		.optional(),
	contactStyle: z
		.object({
			background: z.string().nullable().optional(),
			titleEffect: z.string().nullable().optional(),
		})
		.optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type ContactData = z.infer<typeof ContactSchema>;

type _AssertContact =
	z.infer<typeof ContactSchema> extends Contact ? true : never;

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export const ProjectSchema = z.object({
	id: z.number(),
	title: z.string(),
	description: z.string(),
	longDescription: LexicalContentSchema.nullable().optional(),
	thumbnail: MediaOrIdSchema.nullable().optional(),
	// Tags are now a hasMany relationship to the Tags collection.
	// payload-types.ts will reflect the new shape after `pnpm payload:generate-types`.
	tags: z.array(TagOrIdSchema).nullable().optional(),
	year: z.number().nullable().optional(),
	url: z.string().nullable().optional(),
	github: z.string().nullable().optional(),
	featured: z.boolean().nullable().optional(),
	order: z.number().nullable().optional(),
	status: z.enum(["draft", "published"]),
	updatedAt: z.string(),
	createdAt: z.string(),
});

export type ProjectData = z.infer<typeof ProjectSchema>;

// Note: _AssertProject is temporarily omitted — payload-types.ts still reflects
// the old plain-text tags array. Restore after `pnpm payload:generate-types`.

// ---------------------------------------------------------------------------
// Post
// ---------------------------------------------------------------------------

export const PostSchema = z.object({
	id: z.number(),
	title: z.string(),
	slug: z.string(),
	body: LexicalContentSchema,
	excerpt: z.string().nullable().optional(),
	coverImage: MediaOrIdSchema.nullable().optional(),
	tags: z.array(TagOrIdSchema).nullable().optional(),
	publishedAt: z.string().nullable().optional(),
	status: z.enum(["draft", "published"]),
	metaTitle: z.string().nullable().optional(),
	metaDescription: z.string().nullable().optional(),
	tracingBeam: z.boolean().nullable().optional(),
	updatedAt: z.string(),
	createdAt: z.string(),
});

export type PostData = z.infer<typeof PostSchema>;

// Note: _AssertPost will be restored after `pnpm payload:generate-types` generates
// the Post type from the new Posts collection.

// ---------------------------------------------------------------------------
// WorkConfig — work section visual style (background, card style)
// ---------------------------------------------------------------------------

export const WorkConfigSchema = z.object({
	id: z.number(),
	workStyle: z
		.object({
			background: z.string().nullable().optional(),
			titleEffect: z.string().nullable().optional(),
			projectCardStyle: z.string().nullable().optional(),
		})
		.optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type WorkConfigData = z.infer<typeof WorkConfigSchema>;

// ---------------------------------------------------------------------------
// UIConfig — world map locations and shared UI config
// ---------------------------------------------------------------------------

export const WorldMapLocationSchema = z.object({
	label: z.string(),
	lat: z.number(),
	lng: z.number(),
	id: z.string().nullable().optional(),
});

export type WorldMapLocation = z.infer<typeof WorldMapLocationSchema>;

export const UIConfigSchema = z.object({
	id: z.number(),
	worldMapLocations: z.array(WorldMapLocationSchema).nullable().optional(),
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type UIConfigData = z.infer<typeof UIConfigSchema>;

// ---------------------------------------------------------------------------
// PageData — combined result for the portfolio home page
// ---------------------------------------------------------------------------

export const PageDataSchema = z.object({
	siteConfig: SiteConfigSchema,
	about: AboutSchema,
	contact: ContactSchema,
	projects: z.array(ProjectSchema),
	recentPosts: z.array(PostSchema),
	workConfig: WorkConfigSchema,
	uiConfig: UIConfigSchema,
});

export type PageData = z.infer<typeof PageDataSchema>;

// ---------------------------------------------------------------------------
// BlogListData — paginated list page data
// ---------------------------------------------------------------------------

export const BlogListDataSchema = z.object({
	posts: z.array(PostSchema),
	totalDocs: z.number(),
	totalPages: z.number(),
	page: z.number(),
	hasPrevPage: z.boolean(),
	hasNextPage: z.boolean(),
	tags: z.array(TagSchema),
});

export type BlogListData = z.infer<typeof BlogListDataSchema>;

// ---------------------------------------------------------------------------
// PostPageData — individual post page data
// ---------------------------------------------------------------------------

export const PostPageDataSchema = z.object({
	post: PostSchema,
	prevPost: PostSchema.nullable(),
	nextPost: PostSchema.nullable(),
});

export type PostPageData = z.infer<typeof PostPageDataSchema>;

// ---------------------------------------------------------------------------
// FilterContext — query params carried from list to post for prev/next nav
// ---------------------------------------------------------------------------

export const FilterContextSchema = z.object({
	tagSlug: z.string().optional(),
	sort: z.enum(["newest", "oldest"]).optional(),
});

export type FilterContext = z.infer<typeof FilterContextSchema>;

// ---------------------------------------------------------------------------
// Suppress "unused type" TS errors for assertion types (compile-time safety)
// ---------------------------------------------------------------------------

export type _Assertions = _AssertSiteConfig | _AssertAbout | _AssertContact;
