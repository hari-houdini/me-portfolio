/**
 * neon-signs.tsx — glowing neon sign meshes on building faces
 *
 * Each neon sign is a thin plane mesh with an emissive material.
 * The bloom post-processing pass handles the physical glow effect —
 * the material itself is simply brightly emissive with a high intensity.
 *
 * Signs pulse slowly via a uTime uniform to suggest the flickering
 * that is characteristic of real neon lighting.
 */

"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { NeonSignData } from "./city-generator";

interface NeonSignsProps {
	signs: NeonSignData[];
	opacity?: number;
}

export function NeonSigns({ signs, opacity = 1 }: NeonSignsProps) {
	const groupRef = useRef<THREE.Group>(null);
	const timeRef = useRef(0);
	const materialsRef = useRef<THREE.MeshBasicMaterial[]>([]);

	const { meshes, materials } = useMemo(() => {
		const geometry = new THREE.PlaneGeometry(3, 1.2);
		const mats: THREE.MeshBasicMaterial[] = [];
		const meshList: THREE.Mesh[] = [];

		for (let idx = 0; idx < signs.length; idx++) {
			const sign = signs[idx];
			const mat = new THREE.MeshBasicMaterial({
				color: new THREE.Color(sign.color),
				transparent: true,
				opacity: opacity * sign.intensity,
				side: THREE.DoubleSide,
				depthWrite: false,
			});
			mats.push(mat);

			const mesh = new THREE.Mesh(geometry, mat);
			mesh.position.set(sign.x, sign.y, sign.z);
			mesh.rotation.y = sign.rotation;
			// Stable key via world position — avoids array index as key
			mesh.userData.signKey = `${sign.x.toFixed(1)}_${sign.y.toFixed(1)}_${sign.z.toFixed(1)}`;
			meshList.push(mesh);
		}

		materialsRef.current = mats;
		return { meshes: meshList, materials: mats };
	}, [signs, opacity]);

	// Slow pulse / flicker
	useFrame((_, delta) => {
		timeRef.current += delta;
		const t = timeRef.current;
		for (let i = 0; i < materials.length; i++) {
			// Slight random offset per sign via index
			const flicker = 0.85 + 0.15 * Math.sin(t * 2.5 + i * 1.7);
			materials[i].opacity = opacity * signs[i].intensity * flicker;
		}
	});

	if (signs.length === 0) return null;

	return (
		<group ref={groupRef}>
			{meshes.map((mesh) => (
				<primitive key={mesh.userData.signKey as string} object={mesh} />
			))}
		</group>
	);
}
