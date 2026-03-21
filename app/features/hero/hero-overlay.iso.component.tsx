/**
 * hero-overlay.tsx — HTML content overlay for Section 1 (Galaxy Angled view)
 *
 * Displays the portfolio owner's name, tagline, subtitle, and a scroll prompt.
 * This overlay is positioned as a fixed layer above the Three.js canvas.
 *
 * Accessibility:
 *  - The name is an <h1> — correct document heading hierarchy.
 *  - The scroll prompt has role="status" so screen readers announce it.
 *  - All text is machine-readable regardless of 3D canvas support.
 *
 * Mobile fallback:
 *  On mobile (canvas not rendered), this component stays visible in normal
 *  document flow rather than as a fixed overlay.
 */

// @vitest-environment jsdom

import type { SiteConfig } from "~/services/cms/mod";

export interface HeroOverlayProps {
	siteConfig: SiteConfig;
	/** Whether the intro animation has completed */
	introComplete?: boolean;
	/** Whether this is a mobile fallback (no 3D canvas) */
	isMobile?: boolean;
}

export function HeroOverlay({
	siteConfig,
	introComplete = true,
	isMobile = false,
}: HeroOverlayProps) {
	const { name, tagline, subtitle } = siteConfig;

	const wrapperClass = isMobile
		? "flex flex-col items-center justify-center min-h-screen px-6 text-center"
		: "pointer-events-none fixed inset-0 z-10 flex flex-col items-center justify-center text-center px-6";

	return (
		<section className={wrapperClass} aria-label="Portfolio introduction">
			{/* Name */}
			<h1
				className={[
					"font-display font-bold text-5xl sm:text-7xl lg:text-8xl tracking-tight",
					"text-[var(--color-text-primary)]",
					"transition-opacity duration-1000",
					introComplete ? "opacity-100" : "opacity-0",
				].join(" ")}
			>
				{name}
			</h1>

			{/* Tagline */}
			<p
				className={[
					"mt-4 font-display text-xl sm:text-2xl lg:text-3xl font-light",
					"text-[var(--color-neon-cyan)]",
					"transition-opacity duration-1000 delay-300",
					introComplete ? "opacity-100" : "opacity-0",
				].join(" ")}
			>
				{tagline}
			</p>

			{/* Optional subtitle */}
			{subtitle && (
				<p
					className={[
						"mt-2 font-sans text-base sm:text-lg",
						"text-[var(--color-text-muted)]",
						"transition-opacity duration-1000 delay-500",
						introComplete ? "opacity-100" : "opacity-0",
					].join(" ")}
				>
					{subtitle}
				</p>
			)}

			{/* Scroll prompt — only shown on desktop */}
			{!isMobile && (
				<div
					role="status"
					aria-label="Scroll to explore"
					className={[
						"absolute bottom-12 flex flex-col items-center gap-2",
						"transition-opacity duration-1000 delay-1000",
						introComplete ? "opacity-100" : "opacity-0",
					].join(" ")}
				>
					<span className="font-sans text-xs tracking-[0.3em] uppercase text-[var(--color-text-subtle)]">
						scroll to explore
					</span>
					{/* Animated chevron */}
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
		</section>
	);
}
