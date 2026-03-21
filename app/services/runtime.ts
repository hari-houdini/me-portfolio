/**
 * runtime.ts
 *
 * Composes all service Layers into the application-level AppLayer used by
 * every route loader.
 *
 * Usage in a loader:
 *
 *   import { Effect } from "effect"
 *   import { AppLayer } from "~/services/runtime"
 *   import { CmsService } from "~/services/cms/mod"
 *
 *   export const loader = async () =>
 *     Effect.runPromise(
 *       Effect.gen(function* () {
 *         const cms = yield* CmsService
 *         return yield* cms.getAllPageData()
 *       }).pipe(Effect.provide(AppLayer)),
 *     )
 *
 * To add a new service in a future phase:
 *  1. Import its live Layer
 *  2. Add it to the Layer.mergeAll(...) call below
 *  3. No changes required in any loader — they already depend on the abstract tag
 */

import { Layer } from "effect";
import { CmsServiceLive } from "./cms/cms.service";

/**
 * The full application dependency graph.
 * Layer.mergeAll combines all live service layers into a single provideable Layer.
 */
export const AppLayer = Layer.mergeAll(CmsServiceLive);
