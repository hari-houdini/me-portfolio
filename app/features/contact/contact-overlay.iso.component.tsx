/**
 * contact-overlay.tsx — HTML content overlay for the contact section
 *
 * Appears within Section 3 (city view), below the project list.
 * Displays the portfolio owner's email, social links, and a CTA.
 *
 * Accessibility:
 *  - Email is selectable plain text — never an image or obfuscated string.
 *  - Social links use visually-hidden labels for screen readers.
 *  - The section has a clear landmark heading.
 */

import type { Contact, SiteConfig } from "~/services/cms/mod";

export interface ContactOverlayProps {
	contact: Contact;
	siteConfig: SiteConfig;
	visible?: boolean;
	isMobile?: boolean;
}

const PLATFORM_LABELS: Record<string, string> = {
	github: "GitHub",
	twitter: "Twitter / X",
	x: "Twitter / X",
	linkedin: "LinkedIn",
	instagram: "Instagram",
	youtube: "YouTube",
	dribbble: "Dribbble",
	behance: "Behance",
};

export function ContactOverlay({
	contact,
	siteConfig,
	visible = true,
	isMobile = false,
}: ContactOverlayProps) {
	const { email, ctaText, socials } = contact;
	const sectionTitle = siteConfig.sectionTitles.contact;

	const wrapperClass = isMobile
		? "px-6 py-16 border-t border-[var(--color-border)]"
		: [
				"pointer-events-none fixed bottom-0 left-0 right-0 z-10",
				"flex flex-col items-center text-center pb-12 px-6",
				"transition-opacity duration-700",
				visible ? "opacity-100" : "opacity-0",
			].join(" ");

	return (
		<section className={wrapperClass} aria-label="Contact section">
			<div className="pointer-events-auto">
				{/* Section heading */}
				<p className="font-display text-xs tracking-[0.3em] uppercase text-[var(--color-neon-violet)] mb-4">
					{sectionTitle}
				</p>

				{/* CTA text */}
				<p className="font-display text-2xl lg:text-3xl font-light text-[var(--color-text-primary)] mb-6">
					{ctaText}
				</p>

				{/* Email — plain selectable text */}
				<a
					href={`mailto:${email}`}
					className="font-sans text-base lg:text-lg text-[var(--color-neon-cyan)] hover:underline"
					aria-label={`Send email to ${email}`}
				>
					{email}
				</a>

				{/* Social links */}
				{socials.length > 0 && (
					<nav
						className="mt-6 flex gap-4 justify-center"
						aria-label="Social media links"
					>
						{socials.map((social) => {
							const label =
								PLATFORM_LABELS[social.platform.toLowerCase()] ?? social.label;
							return (
								<a
									key={social.platform}
									href={social.url}
									target="_blank"
									rel="noopener noreferrer"
									className="font-sans text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
									aria-label={`Visit ${label} profile`}
								>
									{label}
								</a>
							);
						})}
					</nav>
				)}
			</div>
		</section>
	);
}
