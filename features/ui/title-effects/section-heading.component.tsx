"use client";

/**
 * section-heading.component.tsx
 *
 * Client Component dispatcher: picks the correct title-effect component from
 * the CMS `titleEffect` variant. Client-only effects are lazy-loaded via
 * next/dynamic (requires "use client" for ssr: false to work).
 *
 * Usage:
 *   <SectionHeading level={2} id="about-heading" variant={titleEffect}>
 *     About
 *   </SectionHeading>
 */

import type { TitleEffectVariant } from "@cms/mod";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { GradientText } from "./gradient-text.component";

const TypewriterText = dynamic(
	() =>
		import("./typewriter-text.client.component").then((m) => ({
			default: m.TypewriterText,
		})),
	{ ssr: false },
);

const GlitchText = dynamic(
	() =>
		import("./glitch-text.client.component").then((m) => ({
			default: m.GlitchText,
		})),
	{ ssr: false },
);

const ShimmerText = dynamic(
	() =>
		import("./shimmer-text.client.component").then((m) => ({
			default: m.ShimmerText,
		})),
	{ ssr: false },
);

interface SectionHeadingProps {
	children: string;
	level?: 1 | 2 | 3;
	id?: string;
	variant?: TitleEffectVariant | string | null;
	className?: string;
}

function EffectWrapper({
	variant,
	children,
}: {
	variant: SectionHeadingProps["variant"];
	children: string;
}) {
	switch (variant) {
		case "gradient":
			return <GradientText>{children}</GradientText>;
		case "shimmer":
			return (
				<Suspense fallback={children}>
					<ShimmerText>{children}</ShimmerText>
				</Suspense>
			);
		case "glitch":
			return (
				<Suspense fallback={children}>
					<GlitchText>{children}</GlitchText>
				</Suspense>
			);
		case "typewriter":
			return (
				<Suspense fallback={children}>
					<TypewriterText>{children}</TypewriterText>
				</Suspense>
			);
		default:
			return <>{children}</>;
	}
}

export function SectionHeading({
	children,
	level = 2,
	id,
	variant,
	className,
}: SectionHeadingProps) {
	const Tag = `h${level}` as "h1" | "h2" | "h3";

	return (
		<Tag id={id} className={className}>
			<EffectWrapper variant={variant}>{children}</EffectWrapper>
		</Tag>
	);
}
