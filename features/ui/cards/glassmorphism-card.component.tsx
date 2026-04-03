/**
 * glassmorphism-card.component.tsx
 *
 * CSS-only glassmorphism card — RSC-safe (no "use client").
 */

import type { ReactNode } from "react";
import styles from "./cards.module.css";

export function GlassmorphismCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`${styles.card} ${styles.glassmorphism} ${className ?? ""}`.trim()}
		>
			{children}
		</div>
	);
}
