/**
 * cms.error.ts
 *
 * Tagged errors for the CMS service layer.
 * All CMS failures are one of these two variants — never plain Error objects.
 *
 *  CmsNetworkError — getPayload() threw or the Local API call rejected.
 *  CmsParseError   — Zod schema parse failed; response shape didn't match expectations.
 */

import { Data } from "effect";

export class CmsNetworkError extends Data.TaggedError("CmsNetworkError")<{
	message: string;
}> {}

export class CmsParseError extends Data.TaggedError("CmsParseError")<{
	message: string;
}> {}
