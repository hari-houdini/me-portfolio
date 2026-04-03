"use client";

/**
 * typewriter-text.client.component.tsx
 *
 * Character-by-character typewriter reveal using GSAP stagger.
 * Falls back to plain text if gsap is unavailable or reduced-motion.
 */

import gsap from "gsap";
import { useEffect, useRef } from "react";
import styles from "./title-effects.module.css";

interface TypewriterTextProps {
	children: string;
	className?: string;
	/** Delay between characters in seconds. Default 0.04 */
	charDelay?: number;
}

export function TypewriterText({
	children,
	className,
	charDelay = 0.04,
}: TypewriterTextProps) {
	const containerRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		// Respect prefers-reduced-motion
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		// Split text into character spans
		const chars = children.split("").map((char) => {
			const span = document.createElement("span");
			span.textContent = char === " " ? "\u00a0" : char;
			span.style.opacity = "0";
			span.style.display = "inline-block";
			return span;
		});

		el.innerHTML = "";
		for (const span of chars) el.appendChild(span);

		const tl = gsap.timeline();
		tl.to(chars, {
			opacity: 1,
			stagger: charDelay,
			ease: "none",
		});

		return () => {
			tl.kill();
		};
	}, [children, charDelay]);

	return (
		<span ref={containerRef} className={className}>
			{children}
			<span className={styles.cursor} aria-hidden="true" />
		</span>
	);
}
