/**
 * gradient-text.component.tsx
 *
 * Pure CSS gradient text — RSC-safe (no "use client").
 * Uses background-clip: text with the 5-neon palette gradient.
 */

import type { ReactNode } from "react";
import styles from "./title-effects.module.css";

interface GradientTextProps {
	children: ReactNode;
	className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
	return (
		<span className={`${styles.gradient} ${className ?? ""}`.trim()}>
			{children}
		</span>
	);
}
