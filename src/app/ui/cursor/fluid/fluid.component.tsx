import { Canvas } from "@react-three/fiber";
import styles from "./fluid.module.css";
import type { FluidCursorProps } from "./fluid.schema";
import { FluidSimulation } from "./simulation/simulation.component";

export default function FluidCursor({
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
}: FluidCursorProps) {
  return (
    <div className={`${styles.container} ${className}`}>
      {/* Set preserveDrawingBuffer false to match Vue context creation args */}
      <Canvas
        gl={{
          preserveDrawingBuffer: false,
          alpha: true,
          antialias: false,
          depth: false,
          stencil: false,
        }}
      >
        <FluidSimulation
          props={{
            simResolution,
            dyeResolution,
            densityDissipation,
            velocityDissipation,
            pressure,
            pressureIterations,
            curl,
            splatRadius,
            splatForce,
            shading,
            colorUpdateSpeed,
            className,
          }}
        />
      </Canvas>
    </div>
  );
}
