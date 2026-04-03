"use client";

/**
 * tracing-beam.client.component.tsx
 *
 * Vertical progress beam on the left edge of blog post content.
 * scaleY grows from 0 to 1 as user scrolls through the wrapped content.
 * Disabled on prefers-reduced-motion.
 */

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./tracing-beam.module.css";

interface TracingBeamProps {
	children: ReactNode;
	enabled?: boolean;
}

export function TracingBeam({ children, enabled = true }: TracingBeamProps) {
	const lineRef = useRef<HTMLDivElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!enabled) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const line = lineRef.current;
		const wrapper = wrapperRef.current;
		if (!line || !wrapper) return;

		const update = () => {
			const rect = wrapper.getBoundingClientRect();
			const windowH = window.innerHeight;
			// How much of the wrapper has scrolled past the top of the viewport
			const scrolled = Math.max(0, -rect.top);
			const total = Math.max(1, rect.height - windowH);
			const pct = Math.min(1, scrolled / total);
			line.style.transform = `scaleY(${pct})`;
		};

		window.addEventListener("scroll", update, { passive: true });
		update();

		return () => window.removeEventListener("scroll", update);
	}, [enabled]);

	if (!enabled) return <>{children}</>;

	return (
		<div ref={wrapperRef} className={styles.wrapper}>
			<div className={styles.track} aria-hidden="true">
				<div ref={lineRef} className={styles.beam} />
			</div>
			{children}
		</div>
	);
}
