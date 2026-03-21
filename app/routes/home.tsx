/**
 * home.tsx — the root "/" route
 *
 * This is the SSR entry point for the portfolio. The loader fetches all CMS
 * page data concurrently using the Effect-ts service layer. If the CMS is
 * unavailable, the loader falls back to hardcoded defaults so the page
 * still renders correctly during local development or CMS outages.
 *
 * The component itself is intentionally minimal in Phase 1 — it renders the
 * portfolio owner's name and tagline as a proof of the data flow. The full
 * three-section 3D experience is wired up in Phase 3.
 */

import { Effect } from "effect";
import type { PageData } from "~/services/cms/mod";
import { CmsService } from "~/services/cms/mod";
import { AppLayer } from "~/services/runtime";
import type { Route } from "./+types/home";

// ---------------------------------------------------------------------------
// Fallback data — used when the CMS is unavailable
// ---------------------------------------------------------------------------

const fallbackPageData: PageData = {
	siteConfig: {
		name: "Hari Houdini",
		tagline: "Creative Technologist",
		subtitle: null,
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
			ogImage: null,
		},
	},
	about: {
		bio: null,
		skills: [],
		photo: null,
	},
	contact: {
		email: "hello@harihoudini.dev",
		ctaText: "Let's work together",
		socials: [],
	},
	projects: [],
};

// ---------------------------------------------------------------------------
// Loader — server-side data fetching
// ---------------------------------------------------------------------------

export const loader = async (_args: Route.LoaderArgs): Promise<PageData> => {
	const program = Effect.gen(function* () {
		const cms = yield* CmsService;
		return yield* cms.getAllPageData();
	}).pipe(
		Effect.provide(AppLayer),
		// If the CMS is unreachable during development or build, use defaults.
		// In production the CMS should always be available; errors are logged
		// to the edge runtime console for investigation.
		Effect.catchAll((error) => {
			console.error("[home loader] CMS fetch failed:", error._tag, error);
			return Effect.succeed(fallbackPageData);
		}),
	);

	return Effect.runPromise(program);
};

// ---------------------------------------------------------------------------
// Meta tags — driven by CMS site-config
// ---------------------------------------------------------------------------

export function meta({ data }: Route.MetaArgs) {
	const seo = data?.seo ?? fallbackPageData.siteConfig.seo;
	return [
		{ title: seo.metaTitle },
		{ name: "description", content: seo.metaDescription },
		// Open Graph
		{ property: "og:title", content: seo.metaTitle },
		{ property: "og:description", content: seo.metaDescription },
		{ property: "og:type", content: "website" },
		...(seo.ogImage
			? [{ property: "og:image", content: seo.ogImage.url }]
			: []),
	];
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

/**
 * Phase 1 placeholder — replaced by the full 3D experience in Phase 3.
 * Renders the CMS-driven name and tagline as an accessible text fallback.
 * This content is also used by the mobile/reduced-motion fallback path
 * in Phase 4.
 */
export default function Home({ loaderData }: Route.ComponentProps) {
	const { name, tagline } = loaderData.siteConfig;

	return (
		<main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
			<h1 className="text-5xl font-bold tracking-tight">{name}</h1>
			<p className="mt-4 text-xl text-zinc-400">{tagline}</p>
			<p className="mt-8 text-sm text-zinc-600">
				Phase 1 scaffold — 3D experience arrives in Phase 3
			</p>
		</main>
	);
}
