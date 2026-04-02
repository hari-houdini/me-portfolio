/**
 * cms.schema.ts
 *
 * Zod v4 schemas for CMS data consumed by the portfolio.
 *
 * Design rules:
 *  - Schemas model what the Payload Local API actually returns (depth: 2 default).
 *  - Payload's array-of-objects format ({ tag, id }, { skill, id }) is preserved.
 *  - Type assertions verify structural alignment with payload-types.ts.
 *    Never edit payload-types.ts — re-run `pnpm payload:generate-types` instead.
 *  - `z.infer<typeof Schema>` is the only source of truth for app-layer types.
 */

import { z } from "zod";
import type { About, Contact, Project, SiteConfig } from "../../payload-types";

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
	updatedAt: z.string().nullable().optional(),
	createdAt: z.string().nullable().optional(),
});

export type SiteConfigData = z.infer<typeof SiteConfigSchema>;

// Verify structural alignment with generated Payload types.
// If this line errors, payload-types.ts and this schema have diverged.
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
	tags: z
		.array(
			z.object({
				tag: z.string(),
				id: z.string().nullable().optional(),
			}),
		)
		.nullable()
		.optional(),
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

type _AssertProject =
	z.infer<typeof ProjectSchema> extends Project ? true : never;

// ---------------------------------------------------------------------------
// PageData — the combined result fetched for the portfolio home page
// ---------------------------------------------------------------------------

export const PageDataSchema = z.object({
	siteConfig: SiteConfigSchema,
	about: AboutSchema,
	contact: ContactSchema,
	projects: z.array(ProjectSchema),
});

export type PageData = z.infer<typeof PageDataSchema>;

// Suppress "unused type" TS errors for assertion types (they ARE used — for compile-time safety).
export type _Assertions =
	| _AssertSiteConfig
	| _AssertAbout
	| _AssertContact
	| _AssertProject;
