"use client";

import { type ReactNode, useCallback } from "react";
import styles from "./cards.module.css";

export function SpotlightCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const x = ((e.clientX - rect.left) / rect.width) * 100;
		const y = ((e.clientY - rect.top) / rect.height) * 100;
		e.currentTarget.style.setProperty("--x", `${x}%`);
		e.currentTarget.style.setProperty("--y", `${y}%`);
	}, []);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: visual-only spotlight effect; children own all interactive semantics */}
			<div
				role="presentation"
				className={`${styles.card} ${styles.spotlight} ${className ?? ""}`.trim()}
				onMouseMove={onMouseMove}
			>
				{children}
			</div>
		</>
	);
}
