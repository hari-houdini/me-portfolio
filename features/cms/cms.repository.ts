/**
 * cms.repository.ts
 *
 * Payload Local API calls wrapped in Effect.tryPromise.
 *
 * Each exported Effect:
 *  1. Calls getPayload({ config }) — failure → CmsNetworkError
 *  2. Parses the response with Zod — failure → CmsParseError
 *
 * Tests mock 'payload' and '@payload-config' at module level (vi.mock) so
 * no database connection is required in the Vitest environment.
 *
 * Note: getPayload internally caches the Payload instance, so calling it
 * per-function is safe and idiomatic in Next.js Server Components.
 */

import config from "@payload-config";
import { Effect } from "effect";
import { getPayload } from "payload";
import { CmsNetworkError, CmsParseError } from "./cms.error";
import type {
	AboutData,
	BlogListData,
	ContactData,
	FilterContext,
	PostData,
	PostPageData,
	ProjectData,
	SiteConfigData,
	TagData,
} from "./cms.schema";
import {
	AboutSchema,
	ContactSchema,
	PostSchema,
	ProjectSchema,
	SiteConfigSchema,
	TagSchema,
} from "./cms.schema";

// ---------------------------------------------------------------------------
// Existing globals / projects
// ---------------------------------------------------------------------------

export const fetchSiteConfig: Effect.Effect<
	SiteConfigData,
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.findGlobal({ slug: "site-config" });
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () => SiteConfigSchema.parse(result),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

export const fetchAbout: Effect.Effect<
	AboutData,
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.findGlobal({ slug: "about" });
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () => AboutSchema.parse(result),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

export const fetchContact: Effect.Effect<
	ContactData,
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.findGlobal({ slug: "contact" });
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () => ContactSchema.parse(result),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

export const fetchProjects: Effect.Effect<
	ProjectData[],
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.find({
			collection: "projects",
			where: { status: { equals: "published" } },
			sort: "order",
			depth: 1,
		});
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () => result.docs.map((doc) => ProjectSchema.parse(doc)),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

// ---------------------------------------------------------------------------
// Blog — recent posts (home page carousel)
// ---------------------------------------------------------------------------

export const fetchRecentPosts = (
	limit = 4,
): Effect.Effect<PostData[], CmsNetworkError | CmsParseError> =>
	Effect.tryPromise({
		try: async () => {
			const payload = await getPayload({ config });
			return payload.find({
				collection: "posts",
				where: { status: { equals: "published" } },
				sort: "-publishedAt",
				limit,
				depth: 1,
			});
		},
		catch: (e) => new CmsNetworkError({ message: String(e) }),
	}).pipe(
		Effect.flatMap((result) =>
			Effect.try({
				try: () => result.docs.map((doc) => PostSchema.parse(doc)),
				catch: (e) => new CmsParseError({ message: String(e) }),
			}),
		),
	);

// ---------------------------------------------------------------------------
// Blog — paginated list with optional search / tag / sort filters
// ---------------------------------------------------------------------------

export interface BlogListParams {
	page?: number;
	limit?: number;
	search?: string;
	tagSlug?: string;
	sort?: "newest" | "oldest";
}

export const fetchBlogList = (
	params: BlogListParams = {},
): Effect.Effect<BlogListData, CmsNetworkError | CmsParseError> => {
	const { page = 1, limit = 9, search, tagSlug, sort = "newest" } = params;

	return Effect.tryPromise({
		try: async () => {
			const payload = await getPayload({ config });

			// Build the where clause
			// biome-ignore lint/suspicious/noExplicitAny: Payload where clause is dynamically typed
			const conditions: Record<string, any>[] = [
				{ status: { equals: "published" } },
			];

			if (tagSlug) {
				conditions.push({ "tags.slug": { equals: tagSlug } });
			}

			if (search?.trim()) {
				conditions.push({
					or: [
						{ title: { contains: search } },
						{ excerpt: { contains: search } },
					],
				});
			}

			const [postsResult, tagsResult] = await Promise.all([
				payload.find({
					collection: "posts",
					where: { and: conditions },
					sort: sort === "oldest" ? "publishedAt" : "-publishedAt",
					page,
					limit,
					depth: 1,
				}),
				payload.find({
					collection: "tags",
					sort: "label",
					limit: 200,
					depth: 0,
				}),
			]);

			return { postsResult, tagsResult };
		},
		catch: (e) => new CmsNetworkError({ message: String(e) }),
	}).pipe(
		Effect.flatMap(({ postsResult, tagsResult }) =>
			Effect.try({
				try: () => ({
					posts: postsResult.docs.map((doc) => PostSchema.parse(doc)),
					totalDocs: postsResult.totalDocs,
					totalPages: postsResult.totalPages,
					page: postsResult.page ?? page,
					hasPrevPage: postsResult.hasPrevPage,
					hasNextPage: postsResult.hasNextPage,
					tags: tagsResult.docs.map((doc) => TagSchema.parse(doc)),
				}),
				catch: (e) => new CmsParseError({ message: String(e) }),
			}),
		),
	);
};

// ---------------------------------------------------------------------------
// Blog — single post by slug
// ---------------------------------------------------------------------------

export const fetchPostBySlug = (
	slug: string,
): Effect.Effect<PostData, CmsNetworkError | CmsParseError> =>
	Effect.tryPromise({
		try: async () => {
			const payload = await getPayload({ config });
			const result = await payload.find({
				collection: "posts",
				where: {
					and: [
						{ slug: { equals: slug } },
						{ status: { equals: "published" } },
					],
				},
				limit: 1,
				depth: 1,
			});
			if (result.docs.length === 0) {
				throw new Error(`Post not found: ${slug}`);
			}
			return result.docs[0];
		},
		catch: (e) => new CmsNetworkError({ message: String(e) }),
	}).pipe(
		Effect.flatMap((doc) =>
			Effect.try({
				try: () => PostSchema.parse(doc),
				catch: (e) => new CmsParseError({ message: String(e) }),
			}),
		),
	);

// ---------------------------------------------------------------------------
// Blog — adjacent posts for prev/next navigation (filter-context aware)
// ---------------------------------------------------------------------------

export const fetchAdjacentPosts = (
	currentPost: PostData,
	filterContext: FilterContext = {},
): Effect.Effect<
	Pick<PostPageData, "prevPost" | "nextPost">,
	CmsNetworkError | CmsParseError
> => {
	const { tagSlug, sort = "newest" } = filterContext;
	const publishedAt = currentPost.publishedAt;

	return Effect.tryPromise({
		try: async () => {
			const payload = await getPayload({ config });

			// biome-ignore lint/suspicious/noExplicitAny: Payload where clause is dynamically typed
			const baseConditions: Record<string, any>[] = [
				{ status: { equals: "published" } },
				{ id: { not_equals: currentPost.id } },
			];
			if (tagSlug) {
				baseConditions.push({ "tags.slug": { equals: tagSlug } });
			}

			const isNewest = sort !== "oldest";

			const [prevResult, nextResult] = await Promise.all([
				// "previous" means the post published before this one in the current sort direction
				publishedAt
					? payload.find({
							collection: "posts",
							where: {
								and: [
									...baseConditions,
									{
										publishedAt: {
											[isNewest ? "greater_than" : "less_than"]: publishedAt,
										},
									},
								],
							},
							sort: isNewest ? "publishedAt" : "-publishedAt",
							limit: 1,
							depth: 1,
						})
					: Promise.resolve(null),
				// "next" means the post published after this one in the current sort direction
				publishedAt
					? payload.find({
							collection: "posts",
							where: {
								and: [
									...baseConditions,
									{
										publishedAt: {
											[isNewest ? "less_than" : "greater_than"]: publishedAt,
										},
									},
								],
							},
							sort: isNewest ? "-publishedAt" : "publishedAt",
							limit: 1,
							depth: 1,
						})
					: Promise.resolve(null),
			]);

			return { prevResult, nextResult };
		},
		catch: (e) => new CmsNetworkError({ message: String(e) }),
	}).pipe(
		Effect.flatMap(({ prevResult, nextResult }) =>
			Effect.try({
				try: () => ({
					prevPost:
						prevResult?.docs[0] != null
							? PostSchema.parse(prevResult.docs[0])
							: null,
					nextPost:
						nextResult?.docs[0] != null
							? PostSchema.parse(nextResult.docs[0])
							: null,
				}),
				catch: (e) => new CmsParseError({ message: String(e) }),
			}),
		),
	);
};

// ---------------------------------------------------------------------------
// Blog — all published post slugs (for generateStaticParams)
// ---------------------------------------------------------------------------

export const fetchAllPostSlugs: Effect.Effect<
	string[],
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.find({
			collection: "posts",
			where: { status: { equals: "published" } },
			limit: 1000,
			depth: 0,
			select: { slug: true },
		});
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () =>
				result.docs
					.map((doc) => (doc as { slug?: unknown }).slug)
					.filter((s): s is string => typeof s === "string"),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

// ---------------------------------------------------------------------------
// Tags — all tag slugs (for generateStaticParams)
// ---------------------------------------------------------------------------

export const fetchAllTagSlugs: Effect.Effect<
	string[],
	CmsNetworkError | CmsParseError
> = Effect.tryPromise({
	try: async () => {
		const payload = await getPayload({ config });
		return payload.find({
			collection: "tags",
			limit: 500,
			depth: 0,
			select: { slug: true },
		});
	},
	catch: (e) => new CmsNetworkError({ message: String(e) }),
}).pipe(
	Effect.flatMap((result) =>
		Effect.try({
			try: () =>
				result.docs
					.map((doc) => (doc as { slug?: unknown }).slug)
					.filter((s): s is string => typeof s === "string"),
			catch: (e) => new CmsParseError({ message: String(e) }),
		}),
	),
);

// ---------------------------------------------------------------------------
// Tags — single tag by slug (for tag archive page metadata)
// ---------------------------------------------------------------------------

export const fetchTagBySlug = (
	slug: string,
): Effect.Effect<TagData, CmsNetworkError | CmsParseError> =>
	Effect.tryPromise({
		try: async () => {
			const payload = await getPayload({ config });
			const result = await payload.find({
				collection: "tags",
				where: { slug: { equals: slug } },
				limit: 1,
				depth: 0,
			});
			if (result.docs.length === 0) {
				throw new Error(`Tag not found: ${slug}`);
			}
			return result.docs[0];
		},
		catch: (e) => new CmsNetworkError({ message: String(e) }),
	}).pipe(
		Effect.flatMap((doc) =>
			Effect.try({
				try: () => TagSchema.parse(doc),
				catch: (e) => new CmsParseError({ message: String(e) }),
			}),
		),
	);
