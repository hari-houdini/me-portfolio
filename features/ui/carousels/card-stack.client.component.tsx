"use client";

/**
 * card-stack.client.component.tsx
 *
 * Stacked card carousel. Cards are stacked with z-index + scale offset.
 * Clicking the top card cycles to the next one.
 */

import { type ReactNode, useState } from "react";
import styles from "./carousels.module.css";

interface CardStackProps {
	cards: ReactNode[];
	className?: string;
}

export function CardStack({ cards, className }: CardStackProps) {
	const [activeIndex, setActiveIndex] = useState(0);

	if (cards.length === 0) return null;

	const handleClick = () => {
		setActiveIndex((i) => (i + 1) % cards.length);
	};

	return (
		<section
			className={`${styles.stack} ${className ?? ""}`.trim()}
			aria-label={`Card stack, ${cards.length} cards`}
		>
			{cards.map((card, i) => {
				const offset = (i - activeIndex + cards.length) % cards.length;
				const isTop = offset === 0;
				return (
					<div
						key={`stack-${
							// biome-ignore lint/suspicious/noArrayIndexKey: card stack ordering is positional
							i
						}`}
						className={styles.stackCard}
						style={{
							zIndex: cards.length - offset,
							transform: `translateY(${offset * 12}px) scale(${1 - offset * 0.04})`,
							opacity: offset > 2 ? 0 : 1 - offset * 0.15,
						}}
						aria-hidden={!isTop}
					>
						{isTop ? (
							<button
								type="button"
								className={styles.stackTrigger}
								onClick={handleClick}
								aria-label="Next card"
							>
								{card}
							</button>
						) : (
							card
						)}
					</div>
				);
			})}
		</section>
	);
}
