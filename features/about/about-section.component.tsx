/**
 * about-section.component.tsx
 *
 * About section — bio (Lexical rich text), skills list, optional portrait photo.
 * Pure Server Component: receives CMS props, renders semantic HTML.
 */

import type { AboutData } from "@cms/mod";
import { SectionHeading } from "@features/ui/mod";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";
import dynamic from "next/dynamic";
import { Suspense } from "react";
import styles from "./about-section.module.css";

const SectionBackground = dynamic(
	() =>
		import("@features/ui/backgrounds/section-background.client.component").then(
			(m) => ({ default: m.SectionBackground }),
		),
	{ ssr: false },
);

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
			{background && background !== "none" ? (
				<Suspense fallback={null}>
					<SectionBackground variant={background} />
				</Suspense>
			) : null}
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
