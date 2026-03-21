/**
 * cms.schemas.ts
 *
 * Zod v4 schemas for every Payload CMS REST API response shape.
 *
 * Design decisions:
 *  - Schemas are the single source of truth. TypeScript types are derived
 *    from schemas via z.infer<> — never written by hand.
 *  - URL fields use z.string() (not z.url()) because Payload can return
 *    relative paths for locally-hosted media.
 *  - Rich-text body fields (bio, longDescription) use z.unknown() because
 *    their Lexical editor AST shape is consumed by the renderer in Phase 3,
 *    not by this service layer.
 *  - Nullable fields match the Payload REST API contract from PRD-001 §4.6.
 *
 * Payload array-of-objects format:
 *  Payload's `array` field type wraps each item in an object with an auto-
 *  generated `id`. For example, tags come back as [{id:"abc", tag:"React"}].
 *  We use a union schema that accepts BOTH the raw Payload format AND a plain
 *  string (used in test fixtures), then transform to string[]. This means:
 *   - Real Payload API responses validate correctly
 *   - Test fixtures can use the simpler string[] format
 *   - z.infer<> gives string[] (the normalised domain type)
 *
 * Barrel exports: all schemas and inferred types are re-exported from mod.ts.
 * Consumers outside this pod import from mod.ts only.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Internal helpers for Payload's array-of-objects fields
// ---------------------------------------------------------------------------

/**
 * Accepts either a plain string or a Payload array-item object { id?, [field] }.
 * Transforms to string[]. Works with both real API responses and test fixtures.
 */
const payloadTagArray = (fieldName: string) =>
	z
		.array(
			z.union([
				z.string(),
				z.object({ id: z.string().optional(), [fieldName]: z.string() }),
			]),
		)
		.transform((arr) =>
			arr.map((item) =>
				typeof item === "string"
					? item
					: ((item as Record<string, string>)[fieldName] ?? ""),
			),
		);

// ---------------------------------------------------------------------------
// Shared sub-schemas
// ---------------------------------------------------------------------------

export const MediaSizeSchema = z.object({
	url: z.string(),
	width: z.number(),
	height: z.number(),
});

export const MediaObjectSchema = z.object({
	url: z.string(),
	width: z.number(),
	height: z.number(),
	alt: z.string().nullable(),
	sizes: z.object({
		thumbnail: MediaSizeSchema.nullable(),
		og: MediaSizeSchema.nullable(),
	}),
});

/**
 * SocialLinkSchema
 *
 * Payload's `array` field adds an `id` to each social link item.
 * `id` is optional so the schema also accepts fixtures without it.
 */
export const SocialLinkSchema = z.object({
	id: z.string().optional(),
	platform: z.string(),
	url: z.string(),
	label: z.string(),
});

// ---------------------------------------------------------------------------
// CMS global schemas
// ---------------------------------------------------------------------------

export const SiteConfigSchema = z.object({
	name: z.string(),
	tagline: z.string(),
	subtitle: z.string().nullable(),
	sectionTitles: z.object({
		hero: z.string(),
		about: z.string(),
		work: z.string(),
		contact: z.string(),
	}),
	seo: z.object({
		metaTitle: z.string(),
		metaDescription: z.string(),
		ogImage: MediaObjectSchema.nullable(),
	}),
});

export const AboutSchema = z.object({
	/** Lexical rich-text document — shape consumed by the renderer in Phase 3. */
	bio: z.unknown(),
	/**
	 * Payload returns [{id, skill: "React"}]. The union transform normalises
	 * this to string[] while also accepting plain strings from test fixtures.
	 */
	skills: payloadTagArray("skill"),
	photo: MediaObjectSchema.nullable(),
});

export const ContactSchema = z.object({
	email: z.string(),
	ctaText: z.string(),
	socials: z.array(SocialLinkSchema),
});

// ---------------------------------------------------------------------------
// Projects collection schemas
// ---------------------------------------------------------------------------

export const ProjectSchema = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	/** Lexical rich-text document — shape consumed by the renderer in Phase 3. */
	longDescription: z.unknown(),
	thumbnail: MediaObjectSchema.nullable(),
	/**
	 * Payload returns [{id, tag: "React"}]. The union transform normalises
	 * this to string[] while also accepting plain strings from test fixtures.
	 */
	tags: payloadTagArray("tag"),
	url: z.string().nullable(),
	github: z.string().nullable(),
	featured: z.boolean(),
	year: z.number().nullable(),
	status: z.enum(["draft", "published"]),
	order: z.number().nullable(),
});

export const ProjectsListResponseSchema = z.object({
	docs: z.array(ProjectSchema),
	totalDocs: z.number(),
});

// ---------------------------------------------------------------------------
// Aggregated page data — shape returned by getAllPageData
// ---------------------------------------------------------------------------

export const PageDataSchema = z.object({
	siteConfig: SiteConfigSchema,
	about: AboutSchema,
	contact: ContactSchema,
	projects: z.array(ProjectSchema),
});

// ---------------------------------------------------------------------------
// Inferred TypeScript types — derived from schemas, never written by hand
// ---------------------------------------------------------------------------

export type MediaSize = z.infer<typeof MediaSizeSchema>;
export type MediaObject = z.infer<typeof MediaObjectSchema>;
export type SocialLink = z.infer<typeof SocialLinkSchema>;
export type SiteConfig = z.infer<typeof SiteConfigSchema>;
export type About = z.infer<typeof AboutSchema>;
export type Contact = z.infer<typeof ContactSchema>;
export type Project = z.infer<typeof ProjectSchema>;
export type ProjectsListResponse = z.infer<typeof ProjectsListResponseSchema>;
export type PageData = z.infer<typeof PageDataSchema>;
