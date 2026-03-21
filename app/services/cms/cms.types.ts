/**
 * cms.types.ts
 *
 * Re-exports all TypeScript types inferred from Zod schemas in cms.schemas.ts.
 *
 * This file exists solely as a stable import alias — consumers that already
 * import from "~/services/cms/cms.types" continue to work without changes.
 * All type definitions live in cms.schemas.ts (source of truth).
 */

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
} from "./cms.schemas";
