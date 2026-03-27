/**
 * project-card.component.tsx
 *
 * Individual project card — title, description, tags, year, links, featured badge.
 * Pure Server Component. Unstyled in Phase 3 (browser defaults).
 */

import type { ProjectData } from "@cms/mod";

interface ProjectCardProps {
	project: ProjectData;
}

export function ProjectCard({ project }: ProjectCardProps) {
	const { title, description, tags, year, url, github, featured } = project;

	return (
		<article aria-label={title}>
			{featured ? <span>Featured</span> : null}
			<h3>{title}</h3>
			{year ? <p>{year}</p> : null}
			<p>{description}</p>
			{tags && tags.length > 0 ? (
				<ul aria-label="Technologies">
					{tags.map(({ tag, id }) => (
						<li key={id ?? tag}>{tag}</li>
					))}
				</ul>
			) : null}
			{url ? (
				<a href={url} aria-label={`${title} — live site`}>
					Live
				</a>
			) : null}
			{github ? (
				<a href={github} aria-label={`${title} — GitHub repository`}>
					GitHub
				</a>
			) : null}
		</article>
	);
}
