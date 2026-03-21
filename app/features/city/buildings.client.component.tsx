/**
 * buildings.tsx — instanced mesh of city buildings
 *
 * Uses Three.js InstancedMesh for a single draw call regardless of building
 * count. Each building's transform (position, scale) is set via Matrix4
 * on the instance buffer.
 *
 * Colours are stored as per-instance attributes for the shader.
 */

"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { BuildingData } from "./city.generator";

interface BuildingsProps {
	buildings: BuildingData[];
	opacity?: number;
}

// Building material — dark concrete with emissive trim
const BUILDING_MATERIAL = new THREE.MeshStandardMaterial({
	color: "#0a0a1a",
	roughness: 0.9,
	metalness: 0.1,
});

export function Buildings({ buildings, opacity = 1 }: BuildingsProps) {
	const meshRef = useRef<THREE.InstancedMesh>(null);

	// Geometry shared across all instances
	const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

	// Set instance matrices once on mount
	const dummy = useMemo(() => new THREE.Object3D(), []);

	useMemo(() => {
		const mesh = meshRef.current;
		if (!mesh) return;

		for (let i = 0; i < buildings.length; i++) {
			const b = buildings[i];
			dummy.position.set(b.x, b.height / 2, b.z);
			dummy.scale.set(b.width, b.height, b.depth);
			dummy.updateMatrix();
			mesh.setMatrixAt(i, dummy.matrix);
		}
		mesh.instanceMatrix.needsUpdate = true;
	}, [buildings, dummy]);

	const material = useMemo(() => {
		const mat = BUILDING_MATERIAL.clone();
		mat.transparent = true;
		mat.opacity = opacity;
		return mat;
	}, [opacity]);

	if (buildings.length === 0) return null;

	return (
		<instancedMesh
			ref={meshRef}
			args={[geometry, material, buildings.length]}
			castShadow={false}
			receiveShadow={false}
		/>
	);
}
