/**
 * home.tsx — the root "/" route
 *
 * Architecture:
 *  - SSR loader fetches all CMS page data concurrently via Effect-ts.
 *  - On the server: renders the full HTML shell with all text content
 *    (name, bio, project titles, contact) for fast FCP and SEO.
 *  - On the client: lazily loads the Three.js Experience component so it
 *    is entirely off the critical rendering path.
 *  - WebGL / canvas is conditionally rendered — skipped on mobile (<1024px)
 *    and when prefers-reduced-motion is set.
 *  - GSAP ScrollTrigger provides magnetic section snap at the page level.
 *  - drei ScrollControls inside the canvas drives camera interpolation.
 */

import { Effect } from "effect";
import {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { AboutOverlay } from "~/features/about/mod";
import { AudioToggle } from "~/features/audio/mod";
import { ContactOverlay } from "~/features/contact/mod";
import { HeroOverlay } from "~/features/hero/mod";
import { WorkOverlay } from "~/features/work/mod";
import type { PageData } from "~/services/cms/mod";
import { CmsService } from "~/services/cms/mod";
import { AppLayer } from "~/services/runtime";
import type { Route } from "./+types/home";

// ---------------------------------------------------------------------------
// Lazy load the Three.js canvas — never imported on the server
// ---------------------------------------------------------------------------

const Experience = lazy(() =>
	import("~/features/experience/mod").then((m) => ({
		default: m.Experience,
	})),
);

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
		Effect.catchAll((error) => {
			console.error("[home loader] CMS fetch failed:", error._tag, error);
			return Effect.succeed(fallbackPageData);
		}),
	);

	return Effect.runPromise(program);
};

// ---------------------------------------------------------------------------
// Meta tags
// ---------------------------------------------------------------------------

export function meta({ data }: Route.MetaArgs) {
	const seo = data?.siteConfig.seo ?? fallbackPageData.siteConfig.seo;
	return [
		{ title: seo.metaTitle },
		{ name: "description", content: seo.metaDescription },
		{ property: "og:title", content: seo.metaTitle },
		{ property: "og:description", content: seo.metaDescription },
		{ property: "og:type", content: "website" },
		...(seo.ogImage
			? [{ property: "og:image", content: seo.ogImage.url }]
			: []),
	];
}

// ---------------------------------------------------------------------------
// GSAP ScrollTrigger magnetic snap
// ---------------------------------------------------------------------------

/** Section boundary offsets (0→1) — must match SECTION_OFFSETS in scroll-section.ts */
const SNAP_OFFSETS = [0, 0.33, 0.66, 1];

function useScrollSnap(
	containerRef: React.RefObject<HTMLElement | null>,
	enabled: boolean,
) {
	useEffect(() => {
		if (!enabled || !containerRef.current) return;

		// Dynamically import GSAP to keep it off the SSR critical path
		let cleanup: (() => void) | undefined;

		import("gsap")
			.then(({ gsap }) =>
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					gsap.registerPlugin(ScrollTrigger);

					const container = containerRef.current;
					if (!container) return;

					const triggers = SNAP_OFFSETS.slice(0, -1).map((offset, i) => {
						const nextOffset = SNAP_OFFSETS[i + 1];
						return ScrollTrigger.create({
							trigger: container,
							start: `${offset * 100}% top`,
							end: `${nextOffset * 100}% top`,
							snap: {
								snapTo: [0, 1],
								duration: { min: 0.2, max: 0.5 },
								delay: 0.05,
								ease: "power1.inOut",
							},
						});
					});

					cleanup = () => {
						for (const trigger of triggers) trigger.kill();
						for (const t of ScrollTrigger.getAll()) t.kill();
					};
				}),
			)
			.catch(() => {
				// GSAP failed to load — degrade gracefully (no snap, scroll still works)
			});

		return () => {
			cleanup?.();
		};
	}, [containerRef, enabled]);
}

// ---------------------------------------------------------------------------
// Device detection helpers
// ---------------------------------------------------------------------------

function useIs3DCapable() {
	const [capable, setCapable] = useState(false);

	useEffect(() => {
		// Run only on client after hydration
		const isWide = window.innerWidth >= 1024;
		const prefersReduced = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;

		// Check WebGL2 support
		let hasWebGL = false;
		try {
			const canvas = document.createElement("canvas");
			hasWebGL = !!canvas.getContext("webgl2");
		} catch {
			hasWebGL = false;
		}

		setCapable(isWide && !prefersReduced && hasWebGL);
	}, []);

	return capable;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function Home({ loaderData }: Route.ComponentProps) {
	const { siteConfig, about, contact, projects } = loaderData;
	const is3DCapable = useIs3DCapable();
	const containerRef = useRef<HTMLDivElement>(null);

	// Track scroll progress for overlay visibility
	const [scrollOffset, setScrollOffset] = useState(0);
	const handleScrollChange = useCallback((offset: number) => {
		setScrollOffset(offset);
	}, []);

	// Section visibility thresholds (per section's scroll range 0→1)
	const section = Math.round(scrollOffset * 2); // 0, 1, or 2
	const isSection2 = section === 1;
	const isSection3 = section === 2;

	// Enable GSAP snap only when canvas is mounted and 3D capable
	useScrollSnap(containerRef, is3DCapable);

	return (
		<>
			{/* ----------------------------------------------------------------
			    Visually-hidden but screen-reader-accessible content.
			    Always present regardless of 3D canvas support.
			    ---------------------------------------------------------------- */}
			<div className="sr-only" aria-hidden="false">
				<h1>{siteConfig.name}</h1>
				<p>{siteConfig.tagline}</p>
				<p>
					{typeof about.bio === "object" && about.bio !== null
						? JSON.stringify(about.bio)
						: ""}
				</p>
				<ul>
					{projects.map((p) => (
						<li key={p.id}>{p.title}</li>
					))}
				</ul>
				<p>{contact.email}</p>
			</div>

			{/* ----------------------------------------------------------------
			    3D Experience — desktop with WebGL2 support only
			    ---------------------------------------------------------------- */}
			{is3DCapable ? (
				<div
					ref={containerRef}
					style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
				>
					<Suspense
						fallback={
							<div className="fixed inset-0 flex items-center justify-center bg-[var(--color-void)]">
								<p className="font-display text-sm text-[var(--color-text-subtle)] tracking-widest uppercase">
									Loading experience…
								</p>
							</div>
						}
					>
						<Experience
							siteConfig={siteConfig}
							about={about}
							contact={contact}
							projects={projects}
							onScrollChange={handleScrollChange}
						/>
					</Suspense>

					{/* HTML overlays layered above the canvas */}
					<HeroOverlay siteConfig={siteConfig} introComplete isMobile={false} />

					<div
						className="transition-opacity duration-700"
						style={{
							opacity: isSection2 ? 1 : 0,
							pointerEvents: isSection2 ? "auto" : "none",
						}}
					>
						<AboutOverlay
							about={about}
							siteConfig={siteConfig}
							visible={isSection2}
						/>
					</div>

					<div
						className="transition-opacity duration-700"
						style={{
							opacity: isSection3 ? 1 : 0,
							pointerEvents: isSection3 ? "auto" : "none",
						}}
					>
						<WorkOverlay
							projects={projects}
							siteConfig={siteConfig}
							visible={isSection3}
						/>
						<ContactOverlay
							contact={contact}
							siteConfig={siteConfig}
							visible={isSection3}
						/>
					</div>

					{/* Audio toggle — only visible in city section */}
					{isSection3 && <AudioToggle />}
				</div>
			) : (
				/* ----------------------------------------------------------------
				   Mobile / no-WebGL fallback — standard document flow
				   ---------------------------------------------------------------- */
				<main
					className="min-h-screen bg-gradient-to-b from-[var(--color-void)] via-[var(--color-deep-navy)] to-[#050520]"
					aria-label="Portfolio — mobile view"
				>
					<HeroOverlay siteConfig={siteConfig} introComplete isMobile />

					<AboutOverlay
						about={about}
						siteConfig={siteConfig}
						visible
						isMobile
					/>

					<WorkOverlay
						projects={projects}
						siteConfig={siteConfig}
						visible
						isMobile
					/>

					<ContactOverlay
						contact={contact}
						siteConfig={siteConfig}
						visible
						isMobile
					/>
				</main>
			)}
		</>
	);
}
