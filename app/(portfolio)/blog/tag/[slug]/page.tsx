/**
 * app/(portfolio)/blog/tag/[slug]/page.tsx
 *
 * Tag archive page — /blog/tag/[slug]
 *
 * Shows all published posts with a specific tag.
 * Rendering strategy: ISR (revalidate: 3600)
 * generateStaticParams pre-builds all tag slugs at deploy time.
 */

import type { BlogListData, TagData } from "@cms/mod";
import { CmsService, CmsServiceLive } from "@cms/mod";
import { BlogFilters } from "@features/blog/blog-filters.client.component";
import { BlogList } from "@features/blog/mod";
import { Effect } from "effect";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import styles from "./page.module.css";

export const revalidate = 3600;

interface PageParams {
	slug: string;
}

interface PageProps {
	params: Promise<PageParams>;
	searchParams: Promise<{ sort?: string; page?: string }>;
}

export async function generateStaticParams(): Promise<PageParams[]> {
	try {
		const slugs = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getAllTagSlugs();
			}).pipe(Effect.provide(CmsServiceLive)),
		);
		return slugs.map((slug) => ({ slug }));
	} catch {
		return [];
	}
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	try {
		const tag = await Effect.runPromise(
			Effect.gen(function* () {
				const cms = yield* CmsService;
				return yield* cms.getTagBySlug(slug);
			}).pipe(Effect.provide(CmsServiceLive)),
		);
		return {
			title: `#${tag.label} — Blog — Hari Houdini`,
			description:
				tag.description ?? `Posts tagged with ${tag.label} on harihoudini.dev`,
		};
	} catch {
		return { title: "Tag — Blog — Hari Houdini" };
	}
}

export default async function TagArchivePage({
	params,
	searchParams,
}: PageProps) {
	const { slug } = await params;
	const sp = await searchParams;
	const sort = sp.sort === "oldest" ? "oldest" : ("newest" as const);
	const page = Math.max(1, Number(sp.page ?? 1) || 1);

	let tag: TagData | undefined;
	let data: BlogListData | undefined;
	try {
		[tag, data] = await Promise.all([
			Effect.runPromise(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getTagBySlug(slug);
				}).pipe(Effect.provide(CmsServiceLive)),
			),
			Effect.runPromise(
				Effect.gen(function* () {
					const cms = yield* CmsService;
					return yield* cms.getBlogListData({
						tagSlug: slug,
						sort,
						page,
						limit: 9,
					});
				}).pipe(Effect.provide(CmsServiceLive)),
			),
		]);
	} catch {
		notFound();
	}

	return (
		<main id="main-content" className={styles.main}>
			<div className={styles.inner}>
				<header className={styles.header}>
					<h1 className={styles.heading}>
						<span className={styles.hashMark}>#</span>
						{tag.label}
					</h1>
					{tag.description ? (
						<p className={styles.description}>{tag.description}</p>
					) : null}
				</header>

				<Suspense fallback={<div />}>
					<BlogFilters
						tags={data.tags}
						initialTagSlug={slug}
						initialSort={sort}
					/>
				</Suspense>

				<BlogList data={data} tagSlug={slug} />
			</div>
		</main>
	);
}
