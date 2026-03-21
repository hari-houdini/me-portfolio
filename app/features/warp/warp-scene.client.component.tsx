/**
 * warp-scene.client.component.tsx — cosmic neon warp tunnel scene orchestrator
 *
 * Section 3 environment: a first-person cosmic highway at light speed.
 *
 * Scene composition:
 *  1. WarpNebula  — deep space backdrop (inside-out sphere, purple→void gradient)
 *  2. WarpStars   — 15k star streaks in a cylinder, animating toward camera
 *  3. WarpRoad    — scrolling violet/cyan perspective grid road
 *  4. WarpCars    — abstract light pod vehicles (white head / red tail lights)
 *
 * Camera sits at eye level on the road (y=1.5) looking along -Z.
 * This component does NOT move the camera — the CameraRig handles that.
 * The scene group is positioned at y=-80 so the galaxy sits above at y=0
 * and the camera dives through the transition naturally.
 *
 * The opacity prop drives all child components for section fade transitions.
 */

"use client";

import { WarpCars } from "./warp-cars.client.component";
import { WarpNebula } from "./warp-nebula.client.component";
import { WarpRoad } from "./warp-road.client.component";
import { WarpStars } from "./warp-stars.client.component";

interface WarpSceneProps {
	/** Opacity 0→1 driven by scroll progress for the galaxy→warp transition */
	opacity?: number;
}

/** Y offset: warp tunnel is below the galaxy so the camera dive feels real */
const WARP_Y_OFFSET = -80;

export function WarpScene({ opacity = 1 }: WarpSceneProps) {
	return (
		<group position={[0, WARP_Y_OFFSET, 0]}>
			{/* Nebula backdrop — must be rendered first (backSide sphere) */}
			<WarpNebula opacity={opacity} />

			{/* Star streaks — fill the full tunnel cylinder */}
			<WarpStars warpSpeed={1 + opacity * 0.5} opacity={opacity} />

			{/* Neon grid road — scrolls toward camera at constant speed */}
			<WarpRoad scrollSpeed={30 + opacity * 10} opacity={opacity} />

			{/* Abstract light pod vehicles in two lanes */}
			<WarpCars speedMultiplier={opacity} opacity={opacity} />

			{/* Subtle violet point light: illuminates the road grid from above */}
			<pointLight
				position={[0, 8, -20]}
				color="#9d00ff"
				intensity={opacity * 1.2}
				distance={80}
			/>
			<pointLight
				position={[0, 6, -60]}
				color="#00f5ff"
				intensity={opacity * 0.8}
				distance={60}
			/>
		</group>
	);
}
