/**
 * mod.ts — public interface of the `cms` service pod
 *
 * Barrel discipline:
 *  ✓ Export: the Context.Tag (CmsService) — used by loaders to yield* the service
 *  ✓ Export: the live Layer (CmsServiceLive) — composed into AppLayer in runtime.ts
 *  ✓ Export: all Zod schemas — used by consumers that need runtime validation
 *  ✓ Export: all inferred TypeScript types — used by components and loaders
 *  ✓ Export: error types and classes — used by loaders for exhaustive error handling
 *
 *  ✗ Do NOT export: repository functions (internal data-access detail)
 *  ✗ Do NOT export: internal helpers from cms.repository.ts
 */

export type { CmsError } from "./cms.errors";
export { CmsNetworkError, CmsNotFoundError, CmsParseError } from "./cms.errors";
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
} from "./cms.schema";

export {
	AboutSchema,
	ContactSchema,
	MediaObjectSchema,
	MediaSizeSchema,
	PageDataSchema,
	ProjectSchema,
	ProjectsListResponseSchema,
	SiteConfigSchema,
	SocialLinkSchema,
} from "./cms.schema";
export { CmsService, CmsServiceLive } from "./cms.service";
