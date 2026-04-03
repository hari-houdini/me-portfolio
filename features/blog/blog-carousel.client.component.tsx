"use client";

/**
 * blog-carousel.client.component.tsx
 *
 * Client Component. Embla Carousel displaying recent blog post cards.
 * No autoplay — manual swipe / arrow navigation only.
 *
 * Accessibility:
 *  - region landmark with aria-label="Recent posts"
 *  - aria-roledescription="carousel" on the slide container
 *  - Each slide has aria-roledescription="slide" and aria-label
 *  - Prev/next buttons have aria-label and aria-disabled
 *  - No autoplay (respects prefers-reduced-motion by default)
 */

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import type { PostData } from "../cms/cms.schema";
import styles from "./blog-carousel.module.css";
import { PostCard } from "./post-card.component";

interface BlogCarouselProps {
	posts: PostData[];
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		align: "start",
		loop: false,
		skipSnaps: false,
		dragFree: false,
	});

	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);

	const updateScrollState = useCallback(() => {
		if (!emblaApi) return;
		setCanScrollPrev(emblaApi.canScrollPrev());
		setCanScrollNext(emblaApi.canScrollNext());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		updateScrollState();
		emblaApi.on("select", updateScrollState);
		emblaApi.on("reInit", updateScrollState);
		return () => {
			emblaApi.off("select", updateScrollState);
			emblaApi.off("reInit", updateScrollState);
		};
	}, [emblaApi, updateScrollState]);

	const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

	if (posts.length === 0) return null;

	return (
		<section
			className={styles.carousel}
			aria-label="Recent posts"
			aria-roledescription="carousel"
		>
			<div className={styles.viewport} ref={emblaRef}>
				<ul className={styles.slideList} aria-label="Recent posts slides">
					{posts.map((post, index) => (
						// biome-ignore lint/a11y/useSemanticElements: ARIA carousel pattern requires role="group" on slide items; no semantic equivalent
						<li
							key={post.id}
							className={styles.slide}
							role="group"
							aria-roledescription="slide"
							aria-label={`${index + 1} of ${posts.length}: ${post.title}`}
						>
							<PostCard post={post} compact />
						</li>
					))}
				</ul>
			</div>

			<div className={styles.controls}>
				<button
					type="button"
					onClick={scrollPrev}
					disabled={!canScrollPrev}
					className={styles.controlBtn}
					aria-label="Previous posts"
					aria-disabled={!canScrollPrev}
				>
					←
				</button>
				<button
					type="button"
					onClick={scrollNext}
					disabled={!canScrollNext}
					className={styles.controlBtn}
					aria-label="Next posts"
					aria-disabled={!canScrollNext}
				>
					→
				</button>
			</div>
		</section>
	);
}
