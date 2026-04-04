"use client";

/**
 * rich-text-label.tsx
 *
 * Custom label component for richText fields in Payload admin.
 *
 * Payload renders <label htmlFor="field-body"> by default, but the Lexical
 * editor mounts as <div contenteditable> — a non-labelable element. This
 * triggers a browser warning: "Incorrect use of <label for=FORM_ELEMENT>".
 *
 * Rendering as <span> instead of <label> eliminates the invalid htmlFor
 * association while preserving Payload's admin label styling via the
 * built-in "field-label" CSS class.
 */

interface RichTextLabelProps {
	label?: string | Record<string, string> | false | null;
	required?: boolean;
}

function resolveLabel(label: RichTextLabelProps["label"]): string | null {
	if (!label) return null;
	if (typeof label === "string") return label;
	// Payload i18n label — prefer English, fall back to first key
	return label.en ?? Object.values(label)[0] ?? null;
}

export function RichTextLabel({ label, required }: RichTextLabelProps) {
	const text = resolveLabel(label);
	return (
		<span className="field-label">
			{text}
			{required ? (
				<span className="required" aria-hidden="true">
					{" "}
					*
				</span>
			) : null}
		</span>
	);
}
