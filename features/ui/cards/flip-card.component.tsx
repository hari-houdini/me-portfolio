/**
 * flip-card.component.tsx
 *
 * CSS-only 3D flip card — RSC-safe (no "use client").
 * Front: thumbnail + title. Back: description + links.
 */

import type { ReactNode } from "react";
import styles from "./cards.module.css";

interface FlipCardProps {
	front: ReactNode;
	back: ReactNode;
	className?: string;
}

export function FlipCard({ front, back, className }: FlipCardProps) {
	return (
		<div className={`${styles.flipOuter} ${className ?? ""}`.trim()}>
			<div className={styles.flipInner}>
				<div className={styles.flipFront}>{front}</div>
				<div className={styles.flipBack}>{back}</div>
			</div>
		</div>
	);
}
