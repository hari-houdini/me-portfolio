/**
 * contact-section.component.tsx
 *
 * Contact section — email (as selectable mailto link), CTA text, social links.
 * Pure Server Component. Unstyled in Phase 3 (browser defaults).
 */

import type { ContactData } from "@cms/mod";

interface ContactSectionProps {
	contact: ContactData;
	sectionTitle?: string | null;
}

export function ContactSection({ contact, sectionTitle }: ContactSectionProps) {
	const { email, ctaText, socials } = contact;

	return (
		<section aria-labelledby="contact-heading">
			<h2 id="contact-heading">{sectionTitle ?? "Contact"}</h2>
			{ctaText ? <p>{ctaText}</p> : null}
			<address>
				<a href={`mailto:${email}`}>{email}</a>
				{socials && socials.length > 0 ? (
					<ul aria-label="Social links">
						{socials.map(({ platform, url, label, id }) => (
							<li key={id ?? platform}>
								<a href={url} aria-label={label}>
									{label}
								</a>
							</li>
						))}
					</ul>
				) : null}
			</address>
		</section>
	);
}
