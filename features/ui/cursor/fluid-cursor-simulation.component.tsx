// ---------------------------------------------------------
// Core R3F Simulation Component

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { FullScreenQuad } from "three-stdlib";

import vertexShader from "./shaders/fluid.vert.glsl";
import advectionFrag from "./shaders/advection.frag.glsl";
import splatFrag from "./shaders/splat.frag.glsl";
import divergenceFrag from "./shaders/divergence.frag.glsl";
import curlFrag from "./shaders/curl.frag.glsl";
import vorticityFrag from "./shaders/vorticity.frag.glsl";
import pressureFrag from "./shaders/pressure.frag.glsl";
import gradientSubtractFrag from "./shaders/gradient-subtract.frag.glsl";
import clearFrag from "./shaders/clear.frag.glsl";
import displayFrag from "./shaders/display.frag.glsl";
import { generateColor } from "./fluid-cursor.util";

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
// Helper: Double FBO for ping-pong buffering
// ---------------------------------------------------------
class DoubleFBO {
  read: THREE.WebGLRenderTarget;
  write: THREE.WebGLRenderTarget;

  constructor(
    w: number,
    h: number,
    type: THREE.TextureDataType,
    format: THREE.PixelFormat,
    minFilter: THREE.MinificationTextureFilter,
    magFilter: THREE.MagnificationTextureFilter
  ) {
    const options: THREE.RenderTargetOptions = {
      type,
      format,
      minFilter: minFilter,
      magFilter: magFilter,
      depthBuffer: false,
      stencilBuffer: false,
    };
    this.read = new THREE.WebGLRenderTarget(w, h, options);
    this.write = new THREE.WebGLRenderTarget(w, h, options);
  }

  swap() {
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }

  dispose() {
    this.read.dispose();
    this.write.dispose();
  }
}

// ---------------------------------------------------------
export const FluidSimulation = ({ props }: { props: Required<FluidCursorProps> }) => {
  const { gl, size } = useThree();

  // State refs
  const colorUpdateTimer = useRef(0);
  
  const pointer = useRef({
    texcoordX: 0,
    texcoordY: 0,
    prevTexcoordX: 0,
    prevTexcoordY: 0,
    deltaX: 0,
    deltaY: 0,
    moved: false,
    color: { r: 0, g: 0, b: 0 },
  });

  // Setup FBOs and Materials only once (or when resolutions change)
  const engine = useMemo(() => {
    // Determine resolutions
    const aspectRatio = size.width / size.height;
    const simW = Math.round(props.simResolution * (aspectRatio > 1 ? aspectRatio : 1));
    const simH = Math.round(props.simResolution * (aspectRatio < 1 ? 1 / aspectRatio : 1));
    const dyeW = Math.round(props.dyeResolution * (aspectRatio > 1 ? aspectRatio : 1));
    const dyeH = Math.round(props.dyeResolution * (aspectRatio < 1 ? 1 / aspectRatio : 1));

    const texType = THREE.HalfFloatType;
    const filter = THREE.LinearFilter;

    const fbos = {
      dye: new DoubleFBO(dyeW, dyeH, texType, THREE.RGBAFormat, filter, filter),
      velocity: new DoubleFBO(simW, simH, texType, THREE.RGFormat, filter, filter),
      divergence: new THREE.WebGLRenderTarget(simW, simH, { type: texType, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }),
      curl: new THREE.WebGLRenderTarget(simW, simH, { type: texType, format: THREE.RedFormat, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: false }),
      pressure: new DoubleFBO(simW, simH, texType, THREE.RedFormat, THREE.NearestFilter, THREE.NearestFilter),
    };

    const uniforms = {
      dyeTexelSize: new THREE.Vector2(1 / dyeW, 1 / dyeH),
      simTexelSize: new THREE.Vector2(1 / simW, 1 / simH),
    };

    const createMaterial = (frag: string, customUniforms: any = {}) =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader: frag,
        uniforms: {
          texelSize: { value: uniforms.simTexelSize },
          ...customUniforms,
        },
        depthWrite: false,
        depthTest: false,
      });

    const materials = {
      clear: createMaterial(clearFrag, { uTexture: { value: null }, value: { value: props.pressure } }),
      splat: createMaterial(splatFrag, { uTarget: { value: null }, aspectRatio: { value: aspectRatio }, color: { value: new THREE.Vector3() }, point: { value: new THREE.Vector2() }, radius: { value: props.splatRadius / 100 } }),
      advection: createMaterial(advectionFrag, { uVelocity: { value: null }, uSource: { value: null }, dt: { value: 0.016 }, dissipation: { value: 1 } }),
      divergence: createMaterial(divergenceFrag, { uVelocity: { value: null } }),
      curl: createMaterial(curlFrag, { uVelocity: { value: null } }),
      vorticity: createMaterial(vorticityFrag, { uVelocity: { value: null }, uCurl: { value: null }, curl: { value: props.curl }, dt: { value: 0.016 } }),
      pressure: createMaterial(pressureFrag, { uPressure: { value: null }, uDivergence: { value: null } }),
      gradientSubtract: createMaterial(gradientSubtractFrag, { uPressure: { value: null }, uVelocity: { value: null } }),
      display: createMaterial(displayFrag, { uTexture: { value: null }, uShading: { value: props.shading }, texelSize: { value: uniforms.dyeTexelSize } }),
    };

    const fsQuad = new FullScreenQuad(materials.display);

    return { fbos, materials, fsQuad, uniforms, aspectRatio };
  }, [size.width, size.height, props.simResolution, props.dyeResolution]);

  // Clean up WebGL resources
  useEffect(() => {
    return () => {
      engine.fbos.dye.dispose();
      engine.fbos.velocity.dispose();
      engine.fbos.divergence.dispose();
      engine.fbos.curl.dispose();
      engine.fbos.pressure.dispose();
      engine.fsQuad.dispose();
      Object.values(engine.materials).forEach(m => m.dispose());
    };
  }, [engine]);

  // Interaction handlers mapped to window
  useEffect(() => {
    

    const updatePointer = (e: MouseEvent | Touch) => {
      const x = e.clientX / window.innerWidth;
      const y = 1 - e.clientY / window.innerHeight; // WebGL UV space

      pointer.current.prevTexcoordX = pointer.current.texcoordX;
      pointer.current.prevTexcoordY = pointer.current.texcoordY;
      pointer.current.texcoordX = x;
      pointer.current.texcoordY = y;
      
      let dx = x - pointer.current.prevTexcoordX;
      let dy = y - pointer.current.prevTexcoordY;
      
      // Aspect ratio correction for interaction
      if (engine.aspectRatio < 1) dx *= engine.aspectRatio;
      if (engine.aspectRatio > 1) dy /= engine.aspectRatio;

      pointer.current.deltaX = dx;
      pointer.current.deltaY = dy;
      pointer.current.moved = Math.abs(dx) > 0 || Math.abs(dy) > 0;
    };

    const onMove = (e: MouseEvent) => updatePointer(e);
    const onTouchMove = (e: TouchEvent) => updatePointer(e.targetTouches[0]);

    // Initial click splat
    const onClick = (e: MouseEvent) => {
      updatePointer(e);
      pointer.current.color = generateColor();
      // Emulate click splat by giving massive fake delta
      pointer.current.deltaX = 10 * (Math.random() - 0.5) / props.splatForce;
      pointer.current.deltaY = 30 * (Math.random() - 0.5) / props.splatForce;
      pointer.current.moved = true;
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mousedown", onClick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mousedown", onClick);
    };
  }, [engine.aspectRatio, props.splatForce]);


  // ---------------------------------------------------------
  // Frame Loop (Overrides default rendering via renderPriority = 1)
  // ---------------------------------------------------------
  useFrame(({ gl }, delta ) => {
    // const now = Date.now();
    // let dt = (now - lastUpdateTime.current) / 1000;
    // dt = Math.min(dt, 0.016666);
    // lastUpdateTime.current = now;

    let dt = delta

    // Update color
    colorUpdateTimer.current += dt * props.colorUpdateSpeed;
    if (colorUpdateTimer.current >= 1) {
      colorUpdateTimer.current %= 1;
      const c = generateColor();
      // simplified color generation omitted to keep succinct, using random
      pointer.current.color = c;
    }

    // Helper to render quad
    const blit = (target: THREE.WebGLRenderTarget | null, material: THREE.ShaderMaterial) => {
      engine.fsQuad.material = material;
      gl.setRenderTarget(target);
      if (target === null) {
        // gl.clearColor(0, 0, 0, 1);
        gl.clearColor();
        gl.clear();
      }
      engine.fsQuad.render(gl);
    };

    // 1. Splat input
    if (pointer.current.moved) {
      pointer.current.moved = false;
      const splatMat = engine.materials.splat;
      
      // Velocity Splat
      splatMat.uniforms.uTarget.value = engine.fbos.velocity.read.texture;
      splatMat.uniforms.point.value.set(pointer.current.texcoordX, pointer.current.texcoordY);
      splatMat.uniforms.color.value.set(pointer.current.deltaX * props.splatForce, pointer.current.deltaY * props.splatForce, 0);
      splatMat.uniforms.radius.value = (props.splatRadius / 100) * (engine.aspectRatio > 1 ? engine.aspectRatio : 1);
      blit(engine.fbos.velocity.write, splatMat);
      engine.fbos.velocity.swap();

      // Dye Splat
      splatMat.uniforms.uTarget.value = engine.fbos.dye.read.texture;
      splatMat.uniforms.color.value.set(pointer.current.color.r, pointer.current.color.g, pointer.current.color.b);
      blit(engine.fbos.dye.write, splatMat);
      engine.fbos.dye.swap();
    }

    // 2. Curl
    engine.materials.curl.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    blit(engine.fbos.curl, engine.materials.curl);

    // 3. Vorticity
    engine.materials.vorticity.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    engine.materials.vorticity.uniforms.uCurl.value = engine.fbos.curl.texture;
    engine.materials.vorticity.uniforms.dt.value = dt;
    blit(engine.fbos.velocity.write, engine.materials.vorticity);
    engine.fbos.velocity.swap();

    // 4. Divergence
    engine.materials.divergence.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    blit(engine.fbos.divergence, engine.materials.divergence);

    // 5. Clear Pressure
    engine.materials.clear.uniforms.uTexture.value = engine.fbos.pressure.read.texture;
    engine.materials.clear.uniforms.value.value = props.pressure;
    blit(engine.fbos.pressure.write, engine.materials.clear);
    engine.fbos.pressure.swap();

    // 6. Pressure Iterations
    engine.materials.pressure.uniforms.uDivergence.value = engine.fbos.divergence.texture;
    for (let i = 0; i < props.pressureIterations; i++) {
      engine.materials.pressure.uniforms.uPressure.value = engine.fbos.pressure.read.texture;
      blit(engine.fbos.pressure.write, engine.materials.pressure);
      engine.fbos.pressure.swap();
    }

    // 7. Gradient Subtract
    engine.materials.gradientSubtract.uniforms.uPressure.value = engine.fbos.pressure.read.texture;
    engine.materials.gradientSubtract.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    blit(engine.fbos.velocity.write, engine.materials.gradientSubtract);
    engine.fbos.velocity.swap();

    // 8. Advection (Velocity)
    engine.materials.advection.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    engine.materials.advection.uniforms.uSource.value = engine.fbos.velocity.read.texture;
    engine.materials.advection.uniforms.dissipation.value = props.velocityDissipation;
    engine.materials.advection.uniforms.dt.value = dt;
    engine.materials.advection.uniforms.texelSize.value = engine.uniforms.simTexelSize;
    blit(engine.fbos.velocity.write, engine.materials.advection);
    engine.fbos.velocity.swap();

    // 9. Advection (Dye)
    engine.materials.advection.uniforms.uVelocity.value = engine.fbos.velocity.read.texture;
    engine.materials.advection.uniforms.uSource.value = engine.fbos.dye.read.texture;
    engine.materials.advection.uniforms.dissipation.value = props.densityDissipation;
    engine.materials.advection.uniforms.texelSize.value = engine.uniforms.simTexelSize; 
    blit(engine.fbos.dye.write, engine.materials.advection);
    engine.fbos.dye.swap();

    // 10. Display to screen
    engine.materials.display.uniforms.uTexture.value = engine.fbos.dye.read.texture;
    engine.materials.display.uniforms.uShading.value = props.shading;
    blit(null, engine.materials.display);

  }, 1); // priority = 1 hijacks R3F render loop

  return null; // This component handles rendering imperatively, no JSX needed here.
};