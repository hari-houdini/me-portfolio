"use client";

/**
 * animated-tooltip.client.component.tsx
 *
 * Tooltip that fades in above the wrapped element on hover/focus.
 * Pure CSS — no JS positioning required for a simple above-center tooltip.
 */

import type { ReactNode } from "react";
import styles from "./animated-tooltip.module.css";

interface AnimatedTooltipProps {
	label: string;
	children: ReactNode;
}

export function AnimatedTooltip({ label, children }: AnimatedTooltipProps) {
	return (
		<span className={styles.wrapper}>
			{children}
			<span className={styles.tooltip} role="tooltip">
				{label}
			</span>
		</span>
	);
}
