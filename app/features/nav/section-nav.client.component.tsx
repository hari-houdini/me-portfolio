/**
 * section-nav.client.component.tsx — liquid-glass section indicator
 *
 * A fixed right-side column of 3 dots showing which scroll section is active.
 * The active dot is wrapped in a liquid-glass frosted pill. Inactive dots are
 * plain neon rings. Hovering reveals the section label from the CMS.
 *
 * Navigation:
 *  - Click: scrolls scrollEl to that section's scrollTop position
 *  - Keyboard: ArrowUp/ArrowDown cycles sections; Enter confirms
 *
 * The liquid glass effect is the SVG feDisplacementMap technique from
 * liquid-glass.client.component.tsx — chromatic aberration over the canvas
 * backdrop, falling back to plain frosted glass on unsupported browsers.
 */

"use client";

import { useState } from "react";
import { LiquidGlass } from "./liquid-glass.client.component";

export interface SectionNavProps {
	/** Current active section index (0=hero, 1=about, 2=work) */
	section: 0 | 1 | 2;
	/** Section title labels from the CMS */
	sectionTitles: {
		hero: string;
		about: string;
		work: string;
	};
	/** The ScrollControls internal element — used for programmatic navigation */
	scrollEl: HTMLElement | null;
}

const SECTION_KEYS: Array<keyof SectionNavProps["sectionTitles"]> = [
	"hero",
	"about",
	"work",
];

/**
 * Scroll the ScrollControls div to a target section.
 * ScrollControls' offset is scrollTop / (scrollHeight - clientHeight).
 * The three anchors are at 0, 0.33, and 0.66 of that range.
 */
function scrollToSection(el: HTMLElement, targetSection: number) {
	const totalScrollable = el.scrollHeight - el.clientHeight;
	const anchors = [0, 0.33, 0.66];
	const targetOffset = anchors[targetSection] ?? 0;
	el.scrollTo({
		top: totalScrollable * targetOffset,
		behavior: "smooth",
	});
}

export function SectionNav({
	section,
	sectionTitles,
	scrollEl,
}: SectionNavProps) {
	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

	function handleKeyDown(e: React.KeyboardEvent) {
		if (e.key === "ArrowUp" && section > 0) {
			scrollEl && scrollToSection(scrollEl, section - 1);
		} else if (e.key === "ArrowDown" && section < 2) {
			scrollEl && scrollToSection(scrollEl, section + 1);
		}
	}

	return (
		<nav
			aria-label="Section navigation"
			className="pointer-events-auto fixed right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-4"
			onKeyDown={handleKeyDown}
		>
			{SECTION_KEYS.map((key, i) => {
				const isActive = section === i;
				const label = sectionTitles[key];
				const isHovered = hoveredIndex === i;

				return (
					<div key={key} className="relative flex items-center">
						{/* Section label — slides in from right on hover */}
						<span
							className={[
								"absolute right-8 whitespace-nowrap",
								"font-sans text-xs tracking-[0.15em] uppercase",
								"transition-all duration-200",
								isHovered || isActive
									? "opacity-100 translate-x-0"
									: "opacity-0 translate-x-2 pointer-events-none",
								isActive
									? "text-[var(--color-neon-cyan)]"
									: "text-[var(--color-text-muted)]",
							].join(" ")}
							aria-hidden="true"
						>
							{label}
						</span>

						{/* Dot / active pill */}
						<button
							type="button"
							aria-label={`Navigate to ${label} section`}
							aria-current={isActive ? "true" : undefined}
							onClick={() => scrollEl && scrollToSection(scrollEl, i)}
							onMouseEnter={() => setHoveredIndex(i)}
							onMouseLeave={() => setHoveredIndex(null)}
							onFocus={() => setHoveredIndex(i)}
							onBlur={() => setHoveredIndex(null)}
							className="relative flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-neon-cyan)] rounded-full"
						>
							{isActive ? (
								// Active dot: liquid glass pill
								<LiquidGlass
									radius={20}
									frost={0.08}
									blur={8}
									scale={-120}
									rOffset={0}
									gOffset={6}
									bOffset={12}
									className="w-3 h-8 flex items-center justify-center"
								>
									<div className="w-1.5 h-1.5 rounded-full bg-[var(--color-neon-cyan)] shadow-[0_0_6px_var(--color-neon-cyan)]" />
								</LiquidGlass>
							) : (
								// Inactive dot: neon ring
								<div
									className={[
										"w-2 h-2 rounded-full border transition-all duration-300",
										isHovered
											? "border-[var(--color-neon-cyan)] scale-125"
											: "border-[var(--color-text-subtle)]",
									].join(" ")}
								/>
							)}
						</button>
					</div>
				);
			})}
		</nav>
	);
}
