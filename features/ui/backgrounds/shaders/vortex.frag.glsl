uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  float r = length(uv);
  float angle = atan(uv.y, uv.x) + uTime * 0.5 + r * 4.0;
  float spiral = sin(angle * 3.0 - r * 6.0) * 0.5 + 0.5;
  float mask = smoothstep(1.0, 0.0, r);
  vec3 cyan    = vec3(0.0, 0.969, 1.0);
  vec3 magenta = vec3(1.0, 0.0, 0.6);
  vec3 col = mix(magenta, cyan, spiral);
  gl_FragColor = vec4(col * mask, spiral * mask * 0.7);
}
