"use client";

import type { ReactNode } from "react";
import styles from "./cards.module.css";

export function GlowCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={`${styles.card} ${styles.glow} ${className ?? ""}`.trim()}>
			{children}
		</div>
	);
}
