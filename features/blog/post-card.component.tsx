/**
 * post-card.component.tsx
 *
 * React Server Component. Renders a single blog post summary card for use on
 * the list page, tag archive page, and home carousel.
 *
 * Receives fully-typed PostData props — no data fetching.
 */

import Image from "next/image";
import type { MediaObject, PostData } from "../cms/cms.schema";
import styles from "./post-card.module.css";
import { calculateReadingTime, formatReadingTime } from "./reading-time.util";

interface PostCardProps {
	post: PostData;
	/** When true, renders a compact layout suitable for the carousel. */
	compact?: boolean;
}

function isMediumObject(value: unknown): value is MediaObject {
	return (
		value !== null &&
		typeof value === "object" &&
		"url" in value &&
		typeof (value as MediaObject).url === "string"
	);
}

function formatDate(iso: string | null | undefined): string {
	if (!iso) return "";
	return new Intl.DateTimeFormat("en-GB", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(new Date(iso));
}

export function PostCard({ post, compact = false }: PostCardProps) {
	const { title, slug, excerpt, coverImage, tags, publishedAt, body } = post;

	const readingTime = calculateReadingTime(body);
	const coverMedia = isMediumObject(coverImage) ? coverImage : null;

	// Build tag list — only expanded tag objects have a slug/label
	const expandedTags = (tags ?? []).filter(
		(t): t is { id: number; label: string; slug: string } =>
			typeof t === "object" && "slug" in t,
	);

	return (
		<article
			className={compact ? styles.cardCompact : styles.card}
			aria-label={title}
		>
			{coverMedia?.url && !compact ? (
				<div className={styles.cardImage}>
					<Image
						src={coverMedia.url}
						alt={coverMedia.alt ?? title}
						width={coverMedia.width ?? 800}
						height={coverMedia.height ?? 450}
						className={styles.thumbnail}
						sizes="(max-width: 768px) 100vw, 400px"
					/>
				</div>
			) : null}

			<div className={styles.cardBody}>
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

				<h3 className={styles.cardTitle}>
					<a href={`/blog/${slug}`} className={styles.titleLink}>
						{title}
					</a>
				</h3>

				{excerpt && !compact ? (
					<p className={styles.excerpt}>{excerpt}</p>
				) : null}

				<footer className={styles.cardMeta}>
					{publishedAt ? (
						<time dateTime={publishedAt} className={styles.date}>
							{formatDate(publishedAt)}
						</time>
					) : null}
					<span className={styles.readingTime}>
						<span className={styles.srOnly}>{readingTime} minute read — </span>
						<span aria-hidden="true">{formatReadingTime(readingTime)}</span>
					</span>
				</footer>
			</div>
		</article>
	);
}
