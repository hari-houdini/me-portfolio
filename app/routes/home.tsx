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
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AboutOverlay, extractText } from "~/features/about/mod";
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

/**
 * Section anchor scroll positions (0→1 of total scrollable height).
 * These must align with SECTION_OFFSETS in scroll-section.util.ts.
 */
const SNAP_ANCHORS = [0, 0.33, 0.66, 1] as const;

/**
 * How much past a section boundary (in normalised offset units) the user
 * must scroll before the snap fires. Too low = snaps too eagerly;
 * too high = snap feels unresponsive. 0.12 = ~12% into the next section.
 */
const SNAP_THRESHOLD = 0.12;

/**
 * useScrollSnap attaches GSAP's magnetic snap to drei's internal scroll element.
 *
 * The scrollEl parameter must be the element returned by drei's useScroll().el —
 * the overflow:scroll div that ScrollControls injects into the canvas DOM.
 * The outer container div (overflow:hidden, height:100vh) never scrolls and
 * must NOT be used as trigger/scroller here.
 */
function useScrollSnap(scrollEl: HTMLElement | null, enabled: boolean) {
	useEffect(() => {
		if (!enabled || !scrollEl) return;

		// Guard against the unmount-before-import race: if the component unmounts
		// while the dynamic import is in flight, the teardown runs first (finding
		// cleanup undefined), then the import resolves and would create a
		// ScrollTrigger that is never killed. isMounted prevents late creation.
		let isMounted = true;
		let cleanup: (() => void) | undefined;

		import("gsap")
			.then(({ gsap }) =>
				import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
					if (!isMounted) return;

					gsap.registerPlugin(ScrollTrigger);

					const trigger = ScrollTrigger.create({
						trigger: scrollEl,
						scroller: scrollEl,
						start: "top top",
						end: "bottom bottom",
						snap: {
							snapTo: (rawValue: number) => {
								for (let i = 0; i < SNAP_ANCHORS.length - 1; i++) {
									const lo = SNAP_ANCHORS[i];
									const hi = SNAP_ANCHORS[i + 1];
									if (rawValue >= lo && rawValue <= hi) {
										const mid = lo + (hi - lo) * SNAP_THRESHOLD;
										return rawValue < mid ? lo : hi;
									}
								}
								return rawValue;
							},
							duration: { min: 0.3, max: 0.6 },
							delay: 0.15,
							ease: "power2.inOut",
						},
					});

					cleanup = () => {
						trigger.kill();
						for (const t of ScrollTrigger.getAll()) t.kill();
					};
				}),
			)
			.catch(() => {
				// GSAP failed to load — degrade gracefully (no snap, scroll still works)
			});

		return () => {
			isMounted = false;
			cleanup?.();
		};
	}, [scrollEl, enabled]);
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

	// drei's internal scroll element — set once via the Experience onScrollElement
	// callback. ScrollTrigger must observe this element, not the outer container.
	const [snapEl, setSnapEl] = useState<HTMLElement | null>(null);
	const handleScrollElement = useCallback((el: HTMLElement) => {
		setSnapEl(el);
	}, []);

	// Track scroll progress for overlay visibility
	const [scrollOffset, setScrollOffset] = useState(0);
	const handleScrollChange = useCallback((offset: number) => {
		setScrollOffset(offset);
	}, []);

	// Section visibility — aligned with SECTION_OFFSETS (0, 0.33, 0.66).
	// Previously used Math.round(offset * 2) which has thresholds at 0.25/0.75,
	// misaligned with the snap anchors at 0.33/0.66.
	const isSection2 = scrollOffset >= 0.33 && scrollOffset < 0.66;
	const isSection3 = scrollOffset >= 0.66;

	// Enable GSAP snap only when drei's scroll element is available and 3D capable
	useScrollSnap(snapEl, is3DCapable);

	return (
		<>
			{/* ----------------------------------------------------------------
			    Visually-hidden but screen-reader-accessible content.
			    Always present regardless of 3D canvas support.
			    ---------------------------------------------------------------- */}
			<div className="sr-only" aria-hidden="false">
				<h1>{siteConfig.name}</h1>
				<p>{siteConfig.tagline}</p>
				<p>{about.bio ? extractText(about.bio) : ""}</p>
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
				<div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
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
							onScrollElement={handleScrollElement}
						/>
					</Suspense>

					{/* HTML overlays layered above the canvas */}
					<HeroOverlay
						siteConfig={siteConfig}
						scrollOffset={scrollOffset}
						introComplete
						isMobile={false}
					/>

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
