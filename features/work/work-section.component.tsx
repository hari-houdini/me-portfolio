"use client";

/**
 * work-section.component.tsx
 *
 * Work section — grid of project cards.
 * Client Component (required for next/dynamic ssr: false on SectionBackground).
 * Receives CMS props from the parent RSC page.
 */

import type { ProjectData, WorkConfigData } from "@cms/mod";
import { SectionHeading } from "@features/ui/mod";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import { ProjectCard } from "./project-card.component";
import styles from "./work-section.module.css";

const SectionBackground = dynamic(
	() =>
		import("@features/ui/backgrounds/section-background.client.component").then(
			(m) => ({ default: m.SectionBackground }),
		),
	{ ssr: false },
);

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
			{background && background !== "none" ? (
				<Suspense fallback={null}>
					<SectionBackground variant={background} />
				</Suspense>
			) : null}
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
