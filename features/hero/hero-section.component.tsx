/**
 * hero-section.component.tsx
 *
 * Hero section — name, tagline, optional subtitle.
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * Unstyled in Phase 3 (browser defaults).
 */

import type { SiteConfigData } from "@cms/mod";

interface HeroSectionProps {
	siteConfig: SiteConfigData;
}

export function HeroSection({ siteConfig }: HeroSectionProps) {
	const { name, tagline, subtitle, sectionTitles } = siteConfig;

	return (
		<section aria-labelledby="hero-heading">
			<h1 id="hero-heading">{name}</h1>
			<p>{tagline}</p>
			{subtitle ? <p>{subtitle}</p> : null}
			{sectionTitles?.hero ? <p>{sectionTitles.hero}</p> : null}
		</section>
	);
}
