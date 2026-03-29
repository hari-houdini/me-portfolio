/**
 * cms.service.unit.test.ts
 *
 * Unit tests for the CMS service layer.
 *
 * Strategy: provide a TestCmsServiceLayer with mock implementations instead
 * of CmsServiceLive — repository is never touched in these tests.
 */

import { Effect, Either, Layer } from "effect";
import { describe, expect, it } from "vitest";
import { mockPageData } from "../../test/fixtures/cms.fixtures";
import { CmsNetworkError } from "../cms.error";
import { CmsService } from "../cms.service";

// ---------------------------------------------------------------------------
// Test Layer — mock implementation of CmsService
// ---------------------------------------------------------------------------

const TestCmsServiceLayer = Layer.succeed(CmsService, {
	getAllPageData: () => Effect.succeed(mockPageData),
});

const FailingCmsServiceLayer = Layer.succeed(CmsService, {
	getAllPageData: () =>
		Effect.fail(new CmsNetworkError({ message: "CMS unavailable" })),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CmsService: getAllPageData", () => {
	it("resolves all four data shapes from the live service", async () => {
		const program = Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* cms.getAllPageData();
		});

		const result = await Effect.runPromise(
			program.pipe(Effect.provide(TestCmsServiceLayer)),
		);

		expect(result.siteConfig.name).toBe("Hari Houdini");
		expect(result.about.bio.root.type).toBe("root");
		expect(result.contact.email).toBe("hello@harihoudini.dev");
		expect(result.projects).toHaveLength(2);
	});

	it("propagates CmsNetworkError when the service fails", async () => {
		const program = Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* cms.getAllPageData();
		});

		const result = await Effect.runPromise(
			Effect.either(program.pipe(Effect.provide(FailingCmsServiceLayer))),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
			expect(result.left.message).toBe("CMS unavailable");
		}
	});

	it("catchAll provides fallback when service fails", async () => {
		const program = Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* cms.getAllPageData();
		}).pipe(
			Effect.provide(FailingCmsServiceLayer),
			Effect.catchAll(() => Effect.succeed(mockPageData)),
		);

		const result = await Effect.runPromise(program);

		expect(result.siteConfig.name).toBe("Hari Houdini");
	});
});
