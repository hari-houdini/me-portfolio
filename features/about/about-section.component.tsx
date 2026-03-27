/**
 * about-section.component.tsx
 *
 * About section — bio (Lexical rich text serialised to paragraphs), skills list.
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * Unstyled in Phase 3 (browser defaults).
 */

import type { AboutData } from "@cms/mod";

interface AboutSectionProps {
	about: AboutData;
	sectionTitle?: string | null;
}

/**
 * Recursively extract text nodes from a Lexical content tree.
 * In Phase 3 the bio is rendered as plain paragraphs — rich formatting
 * (bold, links, lists) is serialised properly in a later phase.
 */
function extractParagraphs(root: AboutData["bio"]["root"]): string[] {
	const paragraphs: string[] = [];

	for (const child of root.children) {
		const node = child as Record<string, unknown>;
		if (node.type === "paragraph" || node.type === "heading") {
			const text = extractText(node);
			if (text) paragraphs.push(text);
		}
	}

	return paragraphs;
}

function extractText(node: Record<string, unknown>): string {
	if (typeof node.text === "string") return node.text;
	if (Array.isArray(node.children)) {
		return (node.children as Record<string, unknown>[])
			.map(extractText)
			.join("");
	}
	return "";
}

export function AboutSection({ about, sectionTitle }: AboutSectionProps) {
	const paragraphs = extractParagraphs(about.bio.root);

	return (
		<section aria-labelledby="about-heading">
			<h2 id="about-heading">{sectionTitle ?? "About"}</h2>
			<div>
				{paragraphs.map((text, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: static server-rendered list, order never changes
					<p key={i}>{text}</p>
				))}
			</div>
			{about.skills && about.skills.length > 0 ? (
				<ul aria-label="Skills">
					{about.skills.map(({ skill, id }) => (
						<li key={id ?? skill}>{skill}</li>
					))}
				</ul>
			) : null}
		</section>
	);
}
