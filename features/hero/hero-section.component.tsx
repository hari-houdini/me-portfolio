/**
 * hero-section.component.tsx
 *
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * SectionBackgroundMount (client wrapper) handles the lazy Three.js canvas.
 */

import type { SiteConfigData } from "@cms/mod";
import { SectionBackgroundMount } from "@features/ui/backgrounds/section-background-mount.client";
import { SectionHeading } from "@features/ui/mod";
import styles from "./hero-section.module.css";

interface HeroSectionProps {
	siteConfig: SiteConfigData;
}

export function HeroSection({ siteConfig }: HeroSectionProps) {
	const { name, tagline, subtitle } = siteConfig;
	const background = siteConfig.heroStyle?.background;
	const titleEffect = siteConfig.heroStyle?.titleEffect;

	return (
		<section
			id="hero"
			className={styles.section}
			aria-labelledby="hero-heading"
		>
			<SectionBackgroundMount variant={background} />
			<div className={styles.content}>
				<SectionHeading
					level={1}
					id="hero-heading"
					variant={titleEffect}
					className={styles.heading}
				>
					{name}
				</SectionHeading>
				<p className={styles.tagline}>{tagline}</p>
				{subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
			</div>
		</section>
	);
}
