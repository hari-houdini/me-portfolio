/**
 * hero-overlay.iso.component.tsx — HTML overlay for Section 1 (Galaxy Angled)
 *
 * The title starts centred in the void above the galaxy (scrollOffset=0) and
 * GSAP-lerps to an editorial bottom-left position as scrollOffset approaches
 * 0.33 (the Section 2 boundary). The scroll prompt fades out as scrolling begins.
 *
 * Layout contract:
 *  scrollOffset 0    → centred, large display typography
 *  scrollOffset 0.33 → bottom-left corner, smaller editorial typography
 *  isMobile=true     → normal document flow (no fixed positioning, no GSAP)
 *
 * Accessibility:
 *  - <h1> always present regardless of visual position.
 *  - Scroll prompt has role="status" for screen reader announcement.
 *  - Visually hidden <h1> in sr-only div owned by home.tsx for full SR coverage.
 */

import { useEffect, useRef } from "react";
import type { SiteConfig } from "~/services/cms/mod";

export interface HeroOverlayProps {
	siteConfig: SiteConfig;
	/** Normalised scroll offset 0→1 from the canvas rAF loop */
	scrollOffset?: number;
	/** Whether the intro animation has completed */
	introComplete?: boolean;
	/** Mobile fallback — renders in normal document flow */
	isMobile?: boolean;
}

export function HeroOverlay({
	siteConfig,
	scrollOffset = 0,
	introComplete = true,
	isMobile = false,
}: HeroOverlayProps) {
	const { name, tagline, subtitle } = siteConfig;
	const containerRef = useRef<HTMLDivElement>(null);

	// GSAP-driven positional animation: centred → editorial bottom-left.
	// Keyed to scrollOffset so it is perfectly synchronised with the camera pan.
	useEffect(() => {
		if (isMobile || !containerRef.current) return;

		let rafId: ReturnType<typeof requestAnimationFrame> | null = null;

		import("gsap")
			.then(({ gsap }) => {
				const el = containerRef.current;
				if (!el) return;

				rafId = requestAnimationFrame(() => {
					// Section 1→2 progress: maps scrollOffset [0, 0.33] → t [0, 1]
					const t = Math.min(scrollOffset / 0.33, 1);
					// Ease in-out for a cinematic feel
					const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;

					// Centred: left=50vw, top=50vh, xPercent=-50, yPercent=-50
					// Editorial: left=6vw, bottom=10vh → top=90vh, xPercent=0, yPercent=-100
					const left = 50 + (6 - 50) * eased;
					const top = 50 + (90 - 50) * eased;
					const xp = 0 + (-50 - 0) * (1 - eased); // -50 at t=0 → 0 at t=1
					const yp = -100 + 50 * (1 - eased); // -50 at t=0 → -100 at t=1

					// Title fades out as it enters the Section 2 lock zone
					const titleOpacity =
						scrollOffset > 0.28
							? Math.max(0, 1 - (scrollOffset - 0.28) / 0.05)
							: 1;

					gsap.set(el, {
						left: `${left}vw`,
						top: `${top}vh`,
						xPercent: xp,
						yPercent: yp,
						opacity: introComplete ? titleOpacity : 0,
					});
				});
			})
			.catch(() => {
				// GSAP failed to load — element stays in its CSS default (centred)
			});

		return () => {
			if (rafId !== null) cancelAnimationFrame(rafId);
		};
	}, [scrollOffset, introComplete, isMobile]);

	// ---------------------------------------------------------------------------
	// Mobile / no-canvas fallback
	// ---------------------------------------------------------------------------
	if (isMobile) {
		return (
			<section
				className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
				aria-label="Portfolio introduction"
			>
				<h1 className="font-display font-bold text-5xl sm:text-7xl tracking-tight text-[var(--color-text-primary)]">
					{name}
				</h1>
				<p className="mt-4 font-display text-xl sm:text-2xl font-light text-[var(--color-neon-cyan)]">
					{tagline}
				</p>
				{subtitle && (
					<p className="mt-2 font-sans text-base text-[var(--color-text-muted)]">
						{subtitle}
					</p>
				)}
			</section>
		);
	}

	// ---------------------------------------------------------------------------
	// Desktop — scroll-animated, GSAP-positioned
	// ---------------------------------------------------------------------------
	return (
		<>
			{/* Title container — GSAP modifies inline left/top/opacity directly */}
			<section
				ref={containerRef}
				className="pointer-events-none z-10"
				aria-label="Portfolio introduction"
				style={{
					position: "fixed",
					// Default centred position; GSAP overrides on each rAF
					left: "50vw",
					top: "50vh",
					transform: "translate(-50%, -50%)",
				}}
			>
				<h1
					className={[
						"font-display font-bold tracking-tight leading-none",
						"text-5xl sm:text-7xl lg:text-8xl",
						"text-[var(--color-text-primary)]",
					].join(" ")}
				>
					{name}
				</h1>
				<p className="mt-3 font-display text-lg sm:text-2xl lg:text-3xl font-light text-[var(--color-neon-cyan)]">
					{tagline}
				</p>
				{subtitle && (
					<p className="mt-1 font-sans text-sm text-[var(--color-text-muted)]">
						{subtitle}
					</p>
				)}
			</section>

			{/* Scroll prompt — visible at rest, fades when scrolling begins */}
			{scrollOffset < 0.04 && (
				<div
					role="status"
					aria-label="Scroll to explore"
					className={[
						"pointer-events-none fixed bottom-12 left-1/2 -translate-x-1/2 z-10",
						"flex flex-col items-center gap-2",
						"transition-opacity duration-700",
						introComplete ? "opacity-100" : "opacity-0",
					].join(" ")}
				>
					<span className="font-sans text-xs tracking-[0.3em] uppercase text-[var(--color-text-subtle)]">
						scroll to explore
					</span>
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						className="animate-bounce text-[var(--color-text-subtle)]"
						aria-hidden="true"
					>
						<path
							d="M6 9l6 6 6-6"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
			)}
		</>
	);
}
