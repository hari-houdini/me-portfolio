/**
 * cms.types.ts
 *
 * TypeScript types that mirror the Payload CMS REST API response shapes.
 *
 * These types represent the external API contract defined in PRD-001 §4.6.
 * They are kept intentionally flat and close to the wire format so that
 * changes to the Payload schema are easy to track and update here.
 *
 * Rich-text documents (Lexical editor output) are typed as `unknown` because
 * their exact structure is consumed by a renderer component, not by the
 * service layer. A stricter schema can be added when the renderer is built.
 */

/** A single resolved media size variant. */
export interface MediaSize {
	readonly url: string;
	readonly width: number;
	readonly height: number;
}

/** A media object as returned by Payload's upload collection. */
export interface MediaObject {
	readonly url: string;
	readonly width: number;
	readonly height: number;
	readonly alt: string | null;
	readonly sizes: {
		readonly thumbnail: MediaSize | null;
		readonly og: MediaSize | null;
	};
}

/** Social platform link entry used in the Contact global. */
export interface SocialLink {
	readonly platform: string;
	readonly url: string;
	readonly label: string;
}

/** site-config global — controls all heading copy and SEO metadata. */
export interface SiteConfig {
	readonly name: string;
	readonly tagline: string;
	readonly subtitle: string | null;
	readonly sectionTitles: {
		readonly hero: string;
		readonly about: string;
		readonly work: string;
		readonly contact: string;
	};
	readonly seo: {
		readonly metaTitle: string;
		readonly metaDescription: string;
		readonly ogImage: MediaObject | null;
	};
}

/** about global — bio rich-text, skill tags, optional portrait. */
export interface About {
	/** Lexical rich-text document — consumed by the renderer in Phase 3. */
	readonly bio: unknown;
	readonly skills: ReadonlyArray<string>;
	readonly photo: MediaObject | null;
}

/** contact global — email, CTA label, social links array. */
export interface Contact {
	readonly email: string;
	readonly ctaText: string;
	readonly socials: ReadonlyArray<SocialLink>;
}

/** A single project entry from the projects collection. */
export interface Project {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	/** Lexical rich-text document — consumed by the renderer in Phase 3. */
	readonly longDescription: unknown | null;
	readonly thumbnail: MediaObject | null;
	readonly tags: ReadonlyArray<string>;
	readonly url: string | null;
	readonly github: string | null;
	readonly featured: boolean;
	readonly year: number | null;
	readonly status: "draft" | "published";
	readonly order: number | null;
}

/** Shape of the Payload paginated list response for the projects collection. */
export interface ProjectsListResponse {
	readonly docs: ReadonlyArray<Project>;
	readonly totalDocs: number;
}

/**
 * The aggregated data shape returned by getAllPageData.
 * This is the entire payload for the home route SSR loader.
 */
export interface PageData {
	readonly siteConfig: SiteConfig;
	readonly about: About;
	readonly contact: Contact;
	readonly projects: ReadonlyArray<Project>;
}
