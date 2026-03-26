/**
 * warp-stars.client.component.tsx — animated star streak particle system
 *
 * Renders 15k star particles distributed in a cylinder around the camera.
 * The custom GLSL shaders animate them racing toward the camera and wrapping
 * back to the far end — creating the classic warp speed infinite-tunnel feel.
 *
 * Each star has an individual speed attribute so they appear at varying
 * velocities, giving the star field organic depth.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { WarpConfig } from "./warp.generator";
import { generateWarp } from "./warp.generator";
import warpStarsFrag from "./warp-stars.shader.frag";
import warpStarsVert from "./warp-stars.shader.vert";

interface WarpStarsProps {
	config?: WarpConfig;
	/** Warp speed multiplier — 1.0 = base speed (~30 u/s) */
	warpSpeed?: number;
	opacity?: number;
}

const BASE_SPEED = 30;

export function WarpStars({
	config,
	warpSpeed = 1,
	opacity = 1,
}: WarpStarsProps) {
	const materialRef = useRef<THREE.ShaderMaterial>(null);

	// Config captured on mount — geometry is stable across re-renders.
	const configRef = useRef(config);
	const {
		starPositions,
		starSpeeds,
		config: resolved,
	} = useMemo(
		() => generateWarp(configRef.current),
		[], // eslint-disable-line react-hooks/exhaustive-deps
	);

	const geometry = useMemo(() => {
		const geo = new THREE.BufferGeometry();
		geo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
		geo.setAttribute("aSpeed", new THREE.BufferAttribute(starSpeeds, 1));
		return geo;
	}, [starPositions, starSpeeds]);

	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: warpStarsVert,
				fragmentShader: warpStarsFrag,
				uniforms: {
					uTime: { value: 0 },
					uSpeed: { value: BASE_SPEED * warpSpeed },
					uTunnelDepth: { value: resolved.tunnelDepth },
					uOpacity: { value: 1 },
				},
				transparent: true,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
			}),
		[resolved.tunnelDepth, warpSpeed],
	);

	// Dispose geometry and material on unmount — neither is auto-disposed by R3F
	// when passed via geometry={geo} or <primitive object={...}>.
	useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
		},
		[geometry, material],
	);

	useFrame((_, delta) => {
		if (materialRef.current) {
			materialRef.current.uniforms.uTime.value += delta;
			materialRef.current.uniforms.uOpacity.value = opacity;
			materialRef.current.uniforms.uSpeed.value = BASE_SPEED * warpSpeed;
		}
	});

	return (
		<points geometry={geometry}>
			<primitive ref={materialRef} object={material} attach="material" />
		</points>
	);
}
