/**
 * blog-carousel-loader.component.tsx
 *
 * Isomorphic wrapper that lazy-loads the Embla carousel client component.
 * The server renders the section shell and heading; the carousel hydrates
 * after client JS is ready.
 *
 * Returns null when there are no recent posts to display.
 */

import { lazy, Suspense } from "react";
import type { PostData } from "../cms/cms.schema";
import styles from "./blog-carousel-loader.module.css";

const BlogCarousel = lazy(() =>
	import("./blog-carousel.client.component").then((m) => ({
		default: m.BlogCarousel,
	})),
);

interface BlogCarouselLoaderProps {
	posts: PostData[];
}

export function BlogCarouselLoader({ posts }: BlogCarouselLoaderProps) {
	if (posts.length === 0) return null;

	return (
		<section className={styles.section} aria-labelledby="recent-posts-heading">
			<div className={styles.inner}>
				<header className={styles.header}>
					<h2 id="recent-posts-heading" className={styles.heading}>
						Recent Posts
					</h2>
					<a href="/blog" className={styles.viewAll}>
						View all →
					</a>
				</header>

				<Suspense
					fallback={
						<div className={styles.carouselFallback} aria-busy="true">
							Loading recent posts…
						</div>
					}
				>
					<BlogCarousel posts={posts} />
				</Suspense>
			</div>
		</section>
	);
}
