"use client";

/**
 * shimmer-text.client.component.tsx
 *
 * CSS shimmer animation on gradient-clipped text.
 * Respects prefers-reduced-motion — falls back to gradient-text.
 */

import type { ReactNode } from "react";
import styles from "./title-effects.module.css";

interface ShimmerTextProps {
	children: ReactNode;
	className?: string;
}

export function ShimmerText({ children, className }: ShimmerTextProps) {
	return (
		<span className={`${styles.shimmer} ${className ?? ""}`.trim()}>
			{children}
		</span>
	);
}
