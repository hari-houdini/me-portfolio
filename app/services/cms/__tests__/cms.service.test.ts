/**
 * cms.service.test.ts
 *
 * Tests for CmsService — the composed Effect-ts service layer.
 *
 * What is tested (external behaviour):
 *  - Each service method resolves to the correct typed value on success
 *  - getAllPageData returns all four data shapes in a single Effect
 *  - getAllPageData propagates a CmsError when any single resource fails
 *  - The service is correctly wired via AppLayer (end-to-end DI graph)
 *
 * What is NOT tested:
 *  - Internal Layer construction (Layer.sync internals)
 *  - Exact HTTP URL construction (covered in cms.repository.test.ts)
 *
 * Strategy:
 *  - Tests run against CmsServiceLive wired through AppLayer
 *  - MSW intercepts all HTTP calls — no real network traffic
 *  - Effect.provide(AppLayer) is called inline per test for clarity
 */

import { Effect, Either } from "effect";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { CmsNetworkError, CmsNotFoundError } from "~/services/cms/cms.errors";
import { CmsService } from "~/services/cms/cms.service";
import { AppLayer } from "~/services/runtime";
import {
	mockAbout,
	mockContact,
	mockPageData,
	mockProjects,
	mockSiteConfig,
} from "~/test/fixtures/cms.fixtures";
import { server } from "~/test/msw/server";

const BASE = "http://localhost:3001";

// ===========================================================================
// getSiteConfig
// ===========================================================================

describe("CmsService: getSiteConfig", () => {
	it("resolves to SiteConfig when the CMS is available", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getSiteConfig();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual(mockSiteConfig);
	});

	it("fails with CmsNotFoundError when the site-config global does not exist", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/site-config`,
				() => new HttpResponse(null, { status: 404 }),
			),
		);

		const result = await Effect.runPromise(
			Effect.either(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getSiteConfig();
				}),
			).pipe(Effect.provide(AppLayer)),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNotFoundError);
		}
	});

	it("fails with CmsNetworkError when the CMS server returns 500", async () => {
		server.use(
			http.get(
				`${BASE}/api/globals/site-config`,
				() => new HttpResponse(null, { status: 500 }),
			),
		);

		const result = await Effect.runPromise(
			Effect.either(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getSiteConfig();
				}),
			).pipe(Effect.provide(AppLayer)),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});

// ===========================================================================
// getAbout
// ===========================================================================

describe("CmsService: getAbout", () => {
	it("resolves to About when the CMS is available", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getAbout();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual(mockAbout);
	});
});

// ===========================================================================
// getContact
// ===========================================================================

describe("CmsService: getContact", () => {
	it("resolves to Contact when the CMS is available", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getContact();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual(mockContact);
	});
});

// ===========================================================================
// getProjects
// ===========================================================================

describe("CmsService: getProjects", () => {
	it("resolves to an array of published projects", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getProjects();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual(mockProjects);
	});

	it("resolves to an empty array when no projects exist", async () => {
		server.use(
			http.get(`${BASE}/api/projects`, () =>
				HttpResponse.json({ docs: [], totalDocs: 0 }),
			),
		);

		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getProjects();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual([]);
	});
});

// ===========================================================================
// getAllPageData
// ===========================================================================

describe("CmsService: getAllPageData", () => {
	it("resolves with all four data shapes when all resources succeed", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getAllPageData();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(data).toEqual(mockPageData);
	});

	it("includes a projects array inside the resolved PageData", async () => {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getAllPageData();
			}).pipe(Effect.provide(AppLayer)),
		);

		expect(Array.isArray(data.projects)).toBe(true);
		expect(data.projects).toHaveLength(mockProjects.length);
	});

	it("fails with CmsNetworkError when the projects endpoint returns 503", async () => {
		server.use(
			http.get(
				`${BASE}/api/projects`,
				() => new HttpResponse(null, { status: 503 }),
			),
		);

		const result = await Effect.runPromise(
			Effect.either(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getAllPageData();
				}),
			).pipe(Effect.provide(AppLayer)),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("fails with CmsNetworkError when all CMS endpoints are unreachable", async () => {
		server.use(
			http.get(`${BASE}/api/globals/site-config`, () => HttpResponse.error()),
			http.get(`${BASE}/api/globals/about`, () => HttpResponse.error()),
			http.get(`${BASE}/api/globals/contact`, () => HttpResponse.error()),
			http.get(`${BASE}/api/projects`, () => HttpResponse.error()),
		);

		const result = await Effect.runPromise(
			Effect.either(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getAllPageData();
				}),
			).pipe(Effect.provide(AppLayer)),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});
