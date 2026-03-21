/**
 * cms.repository.ts
 *
 * Raw HTTP access layer for the Payload CMS REST API.
 *
 * Responsibilities:
 *  - Build the correct endpoint URL for each resource
 *  - Execute the fetch request
 *  - Map HTTP status codes and network failures to typed CmsError variants
 *  - Validate the parsed JSON body against the Zod schema (runtime safety)
 *  - Return the strongly-typed, validated resource
 *
 * This module does NOT:
 *  - Compose multiple fetches (that is CmsService's job)
 *  - Apply business logic or caching
 *
 * Consumers: cms.service.ts only.
 */

import { Effect } from "effect";
import type { z } from "zod";
import type { CmsError } from "./cms.errors";
import { CmsNetworkError, CmsNotFoundError, CmsParseError } from "./cms.errors";
import type { About, Contact, Project, SiteConfig } from "./cms.schemas";
import {
	AboutSchema,
	ContactSchema,
	ProjectsListResponseSchema,
	SiteConfigSchema,
} from "./cms.schemas";

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

/**
 * Fetches the given URL, parses the JSON body, and validates it against the
 * provided Zod schema.
 *
 * Error mapping:
 *  - 404                       → CmsNotFoundError
 *  - Any other non-ok status   → CmsNetworkError
 *  - Network / DNS failure     → CmsNetworkError (fetch throws)
 *  - JSON parse failure        → CmsParseError
 *  - Zod schema validation     → CmsParseError
 */
const fetchJsonValidated = <S extends z.ZodType>(
	url: string,
	schema: S,
): Effect.Effect<z.infer<S>, CmsError> =>
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

			const result = schema.safeParse(body);
			if (!result.success) {
				throw new CmsParseError({ url, cause: result.error });
			}

			return result.data as z.infer<S>;
		},
		catch: (thrown) => {
			if (
				thrown instanceof CmsNotFoundError ||
				thrown instanceof CmsNetworkError ||
				thrown instanceof CmsParseError
			) {
				return thrown;
			}
			return new CmsNetworkError({ url, cause: thrown });
		},
	});

// ---------------------------------------------------------------------------
// Repository functions — one per CMS resource
// ---------------------------------------------------------------------------

/**
 * Fetches and validates the site-config global.
 * Endpoint: GET /api/globals/site-config
 */
export const fetchSiteConfig = (
	baseUrl: string,
): Effect.Effect<SiteConfig, CmsError> =>
	fetchJsonValidated(`${baseUrl}/api/globals/site-config`, SiteConfigSchema);

/**
 * Fetches and validates the about global.
 * Endpoint: GET /api/globals/about
 */
export const fetchAbout = (baseUrl: string): Effect.Effect<About, CmsError> =>
	fetchJsonValidated(`${baseUrl}/api/globals/about`, AboutSchema);

/**
 * Fetches and validates the contact global.
 * Endpoint: GET /api/globals/contact
 */
export const fetchContact = (
	baseUrl: string,
): Effect.Effect<Contact, CmsError> =>
	fetchJsonValidated(`${baseUrl}/api/globals/contact`, ContactSchema);

/**
 * Fetches and validates all published projects, sorted by the `order` field.
 * Endpoint: GET /api/projects?where[status][equals]=published&sort=order&limit=100
 *
 * Validates the full Payload list response shape, then extracts `docs`.
 */
export const fetchProjects = (
	baseUrl: string,
): Effect.Effect<Project[], CmsError> => {
	const params = new URLSearchParams({
		"where[status][equals]": "published",
		sort: "order",
		limit: "100",
	});

	return fetchJsonValidated(
		`${baseUrl}/api/projects?${params.toString()}`,
		ProjectsListResponseSchema,
	).pipe(Effect.map((response) => response.docs));
};
