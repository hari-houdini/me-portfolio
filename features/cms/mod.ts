/**
 * mod.ts — CMS feature pod public barrel
 *
 * Only import from this file when consuming the CMS pod from outside.
 * Never import directly from cms.repository.ts, cms.service.ts, etc.
 */

export { CmsNetworkError, CmsParseError } from "./cms.error";
export type { BlogListParams } from "./cms.repository";
export type {
	AboutData,
	BlogListData,
	ContactData,
	FilterContext,
	MediaObject,
	PageData,
	PostData,
	PostPageData,
	ProjectData,
	SiteConfigData,
	TagData,
} from "./cms.schema";
export {
	AboutSchema,
	BlogListDataSchema,
	ContactSchema,
	FilterContextSchema,
	LexicalContentSchema,
	MediaObjectSchema,
	PageDataSchema,
	PostPageDataSchema,
	PostSchema,
	ProjectSchema,
	SiteConfigSchema,
	TagSchema,
} from "./cms.schema";
export { CmsService, CmsServiceLive, runCms } from "./cms.service";
