"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";

const ORB_DATA = [
	{ color: "#00f7ff", ax: 1.2, ay: 0.5, speed: 0.5, phase: 0 },
	{ color: "#00ff85", ax: 0.9, ay: 0.7, speed: 0.38, phase: 1.2 },
	{ color: "#ff0099", ax: 1.4, ay: 0.4, speed: 0.62, phase: 2.4 },
	{ color: "#ff8f00", ax: 0.7, ay: 0.9, speed: 0.45, phase: 3.6 },
	{ color: "#7c00fe", ax: 1.1, ay: 0.6, speed: 0.55, phase: 4.8 },
];

function Orbs() {
	const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

	const { geometries, materials } = useMemo(() => {
		const geos = ORB_DATA.map(() => new THREE.SphereGeometry(0.22, 16, 16));
		const mats = ORB_DATA.map(
			(d) =>
				new THREE.MeshBasicMaterial({
					color: d.color,
					transparent: true,
					opacity: 0.55,
				}),
		);
		return { geometries: geos, materials: mats };
	}, []);

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		ORB_DATA.forEach((d, i) => {
			const mesh = meshRefs.current[i];
			if (!mesh) return;
			mesh.position.x = Math.cos(t * d.speed + d.phase) * d.ax;
			mesh.position.y = Math.sin(t * d.speed * 0.7 + d.phase) * d.ay;
		});
	});

	useEffect(
		() => () => {
			for (const g of geometries) g.dispose();
			for (const m of materials) m.dispose();
		},
		[geometries, materials],
	);

	return (
		<>
			{ORB_DATA.map((orb, i) => (
				<mesh
					key={orb.color}
					ref={(el) => {
						meshRefs.current[i] = el;
					}}
					geometry={geometries[i]}
					material={materials[i]}
				/>
			))}
		</>
	);
}

export function OrbsBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 3], fov: 75 }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<Orbs />
			</Canvas>
		</div>
	);
}
