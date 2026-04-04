"use client";

/**
 * project-card.component.tsx
 *
 * Individual project card — thumbnail, title, year, description, tags, links.
 * Client Component (required for next/dynamic ssr: false on card variants).
 *
 * cardStyle selects the hover/interaction variant from features/ui/cards.
 */

import type {
	MediaObject,
	ProjectCardStyle,
	ProjectData,
	TagData,
} from "@cms/mod";
import { FlipCard } from "@features/ui/cards/flip-card.component";
import { GlassmorphismCard } from "@features/ui/cards/glassmorphism-card.component";
import dynamic from "next/dynamic";
import Image from "next/image";
import type { ReactNode } from "react";
import styles from "./work-section.module.css";

const GlowCard = dynamic(
	() =>
		import("@features/ui/cards/glow-card.client.component").then((m) => ({
			default: m.GlowCard,
		})),
	{ ssr: false, loading: () => <div className={styles.card} /> },
);
const SpotlightCard = dynamic(
	() =>
		import("@features/ui/cards/spotlight-card.client.component").then((m) => ({
			default: m.SpotlightCard,
		})),
	{ ssr: false, loading: () => <div className={styles.card} /> },
);
const TiltCard = dynamic(
	() =>
		import("@features/ui/cards/tilt-card.client.component").then((m) => ({
			default: m.TiltCard,
		})),
	{ ssr: false, loading: () => <div className={styles.card} /> },
);
const BorderBeamCard = dynamic(
	() =>
		import("@features/ui/cards/border-beam-card.client.component").then(
			(m) => ({ default: m.BorderBeamCard }),
		),
	{ ssr: false, loading: () => <div className={styles.card} /> },
);

interface ProjectCardProps {
	project: ProjectData;
	cardStyle?: ProjectCardStyle | string | null;
}

function isMediumObject(value: unknown): value is MediaObject {
	return (
		typeof value === "object" &&
		value !== null &&
		"url" in value &&
		typeof (value as MediaObject).url === "string"
	);
}

function CardBody({ project }: { project: ProjectData }) {
	const { title, description, tags, year, url, github, featured, thumbnail } =
		project;
	const media = isMediumObject(thumbnail) ? thumbnail : null;

	return (
		<article aria-label={title}>
			{media?.url ? (
				<div className={styles.cardImage}>
					<Image
						src={media.url}
						alt={media.alt ?? title}
						width={media.width ?? 400}
						height={media.height ?? 300}
						className={styles.thumbnail}
					/>
				</div>
			) : null}
			<div className={styles.cardBody}>
				{featured ? (
					<span className={styles.featuredBadge}>Featured</span>
				) : null}
				<h3 className={styles.cardTitle}>{title}</h3>
				{year ? (
					<time className={styles.cardYear} dateTime={String(year)}>
						{year}
					</time>
				) : null}
				<p className={styles.cardDescription}>{description}</p>
				{tags && tags.length > 0 ? (
					<ul className={styles.tagList} aria-label="Technologies">
						{tags
							.filter(
								(t): t is TagData => typeof t === "object" && "label" in t,
							)
							.map((tag) => (
								<li key={tag.id} className={styles.tag}>
									{tag.label}
								</li>
							))}
					</ul>
				) : null}
				<div className={styles.cardLinks}>
					{url ? (
						<a
							href={url}
							aria-label={`${title} — live site`}
							className={styles.cardLink}
							rel="noopener noreferrer"
						>
							Live
						</a>
					) : null}
					{github ? (
						<a
							href={github}
							aria-label={`${title} — GitHub repository`}
							className={styles.cardLink}
							rel="noopener noreferrer"
						>
							GitHub
						</a>
					) : null}
				</div>
			</div>
		</article>
	);
}

function CardWrapper({
	cardStyle,
	children,
}: {
	cardStyle: ProjectCardProps["cardStyle"];
	children: ReactNode;
}) {
	switch (cardStyle) {
		case "spotlight":
			return <SpotlightCard>{children}</SpotlightCard>;
		case "tilt":
			return <TiltCard>{children}</TiltCard>;
		case "flip":
			return <FlipCard front={children} back={children} />;
		case "glassmorphism":
			return <GlassmorphismCard>{children}</GlassmorphismCard>;
		case "border-beam":
			return <BorderBeamCard>{children}</BorderBeamCard>;
		default:
			// "glow" is the default
			return <GlowCard>{children}</GlowCard>;
	}
}

export function ProjectCard({ project, cardStyle = "glow" }: ProjectCardProps) {
	return (
		<CardWrapper cardStyle={cardStyle}>
			<CardBody project={project} />
		</CardWrapper>
	);
}
