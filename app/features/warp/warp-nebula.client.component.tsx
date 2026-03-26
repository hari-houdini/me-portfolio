/**
 * warp-nebula.client.component.tsx — deep space nebula backdrop
 *
 * A large sphere surrounding the scene, rendered with a custom fragment shader
 * producing a layered nebula colour wash (purple → deep blue → void black).
 * The sphere is inside-out (backSide rendering) so the viewer is always inside.
 *
 * Star streaks from WarpStars layer over this nebula backdrop.
 * The nebula itself is static — motion comes from the stars, not the background.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import warpNebulaFrag from "./warp-nebula.shader.frag";
import warpNebulaVert from "./warp-nebula.shader.vert";

interface WarpNebulaProps {
	opacity?: number;
}

export function WarpNebula({ opacity = 1 }: WarpNebulaProps) {
	// Keep a ref so useFrame always reads the latest opacity without needing
	// opacity in its dep list (useFrame recreates its callback each render).
	const opacityRef = useRef(opacity);
	opacityRef.current = opacity;

	// Create the material once — dep array is intentionally empty.
	// Previously [opacity] caused a new ShaderMaterial on every scroll frame
	// at 60fps, leaking GPU memory because <primitive> objects are not
	// auto-disposed by R3F. The opacity uniform is updated in useFrame instead.
	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: warpNebulaVert,
				fragmentShader: warpNebulaFrag,
				uniforms: {
					// Initial value is 1; useFrame sets the correct value on the
					// very first frame, so there is no visible flicker at mount.
					uOpacity: { value: 1 },
				},
				transparent: true,
				depthWrite: false,
				side: THREE.BackSide, // render inside of the sphere
			}),
		[],
	);

	// Update the opacity uniform every frame via the ref — never recreate the material
	useFrame(() => {
		material.uniforms.uOpacity.value = opacityRef.current;
	});

	// Dispose on unmount — R3F does not dispose <primitive> objects automatically
	useEffect(() => () => material.dispose(), [material]);

	return (
		<mesh>
			<sphereGeometry args={[500, 32, 32]} />
			<primitive object={material} attach="material" />
		</mesh>
	);
}
