"use client";

/**
 * liquid-glass.client.component.tsx
 *
 * Wraps children with a glassmorphism surface.
 *
 * Implementation layers (in order of preference):
 *  1. CSS backdrop-filter (most browsers) — blur + saturate + semi-transparent bg
 *  2. Plain var(--color-surface) for browsers that don't support backdrop-filter
 *     (old Safari without -webkit prefix, Firefox < 103)
 *
 * The SVG feTurbulence / feDisplacementMap distortion approach requires the
 * element and the blurred backdrop to be siblings in the DOM, which conflicts
 * with the nav structure. The pure CSS path is visually sufficient.
 */

import type { ReactNode } from "react";
import styles from "./liquid-glass.module.css";

interface LiquidGlassProps {
	children: ReactNode;
	className?: string;
}

export function LiquidGlass({ children, className }: LiquidGlassProps) {
	return (
		<div className={`${styles.glass} ${className ?? ""}`.trim()}>
			{children}
		</div>
	);
}
