/**
 * city-scene.tsx — cyberpunk city scene orchestrator
 *
 * Composes all city sub-components (buildings, rain, car lights, neon signs)
 * into the complete Section 3 environment.
 *
 * The city is positioned below the galaxy in world space (negative Y offset)
 * so the camera dive from Section 2→3 feels like descending from orbit
 * to street level.
 */

"use client";

import { useMemo } from "react";
import { Buildings } from "./buildings";
import { CarLights } from "./car-lights";
import { generateCity } from "./city-generator";
import { NeonSigns } from "./neon-signs";
import { Rain } from "./rain";

const CITY_Y_OFFSET = -80; // position city below the galaxy

interface CitySceneProps {
	/** Opacity 0→1 for section transitions */
	opacity?: number;
}

export function CityScene({ opacity = 1 }: CitySceneProps) {
	const { buildings, carRoutes, neonSigns } = useMemo(
		() => generateCity({ seed: 42 }),
		[],
	);

	return (
		<group position={[0, CITY_Y_OFFSET, 0]}>
			{/* Ground plane — wet reflective surface */}
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
				<planeGeometry args={[200, 200]} />
				<meshStandardMaterial
					color="#050510"
					roughness={0.1}
					metalness={0.9}
					transparent
					opacity={opacity}
				/>
			</mesh>

			{/* Buildings */}
			<Buildings buildings={buildings} opacity={opacity} />

			{/* Falling rain */}
			<Rain opacity={opacity} />

			{/* Car light trails on roads */}
			<CarLights routes={carRoutes} opacity={opacity} />

			{/* Neon signs on building faces */}
			<NeonSigns signs={neonSigns} opacity={opacity} />

			{/* Point lights simulating neon reflections on wet ground */}
			<pointLight
				position={[0, 20, 0]}
				color="#00f5ff"
				intensity={opacity * 0.8}
				distance={100}
			/>
			<pointLight
				position={[20, 20, 20]}
				color="#ff0080"
				intensity={opacity * 0.6}
				distance={80}
			/>
			<pointLight
				position={[-20, 20, -20]}
				color="#9d00ff"
				intensity={opacity * 0.5}
				distance={80}
			/>
		</group>
	);
}
