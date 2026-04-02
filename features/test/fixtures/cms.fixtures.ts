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
	ProjectData,
	SiteConfigData,
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

export const mockProject: ProjectData = {
	id: 1,
	title: "Immersive Portfolio",
	description: "A real-time 3D portfolio built with Three.js and React.",
	longDescription: null,
	thumbnail: null,
	tags: [
		{ tag: "Three.js", id: "1" },
		{ tag: "React", id: "2" },
		{ tag: "TypeScript", id: "3" },
	],
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

export const mockPageData: PageData = {
	siteConfig: mockSiteConfig,
	about: mockAbout,
	contact: mockContact,
	projects: [mockProject, mockFeaturedProject],
};
