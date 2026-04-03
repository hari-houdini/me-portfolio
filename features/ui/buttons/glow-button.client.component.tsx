"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./buttons.module.css";

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
}

export function GlowButton({ children, className, ...rest }: GlowButtonProps) {
	return (
		<button
			type="button"
			className={`${styles.base} ${styles.glow} ${className ?? ""}`.trim()}
			{...rest}
		>
			{children}
		</button>
	);
}
