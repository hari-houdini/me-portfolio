/**
 * contact-section.component.tsx
 *
 * Contact section — email (selectable mailto link), CTA text, social links.
 * Pure Server Component. Styled via contact-section.module.css.
 */

import type { ContactData } from "@cms/mod";
import styles from "./contact-section.module.css";

interface ContactSectionProps {
	contact: ContactData;
	sectionTitle?: string | null;
}

export function ContactSection({ contact, sectionTitle }: ContactSectionProps) {
	const { email, ctaText, socials } = contact;

	return (
		<section
			id="contact"
			className={styles.section}
			aria-labelledby="contact-heading"
		>
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
