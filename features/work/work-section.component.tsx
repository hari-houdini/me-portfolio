/**
 * work-section.component.tsx
 *
 * Work section — grid of project cards.
 * Pure Server Component. Styled via work-section.module.css.
 */

import type { ProjectData } from "@cms/mod";
import { ProjectCard } from "./project-card.component";
import styles from "./work-section.module.css";

interface WorkSectionProps {
	projects: ProjectData[];
	sectionTitle?: string | null;
}

export function WorkSection({ projects, sectionTitle }: WorkSectionProps) {
	return (
		<section
			id="work"
			className={styles.section}
			aria-labelledby="work-heading"
		>
			<div className={styles.container}>
				<h2 id="work-heading" className={styles.heading}>
					{sectionTitle ?? "Work"}
				</h2>
				{projects.length > 0 ? (
					<ul className={styles.projectList} aria-label="Projects">
						{projects.map((project) => (
							<li key={project.id}>
								<ProjectCard project={project} />
							</li>
						))}
					</ul>
				) : (
					<p className={styles.emptyState}>No projects to display.</p>
				)}
			</div>
		</section>
	);
}
