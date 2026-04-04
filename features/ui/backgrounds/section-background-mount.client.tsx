"use client";

/**
 * section-background-mount.client.tsx
 *
 * Thin "use client" wrapper that lazy-loads SectionBackground with ssr: false.
 *
 * Purpose: section components (Hero, About, Work, Contact) are Server Components.
 * next/dynamic with { ssr: false } is only valid inside "use client" files. Rather
 * than making every section a Client Component, this wrapper owns the dynamic import
 * so sections stay RSC and can render async children (e.g. RichText, LexicalRenderer).
 *
 * Usage:
 *   <SectionBackgroundMount variant={heroStyle?.background} />
 */

import dynamic from "next/dynamic";
import { Suspense } from "react";

const SectionBackground = dynamic(
	() =>
		import("./section-background.client.component").then((m) => ({
			default: m.SectionBackground,
		})),
	{ ssr: false },
);

interface SectionBackgroundMountProps {
	variant: string | null | undefined;
}

export function SectionBackgroundMount({
	variant,
}: SectionBackgroundMountProps) {
	if (!variant || variant === "none") return null;
	return (
		<Suspense fallback={null}>
			<SectionBackground variant={variant} />
		</Suspense>
	);
}
