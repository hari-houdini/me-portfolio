"use client";

/**
 * glitch-text.client.component.tsx
 *
 * CSS glitch effect using ::before / ::after pseudo-elements with clip-path.
 * data-text attribute carries the text so pseudo-elements can replicate it.
 */

import type { ReactNode } from "react";
import styles from "./title-effects.module.css";

interface GlitchTextProps {
	children: ReactNode;
	className?: string;
}

export function GlitchText({ children, className }: GlitchTextProps) {
	const text = typeof children === "string" ? children : "";

	return (
		<span
			className={`${styles.glitch} ${className ?? ""}`.trim()}
			data-text={text}
		>
			{children}
		</span>
	);
}
