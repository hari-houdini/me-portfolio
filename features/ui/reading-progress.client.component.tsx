"use client";

/**
 * reading-progress.client.component.tsx
 *
 * Fixed top progress bar that fills as the user scrolls the page.
 * Uses the native scroll event for maximum compatibility.
 * Disabled on prefers-reduced-motion.
 */

import { useEffect, useRef } from "react";
import styles from "./reading-progress.module.css";

export function ReadingProgress() {
	const barRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const bar = barRef.current;
		if (!bar) return;

		const update = () => {
			const { scrollTop, scrollHeight, clientHeight } =
				document.documentElement;
			const total = scrollHeight - clientHeight;
			const pct = total > 0 ? (scrollTop / total) * 100 : 0;
			bar.style.width = `${pct}%`;
		};

		window.addEventListener("scroll", update, { passive: true });
		update();

		return () => window.removeEventListener("scroll", update);
	}, []);

	return (
		<div className={styles.track} aria-hidden="true">
			<div ref={barRef} className={styles.bar} />
		</div>
	);
}
