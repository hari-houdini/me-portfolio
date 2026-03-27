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
import * as Repo from "./cms.repository";
import type { PageData } from "./cms.schema";

// ---------------------------------------------------------------------------
// Service interface
// ---------------------------------------------------------------------------

export interface CmsServiceShape {
	getAllPageData: () => Effect.Effect<
		PageData,
		CmsNetworkError | CmsParseError
	>;
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
			}),
	},
);
