/**
 * galaxy-scene.tsx — full galaxy scene orchestrator
 *
 * Composes the particle system and 3D text titles into the complete galaxy
 * experience for Sections 1 and 2. The section view (angled vs top-down) is
 * controlled by the camera rig, not this component — this component always
 * renders the same geometry regardless of which section is active.
 */

"use client";

import { GalaxyParticles } from "./galaxy-particles";
import { GalaxyTitle } from "./galaxy-title";

interface GalaxySceneProps {
	/** Opacity 0→1 for section transitions */
	opacity?: number;
	/** Hero section title — displayed in Section 1 */
	heroTitle?: string;
	/** About section title — displayed in Section 2 */
	aboutTitle?: string;
}

export function GalaxyScene({
	opacity = 1,
	heroTitle,
	aboutTitle,
}: GalaxySceneProps) {
	return (
		<group>
			<GalaxyParticles opacity={opacity} />

			{/* Section 1 title — angled view, positioned above the core */}
			{heroTitle && (
				<GalaxyTitle
					text={heroTitle}
					position={[0, 8, 0]}
					fontSize={5}
					opacity={opacity}
				/>
			)}

			{/* Section 2 title — top-down view, positioned above centre */}
			{aboutTitle && (
				<GalaxyTitle
					text={aboutTitle}
					position={[-18, 2, -10]}
					fontSize={3.5}
					color="#00f5ff"
					opacity={opacity}
				/>
			)}
		</group>
	);
}
