"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import styles from "./backgrounds.module.css";
import wavesFrag from "./shaders/waves.frag.glsl";
import wavesVert from "./shaders/waves.vert.glsl";

function WavePlane() {
	const meshRef = useRef<THREE.Mesh>(null);

	const geometry = useMemo(() => new THREE.PlaneGeometry(4, 4, 48, 48), []);
	const material = useMemo(
		() =>
			new THREE.ShaderMaterial({
				vertexShader: wavesVert,
				fragmentShader: wavesFrag,
				uniforms: { uTime: { value: 0 } },
				transparent: true,
				depthWrite: false,
				side: THREE.DoubleSide,
			}),
		[],
	);

	useFrame(({ clock }) => {
		material.uniforms.uTime.value = clock.getElapsedTime();
	});

	useEffect(
		() => () => {
			geometry.dispose();
			material.dispose();
		},
		[geometry, material],
	);

	return (
		<mesh
			ref={meshRef}
			geometry={geometry}
			material={material}
			rotation={[-Math.PI / 3, 0, 0]}
			position={[0, -0.5, 0]}
		/>
	);
}

export function WavesBackground() {
	return (
		<div className={styles.canvas} aria-hidden="true">
			<Canvas
				camera={{ position: [0, 1, 3], fov: 60 }}
				gl={{ alpha: true }}
				style={{ width: "100%", height: "100%" }}
			>
				<WavePlane />
			</Canvas>
		</div>
	);
}
