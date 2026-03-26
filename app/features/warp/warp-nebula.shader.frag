uniform float uOpacity;
varying vec3 vPosition;

void main() {
  // Map normalised position to a colour based on the direction from the origin
  vec3 dir = normalize(vPosition);

  // Colour stops: void black (sides/bottom) → deep violet (midfield) → purple (top/ahead)
  float upFactor  = max(0.0, dir.y * 0.5 + 0.5); // 0=looking down, 1=looking up
  float fwdFactor = max(0.0, -dir.z * 0.5 + 0.5); // 0=behind, 1=forward

  vec3 voidColor   = vec3(0.0,  0.0,  0.002);
  vec3 violetColor = vec3(0.12, 0.0,  0.22);
  vec3 purpleColor = vec3(0.06, 0.0,  0.18);

  // Blend: strong forward component gets violet, upward gets purple tint
  vec3 color = mix(voidColor, violetColor, fwdFactor * 0.7);
  color = mix(color, purpleColor, upFactor * 0.3);

  // Very subtle animated shimmer via a static dither — keeps the nebula alive
  float noise = fract(sin(dot(dir.xy, vec2(127.1, 311.7))) * 43758.5453);
  color += noise * 0.008;

  gl_FragColor = vec4(color, uOpacity * 0.95);
}
