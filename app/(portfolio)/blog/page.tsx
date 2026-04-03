/**
 * app/(portfolio)/blog/page.tsx
 *
 * Blog list page — /blog
 *
 * Rendering strategy:
 *  - No searchParams → ISR (revalidate: 3600)
 *  - With searchParams → dynamic (Next.js auto-detects via searchParams access)
 *
 * Filters are server-driven: search, tag, sort, page all expressed as URL params.
 * BlogFilters is a client component wrapped in Suspense for useSearchParams support.
 */

import type { BlogListParams } from "@cms/mod";
import { CmsService, CmsServiceLive } from "@cms/mod";
import { BlogFilters } from "@features/blog/blog-filters.client.component";
import { BlogList } from "@features/blog/mod";
import { Effect } from "effect";
import type { Metadata } from "next";
import { Suspense } from "react";
import styles from "./page.module.css";

export const revalidate = 3600;

export const metadata: Metadata = {
	title: "Blog — Hari Houdini",
	description:
		"Writing on creative technology, engineering craft, and building at the intersection of art and code.",
};

interface PageProps {
	searchParams: Promise<{
		search?: string;
		tag?: string;
		sort?: string;
		page?: string;
	}>;
}

export default async function BlogListPage({ searchParams }: PageProps) {
	const params = await searchParams;
	const search = params.search?.trim() ?? "";
	const tagSlug = params.tag ?? "";
	const sort = params.sort === "oldest" ? "oldest" : ("newest" as const);
	const page = Math.max(1, Number(params.page ?? 1) || 1);

	const queryParams: BlogListParams = {
		page,
		limit: 9,
		...(search ? { search } : {}),
		...(tagSlug ? { tagSlug } : {}),
		sort,
	};

	const data = await Effect.runPromise(
		Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* cms.getBlogListData(queryParams);
		}).pipe(Effect.provide(CmsServiceLive)),
	);

	return (
		<main id="main-content" className={styles.main}>
			<div className={styles.inner}>
				<header className={styles.header}>
					<h1 className={styles.heading}>Blog</h1>
					<p className={styles.subheading}>
						Writing on creative technology, engineering craft, and building at
						the intersection of art and code.
					</p>
				</header>

				<Suspense fallback={<div className={styles.filtersFallback} />}>
					<BlogFilters
						tags={data.tags}
						initialSearch={search}
						initialTagSlug={tagSlug}
						initialSort={sort}
					/>
				</Suspense>

				<BlogList data={data} search={search} tagSlug={tagSlug} />
			</div>
		</main>
	);
}
