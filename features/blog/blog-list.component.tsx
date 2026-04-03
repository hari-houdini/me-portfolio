/**
 * blog-list.component.tsx
 *
 * React Server Component. Renders the blog post list grid with pagination.
 * Receives pre-fetched BlogListData as props — no data fetching here.
 *
 * The search/sort/tag filter UI is a Client Component (blog-filters) loaded
 * separately so the list itself remains a pure server render.
 */

import type { BlogListData } from "../cms/cms.schema";
import styles from "./blog-list.module.css";
import { PostCard } from "./post-card.component";

interface BlogListProps {
	data: BlogListData;
	/** Active search query, for aria-live announcement */
	search?: string;
	/** Active tag slug filter */
	tagSlug?: string;
}

export function BlogList({ data, search, tagSlug }: BlogListProps) {
	const { posts, totalDocs, totalPages, page, hasPrevPage, hasNextPage } = data;

	const hasActiveFilter = Boolean(search?.trim() || tagSlug);

	return (
		<div className={styles.container}>
			{/* Screen-reader announcement of result count after filter changes */}
			<p
				className={styles.srOnly}
				role="status"
				aria-live="polite"
				aria-atomic="true"
			>
				{`${totalDocs} post${totalDocs === 1 ? "" : "s"} found`}
			</p>

			{posts.length === 0 ? (
				<div className={styles.emptyState} role="status">
					<p>
						No posts found{hasActiveFilter ? " matching your filters" : ""}.
					</p>
					{hasActiveFilter ? (
						<a href="/blog" className={styles.clearLink}>
							Clear filters
						</a>
					) : null}
				</div>
			) : (
				<>
					<ul className={styles.grid} aria-label="Blog posts">
						{posts.map((post) => (
							<li key={post.id}>
								<PostCard post={post} />
							</li>
						))}
					</ul>

					{totalPages > 1 ? (
						<Pagination
							page={page}
							totalPages={totalPages}
							hasPrevPage={hasPrevPage}
							hasNextPage={hasNextPage}
							search={search}
							tagSlug={tagSlug}
						/>
					) : null}
				</>
			)}
		</div>
	);
}

interface PaginationProps {
	page: number;
	totalPages: number;
	hasPrevPage: boolean;
	hasNextPage: boolean;
	search?: string;
	tagSlug?: string;
}

function buildPageUrl(
	targetPage: number,
	search?: string,
	tagSlug?: string,
): string {
	const params = new URLSearchParams();
	if (search?.trim()) params.set("search", search);
	if (tagSlug) params.set("tag", tagSlug);
	if (targetPage > 1) params.set("page", String(targetPage));
	const qs = params.toString();
	return `/blog${qs ? `?${qs}` : ""}`;
}

function Pagination({
	page,
	totalPages,
	hasPrevPage,
	hasNextPage,
	search,
	tagSlug,
}: PaginationProps) {
	// Build a window of page numbers around the current page
	const pages: number[] = [];
	for (
		let i = Math.max(1, page - 2);
		i <= Math.min(totalPages, page + 2);
		i++
	) {
		pages.push(i);
	}

	return (
		<nav className={styles.pagination} aria-label="Blog pagination">
			<ol className={styles.pageList}>
				{hasPrevPage ? (
					<li>
						<a
							href={buildPageUrl(page - 1, search, tagSlug)}
							className={styles.pageLink}
							aria-label="Previous page"
							rel="prev"
						>
							←
						</a>
					</li>
				) : null}

				{pages.map((p) => (
					<li key={p}>
						{p === page ? (
							<span className={styles.pageLinkActive} aria-current="page">
								<span className={styles.srOnly}>Page </span>
								{p}
							</span>
						) : (
							<a
								href={buildPageUrl(p, search, tagSlug)}
								className={styles.pageLink}
								aria-label={`Page ${p}`}
							>
								{p}
							</a>
						)}
					</li>
				))}

				{hasNextPage ? (
					<li>
						<a
							href={buildPageUrl(page + 1, search, tagSlug)}
							className={styles.pageLink}
							aria-label="Next page"
							rel="next"
						>
							→
						</a>
					</li>
				) : null}
			</ol>
		</nav>
	);
}
