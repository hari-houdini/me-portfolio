/**
 * camera-rig.tsx — scroll-driven camera controller
 *
 * Reads the normalised scroll offset from drei's useScroll() hook and
 * interpolates the camera's position and look-at target along a predefined
 * bezier-inspired path using GSAP's `gsap.to` with Three.js vectors.
 *
 * Architecture:
 *  - This component mounts INSIDE the <Canvas> tree.
 *  - It uses useFrame() to update camera position every render tick.
 *  - GSAP is NOT used for per-frame animation here — lerp() gives smooth
 *    inertia without the overhead of GSAP tweens inside the render loop.
 *
 * Camera path:
 *  Section 1 (GALAXY_ANGLED): position [0, 30, 60], look-at [0, 0, 0]
 *  Section 2 (GALAXY_TOP):    position [0, 90,  5], look-at [0, 0, 0]
 *  Section 3 (CITY):          position [0, 80,  0], look-at [0, 0, 0]
 *    (city is rendered beneath the galaxy — camera descends into it)
 */

"use client";

import { useScroll } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { SECTION_COUNT } from "./scroll-section";

// Camera keyframes — one per scroll section
const CAMERA_KEYFRAMES: { position: THREE.Vector3; target: THREE.Vector3 }[] = [
	// Section 1 — angled view of galaxy
	{
		position: new THREE.Vector3(0, 30, 60),
		target: new THREE.Vector3(0, 0, 0),
	},
	// Section 2 — top-down view of galaxy
	{
		position: new THREE.Vector3(0, 90, 5),
		target: new THREE.Vector3(0, 0, 0),
	},
	// Section 3 — aerial view of cyberpunk city
	{
		position: new THREE.Vector3(0, 80, 0),
		target: new THREE.Vector3(0, -40, 0),
	},
];

// Lerp factor — higher = snappier, lower = more inertia
const LERP_FACTOR = 0.05;

export function CameraRig() {
	const scroll = useScroll();
	const { camera } = useThree();

	// Working vectors — allocated once, reused every frame
	const targetPosition = useRef(new THREE.Vector3());
	const targetLookAt = useRef(new THREE.Vector3());
	const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

	useFrame(() => {
		// scroll.offset is 0→1 across the full scroll range
		// Map to 0→(SECTION_COUNT-1) for keyframe interpolation
		const t = scroll.offset * (SECTION_COUNT - 1);
		const lower = Math.floor(t);
		const upper = Math.min(lower + 1, SECTION_COUNT - 1);
		const alpha = t - lower;

		const from = CAMERA_KEYFRAMES[lower];
		const to = CAMERA_KEYFRAMES[upper];

		// Interpolate target position and look-at between keyframes
		targetPosition.current.lerpVectors(from.position, to.position, alpha);
		targetLookAt.current.lerpVectors(from.target, to.target, alpha);

		// Smooth follow with inertia
		camera.position.lerp(targetPosition.current, LERP_FACTOR);
		currentLookAt.current.lerp(targetLookAt.current, LERP_FACTOR);
		camera.lookAt(currentLookAt.current);
	});

	return null;
}
