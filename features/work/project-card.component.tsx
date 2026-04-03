/**
 * project-card.component.tsx
 *
 * Individual project card — thumbnail, title, year, description, tags, links.
 * Pure Server Component. Renders the thumbnail via next/image when a URL is
 * available from the Payload Media relation.
 */

import type { MediaObject, ProjectData, TagData } from "@cms/mod";
import Image from "next/image";
import styles from "./work-section.module.css";

interface ProjectCardProps {
	project: ProjectData;
}

function isMediumObject(value: unknown): value is MediaObject {
	return (
		typeof value === "object" &&
		value !== null &&
		"url" in value &&
		typeof (value as MediaObject).url === "string"
	);
}

export function ProjectCard({ project }: ProjectCardProps) {
	const { title, description, tags, year, url, github, featured, thumbnail } =
		project;

	const media = isMediumObject(thumbnail) ? thumbnail : null;

	return (
		<article className={styles.card} aria-label={title}>
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
