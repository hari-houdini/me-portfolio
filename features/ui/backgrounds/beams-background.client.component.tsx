"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";

const NEON = ["#00f7ff", "#00ff85", "#ff0099", "#ff8f00", "#7c00fe", "#00f7ff"];
const BEAM_COUNT = 6;

function Beams() {
	const refs = useRef<(THREE.Mesh | null)[]>([]);

	const { geometries, materials } = useMemo(() => {
		const geos = Array.from(
			{ length: BEAM_COUNT },
			() => new THREE.ConeGeometry(0.02, 2.5, 4),
		);
		const mats = NEON.slice(0, BEAM_COUNT).map(
			(c) =>
				new THREE.MeshBasicMaterial({
					color: c,
					transparent: true,
					opacity: 0.28,
					side: THREE.DoubleSide,
				}),
		);
		return { geometries: geos, materials: mats };
	}, []);

	useFrame(({ clock }) => {
		const t = clock.getElapsedTime();
		refs.current.forEach((mesh, i) => {
			if (!mesh) return;
			mesh.scale.y = 1 + Math.sin(t * 0.8 + i * 0.5) * 0.12;
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
			{NEON.slice(0, BEAM_COUNT).map((color, i) => {
				const angle = ((i - (BEAM_COUNT - 1) / 2) / (BEAM_COUNT - 1)) * 1.2;
				return (
					<mesh
						key={color}
						ref={(el) => {
							refs.current[i] = el;
						}}
						geometry={geometries[i]}
						material={materials[i]}
						position={[0, 1.2, 0]}
						rotation={[0, 0, -angle]}
					/>
				);
			})}
		</>
	);
}

export function BeamsBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 0, 3], fov: 75 }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<Beams />
			</Canvas>
		</div>
	);
}
