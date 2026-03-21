/**
 * cms.fixtures.ts
 *
 * Realistic test fixtures for all CMS resource types.
 *
 * Rules:
 *  - Every optional field is tested in two variants where relevant:
 *    a present value and a null value
 *  - Values are chosen to be representative of real CMS data, not just
 *    placeholder strings, so that assertion messages are meaningful
 *  - Fixtures are typed with the exact interfaces from cms.types.ts —
 *    any schema change will cause a compile error here, surfacing the gap
 */

import type {
	About,
	Contact,
	PageData,
	Project,
	SiteConfig,
} from "~/services/cms/mod";

// ---------------------------------------------------------------------------
// SiteConfig
// ---------------------------------------------------------------------------

export const mockSiteConfig: SiteConfig = {
	name: "Hari Houdini",
	tagline: "Creative Technologist",
	subtitle: "Building at the intersection of art and engineering",
	sectionTitles: {
		hero: "Hello, Universe",
		about: "About",
		work: "Work",
		contact: "Contact",
	},
	seo: {
		metaTitle: "Hari Houdini — Creative Technologist",
		metaDescription:
			"Portfolio of Hari Houdini — immersive 3D experiences built with React Three Fiber.",
		ogImage: {
			url: "https://cms.harihoudini.dev/media/og.png",
			width: 1200,
			height: 630,
			alt: "Hari Houdini portfolio — galaxy hero image",
			sizes: {
				thumbnail: null,
				og: {
					url: "https://cms.harihoudini.dev/media/og-1200.png",
					width: 1200,
					height: 630,
				},
			},
		},
	},
};

export const mockSiteConfigMinimal: SiteConfig = {
	name: "Hari Houdini",
	tagline: "Creative Technologist",
	subtitle: null,
	sectionTitles: {
		hero: "Hello, Universe",
		about: "About",
		work: "Work",
		contact: "Contact",
	},
	seo: {
		metaTitle: "Hari Houdini",
		metaDescription: "",
		ogImage: null,
	},
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

export const mockAbout: About = {
	bio: {
		root: {
			type: "root",
			children: [
				{
					type: "paragraph",
					children: [{ text: "I build immersive digital experiences." }],
				},
			],
		},
	},
	skills: ["React", "Three.js", "TypeScript", "Node.js", "GLSL"],
	photo: {
		url: "https://cms.harihoudini.dev/media/portrait.jpg",
		width: 800,
		height: 800,
		alt: "Hari Houdini",
		sizes: {
			thumbnail: {
				url: "https://cms.harihoudini.dev/media/portrait-400.jpg",
				width: 400,
				height: 400,
			},
			og: null,
		},
	},
};

export const mockAboutMinimal: About = {
	bio: null,
	skills: [],
	photo: null,
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const mockContact: Contact = {
	email: "hello@harihoudini.dev",
	ctaText: "Let's work together",
	socials: [
		{
			platform: "github",
			url: "https://github.com/hari-houdini",
			label: "GitHub",
		},
		{
			platform: "twitter",
			url: "https://twitter.com/hari_houdini",
			label: "Twitter",
		},
	],
};

export const mockContactMinimal: Contact = {
	email: "hello@harihoudini.dev",
	ctaText: "Get in touch",
	socials: [],
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const mockProjectFeatured: Project = {
	id: "proj-001",
	title: "Galaxy Portfolio",
	description:
		"An immersive 3D portfolio built with React Three Fiber and custom GLSL shaders.",
	longDescription: null,
	thumbnail: {
		url: "https://cms.harihoudini.dev/media/galaxy-thumb.jpg",
		width: 800,
		height: 600,
		alt: "Galaxy portfolio screenshot",
		sizes: {
			thumbnail: {
				url: "https://cms.harihoudini.dev/media/galaxy-thumb-400.jpg",
				width: 400,
				height: 300,
			},
			og: null,
		},
	},
	tags: ["React", "Three.js", "GLSL", "TypeScript"],
	url: "https://harihoudini.dev",
	github: "https://github.com/hari-houdini/me-portfolio",
	featured: true,
	year: 2026,
	status: "published",
	order: 1,
};

export const mockProjectRegular: Project = {
	id: "proj-002",
	title: "Starboi",
	description: "Generative art experiment using procedural geometry.",
	longDescription: null,
	thumbnail: null,
	tags: ["Three.js", "GLSL"],
	url: null,
	github: "https://github.com/hari-houdini/starboi",
	featured: false,
	year: 2025,
	status: "published",
	order: 2,
};

export const mockProjects: ReadonlyArray<Project> = [
	mockProjectFeatured,
	mockProjectRegular,
];

// ---------------------------------------------------------------------------
// Aggregated page data
// ---------------------------------------------------------------------------

export const mockPageData: PageData = {
	siteConfig: mockSiteConfig,
	about: mockAbout,
	contact: mockContact,
	projects: mockProjects,
};
