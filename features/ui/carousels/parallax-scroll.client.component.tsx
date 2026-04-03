"use client";

/**
 * parallax-scroll.client.component.tsx
 *
 * Scroll-linked parallax layers. Each layer moves at a different rate
 * relative to scroll position. Respects prefers-reduced-motion.
 */

import { type ReactNode, useEffect, useRef } from "react";
import styles from "./carousels.module.css";

interface Layer {
	content: ReactNode;
	speed: number; // 0 = no movement, 1 = full scroll speed
}

interface ParallaxScrollProps {
	layers: Layer[];
	className?: string;
}

export function ParallaxScroll({ layers, className }: ParallaxScrollProps) {
	const wrapperRef = useRef<HTMLDivElement>(null);
	const layerRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const update = () => {
			const rect = wrapper.getBoundingClientRect();
			const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;

			for (let i = 0; i < layers.length; i++) {
				const el = layerRefs.current[i];
				if (!el) continue;
				const translateY = centerOffset * layers[i].speed * -0.3;
				el.style.transform = `translateY(${translateY}px)`;
			}
		};

		window.addEventListener("scroll", update, { passive: true });
		update();

		return () => window.removeEventListener("scroll", update);
	}, [layers]);

	return (
		<div
			ref={wrapperRef}
			className={`${styles.parallaxWrapper} ${className ?? ""}`.trim()}
		>
			{layers.map((layer, i) => (
				<div
					key={`parallax-${
						// biome-ignore lint/suspicious/noArrayIndexKey: layers are positional and stable
						i
					}`}
					ref={(el) => {
						layerRefs.current[i] = el;
					}}
					className={styles.parallaxLayer}
				>
					{layer.content}
				</div>
			))}
		</div>
	);
}
