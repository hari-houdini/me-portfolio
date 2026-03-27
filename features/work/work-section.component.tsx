/**
 * work-section.component.tsx
 *
 * Work section — list of project cards.
 * Pure Server Component. Unstyled in Phase 3 (browser defaults).
 */

import type { ProjectData } from "@cms/mod";
import { ProjectCard } from "./project-card.component";

interface WorkSectionProps {
	projects: ProjectData[];
	sectionTitle?: string | null;
}

export function WorkSection({ projects, sectionTitle }: WorkSectionProps) {
	return (
		<section aria-labelledby="work-heading">
			<h2 id="work-heading">{sectionTitle ?? "Work"}</h2>
			{projects.length > 0 ? (
				<ul aria-label="Projects">
					{projects.map((project) => (
						<li key={project.id}>
							<ProjectCard project={project} />
						</li>
					))}
				</ul>
			) : (
				<p>No projects to display.</p>
			)}
		</section>
	);
}
