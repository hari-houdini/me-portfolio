"use client";

import { type ReactNode, useCallback, useRef } from "react";
import styles from "./cards.module.css";

export function TiltCard({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	const cardRef = useRef<HTMLDivElement>(null);

	const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
		const card = cardRef.current;
		if (!card) return;
		const rect = card.getBoundingClientRect();
		const cx = rect.left + rect.width / 2;
		const cy = rect.top + rect.height / 2;
		const rx = ((e.clientY - cy) / rect.height) * -12;
		const ry = ((e.clientX - cx) / rect.width) * 12;
		card.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`;
	}, []);

	const onMouseLeave = useCallback(() => {
		if (cardRef.current) cardRef.current.style.transform = "";
	}, []);

	return (
		<>
			{/* biome-ignore lint/a11y/noStaticElementInteractions: visual-only tilt effect; children own all interactive semantics */}
			<div
				ref={cardRef}
				role="presentation"
				className={`${styles.card} ${styles.tilt} ${className ?? ""}`.trim()}
				onMouseMove={onMouseMove}
				onMouseLeave={onMouseLeave}
			>
				{children}
			</div>
		</>
	);
}
