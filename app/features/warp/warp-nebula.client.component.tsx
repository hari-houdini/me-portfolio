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

interface WarpNebulaProps {
	opacity?: number;
}

// Nebula gradient shader — procedural, no texture
const NEBULA_VERT = `
varying vec3 vPosition;
void main() {
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const NEBULA_FRAG = `
uniform float uOpacity;
varying vec3 vPosition;

void main() {
  // Map normalised position to a colour based on the direction from the origin
  vec3 dir = normalize(vPosition);

  // Colour stops: void black (sides/bottom) → deep violet (midfield) → purple (top/ahead)
  float upFactor  = max(0.0, dir.y * 0.5 + 0.5); // 0=looking down, 1=looking up
  float fwdFactor = max(0.0, -dir.z * 0.5 + 0.5); // 0=behind, 1=forward

  vec3 voidColor   = vec3(0.0,  0.0,  0.002);
  vec3 violetColor = vec3(0.12, 0.0,  0.22);
  vec3 purpleColor = vec3(0.06, 0.0,  0.18);

  // Blend: strong forward component gets violet, upward gets purple tint
  vec3 color = mix(voidColor, violetColor, fwdFactor * 0.7);
  color = mix(color, purpleColor, upFactor * 0.3);

  // Very subtle animated shimmer via a static dither — keeps the nebula alive
  float noise = fract(sin(dot(dir.xy, vec2(127.1, 311.7))) * 43758.5453);
  color += noise * 0.008;

  gl_FragColor = vec4(color, uOpacity * 0.95);
}
`;

export function WarpNebula({ opacity = 1 }: WarpNebulaProps) {
	// Keep a ref so useFrame always reads the latest opacity without needing
	// opacity in its own dep list (useFrame recreates its callback each render).
	const opacityRef = useRef(opacity);
	opacityRef.current = opacity;

	// Create the material once — dep array is intentionally empty.
	// Previously [opacity] caused a new ShaderMaterial on every scroll frame
	// at 60fps, leaking GPU memory because <primitive> objects are not
	// auto-disposed by R3F. The opacity uniform is updated in useFrame instead.
	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: NEBULA_VERT,
				fragmentShader: NEBULA_FRAG,
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
