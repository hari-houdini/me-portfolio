uniform float uTime;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  vUv = uv;
  float d = sin(position.x * 2.5 + uTime) * 0.15
          + sin(position.y * 2.0 - uTime * 0.8) * 0.12;
  vDisplacement = d;
  vec3 displaced = position + normal * d;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
