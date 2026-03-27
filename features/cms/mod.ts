/**
 * mod.ts — CMS feature pod public barrel
 *
 * Only import from this file when consuming the CMS pod from outside.
 * Never import directly from cms.repository.ts, cms.service.ts, etc.
 */

export { CmsNetworkError, CmsParseError } from "./cms.error";
export type {
	AboutData,
	ContactData,
	MediaObject,
	PageData,
	ProjectData,
	SiteConfigData,
} from "./cms.schema";
export {
	AboutSchema,
	ContactSchema,
	LexicalContentSchema,
	MediaObjectSchema,
	PageDataSchema,
	ProjectSchema,
	SiteConfigSchema,
} from "./cms.schema";
export { CmsService, CmsServiceLive } from "./cms.service";
