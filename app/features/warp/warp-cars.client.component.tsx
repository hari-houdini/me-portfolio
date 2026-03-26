/**
 * warp-cars.client.component.tsx — abstract light pod vehicles
 *
 * Cars are rendered as pairs of glowing point-light sources (not geometry),
 * represented as bright additive-blended points moving along two lanes.
 *
 * Headlights: white (#fffde8) — oncoming traffic, moves toward camera (+Z)
 * Tail lights: red (#ff2200) — same-direction traffic, moves away from camera
 *
 * Each pod's position is updated CPU-side per frame — with only 36 pods total
 * this is negligible. A single Points draw call with vertex colours handles all.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { LightPodData, WarpConfig } from "./warp.generator";
import { generateWarp } from "./warp.generator";

interface WarpCarsProps {
	config?: WarpConfig;
	/** Travel speed multiplier — applied on top of each pod's base speed */
	speedMultiplier?: number;
	opacity?: number;
}

export function WarpCars({
	config,
	speedMultiplier = 1,
	opacity = 1,
}: WarpCarsProps) {
	const configRef = useRef(config);
	const { lightPods, config: resolved } = useMemo(
		() => generateWarp(configRef.current),
		[], // eslint-disable-line react-hooks/exhaustive-deps
	);

	const podCount = lightPods.length;

	// z positions are mutable per frame — stored in a plain array
	const zPositions = useRef(lightPods.map((p) => p.z));

	const positionsRef = useRef(new Float32Array(podCount * 3));
	const colorsRef = useRef(new Float32Array(podCount * 3));
	const pointsRef = useRef<THREE.Points>(null);

	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute(
			"position",
			new THREE.BufferAttribute(positionsRef.current, 3),
		);
		geo.setAttribute("color", new THREE.BufferAttribute(colorsRef.current, 3));
		return geo;
	}, []);

	// Set colours once — they don't change per frame
	useMemo(() => {
		for (let i = 0; i < podCount; i++) {
			const pod = lightPods[i];
			const i3 = i * 3;
			if (pod.lightType === "headlight") {
				colorsRef.current[i3] = 1;
				colorsRef.current[i3 + 1] = 0.99;
				colorsRef.current[i3 + 2] = 0.91;
			} else {
				colorsRef.current[i3] = 1;
				colorsRef.current[i3 + 1] = 0.13;
				colorsRef.current[i3 + 2] = 0;
			}
		}
	}, [lightPods, podCount]);

	// Dispose geometry on unmount. The <pointsMaterial> is JSX-declared so R3F
	// auto-disposes it; only the programmatically constructed geometry needs cleanup.
	useEffect(() => () => geometry.dispose(), [geometry]);

	useFrame((_, delta) => {
		const pods = lightPods as LightPodData[];
		const pos = positionsRef.current;
		const tunnelLen = resolved.roadDepth;

		for (let i = 0; i < podCount; i++) {
			const pod = pods[i];
			const dir = pod.lightType === "headlight" ? 1 : -1;
			zPositions.current[i] += delta * pod.speed * speedMultiplier * dir;

			// Wrap z within [-tunnelLen, 0]
			if (zPositions.current[i] > 0) zPositions.current[i] -= tunnelLen;
			if (zPositions.current[i] < -tunnelLen)
				zPositions.current[i] += tunnelLen;

			const i3 = i * 3;
			pos[i3] = pod.x;
			pos[i3 + 1] = pod.y;
			pos[i3 + 2] = zPositions.current[i];
		}

		const geo = pointsRef.current?.geometry;
		if (geo) {
			(geo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
		}
	});

	return (
		<points ref={pointsRef} geometry={geometry}>
			<pointsMaterial
				vertexColors
				size={2.5}
				sizeAttenuation
				transparent
				opacity={opacity}
				depthWrite={false}
				blending={THREE.AdditiveBlending}
			/>
		</points>
	);
}
