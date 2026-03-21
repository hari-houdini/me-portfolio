/**
 * rain.tsx — animated rain particle system
 *
 * Generates a field of rain particles distributed over the city area.
 * The vertex shader animates them falling in a loop — no CPU updates
 * per frame, only the uTime uniform is updated.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import rainFrag from "./rain.frag";
import rainVert from "./rain.vert";

const RAIN_PARTICLE_COUNT = 20_000;
const CITY_HALF_EXTENT = 80; // world units — covers the city footprint
const FALL_HEIGHT = 100; // particles cycle over this height range
const FALL_SPEED = 25; // world units per second

interface RainProps {
	opacity?: number;
}

export function Rain({ opacity = 1 }: RainProps) {
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	const geometry = useMemo(() => {
		const positions = new Float32Array(RAIN_PARTICLE_COUNT * 3);
		for (let i = 0; i < RAIN_PARTICLE_COUNT; i++) {
			const i3 = i * 3;
			positions[i3] = (Math.random() - 0.5) * CITY_HALF_EXTENT * 2;
			positions[i3 + 1] = Math.random() * FALL_HEIGHT;
			positions[i3 + 2] = (Math.random() - 0.5) * CITY_HALF_EXTENT * 2;
		}
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		return geo;
	}, []);

	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: rainVert,
				fragmentShader: rainFrag,
				uniforms: {
					uTime: { value: 0 },
					uOpacity: { value: 1 },
					uFallHeight: { value: FALL_HEIGHT },
					uFallSpeed: { value: FALL_SPEED },
				},
				transparent: true,
				depthWrite: false,
				blending: THREE.NormalBlending,
			}),
		[],
	);

	useFrame((_, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
			materialRef.current.uniforms.uOpacity.value = opacity;
		}
	});

	return (
		<points geometry={geometry}>
			<primitive ref={materialRef} object={material} attach="material" />
		</points>
	);
}
