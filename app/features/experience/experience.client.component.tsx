/**
 * experience.tsx — root Three.js canvas and scene orchestrator
 *
 * This is the single entry point for all 3D rendering. It:
 *  1. Renders a fixed-position <Canvas> that covers the viewport
 *  2. Wraps everything in drei's <ScrollControls> for scroll-driven animation
 *  3. Mounts the <CameraRig> which drives camera along the bezier path
 *  4. Renders both scenes (galaxy + warp) in a single scene graph — opacity
 *     transitions between them are driven by scroll progress
 *  5. Applies the post-processing effect stack via <PostFx>
 *
 * SSR safety:
 *  This file is imported via React.lazy() in home.tsx. The lazy boundary
 *  ensures Three.js never instantiates on the server. This file may safely
 *  import from three, @react-three/fiber, and @react-three/drei.
 *
 * Props are passed down from the home route loader (CMS data + scroll state).
 */

"use client";

import { ScrollControls, useScroll } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
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
	onScrollElement,
}: {
	onScrollChange: (offset: number) => void;
	onScrollElement?: (el: HTMLElement) => void;
}) {
	const scroll = useScroll();
	const [scrollOffset, setScrollOffset] = useState(0);

	// Track which section (0/1/2) is active so we only notify the parent when
	// the section changes — not on every 60fps float. This prevents the HTML
	// overlay tree (HeroOverlay, AboutOverlay, WorkOverlay, ContactOverlay) from
	// reconciling at 60fps. -1 means no section has been notified yet.
	const activeSectionRef = useRef(-1);

	// Expose drei's internal scroll element to the parent (home.tsx) so that
	// GSAP ScrollTrigger can attach to the element that actually scrolls.
	// scroll.el is the overflow:scroll div ScrollControls injects into the DOM.
	useEffect(() => {
		if (scroll.el) {
			onScrollElement?.(scroll.el as HTMLElement);
		}
	}, [scroll.el, onScrollElement]);

	// useFrame is the correct R3F mechanism for per-frame work inside <Canvas>.
	// It stops automatically when the component unmounts — no manual cleanup needed.
	useFrame(() => {
		const o = scroll.offset;
		setScrollOffset(o);

		// Gate parent notification to section changes only.
		// The parent's setScrollOffset drives HTML overlay visibility — no need to
		// call it at 60fps since the section thresholds are 0.33 and 0.66.
		const section = o < 0.33 ? 0 : o < 0.66 ? 1 : 2;
		if (section !== activeSectionRef.current) {
			activeSectionRef.current = section;
			onScrollChange(o);
		}
	});

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
	/** Called once with drei's internal scroll element so the parent can
	 *  attach GSAP ScrollTrigger to the element that actually scrolls. */
	onScrollElement?: (el: HTMLElement) => void;
}

export function Experience({
	onScrollChange = () => {},
	onScrollElement,
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
					onScrollElement={onScrollElement}
				/>
			</ScrollControls>
		</Canvas>
	);
}
