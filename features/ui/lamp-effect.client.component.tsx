"use client";

/**
 * lamp-effect.client.component.tsx
 *
 * Wraps children with a radial-gradient "lamp" cone of light that
 * appears on hover/focus. Uses CSS custom properties for position;
 * no GSAP needed for this simple effect.
 *
 * Props:
 *   color  — CSS color for the glow. Defaults to var(--color-cta).
 *   children — interactive element to wrap (e.g. <a>, <button>)
 */

import type { ReactNode } from "react";
import styles from "./lamp-effect.module.css";

interface LampEffectProps {
	children: ReactNode;
	color?: string;
	className?: string;
}

export function LampEffect({ children, color, className }: LampEffectProps) {
	return (
		<span
			className={`${styles.lamp} ${className ?? ""}`.trim()}
			style={
				color ? ({ "--lamp-color": color } as React.CSSProperties) : undefined
			}
		>
			<span className={styles.glow} aria-hidden="true" />
			{children}
		</span>
	);
}
