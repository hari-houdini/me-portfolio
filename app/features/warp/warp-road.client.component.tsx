/**
 * warp-road.client.component.tsx — neon grid road scrolling toward camera
 *
 * Renders the perspective-converging grid road as LineSegments geometry.
 * The vertex shader animates the Z scroll so the grid appears to move
 * continuously toward the camera — an infinite road illusion.
 *
 * Grid colours: violet primary (#9d00ff) with cyan accent (#00f5ff),
 * matching the agreed palette. Brightness falls off with distance.
 * AdditiveBlending amplifies the glow without requiring explicit bloom uniforms.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { generateWarp } from "./warp.generator";
import warpRoadFrag from "./warp-road.shader.frag";
import warpRoadVert from "./warp-road.shader.vert";

interface WarpRoadProps {
	/** Road scroll speed in world units per second. Default: 30 */
	scrollSpeed?: number;
	opacity?: number;
}

export function WarpRoad({ scrollSpeed = 30, opacity = 1 }: WarpRoadProps) {
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const { gridSegments, config: resolved } = useMemo(() => generateWarp(), []);

	// LineSegments geometry — pairs of [start, end] vertices per line
	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(gridSegments, 3));
		return geo;
	}, [gridSegments]);

	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: warpRoadVert,
				fragmentShader: warpRoadFrag,
				uniforms: {
					uScrollZ: { value: 0 },
					uRoadDepth: { value: resolved.roadDepth },
					uOpacity: { value: 1 },
				},
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		[resolved.roadDepth],
	);

	useFrame((_, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uScrollZ.value += delta * scrollSpeed;
			materialRef.current.uniforms.uOpacity.value = opacity;
		}
	});

	return (
		<lineSegments geometry={geometry}>
			<primitive ref={materialRef} object={material} attach="material" />
		</lineSegments>
	);
}
