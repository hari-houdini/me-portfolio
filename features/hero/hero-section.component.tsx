/**
 * hero-section.component.tsx
 *
 * Hero section — name, tagline, optional subtitle.
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * SectionBackground is lazy-loaded on the client via next/dynamic.
 */

import type { SiteConfigData } from "@cms/mod";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import styles from "./hero-section.module.css";

const SectionBackground = dynamic(
	() =>
		import("@features/ui/backgrounds/section-background.client.component").then(
			(m) => ({ default: m.SectionBackground }),
		),
	{ ssr: false },
);

interface HeroSectionProps {
	siteConfig: SiteConfigData;
}

export function HeroSection({ siteConfig }: HeroSectionProps) {
	const { name, tagline, subtitle } = siteConfig;
	const background = siteConfig.heroStyle?.background;

	return (
		<section
			id="hero"
			className={styles.section}
			aria-labelledby="hero-heading"
		>
			{background && background !== "none" ? (
				<Suspense fallback={null}>
					<SectionBackground variant={background} />
				</Suspense>
			) : null}
			<div className={styles.content}>
				<h1 id="hero-heading" className={styles.heading}>
					{name}
				</h1>
				<p className={styles.tagline}>{tagline}</p>
				{subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
			</div>
		</section>
	);
}
