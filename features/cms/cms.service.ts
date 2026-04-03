/**
 * cms.service.ts
 *
 * Effect-ts Context.Tag + Layer for the CMS service.
 *
 * Usage in Next.js Server Components:
 *
 *   import { cache } from 'react'
 *   import { Effect } from 'effect'
 *   import { CmsService, CmsServiceLive } from '@cms/mod'
 *
 *   const getPageData = cache(() =>
 *     Effect.runPromise(
 *       Effect.gen(function* () {
 *         const cms = yield* CmsService
 *         return yield* cms.getAllPageData()
 *       }).pipe(
 *         Effect.provide(CmsServiceLive),
 *         Effect.catchAll(() => Effect.succeed(fallbackPageData))
 *       )
 *     )
 *   )
 *
 * Tests provide a TestCmsServiceLayer with mock implementations instead
 * of CmsServiceLive — no database or Payload instance required.
 */

import { Context, Effect, Layer } from "effect";
import type { CmsNetworkError, CmsParseError } from "./cms.error";
import type { BlogListParams } from "./cms.repository";
import * as Repo from "./cms.repository";
import type {
	BlogListData,
	FilterContext,
	PageData,
	PostData,
	PostPageData,
	TagData,
} from "./cms.schema";

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface CmsServiceShape {
	getAllPageData: () => Effect.Effect<
		PageData,
		CmsNetworkError | CmsParseError
	>;
	getBlogListData: (
		params?: BlogListParams,
	) => Effect.Effect<BlogListData, CmsNetworkError | CmsParseError>;
	getPostPageData: (
		slug: string,
		filterContext?: FilterContext,
	) => Effect.Effect<PostPageData, CmsNetworkError | CmsParseError>;
	getAllPostSlugs: () => Effect.Effect<
		string[],
		CmsNetworkError | CmsParseError
	>;
	getAllTagSlugs: () => Effect.Effect<
		string[],
		CmsNetworkError | CmsParseError
	>;
	getTagBySlug: (
		slug: string,
	) => Effect.Effect<TagData, CmsNetworkError | CmsParseError>;
}

// ---------------------------------------------------------------------------
// Context.Tag — the DI identifier used at call sites (yield* CmsService)
// ---------------------------------------------------------------------------

export class CmsService extends Context.Tag("CmsService")<
	CmsService,
	CmsServiceShape
>() {}

// ---------------------------------------------------------------------------
// Live Layer — uses the real Payload Local API repository
// ---------------------------------------------------------------------------

export const CmsServiceLive: Layer.Layer<CmsService> = Layer.succeed(
	CmsService,
	{
		getAllPageData: () =>
			Effect.all({
				siteConfig: Repo.fetchSiteConfig,
				about: Repo.fetchAbout,
				contact: Repo.fetchContact,
				projects: Repo.fetchProjects,
				recentPosts: Repo.fetchRecentPosts(4),
			}),

		getBlogListData: (params?: BlogListParams) => Repo.fetchBlogList(params),

		getPostPageData: (slug: string, filterContext?: FilterContext) =>
			Effect.gen(function* () {
				const post = yield* Repo.fetchPostBySlug(slug);
				const { prevPost, nextPost } = yield* Repo.fetchAdjacentPosts(
					post,
					filterContext,
				);
				return { post, prevPost, nextPost } satisfies PostPageData;
			}),

		getAllPostSlugs: () => Repo.fetchAllPostSlugs,

		getAllTagSlugs: () => Repo.fetchAllTagSlugs,

		getTagBySlug: (slug: string) => Repo.fetchTagBySlug(slug),
	},
);

// ---------------------------------------------------------------------------
// Helper: run a CmsService effect in a Server Component
// ---------------------------------------------------------------------------

/**
 * Convenience wrapper used by route files.
 * Provides CmsServiceLive and runs the effect to a Promise.
 *
 *   const data = await runCms((cms) => cms.getBlogListData({ page: 1 }))
 */
export const runCms = <A>(
	fn: (
		cms: CmsServiceShape,
	) => Effect.Effect<A, CmsNetworkError | CmsParseError>,
): Promise<A> =>
	Effect.runPromise(
		Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* fn(cms);
		}).pipe(Effect.provide(CmsServiceLive)),
	);

// Re-export PostData for convenience at call sites
export type { PostData };
