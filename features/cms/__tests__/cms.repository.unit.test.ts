/**
 * cms.repository.unit.test.ts
 *
 * Unit tests for the CMS repository layer.
 *
 * Strategy: vi.mock('payload') + vi.mock('@payload-config') intercept all
 * Payload Local API calls. No database connection is required.
 *
 * Each fetchX function is tested for:
 *  - Success: parses valid data into the correct typed shape
 *  - Network failure: getPayload rejects → CmsNetworkError
 *  - Parse failure: response has wrong shape → CmsParseError
 */

import { Effect, Either } from "effect";
import { getPayload } from "payload";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	mockAbout,
	mockContact,
	mockProject,
	mockSiteConfig,
} from "../../test/fixtures/cms.fixtures";
import { CmsNetworkError, CmsParseError } from "../cms.error";
import {
	fetchAbout,
	fetchContact,
	fetchProjects,
	fetchSiteConfig,
} from "../cms.repository";

// ---------------------------------------------------------------------------
// Module-level mocks — prevent any real Payload or DB initialisation
// ---------------------------------------------------------------------------

vi.mock("payload", () => ({
	getPayload: vi.fn(),
}));

// @payload-config is imported as a default import — must expose a default export
vi.mock("@payload-config", () => ({ default: {} }));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockGetPayload = vi.mocked(getPayload);

function makePayloadInstance(overrides: {
	findGlobal?: ReturnType<typeof vi.fn>;
	find?: ReturnType<typeof vi.fn>;
}) {
	return {
		findGlobal: overrides.findGlobal ?? vi.fn(),
		find: overrides.find ?? vi.fn(),
	};
}

// ---------------------------------------------------------------------------
// fetchSiteConfig
// ---------------------------------------------------------------------------

describe("fetchSiteConfig", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed SiteConfigData on success", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi.fn().mockResolvedValue(mockSiteConfig),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(fetchSiteConfig);

		expect(result.name).toBe("Hari Houdini");
		expect(result.tagline).toBe("Creative Technologist");
	});

	it("returns CmsNetworkError when getPayload throws", async () => {
		mockGetPayload.mockRejectedValue(new Error("DB connection refused"));

		const result = await Effect.runPromise(Effect.either(fetchSiteConfig));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
			expect(result.left.message).toContain("DB connection refused");
		}
	});

	it("returns CmsNetworkError when findGlobal rejects", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi
				.fn()
				.mockRejectedValue(new Error("Payload internal error")),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchSiteConfig));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsParseError when response shape is invalid", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi
				.fn()
				.mockResolvedValue({ invalid: "data", missingName: true }),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchSiteConfig));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsParseError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchAbout
// ---------------------------------------------------------------------------

describe("fetchAbout", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed AboutData on success", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi.fn().mockResolvedValue(mockAbout),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(fetchAbout);

		expect(result.bio.root.type).toBe("root");
		expect(result.skills).toHaveLength(3);
	});

	it("returns CmsNetworkError when getPayload throws", async () => {
		mockGetPayload.mockRejectedValue(new Error("connection failed"));

		const result = await Effect.runPromise(Effect.either(fetchAbout));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsParseError on schema mismatch", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi.fn().mockResolvedValue({ bio: "not-an-object" }),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchAbout));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsParseError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchContact
// ---------------------------------------------------------------------------

describe("fetchContact", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed ContactData on success", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi.fn().mockResolvedValue(mockContact),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(fetchContact);

		expect(result.email).toBe("hello@harihoudini.dev");
		expect(result.socials).toHaveLength(2);
	});

	it("returns CmsNetworkError when getPayload throws", async () => {
		mockGetPayload.mockRejectedValue(new Error("timeout"));

		const result = await Effect.runPromise(Effect.either(fetchContact));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsParseError on schema mismatch", async () => {
		const instance = makePayloadInstance({
			findGlobal: vi.fn().mockResolvedValue({ email: 12345 }),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchContact));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsParseError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchProjects
// ---------------------------------------------------------------------------

describe("fetchProjects", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed ProjectData[] on success", async () => {
		const instance = makePayloadInstance({
			find: vi.fn().mockResolvedValue({ docs: [mockProject], totalDocs: 1 }),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(fetchProjects);

		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Immersive Portfolio");
		expect(result[0].status).toBe("published");
	});

	it("returns CmsNetworkError when getPayload throws", async () => {
		mockGetPayload.mockRejectedValue(new Error("network error"));

		const result = await Effect.runPromise(Effect.either(fetchProjects));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsNetworkError when find rejects", async () => {
		const instance = makePayloadInstance({
			find: vi.fn().mockRejectedValue(new Error("query failed")),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchProjects));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsParseError when a doc has wrong shape", async () => {
		const instance = makePayloadInstance({
			find: vi.fn().mockResolvedValue({
				docs: [{ id: "not-a-number", title: 99 }],
				totalDocs: 1,
			}),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(Effect.either(fetchProjects));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsParseError);
		}
	});

	it("returns empty array when no published projects exist", async () => {
		const instance = makePayloadInstance({
			find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
		});
		mockGetPayload.mockResolvedValue(instance as never);

		const result = await Effect.runPromise(fetchProjects);

		expect(result).toEqual([]);
	});
});
