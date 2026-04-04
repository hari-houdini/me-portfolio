/**
 * about-section.component.tsx
 *
 * Pure Server Component: receives CMS props, renders semantic HTML.
 * RichText / LexicalRenderer are async RSCs — this component must stay a Server
 * Component so they can be composed without "async Client Component" errors.
 * SectionBackgroundMount (client wrapper) handles the lazy Three.js canvas.
 */

import type { AboutData } from "@cms/mod";
import { SectionBackgroundMount } from "@features/ui/backgrounds/section-background-mount.client";
import { SectionHeading } from "@features/ui/mod";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";
import styles from "./about-section.module.css";

interface AboutSectionProps {
	about: AboutData;
	sectionTitle?: string | null;
}

export function AboutSection({ about, sectionTitle }: AboutSectionProps) {
	const background = about.aboutStyle?.background;
	const titleEffect = about.aboutStyle?.titleEffect;

	return (
		<section
			id="about"
			className={styles.section}
			aria-labelledby="about-heading"
		>
			<SectionBackgroundMount variant={background} />
			<div className={styles.container}>
				<SectionHeading
					level={2}
					id="about-heading"
					variant={titleEffect}
					className={styles.heading}
				>
					{sectionTitle ?? "About"}
				</SectionHeading>
				<div className={styles.bio}>
					<RichText data={about.bio as unknown as SerializedEditorState} />
				</div>
				{about.skills && about.skills.length > 0 ? (
					<ul className={styles.skills} aria-label="Skills">
						{about.skills.map(({ skill, id }) => (
							<li key={id ?? skill} className={styles.skill}>
								{skill}
							</li>
						))}
					</ul>
				) : null}
			</div>
		</section>
	);
}
