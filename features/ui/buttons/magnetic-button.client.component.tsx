"use client";

/**
 * magnetic-button.client.component.tsx
 *
 * Button that translates toward the cursor within ±20px on hover.
 * Snaps back on mouse leave.
 */

import {
	type ButtonHTMLAttributes,
	type ReactNode,
	useCallback,
	useRef,
} from "react";
import styles from "./buttons.module.css";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
	/** Max displacement in px. Default 20 */
	strength?: number;
}

export function MagneticButton({
	children,
	className,
	strength = 20,
	...rest
}: MagneticButtonProps) {
	const btnRef = useRef<HTMLButtonElement>(null);

	const onMouseMove = useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			const btn = btnRef.current;
			if (!btn) return;
			const rect = btn.getBoundingClientRect();
			const cx = rect.left + rect.width / 2;
			const cy = rect.top + rect.height / 2;
			const dx = ((e.clientX - cx) / rect.width) * strength;
			const dy = ((e.clientY - cy) / rect.height) * strength;
			btn.style.transform = `translate(${dx}px, ${dy}px)`;
		},
		[strength],
	);

	const onMouseLeave = useCallback(() => {
		if (btnRef.current) btnRef.current.style.transform = "";
	}, []);

	return (
		<button
			ref={btnRef}
			type="button"
			className={`${styles.base} ${styles.magnetic} ${className ?? ""}`.trim()}
			onMouseMove={onMouseMove}
			onMouseLeave={onMouseLeave}
			{...rest}
		>
			{children}
		</button>
	);
}
