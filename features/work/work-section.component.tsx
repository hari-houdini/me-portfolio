/**
 * work-section.component.tsx
 *
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * SectionBackgroundMount (client wrapper) handles the lazy Three.js canvas.
 */

import type { ProjectData, WorkConfigData } from "@cms/mod";
import { SectionBackgroundMount } from "@features/ui/backgrounds/section-background-mount.client";
import { SectionHeading } from "@features/ui/mod";
import { ProjectCard } from "./project-card.component";
import styles from "./work-section.module.css";

interface WorkSectionProps {
	projects: ProjectData[];
	sectionTitle?: string | null;
	workConfig?: WorkConfigData;
}

export function WorkSection({
	projects,
	sectionTitle,
	workConfig,
}: WorkSectionProps) {
	const background = workConfig?.workStyle?.background;
	const titleEffect = workConfig?.workStyle?.titleEffect;

	return (
		<section
			id="work"
			className={styles.section}
			aria-labelledby="work-heading"
		>
			<SectionBackgroundMount variant={background} />
			<div className={styles.container}>
				<SectionHeading
					level={2}
					id="work-heading"
					variant={titleEffect}
					className={styles.heading}
				>
					{sectionTitle ?? "Work"}
				</SectionHeading>
				{projects.length > 0 ? (
					<ul className={styles.projectList} aria-label="Projects">
						{projects.map((project) => (
							<li key={project.id}>
								<ProjectCard
									project={project}
									cardStyle={workConfig?.workStyle?.projectCardStyle ?? "glow"}
								/>
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
