/**
 * cms.fixtures.ts
 *
 * Test fixtures generated from Zod schemas via zocker.
 *
 * Why zocker instead of hand-written objects:
 *  - Fixtures stay automatically in sync with schema changes.
 *    A schema field addition/rename immediately causes a TypeScript error here,
 *    surfacing the gap before any test runs.
 *  - No maintenance overhead for keeping mock values plausible.
 *  - zocker's setSeed() guarantees determinism: same seed = same data on
 *    every run, on every machine, in CI.
 *
 * Override strategy:
 *  Fields that tests explicitly assert on (e.g. project order for sorting)
 *  are spread-overridden after generation. Zocker generates valid base data;
 *  overrides apply the specific values the test needs.
 */

import { zocker } from "zocker";
import {
	AboutSchema,
	ContactSchema,
	PageDataSchema,
	ProjectSchema,
	SiteConfigSchema,
} from "~/services/cms/cms.schemas";
import type {
	About,
	Contact,
	PageData,
	Project,
	SiteConfig,
} from "~/services/cms/mod";

// A single seed for the entire fixture set — guarantees cross-fixture
// consistency. Increment if a schema change causes an undesirable value.
const SEED = 42;

// ---------------------------------------------------------------------------
// SiteConfig
// ---------------------------------------------------------------------------

export const mockSiteConfig: SiteConfig = zocker(SiteConfigSchema)
	.setSeed(SEED)
	.generate();

// A minimal variant used in tests that exercise nullable field fallbacks.
export const mockSiteConfigMinimal: SiteConfig = {
	...zocker(SiteConfigSchema)
		.setSeed(SEED + 1)
		.generate(),
	subtitle: null,
	seo: {
		...zocker(SiteConfigSchema)
			.setSeed(SEED + 1)
			.generate().seo,
		ogImage: null,
	},
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------

// bio is typed as z.unknown() in the schema (Lexical rich-text document shape).
// Zocker may generate non-JSON-serializable values for `unknown` fields.
// Override with a minimal Lexical document that survives HTTP round-trips.
const MOCK_LEXICAL_DOC = {
	root: {
		type: "root",
		version: 1,
		children: [],
		direction: null,
		format: "",
		indent: 0,
	},
};

export const mockAbout: About = {
	...zocker(AboutSchema).setSeed(SEED).generate(),
	bio: MOCK_LEXICAL_DOC,
};

export const mockAboutMinimal: About = {
	...zocker(AboutSchema)
		.setSeed(SEED + 1)
		.generate(),
	bio: null,
	skills: [],
	photo: null,
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const mockContact: Contact = zocker(ContactSchema)
	.setSeed(SEED)
	.generate();

export const mockContactMinimal: Contact = {
	...zocker(ContactSchema)
		.setSeed(SEED + 1)
		.generate(),
	socials: [],
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const mockProjectFeatured: Project = {
	...zocker(ProjectSchema).setSeed(SEED).generate(),
	// longDescription is typed z.unknown() — zocker may generate non-JSON-
	// serializable values. Null is the correct representation for a project
	// that has no long description yet.
	longDescription: null,
	status: "published",
	featured: true,
	order: 1,
};

export const mockProjectRegular: Project = {
	...zocker(ProjectSchema)
		.setSeed(SEED + 1)
		.generate(),
	longDescription: null,
	status: "published",
	featured: false,
	order: 2,
};

export const mockProjects: Project[] = [
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

// Confirm the aggregated shape is schema-valid at module load time.
// If this throws, a schema/fixture mismatch exists and tests will fail fast.
PageDataSchema.parse(mockPageData);
