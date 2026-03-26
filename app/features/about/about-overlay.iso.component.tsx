/**
 * about-overlay.tsx — HTML content overlay for Section 2 (Galaxy Top-Down view)
 *
 * Displays the portfolio owner's bio, skills, and an optional photo.
 * The overlay fades in as the camera locks to the top-down position.
 *
 * The bio field is a Lexical rich-text document. For Phase 3, it is rendered
 * as plain text paragraphs extracted from the Lexical AST. A full Lexical
 * renderer can be wired in Phase 4 if needed.
 *
 * Accessibility:
 *  - Skills are rendered as a visually styled list with proper list semantics.
 *  - The photo has descriptive alt text from the CMS.
 */

import type { About, SiteConfig } from "~/services/cms/mod";

export interface AboutOverlayProps {
	about: About;
	siteConfig: SiteConfig;
	/** Opacity 0→1 driven by scroll position */
	visible?: boolean;
	isMobile?: boolean;
}

// ---------------------------------------------------------------------------
// Minimal Lexical text extractor
// ---------------------------------------------------------------------------

interface LexicalNode {
	type: string;
	text?: string;
	children?: LexicalNode[];
}

export function extractText(node: unknown): string {
	if (!node || typeof node !== "object") return "";
	const n = node as LexicalNode;
	if (n.type === "text" && typeof n.text === "string") return n.text;
	if (Array.isArray(n.children)) {
		return n.children
			.map(extractText)
			.join(n.type === "paragraph" ? "\n" : " ");
	}
	const root = (n as { root?: LexicalNode }).root;
	if (root) return extractText(root);
	return "";
}

export function AboutOverlay({
	about,
	siteConfig,
	visible = true,
	isMobile = false,
}: AboutOverlayProps) {
	const bioText = about.bio ? extractText(about.bio) : null;
	const sectionTitle = siteConfig.sectionTitles.about;

	const wrapperClass = isMobile
		? "px-6 py-16 max-w-2xl mx-auto"
		: [
				"pointer-events-none fixed inset-0 z-10 flex items-center justify-start",
				"pl-12 lg:pl-24",
				"transition-opacity duration-700",
				visible ? "opacity-100" : "opacity-0",
			].join(" ");

	return (
		<section className={wrapperClass} aria-label="About section">
			<div className="max-w-xl pointer-events-auto">
				{/* Section title */}
				<p className="font-display text-xs tracking-[0.3em] uppercase text-[var(--color-neon-cyan)] mb-4">
					{sectionTitle}
				</p>

				{/* Bio */}
				{bioText ? (
					<div className="space-y-4">
						{bioText.split("\n").map((paragraph) => (
							<p
								key={paragraph.slice(0, 40)}
								className="font-sans text-base lg:text-lg leading-relaxed text-[var(--color-text-primary)]"
							>
								{paragraph}
							</p>
						))}
					</div>
				) : (
					<p className="font-sans text-base text-[var(--color-text-muted)]">
						Bio coming soon.
					</p>
				)}

				{/* Skills */}
				{about.skills.length > 0 && (
					<div className="mt-8">
						<p className="font-sans text-xs tracking-[0.2em] uppercase text-[var(--color-text-muted)] mb-3">
							Technologies
						</p>
						<ul
							className="flex flex-wrap gap-2"
							aria-label="Skills and technologies"
						>
							{about.skills.map((skill) => (
								<li
									key={skill}
									className="px-3 py-1 text-xs font-sans rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] bg-[var(--color-surface-1)]"
								>
									{skill}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Photo */}
				{about.photo && (
					<img
						src={about.photo.sizes?.thumbnail?.url ?? about.photo.url}
						alt={about.photo.alt ?? "Portrait"}
						width={about.photo.sizes?.thumbnail?.width ?? 120}
						height={about.photo.sizes?.thumbnail?.height ?? 120}
						className="mt-6 rounded-full w-24 h-24 object-cover border-2 border-[var(--color-neon-cyan)]"
					/>
				)}
			</div>
		</section>
	);
}
