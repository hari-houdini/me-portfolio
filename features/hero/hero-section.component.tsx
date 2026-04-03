/**
 * hero-section.component.tsx
 *
 * Hero section — name, tagline, optional subtitle.
 * Pure Server Component: receives CMS props, renders semantic HTML.
 */

import type { SiteConfigData } from "@cms/mod";
import styles from "./hero-section.module.css";

interface HeroSectionProps {
	siteConfig: SiteConfigData;
}

export function HeroSection({ siteConfig }: HeroSectionProps) {
	const { name, tagline, subtitle } = siteConfig;

	return (
		<section
			id="hero"
			className={styles.section}
			aria-labelledby="hero-heading"
		>
			<h1 id="hero-heading" className={styles.heading}>
				{name}
			</h1>
			<p className={styles.tagline}>{tagline}</p>
			{subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
		</section>
	);
}
