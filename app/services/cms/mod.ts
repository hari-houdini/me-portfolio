/**
 * mod.ts — public interface of the `cms` service pod
 *
 * Barrel discipline:
 *  ✓ Export: the Context.Tag (CmsService) — used by loaders to yield* the service
 *  ✓ Export: the live Layer (CmsServiceLive) — composed into AppLayer in runtime.ts
 *  ✓ Export: all CMS TypeScript types — used by components and loaders for typing
 *  ✓ Export: error types — used by loaders for exhaustive error handling
 *
 *  ✗ Do NOT export: repository functions (internal data-access detail)
 *  ✗ Do NOT export: internal helpers from cms.repository.ts
 */

export type { CmsError } from "./cms.errors";
export { CmsNetworkError, CmsNotFoundError, CmsParseError } from "./cms.errors";
export { CmsService, CmsServiceLive } from "./cms.service";
export type {
	About,
	Contact,
	MediaObject,
	MediaSize,
	PageData,
	Project,
	ProjectsListResponse,
	SiteConfig,
	SocialLink,
} from "./cms.types";
