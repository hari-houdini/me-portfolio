/**
 * galaxy-particles.tsx — R3F particle system component
 *
 * Creates a Three.js Points mesh with a custom ShaderMaterial fed by
 * procedurally generated geometry from galaxy-generator.ts.
 *
 * Performance:
 *  - Geometry is computed once on mount and stored in a ref — never on render.
 *  - BufferAttributes are set once; the PRNG seed ensures layout is stable.
 *  - The only per-frame update is the `uTime` uniform for rotation/shimmer.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type GalaxyConfig, generateGalaxy } from "./galaxy.generator";
import galaxyFrag from "./galaxy.shader.frag";
import galaxyVert from "./galaxy.shader.vert";

export const GALAXY_PARTICLE_COUNT = 150_000;

interface GalaxyParticlesProps {
	config?: GalaxyConfig;
	/** Opacity 0→1 for section transitions */
	opacity?: number;
}

export function GalaxyParticles({ config, opacity = 1 }: GalaxyParticlesProps) {
	const meshRef = useRef<THREE.Points>(null);
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	// Generate geometry once on mount — galaxy layout is stable across renders.
	// Intentionally ignoring config changes after mount; the seed in the config
	// object guarantees identical output even if the reference changes.
	const configRef = useRef(config);
	const { positions, colors, sizes } = useMemo(
		() =>
			generateGalaxy({
				particleCount: GALAXY_PARTICLE_COUNT,
				...configRef.current,
			}),
		// Geometry only ever regenerates if the component remounts.
		[], // eslint-disable-line react-hooks/exhaustive-deps
	);

	// Build the BufferGeometry once
	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
		geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
		geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
		return geo;
	}, [positions, colors, sizes]);

	// Shader material — constructed once; opacity is updated via uniform each frame
	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: galaxyVert,
				fragmentShader: galaxyFrag,
				uniforms: {
					uTime: { value: 0 },
					uOpacity: { value: 1 },
				},
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				vertexColors: false,
			}),
		[],
	);

	// Update uniforms every frame
	useFrame((_, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
			materialRef.current.uniforms.uOpacity.value = opacity;
		}
	});

	return (
		<points ref={meshRef} geometry={geometry}>
			<primitive ref={materialRef} object={material} attach="material" />
		</points>
	);
}
