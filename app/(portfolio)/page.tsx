/**
 * app/(portfolio)/page.tsx
 *
 * Home page — async Server Component.
 * Fetches all CMS data via the Effect-ts service layer and renders the
 * accessible HTML shell. Section components are pure (not async) and
 * receive typed props.
 *
 * React.cache() deduplicates the data fetch so generateMetadata and the
 * default export share one Payload Local API call per request.
 *
 * Effect error handling: any CMS failure falls back to fallbackPageData so
 * the page always renders — never a 500 in production.
 */

import type { PageData } from "@cms/mod";
import { CmsService, CmsServiceLive } from "@cms/mod";
import { AboutSection } from "@features/about/mod";
import { CanvasPlaceholder } from "@features/canvas/mod";
import { ContactSection } from "@features/contact/mod";
import { HeroSection } from "@features/hero/mod";
import { WorkSection } from "@features/work/mod";
import { Effect } from "effect";
import type { Metadata } from "next";
import { cache } from "react";

// ---------------------------------------------------------------------------
// Fallback — used when the CMS is unreachable at request time
// ---------------------------------------------------------------------------

const fallbackPageData: PageData = {
	siteConfig: {
		id: 0,
		name: "Hari Houdini",
		tagline: "Creative Technologist",
		sectionTitles: {
			hero: "Hello, Universe",
			about: "About",
			work: "Work",
			contact: "Contact",
		},
		seo: {
			metaTitle: "Hari Houdini — Creative Technologist",
			metaDescription:
				"Portfolio of Hari Houdini — immersive 3D experiences built at the intersection of art and engineering.",
		},
	},
	about: {
		id: 0,
		bio: {
			root: {
				type: "root",
				children: [],
				direction: "ltr",
				format: "left",
				indent: 0,
				version: 1,
			},
		},
	},
	contact: {
		id: 0,
		email: "hello@harihoudini.dev",
		ctaText: "Get in touch",
	},
	projects: [],
};

// ---------------------------------------------------------------------------
// Data fetching — deduplicated within a single request via React.cache()
// ---------------------------------------------------------------------------

const getPageData = cache(() =>
	Effect.runPromise(
		Effect.gen(function* () {
			const cms = yield* CmsService;
			return yield* cms.getAllPageData();
		}).pipe(
			Effect.provide(CmsServiceLive),
			Effect.catchAll(() => Effect.succeed(fallbackPageData)),
		),
	),
);

// ---------------------------------------------------------------------------
// Metadata — reuses the same cached fetch as the page render
// ---------------------------------------------------------------------------

export async function generateMetadata(): Promise<Metadata> {
	const { siteConfig } = await getPageData();
	return {
		title: siteConfig.seo.metaTitle,
		description: siteConfig.seo.metaDescription,
	};
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function HomePage() {
	const data = await getPageData();
	const { siteConfig, about, contact, projects } = data;

	return (
		<>
			<a href="#main-content">Skip to content</a>
			<CanvasPlaceholder />
			<main id="main-content">
				<HeroSection siteConfig={siteConfig} />
				<AboutSection
					about={about}
					sectionTitle={siteConfig.sectionTitles?.about}
				/>
				<WorkSection
					projects={projects}
					sectionTitle={siteConfig.sectionTitles?.work}
				/>
				<ContactSection
					contact={contact}
					sectionTitle={siteConfig.sectionTitles?.contact}
				/>
			</main>
		</>
	);
}
