/**
 * experience.tsx — root Three.js canvas and scene orchestrator
 *
 * This is the single entry point for all 3D rendering. It:
 *  1. Renders a fixed-position <Canvas> that covers the viewport
 *  2. Wraps everything in drei's <ScrollControls> for scroll-driven animation
 *  3. Mounts the <CameraRig> which drives camera along the bezier path
 *  4. Renders both scenes (galaxy + city) in a single scene graph — opacity
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
}: {
	onScrollChange: (offset: number) => void;
}) {
	const scroll = useScroll();
	const rafRef = useRef<number>(0);

	// Propagate scroll offset to parent on every frame for overlay positioning
	// and post-FX parameterisation.  useFrame is not available outside Canvas
	// so we use a rAF loop attached to the scroll object.
	const [scrollOffset, setScrollOffset] = useState(0);

	// Sync scroll offset with parent via a callback on each fiber frame tick.
	// We update state here to trigger re-renders for PostFx parameterisation.
	const updateOffset = () => {
		const o = scroll.offset;
		setScrollOffset(o);
		onScrollChange(o);
		rafRef.current = requestAnimationFrame(updateOffset);
	};

	// Start the rAF loop once on mount — cancelled on unmount via effect.
	// We use a vanilla ref flag to avoid starting it twice in StrictMode.
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
}

export function Experience({ onScrollChange = () => {} }: ExperienceProps) {
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
				<SceneContent onScrollChange={onScrollChange} />
			</ScrollControls>
		</Canvas>
	);
}
