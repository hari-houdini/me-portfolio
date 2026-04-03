"use client";

/**
 * infinite-scroll-list.client.component.tsx
 *
 * CSS animation infinite scroll. Duplicates the list so the animation loops
 * seamlessly. Pauses on hover and respects prefers-reduced-motion.
 */

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./carousels.module.css";

interface InfiniteScrollListProps {
	items: ReactNode[];
	direction?: "left" | "right";
	speed?: number;
	className?: string;
}

export function InfiniteScrollList({
	items,
	direction = "left",
	speed = 40,
	className,
}: InfiniteScrollListProps) {
	const trackRef = useRef<HTMLUListElement>(null);

	useEffect(() => {
		const track = trackRef.current;
		if (!track) return;
		// Set animation duration proportional to item count and speed
		track.style.setProperty("--scroll-duration", `${items.length * speed}s`);
	}, [items.length, speed]);

	if (items.length === 0) return null;

	return (
		<section
			className={`${styles.scrollOuter} ${className ?? ""}`.trim()}
			aria-label="Scrolling list"
		>
			<ul
				ref={trackRef}
				className={`${styles.scrollTrack} ${direction === "right" ? styles.scrollRight : ""}`.trim()}
				aria-hidden="true"
			>
				{/* Render twice to create seamless loop */}
				{[...items, ...items].map((item, i) => (
					<li
						key={`scroll-${
							// biome-ignore lint/suspicious/noArrayIndexKey: duplicated list for seamless loop — index is stable
							i
						}`}
						className={styles.scrollItem}
					>
						{item}
					</li>
				))}
			</ul>
		</section>
	);
}
