"use client";

import type { ReactNode } from "react";
import styles from "./cards.module.css";

export function BorderBeamCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div
			className={`${styles.card} ${styles.borderBeamCard} ${className ?? ""}`.trim()}
		>
			{children}
		</div>
	);
}
