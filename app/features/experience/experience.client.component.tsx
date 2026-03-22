/**
 * experience.client.component.tsx — root Three.js canvas and scene orchestrator
 *
 * This is the single entry point for all 3D rendering. It:
 *  1. Renders a fixed-position <Canvas> that covers the viewport
 *  2. Wraps everything in drei's <ScrollControls> for scroll-driven animation
 *  3. Mounts the <CameraRig> which drives camera along the bezier path
 *  4. Renders both scenes (galaxy + warp) in a single scene graph — opacity
 *     transitions between them are driven by scroll progress
 *  5. Applies the post-processing effect stack via <PostFx>
 *
 * Scroll architecture:
 *  ScrollControls creates a private internal <div> (scroll.el) that it scrolls
 *  by setting scrollTop directly — it intercepts all wheel events on the canvas.
 *  This element is surfaced to home.tsx via onScrollElReady() so GSAP
 *  ScrollTrigger can watch the correct scroller (not the page / window).
 *
 * SSR safety:
 *  This file is imported via React.lazy() in home.tsx. The lazy boundary
 *  ensures Three.js never instantiates on the server.
 */

"use client";

import { ScrollControls, useScroll } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState } from "react";
import { GalaxyScene } from "~/features/galaxy/mod";
import { WarpScene } from "~/features/warp/mod";
import type { About, Contact, Project, SiteConfig } from "~/services/cms/mod";
import { CameraRig } from "./camera-rig.client.component";
import { PostFx } from "./post-fx.client.component";
import { SECTION_COUNT } from "./scroll-section.util";

// ---------------------------------------------------------------------------
// Inner scene — reads scroll state from ScrollControls context
// ---------------------------------------------------------------------------

function SceneContent({
	onScrollChange,
	onScrollElReady,
}: {
	onScrollChange: (offset: number) => void;
	/**
	 * Called once with ScrollControls' internal scroll DOM element.
	 * GSAP ScrollTrigger must watch this element (not the page/window)
	 * because ScrollControls intercepts wheel events internally and
	 * sets scrollTop on this div directly — the window never scrolls.
	 */
	onScrollElReady?: (el: HTMLElement) => void;
}) {
	const scroll = useScroll();
	const rafRef = useRef<number>(0);

	// Surface scroll.el to home.tsx exactly once after mount.
	// scroll.el is the ScrollControls div — GSAP must use it as its scroller.
	const elReportedRef = useRef(false);
	if (!elReportedRef.current && scroll.el) {
		elReportedRef.current = true;
		onScrollElReady?.(scroll.el);
	}

	// Propagate scroll offset to parent on every frame for overlay positioning
	// and post-FX parameterisation. useFrame is not available outside Canvas
	// so we use a rAF loop driven by the canvas animation frame.
	const [scrollOffset, setScrollOffset] = useState(0);

	const updateOffset = () => {
		const o = scroll.offset;
		setScrollOffset(o);
		onScrollChange(o);
		rafRef.current = requestAnimationFrame(updateOffset);
	};

	// Start the rAF loop once on mount — never restarted in StrictMode.
	const started = useRef(false);
	if (!started.current && typeof window !== "undefined") {
		started.current = true;
		rafRef.current = requestAnimationFrame(updateOffset);
	}

	// Warp section weight: 0 → galaxy visible, 1 → warp tunnel visible
	// Transitions in the 0.5→1.0 range of scroll progress (Section 2→3)
	const warpWeight = Math.max(0, scrollOffset * 2 - 1);

	return (
		<>
			<CameraRig />

			{/* Ambient light — very low, lets scene emissives dominate */}
			<ambientLight intensity={0.05} />

			{/* Galaxy — Sections 1 & 2, fades as warp begins */}
			<group visible={warpWeight < 0.99}>
				<GalaxyScene opacity={1 - warpWeight} />
			</group>

			{/* Warp tunnel — Section 3, fades in as galaxy fades out */}
			<group visible={warpWeight > 0.01}>
				<WarpScene opacity={warpWeight} />
			</group>

			<PostFx scrollOffset={scrollOffset} />
		</>
	);
}

// ---------------------------------------------------------------------------
// Public Experience component
// ---------------------------------------------------------------------------

export interface ExperienceProps {
	siteConfig: SiteConfig;
	about: About;
	contact: Contact;
	projects: Project[];
	onScrollChange?: (offset: number) => void;
	/** Receives the ScrollControls internal scroll element for GSAP snap wiring */
	onScrollElReady?: (el: HTMLElement) => void;
}

export function Experience({
	onScrollChange = () => {},
	onScrollElReady,
}: ExperienceProps) {
	return (
		<Canvas
			style={{
				position: "fixed",
				inset: 0,
				width: "100%",
				height: "100%",
				zIndex: 0,
			}}
			camera={{ fov: 60, near: 0.1, far: 2000 }}
			gl={{
				antialias: true,
				alpha: false,
				powerPreference: "high-performance",
			}}
			dpr={[1, 2]}
		>
			<ScrollControls pages={SECTION_COUNT} damping={0.3}>
				<SceneContent
					onScrollChange={onScrollChange}
					onScrollElReady={onScrollElReady}
				/>
			</ScrollControls>
		</Canvas>
	);
}
