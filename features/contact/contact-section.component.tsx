"use client";

/**
 * contact-section.component.tsx
 *
 * Contact section — email (selectable mailto link), CTA text, social links.
 * Client Component (required for next/dynamic ssr: false on SectionBackground).
 * Receives CMS props from the parent RSC page.
 */

import type { ContactData, UIConfigData } from "@cms/mod";
import { SectionHeading, WorldMap } from "@features/ui/mod";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import styles from "./contact-section.module.css";

const SectionBackground = dynamic(
	() =>
		import("@features/ui/backgrounds/section-background.client.component").then(
			(m) => ({ default: m.SectionBackground }),
		),
	{ ssr: false },
);

interface ContactSectionProps {
	contact: ContactData;
	sectionTitle?: string | null;
	uiConfig?: UIConfigData | null;
}

export function ContactSection({
	contact,
	sectionTitle,
	uiConfig,
}: ContactSectionProps) {
	const { email, ctaText, socials } = contact;
	const background = contact.contactStyle?.background;
	const titleEffect = contact.contactStyle?.titleEffect;

	return (
		<section
			id="contact"
			className={styles.section}
			aria-labelledby="contact-heading"
		>
			{background && background !== "none" ? (
				<Suspense fallback={null}>
					<SectionBackground variant={background} />
				</Suspense>
			) : null}
			<div className={styles.container}>
				<SectionHeading
					level={2}
					id="contact-heading"
					variant={titleEffect}
					className={styles.heading}
				>
					{sectionTitle ?? "Contact"}
				</SectionHeading>
				{ctaText ? <p className={styles.cta}>{ctaText}</p> : null}
				<address>
					<a href={`mailto:${email}`} className={styles.emailLink}>
						{email}
					</a>
					{socials && socials.length > 0 ? (
						<ul className={styles.socialList} aria-label="Social links">
							{socials.map(({ platform, url, label, id }) => (
								<li key={id ?? platform}>
									<a
										href={url}
										aria-label={label}
										className={styles.socialLink}
										rel="noopener noreferrer"
									>
										{label}
									</a>
								</li>
							))}
						</ul>
					) : null}
				</address>
				{uiConfig ? <WorldMap locations={uiConfig.worldMapLocations} /> : null}
			</div>
		</section>
	);
}
