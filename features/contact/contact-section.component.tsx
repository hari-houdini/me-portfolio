/**
 * contact-section.component.tsx
 *
 * Contact section — email (selectable mailto link), CTA text, social links.
 * Pure Server Component. Styled via contact-section.module.css.
 */

import type { ContactData } from "@cms/mod";
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
}

export function ContactSection({ contact, sectionTitle }: ContactSectionProps) {
	const { email, ctaText, socials } = contact;
	const background = contact.contactStyle?.background;

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
				<h2 id="contact-heading" className={styles.heading}>
					{sectionTitle ?? "Contact"}
				</h2>
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
			</div>
		</section>
	);
}
