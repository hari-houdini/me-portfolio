/**
 * cms.repository.test.ts
 *
 * Tests for the CMS repository — the raw HTTP access layer.
 *
 * What is tested (external behaviour):
 *  - Each fetch function resolves to the expected typed value on HTTP 200
 *  - HTTP 404 produces CmsNotFoundError with the correct url field
 *  - Non-ok HTTP status (5xx) produces CmsNetworkError
 *  - Network-level failure (MSW NetworkError) produces CmsNetworkError
 *  - fetchProjects extracts the `docs` array from the paginated list response
 *  - fetchProjects builds the URL with the correct query parameters
 *
 * What is NOT tested:
 *  - Internal implementation of fetchJson (private helper)
 *  - The exact shape of the error `cause` field (opaque to callers)
 *  - HTTP retry logic (none exists — intentional; loaders handle retries)
 */

import { Effect, Either } from "effect";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import {
	CmsNetworkError,
	CmsNotFoundError,
	CmsParseError,
} from "~/services/cms/cms.errors";
import {
	fetchAbout,
	fetchContact,
	fetchProjects,
	fetchSiteConfig,
} from "~/services/cms/cms.repository";
import {
	mockAbout,
	mockContact,
	mockProjects,
	mockSiteConfig,
} from "~/test/fixtures/cms.fixtures";
import { server } from "~/test/msw/server";

const BASE = "http://localhost:3001";

// ---------------------------------------------------------------------------
// Helper: run an Effect and return Either so failures don't throw in tests
// ---------------------------------------------------------------------------
const runEither = <A, E>(effect: Effect.Effect<A, E>) =>
	Effect.runPromise(Effect.either(effect));

// ===========================================================================
// fetchSiteConfig
// ===========================================================================

describe("cms repository: fetchSiteConfig", () => {
	it("resolves to SiteConfig when the API returns 200 with valid data", async () => {
		const result = await runEither(fetchSiteConfig(BASE));

		expect(Either.isRight(result)).toBe(true);
		if (Either.isRight(result)) {
			expect(result.right).toEqual(mockSiteConfig);
		}
	});

	it("fails with CmsNotFoundError when the API returns 404", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/site-config`,
				() => new HttpResponse(null, { status: 404 }),
			),
		);

		const result = await runEither(fetchSiteConfig(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNotFoundError);
			expect((result.left as CmsNotFoundError).url).toBe(
				`${BASE}/api/globals/site-config`,
			);
		}
	});

	it("fails with CmsNetworkError when the API returns 500", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/site-config`,
				() =>
					new HttpResponse(null, {
						status: 500,
						statusText: "Internal Server Error",
					}),
			),
		);

		const result = await runEither(fetchSiteConfig(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("fails with CmsNetworkError when the network connection is refused", async () => {
		// HttpResponse.error() causes fetch() itself to throw a TypeError,
		// exercising the inner try/catch branch (line 52 in cms.repository.ts).
		server.use(
			http.get(`${BASE}/api/globals/site-config`, () => HttpResponse.error()),
		);

		const result = await runEither(fetchSiteConfig(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("fails with CmsParseError when the response body is not valid JSON", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/site-config`,
				() =>
					new HttpResponse("<!DOCTYPE html><p>Not JSON</p>", {
						status: 200,
						headers: { "Content-Type": "text/html" },
					}),
			),
		);

		const result = await runEither(fetchSiteConfig(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsParseError);
			expect((result.left as CmsParseError).url).toBe(
				`${BASE}/api/globals/site-config`,
			);
		}
	});
});

// ===========================================================================
// fetchAbout
// ===========================================================================

describe("cms repository: fetchAbout", () => {
	it("resolves to About when the API returns 200 with valid data", async () => {
		const result = await runEither(fetchAbout(BASE));

		expect(Either.isRight(result)).toBe(true);
		if (Either.isRight(result)) {
			expect(result.right).toEqual(mockAbout);
		}
	});

	it("fails with CmsNotFoundError when the API returns 404", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/about`,
				() => new HttpResponse(null, { status: 404 }),
			),
		);

		const result = await runEither(fetchAbout(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNotFoundError);
		}
	});
});

// ===========================================================================
// fetchContact
// ===========================================================================

describe("cms repository: fetchContact", () => {
	it("resolves to Contact when the API returns 200 with valid data", async () => {
		const result = await runEither(fetchContact(BASE));

		expect(Either.isRight(result)).toBe(true);
		if (Either.isRight(result)) {
			expect(result.right).toEqual(mockContact);
		}
	});

	it("fails with CmsNotFoundError when the API returns 404", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/contact`,
				() => new HttpResponse(null, { status: 404 }),
			),
		);

		const result = await runEither(fetchContact(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNotFoundError);
		}
	});
});

// ===========================================================================
// fetchProjects
// ===========================================================================

describe("cms repository: fetchProjects", () => {
	it("resolves to the docs array when the API returns a valid list response", async () => {
		const result = await runEither(fetchProjects(BASE));

		expect(Either.isRight(result)).toBe(true);
		if (Either.isRight(result)) {
			expect(result.right).toEqual(mockProjects);
			expect(result.right).toHaveLength(mockProjects.length);
		}
	});

	it("requests the published projects endpoint with sort and limit query params", async () => {
		let capturedUrl: string | null = null;

		server.use(
			http.get(`${BASE}/api/projects`, ({ request }) => {
				capturedUrl = request.url;
				return HttpResponse.json({
					docs: mockProjects,
					totalDocs: mockProjects.length,
				});
			}),
		);

		await Effect.runPromise(fetchProjects(BASE));

		expect(capturedUrl).not.toBeNull();
		const url = new URL(capturedUrl as unknown as string);
		expect(url.searchParams.get("where[status][equals]")).toBe("published");
		expect(url.searchParams.get("sort")).toBe("order");
		expect(url.searchParams.get("limit")).toBe("100");
	});

	it("resolves to an empty array when the API returns an empty docs list", async () => {
		server.use(
			http.get(`${BASE}/api/projects`, () =>
				HttpResponse.json({ docs: [], totalDocs: 0 }),
			),
		);

		const result = await runEither(fetchProjects(BASE));

		expect(Either.isRight(result)).toBe(true);
		if (Either.isRight(result)) {
			expect(result.right).toEqual([]);
		}
	});

	it("fails with CmsNetworkError when the API returns 500", async () => {
		server.use(
			http.get(
				`${BASE}/api/projects`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);

		const result = await runEither(fetchProjects(BASE));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});
