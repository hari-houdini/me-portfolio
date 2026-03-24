/**
 * project-card.tsx — individual project card component
 *
 * Displays a single project entry from the CMS with:
 *  - Title, description, technology tags, year
 *  - Optional thumbnail image
 *  - Links to live URL and GitHub
 *  - Featured badge when project.featured is true
 *
 * Styling: each card uses the LiquidGlass component to create a refractive
 * glass effect that reads naturally over the neon warp tunnel backdrop.
 *
 * Accessibility:
 *  - The card is an <article> with a heading and accessible links.
 *  - The featured badge is communicated to screen readers via aria-label.
 *  - External links have rel="noopener noreferrer".
 */

import { LiquidGlass } from "~/features/nav/mod";
import type { Project } from "~/services/cms/mod";

export interface ProjectCardProps {
	project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
	const { title, description, tags, year, thumbnail, url, github, featured } =
		project;

	return (
		<LiquidGlass
			className="flex flex-col overflow-hidden"
			radius={12}
			frost={0.07}
			blur={8}
			scale={-120}
			gOffset={6}
			bOffset={12}
		>
			<article className="relative flex flex-col h-full">
				{/* Featured badge */}
				{featured && (
					<mark className="absolute top-3 right-3 px-2 py-0.5 text-xs font-sans font-medium rounded-full bg-[var(--color-neon-cyan)] text-black z-10 no-underline">
						<span className="sr-only">Featured project: </span>
						Featured
					</mark>
				)}

				{/* Thumbnail */}
				{thumbnail && (
					<div className="w-full aspect-video overflow-hidden bg-[var(--color-surface-2)]">
						<img
							src={thumbnail.sizes?.thumbnail?.url ?? thumbnail.url}
							alt={thumbnail.alt ?? `${title} screenshot`}
							width={thumbnail.sizes?.thumbnail?.width ?? 400}
							height={thumbnail.sizes?.thumbnail?.height ?? 225}
							className="w-full h-full object-cover"
							loading="lazy"
						/>
					</div>
				)}

				{/* Content */}
				<div className="flex flex-col flex-1 p-5 gap-3">
					{/* Header row */}
					<div className="flex items-start justify-between gap-2">
						<h3 className="font-display font-semibold text-base text-[var(--color-text-primary)] leading-tight">
							{title}
						</h3>
						{year && (
							<span className="font-sans text-xs text-[var(--color-text-subtle)] shrink-0 mt-0.5">
								{year}
							</span>
						)}
					</div>

					{/* Description */}
					<p className="font-sans text-sm text-[var(--color-text-muted)] leading-relaxed flex-1">
						{description}
					</p>

					{/* Technology tags */}
					{tags.length > 0 && (
						<ul
							className="flex flex-wrap gap-1.5"
							aria-label="Technologies used"
						>
							{tags.map((tag) => (
								<li
									key={tag}
									className="px-2 py-0.5 text-xs font-sans rounded border border-[var(--color-border)] text-[var(--color-text-subtle)]"
								>
									{tag}
								</li>
							))}
						</ul>
					)}

					{/* Links */}
					{(url || github) && (
						<div className="flex gap-3 mt-auto pt-2 border-t border-[var(--color-border)]/50">
							{url && (
								<a
									href={url}
									target="_blank"
									rel="noopener noreferrer"
									className="font-sans text-xs text-[var(--color-neon-cyan)] hover:underline"
									aria-label={`Visit ${title} live site`}
								>
									Live &rarr;
								</a>
							)}
							{github && (
								<a
									href={github}
									target="_blank"
									rel="noopener noreferrer"
									className="font-sans text-xs text-[var(--color-text-muted)] hover:underline"
									aria-label={`View ${title} on GitHub`}
								>
									GitHub &rarr;
								</a>
							)}
						</div>
					)}
				</div>
			</article>
		</LiquidGlass>
	);
}
