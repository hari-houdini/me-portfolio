/**
 * work-overlay.tsx — HTML content overlay for Section 3 (Cyberpunk City view)
 *
 * Displays the project grid above the city scene. Featured projects appear
 * first, followed by the rest ordered by the CMS `order` field.
 *
 * The overlay is a scrollable panel positioned to the right side of the
 * viewport — the left side of the city scene remains visible.
 */

import type { Project, SiteConfig } from "~/services/cms/mod";
import { ProjectCard } from "./project-card";

export interface WorkOverlayProps {
	projects: Project[];
	siteConfig: SiteConfig;
	visible?: boolean;
	isMobile?: boolean;
}

function sortProjects(projects: Project[]): Project[] {
	return [...projects].sort((a, b) => {
		// Featured first
		if (a.featured && !b.featured) return -1;
		if (!a.featured && b.featured) return 1;
		// Then by CMS order
		const aOrder = a.order ?? 999;
		const bOrder = b.order ?? 999;
		return aOrder - bOrder;
	});
}

export function WorkOverlay({
	projects,
	siteConfig,
	visible = true,
	isMobile = false,
}: WorkOverlayProps) {
	const sorted = sortProjects(projects);
	const sectionTitle = siteConfig.sectionTitles.work;

	const wrapperClass = isMobile
		? "px-6 py-16"
		: [
				"pointer-events-none fixed top-0 right-0 bottom-0 z-10 w-full max-w-lg",
				"flex flex-col pt-12 pr-6 lg:pr-12 overflow-y-auto",
				"transition-opacity duration-700",
				visible ? "opacity-100" : "opacity-0",
			].join(" ");

	return (
		<section className={wrapperClass} aria-label="Work section">
			<div className="pointer-events-auto">
				{/* Section heading */}
				<p className="font-display text-xs tracking-[0.3em] uppercase text-[var(--color-neon-pink)] mb-6">
					{sectionTitle}
				</p>

				{sorted.length === 0 ? (
					<p className="font-sans text-sm text-[var(--color-text-muted)]">
						Projects coming soon.
					</p>
				) : (
					<ul className="flex flex-col gap-4" aria-label="Project list">
						{sorted.map((project) => (
							<li key={project.id}>
								<ProjectCard project={project} />
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
