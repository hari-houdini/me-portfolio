uniform float uTime;
varying vec2 vUv;
varying float vDisplacement;

void main() {
  float t = vDisplacement * 0.5 + 0.5;
  vec3 cyan  = vec3(0.0, 0.969, 1.0);
  vec3 blue  = vec3(0.047, 0.0, 0.996);
  vec3 col = mix(blue, cyan, t);
  float alpha = 0.55 + vDisplacement * 0.3;
  gl_FragColor = vec4(col, clamp(alpha, 0.2, 0.8));
}
