/**
 * post-fx.tsx — post-processing effect stack
 *
 * Applies the cinematic visual stack described in PRD-001 §3.6.
 * Effects are composed via @react-three/postprocessing (pmndrs).
 *
 * Section-aware behaviour:
 *  - Bloom is always on (galaxy glow + neon signs)
 *  - ChromaticAberration and Vignette ramp up in Section 3 (city)
 *  - DepthOfField is active in Section 3 only, focused at street level
 *  - Noise (film grain) is always on at a subtle level
 *
 * Implementation note:
 *  The scroll offset is passed as a prop (not read via useScroll()) because
 *  this component is consumed both inside and outside the ScrollControls
 *  provider in tests. Keeping it prop-driven makes it pure and testable.
 */

"use client";

import {
	Bloom,
	ChromaticAberration,
	EffectComposer,
	Noise,
	Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useMemo } from "react";
import * as THREE from "three";

interface PostFxProps {
	/** Normalised scroll offset 0→1 across the full experience */
	scrollOffset: number;
}

export function PostFx({ scrollOffset }: PostFxProps) {
	// City section weight — 0 in Sections 1/2, ramps to 1 in Section 3
	const cityWeight = useMemo(() => {
		const t = scrollOffset * 2; // 0→1 per section pair
		return Math.max(0, t - 1); // zero until Section 2→3 transition
	}, [scrollOffset]);

	// ChromaticAberration offset — subtle in galaxy, stronger in city
	const caOffset = useMemo(
		() => new THREE.Vector2(0.0005 + cityWeight * 0.002, 0),
		[cityWeight],
	);

	return (
		<EffectComposer>
			{/* Bloom — always active; galaxy core and neon signs glow */}
			<Bloom
				intensity={1.0 + cityWeight * 0.5}
				luminanceThreshold={0.6}
				luminanceSmoothing={0.9}
				mipmapBlur
			/>

			{/* Chromatic Aberration — subtle galaxy, stronger city */}
			<ChromaticAberration
				offset={caOffset}
				blendFunction={BlendFunction.NORMAL}
				radialModulation={false}
				modulationOffset={0}
			/>

			{/* Film Grain — always on, very subtle */}
			<Noise opacity={0.03 + cityWeight * 0.02} />

			{/* Vignette — edges darken in city section */}
			<Vignette
				offset={0.2 + cityWeight * 0.2}
				darkness={0.5 + cityWeight * 0.3}
				blendFunction={BlendFunction.NORMAL}
			/>
		</EffectComposer>
	);
}
