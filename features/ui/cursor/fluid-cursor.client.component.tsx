import React from "react";
import { Canvas } from "@react-three/fiber";

import styles from "./fluid-cursor.module.css";
import { FluidSimulation } from "./fluid-cursor-simulation.component";

interface FluidCursorProps {
  simResolution?: number;
  dyeResolution?: number;
  densityDissipation?: number;
  velocityDissipation?: number;
  pressure?: number;
  pressureIterations?: number;
  curl?: number;
  splatRadius?: number;
  splatForce?: number;
  shading?: boolean;
  colorUpdateSpeed?: number;
  className?: string;
}

// ---------------------------------------------------------
// Main Wrapper
// ---------------------------------------------------------
export const FluidCursor: React.FC<FluidCursorProps> = ({
  simResolution = 128,
  dyeResolution = 1440,
  densityDissipation = 3.5,
  velocityDissipation = 2,
  pressure = 0.1,
  pressureIterations = 20,
  curl = 3,
  splatRadius = 0.2,
  splatForce = 6000,
  shading = true,
  colorUpdateSpeed = 10,
  className = "",
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Set preserveDrawingBuffer false to match Vue context creation args */}
      <Canvas gl={{ preserveDrawingBuffer: false, alpha: true, antialias: false, depth: false, stencil: false }}>
        <FluidSimulation
          props={{
            simResolution, dyeResolution, densityDissipation, velocityDissipation,
            pressure, pressureIterations, curl, splatRadius, splatForce, shading,
            colorUpdateSpeed, className
          }}
        />
      </Canvas>
    </div>
  );
};