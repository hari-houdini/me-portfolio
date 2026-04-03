"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";

const METEOR_COUNT = 25;
const NEON_COLORS = ["#00f7ff", "#00ff85", "#ff0099", "#ff8f00", "#7c00fe"];

interface MeteorData {
	id: string;
	geometry: THREE.BufferGeometry;
	material: THREE.MeshBasicMaterial;
	speed: number;
	offset: number;
}

function Meteors() {
	const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

	const meteors = useMemo<MeteorData[]>(() => {
		return Array.from({ length: METEOR_COUNT }, (_, i) => {
			// Thin box geometry oriented as a streak (wide on x, very thin on y/z)
			const geo = new THREE.BoxGeometry(0.32, 0.003, 0.001);
			const mat = new THREE.MeshBasicMaterial({
				color: NEON_COLORS[i % NEON_COLORS.length],
				transparent: true,
				opacity: 0.7,
			});
			return {
				id: `meteor-${i}`,
				geometry: geo,
				material: mat,
				speed: 0.4 + Math.random() * 0.8,
				offset: Math.random(),
			};
		});
	}, []);

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		meteors.forEach((m, i) => {
			const mesh = meshRefs.current[i];
			if (!mesh) return;
			const progress = ((t * m.speed + m.offset * 3) % 3) / 3;
			mesh.position.x = 2 - progress * 5;
			mesh.position.y = 1.5 - progress * 3.5;
			m.material.opacity = Math.sin(progress * Math.PI) * 0.7;
		});
	});

	useEffect(
		() => () => {
			for (const m of meteors) {
				m.geometry.dispose();
				m.material.dispose();
			}
		},
		[meteors],
	);

	return (
		<>
			{meteors.map((m, i) => (
				<mesh
					key={m.id}
					ref={(el) => {
						meshRefs.current[i] = el;
					}}
					geometry={m.geometry}
					material={m.material}
					// Rotate ~-25 degrees on Z so streaks angle top-right → bottom-left
					rotation={[0, 0, -0.44]}
				/>
			))}
		</>
	);
}

export function MeteorsBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 3], fov: 75 }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<Meteors />
			</Canvas>
		</div>
	);
}
