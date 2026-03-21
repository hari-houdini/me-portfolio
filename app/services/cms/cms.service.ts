/**
 * cms.service.ts
 *
 * Effect-ts service for the Payload CMS.
 *
 * Architecture:
 *  - CmsService is an Effect Context.Tag — the abstract service interface
 *  - CmsServiceLive is a Layer — the concrete implementation
 *  - The Layer reads PAYLOAD_API_URL from the environment at construction time
 *    and closes over it in each method
 *  - getAllPageData runs all four fetches concurrently with Effect.all
 *
 * Consumers:
 *  - Route loaders access this service by yielding* CmsService inside
 *    Effect.gen, after providing AppLayer from runtime.ts
 *  - Tests provide a mock Layer in place of CmsServiceLive
 *
 * SOLID note:
 *  - OCP: new CMS resources are added by extending the interface and adding
 *    a method — existing methods remain untouched
 *  - DIP: loaders depend on the Context.Tag (abstract), not the live Layer
 */

import { Context, Effect, Layer } from "effect";
import type { CmsError } from "./cms.errors";
import * as Repo from "./cms.repository";
import type {
	About,
	Contact,
	PageData,
	Project,
	SiteConfig,
} from "./cms.types";

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface CmsService {
	/** Fetches the site-config global (name, tagline, SEO). */
	readonly getSiteConfig: () => Effect.Effect<SiteConfig, CmsError>;

	/** Fetches the about global (bio, skills, photo). */
	readonly getAbout: () => Effect.Effect<About, CmsError>;

	/** Fetches the contact global (email, CTA, socials). */
	readonly getContact: () => Effect.Effect<Contact, CmsError>;

	/** Fetches all published projects sorted by the `order` field. */
	readonly getProjects: () => Effect.Effect<ReadonlyArray<Project>, CmsError>;

	/**
	 * Fetches all four resources concurrently in a single Effect.
	 * Used by the home route loader to minimise round-trip latency.
	 * Fails with the first error encountered if any fetch fails.
	 */
	readonly getAllPageData: () => Effect.Effect<PageData, CmsError>;
}

// ---------------------------------------------------------------------------
// Context tag — the abstract DI handle used by consumers
// ---------------------------------------------------------------------------

export const CmsService = Context.GenericTag<CmsService>(
	"@services/CmsService",
);

// ---------------------------------------------------------------------------
// Live implementation Layer
// ---------------------------------------------------------------------------

export const CmsServiceLive = Layer.sync(CmsService, () => {
	// Read the base URL once at layer construction. Falls back to the local
	// Payload dev server when the env var is not set (local development).
	// biome-ignore lint/complexity/useLiteralKeys: env var name contains uppercase — bracket access is required for clarity
	const baseUrl = process.env["PAYLOAD_API_URL"] ?? "http://localhost:3001";

	return {
		getSiteConfig: () => Repo.fetchSiteConfig(baseUrl),
		getAbout: () => Repo.fetchAbout(baseUrl),
		getContact: () => Repo.fetchContact(baseUrl),
		getProjects: () => Repo.fetchProjects(baseUrl),

		getAllPageData: () =>
			Effect.all(
				{
					siteConfig: Repo.fetchSiteConfig(baseUrl),
					about: Repo.fetchAbout(baseUrl),
					contact: Repo.fetchContact(baseUrl),
					projects: Repo.fetchProjects(baseUrl),
				},
				// Run all four fetches in parallel — no sequential dependency between them.
				{ concurrency: "unbounded" },
			),
	};
});
