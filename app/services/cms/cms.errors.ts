/**
 * cms.errors.ts
 *
 * Tagged error types for the CMS service layer.
 *
 * Each error extends Data.TaggedError so Effect-ts can:
 *  - Discriminate on `_tag` at the call site with exhaustive pattern matching
 *  - Carry structured context (url, status, cause) without losing the type
 *
 * Callers never construct these directly — they are produced by the repository
 * and surfaced through Effect failure channels.
 */

import { Data } from "effect";

/**
 * Produced when a network-level failure occurs (DNS, timeout, non-ok HTTP
 * status that is not a 404). Carries the originating URL and the raw cause.
 */
export class CmsNetworkError extends Data.TaggedError("CmsNetworkError")<{
	readonly url: string;
	readonly cause: unknown;
}> {}

/**
 * Produced when the API returns HTTP 404 for a specific resource.
 */
export class CmsNotFoundError extends Data.TaggedError("CmsNotFoundError")<{
	readonly url: string;
	readonly status: number;
}> {}

/**
 * Produced when the API responds successfully but the response body cannot
 * be deserialised into the expected shape.
 */
export class CmsParseError extends Data.TaggedError("CmsParseError")<{
	readonly url: string;
	readonly cause: unknown;
}> {}

/**
 * Union of all errors that the CMS service layer can produce.
 * Route loaders handle this union with exhaustive pattern matching.
 */
export type CmsError = CmsNetworkError | CmsNotFoundError | CmsParseError;
