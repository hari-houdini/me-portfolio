/**
 * blog-post.component.tsx
 *
 * Async React Server Component. Renders the full layout for a single blog post.
 * Receives pre-fetched PostPageData as props.
 *
 * Layout (dev.to-inspired):
 *  - Post header: title, tags, date, reading time
 *  - Body: LexicalRenderer (with Shiki code blocks)
 *  - Footer: prev/next navigation (filter-context aware)
 */

import { LampEffect } from "@features/ui/mod";
import type { FilterContext, PostPageData } from "../cms/cms.schema";
import styles from "./blog-post.module.css";
import { LexicalRenderer } from "./lexical-renderer.component";
import { calculateReadingTime, formatReadingTime } from "./reading-time.util";

export interface BlogPostProps {
	data: PostPageData;
	filterContext?: FilterContext;
}

function formatDate(iso: string | null | undefined): string {
	if (!iso) return "";
	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(iso));
}

function buildPostUrl(slug: string, ctx?: FilterContext): string {
	const params = new URLSearchParams();
	if (ctx?.tagSlug) params.set("tag", ctx.tagSlug);
	if (ctx?.sort && ctx.sort !== "newest") params.set("sort", ctx.sort);
	const qs = params.toString();
	return `/blog/${slug}${qs ? `?${qs}` : ""}`;
}

export async function BlogPost({ data, filterContext }: BlogPostProps) {
	const { post, prevPost, nextPost } = data;
	const { title, body, tags, publishedAt, excerpt } = post;

	const readingTime = calculateReadingTime(body);

	const expandedTags = (tags ?? []).filter(
		(t): t is { id: number; label: string; slug: string } =>
			typeof t === "object" && "slug" in t,
	);

	const hasFilterContext = Boolean(
		filterContext?.tagSlug ||
			(filterContext?.sort && filterContext.sort !== "newest"),
	);

	return (
		<article className={styles.article} aria-labelledby="post-title">
			<header className={styles.header}>
				{expandedTags.length > 0 ? (
					<ul className={styles.tagList} aria-label="Post tags">
						{expandedTags.map((tag) => (
							<li key={tag.slug}>
								<a
									href={`/blog/tag/${tag.slug}`}
									className={styles.tag}
									rel="tag"
								>
									{tag.label}
								</a>
							</li>
						))}
					</ul>
				) : null}

				<h1 id="post-title" className={styles.title}>
					{title}
				</h1>

				{excerpt ? <p className={styles.excerpt}>{excerpt}</p> : null}

				<div className={styles.meta}>
					{publishedAt ? (
						<time dateTime={publishedAt} className={styles.date}>
							{formatDate(publishedAt)}
						</time>
					) : null}
					<span className={styles.readingTime}>
						<span className={styles.srOnly}>{readingTime} minute read — </span>
						<span aria-hidden="true">{formatReadingTime(readingTime)}</span>
					</span>
				</div>

				{hasFilterContext ? (
					<div className={styles.filterBanner}>
						<span>
							Browsing within:{" "}
							{filterContext?.tagSlug ? (
								<a
									href={`/blog/tag/${filterContext.tagSlug}`}
									className={styles.filterTag}
								>
									#{filterContext.tagSlug}
								</a>
							) : null}
							{filterContext?.sort === "oldest" ? (
								<span className={styles.filterSort}> · oldest first</span>
							) : null}
						</span>
						<a
							href={`/blog/${post.slug}`}
							className={styles.clearFilter}
							aria-label="Clear filter and view post in default context"
						>
							Clear filter
						</a>
					</div>
				) : null}
			</header>

			<div className={styles.body}>
				<LexicalRenderer content={body} />
			</div>

			<footer className={styles.footer}>
				<nav aria-label="Post navigation" className={styles.postNav}>
					{prevPost ? (
						<div className={styles.navItem}>
							<span className={styles.navLabel}>← Previous</span>
							<LampEffect>
								<a
									href={buildPostUrl(prevPost.slug, filterContext)}
									className={styles.navLink}
								>
									{prevPost.title}
								</a>
							</LampEffect>
						</div>
					) : (
						<div />
					)}

					{nextPost ? (
						<div className={`${styles.navItem} ${styles.navItemNext}`}>
							<span className={styles.navLabel}>Next →</span>
							<LampEffect>
								<a
									href={buildPostUrl(nextPost.slug, filterContext)}
									className={styles.navLink}
								>
									{nextPost.title}
								</a>
							</LampEffect>
						</div>
					) : null}
				</nav>

				<div className={styles.backLink}>
					<a
						href={
							filterContext?.tagSlug
								? `/blog?tag=${filterContext.tagSlug}`
								: "/blog"
						}
					>
						← Back to{" "}
						{filterContext?.tagSlug ? `#${filterContext.tagSlug}` : "all posts"}
					</a>
				</div>
			</footer>
		</article>
	);
}
