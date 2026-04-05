import * as THREE from "three";

export const generateColor = (): THREE.Color => {
        const brandingColor = [
            "#00F7FF", // Electric Cyan
            "#00FF85", // Hyper Green
            "#FF0099", // Vivid Magenta
            "#FF8F00", // Safety Orange
            "#7C00FE" // Ultraviolet
        ]
        const randomIndex = Math.floor(Math.random() * (brandingColor.length - 1))
        return new THREE.Color().setStyle(brandingColor[randomIndex]);
    };