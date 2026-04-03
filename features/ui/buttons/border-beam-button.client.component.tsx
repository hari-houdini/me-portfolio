"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./buttons.module.css";

interface BorderBeamButtonProps
	extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ReactNode;
}

export function BorderBeamButton({
	children,
	className,
	...rest
}: BorderBeamButtonProps) {
	return (
		<button
			type="button"
			className={`${styles.base} ${styles.borderBeam} ${className ?? ""}`.trim()}
			{...rest}
		>
			{children}
		</button>
	);
}
