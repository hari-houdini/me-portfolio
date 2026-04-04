/**
 * contact-section.component.tsx
 *
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * SectionBackgroundMount (client wrapper) handles the lazy Three.js canvas.
 */

import type { ContactData, UIConfigData } from "@cms/mod";
import { SectionBackgroundMount } from "@features/ui/backgrounds/section-background-mount.client";
import { SectionHeading, WorldMap } from "@features/ui/mod";
import styles from "./contact-section.module.css";

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
			<SectionBackgroundMount variant={background} />
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
