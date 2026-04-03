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
	mockPost,
	mockPost2,
	mockProject,
	mockSiteConfig,
	mockTag,
} from "../../test/fixtures/cms.fixtures";
import { CmsNetworkError, CmsParseError } from "../cms.error";
import {
	fetchAbout,
	fetchAllPostSlugs,
	fetchAllTagSlugs,
	fetchBlogList,
	fetchContact,
	fetchPostBySlug,
	fetchProjects,
	fetchRecentPosts,
	fetchSiteConfig,
	fetchTagBySlug,
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

// ---------------------------------------------------------------------------
// fetchRecentPosts
// ---------------------------------------------------------------------------

describe("fetchRecentPosts", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("queries with status=published and sort=-publishedAt", async () => {
		const findMock = vi
			.fn()
			.mockResolvedValue({ docs: [mockPost, mockPost2], totalDocs: 2 });
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({ find: findMock }) as never,
		);

		await Effect.runPromise(fetchRecentPosts(4));

		const callArgs = findMock.mock.calls[0][0];
		expect(callArgs.collection).toBe("posts");
		expect(callArgs.limit).toBe(4);
		expect(callArgs.sort).toBe("-publishedAt");
		expect(callArgs.where?.status?.equals).toBe("published");
	});

	it("returns parsed PostData[] on success", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({ docs: [mockPost], totalDocs: 1 }),
			}) as never,
		);

		const result = await Effect.runPromise(fetchRecentPosts(4));

		expect(result).toHaveLength(1);
		expect(result[0].title).toBe("Building a Galaxy with Three.js");
		expect(result[0].status).toBe("published");
	});

	it("returns CmsNetworkError when find rejects", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockRejectedValue(new Error("DB error")),
			}) as never,
		);

		const result = await Effect.runPromise(Effect.either(fetchRecentPosts(4)));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchBlogList
// ---------------------------------------------------------------------------

describe("fetchBlogList", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("queries with sort=-publishedAt by default (newest first)", async () => {
		// fetchBlogList calls find twice: once for posts, once for tags.
		// Return collection-appropriate mock data to avoid TagSchema parse failures.
		const findMock = vi
			.fn()
			.mockImplementation(({ collection }: { collection: string }) => {
				if (collection === "tags") {
					return Promise.resolve({ docs: [mockTag], totalDocs: 1 });
				}
				return Promise.resolve({
					docs: [mockPost],
					totalDocs: 1,
					totalPages: 1,
					page: 1,
					hasPrevPage: false,
					hasNextPage: false,
				});
			});
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({ find: findMock }) as never,
		);

		await Effect.runPromise(fetchBlogList({ page: 1, limit: 9 }));

		const postCall = findMock.mock.calls.find(
			(c) => c[0].collection === "posts",
		);
		expect(postCall?.[0].sort).toBe("-publishedAt");
	});

	it("queries with sort=publishedAt when sort='oldest'", async () => {
		const findMock = vi
			.fn()
			.mockImplementation(({ collection }: { collection: string }) => {
				if (collection === "tags") {
					return Promise.resolve({ docs: [], totalDocs: 0 });
				}
				return Promise.resolve({
					docs: [],
					totalDocs: 0,
					totalPages: 1,
					page: 1,
					hasPrevPage: false,
					hasNextPage: false,
				});
			});
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({ find: findMock }) as never,
		);

		await Effect.runPromise(fetchBlogList({ sort: "oldest" }));

		const postCall = findMock.mock.calls.find(
			(c) => c[0].collection === "posts",
		);
		expect(postCall?.[0].sort).toBe("publishedAt");
	});

	it("returns CmsNetworkError when find rejects", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockRejectedValue(new Error("timeout")),
			}) as never,
		);

		const result = await Effect.runPromise(Effect.either(fetchBlogList({})));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchPostBySlug
// ---------------------------------------------------------------------------

describe("fetchPostBySlug", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed PostData on success", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({ docs: [mockPost], totalDocs: 1 }),
			}) as never,
		);

		const result = await Effect.runPromise(
			fetchPostBySlug("building-a-galaxy-with-three-js"),
		);

		expect(result.title).toBe("Building a Galaxy with Three.js");
	});

	it("returns CmsNetworkError when no post found (empty docs array)", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
			}) as never,
		);

		const result = await Effect.runPromise(
			Effect.either(fetchPostBySlug("does-not-exist")),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});

	it("returns CmsNetworkError when find rejects", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockRejectedValue(new Error("query failed")),
			}) as never,
		);

		const result = await Effect.runPromise(
			Effect.either(fetchPostBySlug("some-slug")),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchAllPostSlugs
// ---------------------------------------------------------------------------

describe("fetchAllPostSlugs", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns an array of slug strings from published posts", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({
					docs: [{ slug: "post-one" }, { slug: "post-two" }],
					totalDocs: 2,
				}),
			}) as never,
		);

		const result = await Effect.runPromise(fetchAllPostSlugs);

		expect(result).toEqual(["post-one", "post-two"]);
	});

	it("returns CmsNetworkError when find rejects", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockRejectedValue(new Error("DB unavailable")),
			}) as never,
		);

		const result = await Effect.runPromise(Effect.either(fetchAllPostSlugs));

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});

// ---------------------------------------------------------------------------
// fetchAllTagSlugs
// ---------------------------------------------------------------------------

describe("fetchAllTagSlugs", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns an array of slug strings", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({
					docs: [{ slug: "three-js" }, { slug: "react" }],
					totalDocs: 2,
				}),
			}) as never,
		);

		const result = await Effect.runPromise(fetchAllTagSlugs);

		expect(result).toEqual(["three-js", "react"]);
	});
});

// ---------------------------------------------------------------------------
// fetchTagBySlug
// ---------------------------------------------------------------------------

describe("fetchTagBySlug", () => {
	beforeEach(() => vi.resetAllMocks());
	afterEach(() => vi.resetAllMocks());

	it("returns parsed TagData on success", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({ docs: [mockTag], totalDocs: 1 }),
			}) as never,
		);

		const result = await Effect.runPromise(fetchTagBySlug("three-js"));

		expect(result.label).toBe("Three.js");
		expect(result.slug).toBe("three-js");
	});

	it("returns CmsNetworkError when tag is not found", async () => {
		mockGetPayload.mockResolvedValue(
			makePayloadInstance({
				find: vi.fn().mockResolvedValue({ docs: [], totalDocs: 0 }),
			}) as never,
		);

		const result = await Effect.runPromise(
			Effect.either(fetchTagBySlug("missing")),
		);

		expect(Either.isLeft(result)).toBe(true);
		if (Either.isLeft(result)) {
			expect(result.left).toBeInstanceOf(CmsNetworkError);
		}
	});
});
