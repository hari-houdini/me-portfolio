/**
 * cms.fixtures.ts
 *
 * Type-safe test fixtures for CMS data shapes.
 *
 * The zocker library can generate values from Zod schemas via:
 *   import { zocker } from 'zocker'
 *   zocker(ProjectSchema).generate()
 *
 * Hand-crafted fixtures are used here for determinism and readability.
 * They match exactly what the Payload Local API returns at depth 2.
 */

import type {
	AboutData,
	ContactData,
	PageData,
	PostData,
	ProjectData,
	SiteConfigData,
	TagData,
} from "../../../features/cms/cms.schema";

export const mockSiteConfig: SiteConfigData = {
	id: 1,
	name: "Hari Houdini",
	tagline: "Creative Technologist",
	subtitle: "Building at the intersection of art and engineering.",
	sectionTitles: {
		hero: "Hello, Universe",
		about: "About",
		work: "Work",
		contact: "Contact",
	},
	seo: {
		metaTitle: "Hari Houdini — Creative Technologist",
		metaDescription:
			"Portfolio of Hari Houdini — immersive 3D experiences built at the intersection of art and engineering.",
		ogImage: null,
	},
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockAbout: AboutData = {
	id: 1,
	bio: {
		root: {
			type: "root",
			children: [
				{
					type: "paragraph",
					version: 1,
					children: [
						{
							type: "text",
							text: "I build immersive digital experiences.",
							version: 1,
						},
					],
				},
			],
			direction: "ltr",
			format: "left",
			indent: 0,
			version: 1,
		},
	},
	skills: [
		{ skill: "TypeScript", id: "1" },
		{ skill: "Three.js", id: "2" },
		{ skill: "React", id: "3" },
	],
	photo: null,
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockContact: ContactData = {
	id: 1,
	email: "hello@harihoudini.dev",
	ctaText: "Let's work together",
	socials: [
		{
			platform: "github",
			url: "https://github.com/hari-houdini",
			label: "GitHub profile",
			id: "1",
		},
		{
			platform: "linkedin",
			url: "https://linkedin.com/in/harihoudini",
			label: "LinkedIn profile",
			id: "2",
		},
	],
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockTag: TagData = {
	id: 1,
	label: "Three.js",
	slug: "three-js",
	description: "3D graphics library for the web",
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockTag2: TagData = {
	id: 2,
	label: "React",
	slug: "react",
	description: null,
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockProject: ProjectData = {
	id: 1,
	title: "Immersive Portfolio",
	description: "A real-time 3D portfolio built with Three.js and React.",
	longDescription: null,
	thumbnail: null,
	tags: [mockTag, mockTag2],
	year: 2026,
	url: "https://harihoudini.dev",
	github: "https://github.com/hari-houdini/me-portfolio",
	featured: true,
	order: 1,
	status: "published",
	updatedAt: "2026-01-01T00:00:00.000Z",
	createdAt: "2026-01-01T00:00:00.000Z",
};

export const mockFeaturedProject: ProjectData = {
	...mockProject,
	id: 2,
	title: "Galaxy Renderer",
	description: "Procedural galaxy built with 150,000 particles in GLSL.",
	featured: true,
	order: 2,
};

/** Minimal Lexical body — a single paragraph with 200 words for reading time tests */
const mockLexicalBody = {
	root: {
		type: "root" as const,
		direction: "ltr" as const,
		format: "left" as const,
		indent: 0,
		version: 1,
		children: [
			{
				type: "paragraph",
				version: 1,
				children: [
					{
						type: "text",
						// 40 words — reading time = 1 min
						text: "Alpha bravo charlie delta echo foxtrot golf hotel india juliet kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu alpha bravo charlie delta echo foxtrot golf hotel india juliet",
						version: 1,
					},
				],
			},
		],
	},
};

export const mockPost: PostData = {
	id: 1,
	title: "Building a Galaxy with Three.js",
	slug: "building-a-galaxy-with-three-js",
	body: mockLexicalBody,
	excerpt:
		"A deep dive into procedural generation with Three.js particle systems.",
	coverImage: null,
	tags: [mockTag],
	publishedAt: "2026-02-01T10:00:00.000Z",
	status: "published",
	metaTitle: null,
	metaDescription: null,
	updatedAt: "2026-02-01T10:00:00.000Z",
	createdAt: "2026-02-01T10:00:00.000Z",
};

export const mockPost2: PostData = {
	id: 2,
	title: "Effect-ts in a Next.js App",
	slug: "effect-ts-next-js",
	body: mockLexicalBody,
	excerpt: "How to use Effect-ts for typed service layers in Next.js.",
	coverImage: null,
	tags: [mockTag2],
	publishedAt: "2026-01-15T09:00:00.000Z",
	status: "published",
	metaTitle: null,
	metaDescription: null,
	updatedAt: "2026-01-15T09:00:00.000Z",
	createdAt: "2026-01-15T09:00:00.000Z",
};

export const mockPageData: PageData = {
	siteConfig: mockSiteConfig,
	about: mockAbout,
	contact: mockContact,
	projects: [mockProject, mockFeaturedProject],
	recentPosts: [mockPost, mockPost2],
};
