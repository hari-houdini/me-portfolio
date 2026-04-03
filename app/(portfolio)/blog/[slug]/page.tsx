/**
 * app/(portfolio)/blog/[slug]/page.tsx
 *
 * Individual blog post page — /blog/[slug]
 *
 * Rendering strategy: ISR (revalidate: 3600)
 * generateStaticParams pre-builds all published post slugs at deploy time.
 *
 * Filter context (tag, sort) is read from searchParams and passed to
 * BlogPost for filter-aware prev/next navigation.
 */

import type { FilterContext, PostPageData } from "@cms/mod";
import { CmsService, CmsServiceLive } from "@cms/mod";
import { BlogPost } from "@features/blog/mod";
import { Effect } from "effect";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const ReadingProgress = dynamic(
	() =>
		import("@features/ui/mod").then((m) => ({ default: m.ReadingProgress })),
	{ ssr: false },
);
const TracingBeam = dynamic(
	() => import("@features/ui/mod").then((m) => ({ default: m.TracingBeam })),
	{ ssr: false },
);

export const revalidate = 3600;

interface PageParams {
	slug: string;
}

interface PageProps {
	params: Promise<PageParams>;
	searchParams: Promise<{ tag?: string; sort?: string }>;
}

export async function generateStaticParams(): Promise<PageParams[]> {
	try {
		const slugs = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getAllPostSlugs();
			}).pipe(Effect.provide(CmsServiceLive)),
		);
		return slugs.map((slug) => ({ slug }));
	} catch {
		// If DB is unavailable at build time (CI), return empty — pages are built on demand via ISR.
		return [];
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	try {
		const data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getPostPageData(slug);
			}).pipe(Effect.provide(CmsServiceLive)),
		);
		const { post } = data;
		const title = post.metaTitle ?? post.title;
		const description = post.metaDescription ?? post.excerpt ?? undefined;

		const ogImage =
			typeof post.coverImage === "object" &&
			post.coverImage !== null &&
			"url" in post.coverImage &&
			typeof post.coverImage.url === "string"
				? post.coverImage.url
				: undefined;

		return {
			title: `${title} — Hari Houdini`,
			description,
			openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
		};
	} catch {
		return { title: "Post — Hari Houdini" };
	}
}

export default async function PostPage({ params, searchParams }: PageProps) {
	const { slug } = await params;
	const sp = await searchParams;

	const filterContext: FilterContext = {
		...(sp.tag ? { tagSlug: sp.tag } : {}),
		...(sp.sort === "oldest" ? { sort: "oldest" as const } : {}),
	};

	let data: PostPageData | undefined;
	try {
		data = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getPostPageData(slug, filterContext);
			}).pipe(Effect.provide(CmsServiceLive)),
		);
	} catch {
		notFound();
	}

	const tracingBeam = data?.post.tracingBeam ?? true;

	return (
		<main id="main-content">
			<Suspense fallback={null}>
				<ReadingProgress />
			</Suspense>
			<Suspense fallback={null}>
				<TracingBeam enabled={tracingBeam}>
					<BlogPost data={data} filterContext={filterContext} />
				</TracingBeam>
			</Suspense>
		</main>
	);
}
