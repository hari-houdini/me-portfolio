/**
 * cms.repository.ts
 *
 * Raw HTTP access layer for the Payload CMS REST API.
 *
 * Responsibility:
 *  - Build the correct endpoint URL for each resource
 *  - Execute the fetch request
 *  - Map HTTP status codes and network failures to typed CmsError variants
 *  - Return the raw parsed JSON as the typed resource shape
 *
 * This module does NOT:
 *  - Compose multiple fetches
 *  - Apply business logic
 *  - Cache results
 *
 * Consumers: cms.service.ts only. Nothing outside this pod should import
 * repository functions directly.
 */

import { Effect } from "effect";
import type { CmsError } from "./cms.errors";
import { CmsNetworkError, CmsNotFoundError, CmsParseError } from "./cms.errors";
import type {
	About,
	Contact,
	ProjectsListResponse,
	SiteConfig,
} from "./cms.types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Executes a fetch request against the given URL and parses the JSON body.
 *
 * Error mapping:
 *  - 404 → CmsNotFoundError
 *  - Any other non-ok status → CmsNetworkError
 *  - Network/DNS failure → CmsNetworkError
 *  - JSON parse failure → CmsParseError
 */
const fetchJson = <T>(url: string): Effect.Effect<T, CmsError> =>
	Effect.tryPromise({
		try: async () => {
			let response: Response;

			try {
				response = await fetch(url);
			} catch (networkCause) {
				throw new CmsNetworkError({ url, cause: networkCause });
			}

			if (response.status === 404) {
				throw new CmsNotFoundError({ url, status: 404 });
			}

			if (!response.ok) {
				throw new CmsNetworkError({
					url,
					cause: `HTTP ${response.status} ${response.statusText}`,
				});
			}

			let body: unknown;
			try {
				body = await response.json();
			} catch (parseCause) {
				throw new CmsParseError({ url, cause: parseCause });
			}

			return body as T;
		},
		catch: (thrown) => {
			// If we already constructed a typed error inside try, pass it through.
			if (
				thrown instanceof CmsNotFoundError ||
				thrown instanceof CmsNetworkError ||
				thrown instanceof CmsParseError
			) {
				return thrown;
			}
			// Unknown thrown value — defensive fallback, not reachable
			// through documented code paths (all errors are typed above).
			return new CmsNetworkError({ url, cause: thrown });
		},
	});

// ---------------------------------------------------------------------------
// Repository functions — one per CMS resource
// ---------------------------------------------------------------------------

/**
 * Fetches the site-config global.
 * Endpoint: GET /api/globals/site-config
 */
export const fetchSiteConfig = (
	baseUrl: string,
): Effect.Effect<SiteConfig, CmsError> =>
	fetchJson<SiteConfig>(`${baseUrl}/api/globals/site-config`);

/**
 * Fetches the about global.
 * Endpoint: GET /api/globals/about
 */
export const fetchAbout = (baseUrl: string): Effect.Effect<About, CmsError> =>
	fetchJson<About>(`${baseUrl}/api/globals/about`);

/**
 * Fetches the contact global.
 * Endpoint: GET /api/globals/contact
 */
export const fetchContact = (
	baseUrl: string,
): Effect.Effect<Contact, CmsError> =>
	fetchJson<Contact>(`${baseUrl}/api/globals/contact`);

/**
 * Fetches all published projects, sorted by the manual `order` field.
 * Endpoint: GET /api/projects?where[status][equals]=published&sort=order&limit=100
 *
 * Extracts the `docs` array from the Payload paginated list response.
 */
export const fetchProjects = (
	baseUrl: string,
): Effect.Effect<ProjectsListResponse["docs"], CmsError> => {
	const params = new URLSearchParams({
		"where[status][equals]": "published",
		sort: "order",
		limit: "100",
	});

	return fetchJson<ProjectsListResponse>(
		`${baseUrl}/api/projects?${params.toString()}`,
	).pipe(Effect.map((response) => response.docs));
};
