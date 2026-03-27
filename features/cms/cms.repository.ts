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
	ContactData,
	ProjectData,
	SiteConfigData,
} from "./cms.schema";
import {
	AboutSchema,
	ContactSchema,
	ProjectSchema,
	SiteConfigSchema,
} from "./cms.schema";

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
