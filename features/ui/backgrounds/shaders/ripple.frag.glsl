uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = (gl_FragCoord.xy / uResolution) * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;
  float r = length(uv);
  float ripple = sin(r * 12.0 - uTime * 2.5) * 0.5 + 0.5;
  float fade = smoothstep(1.0, 0.0, r);
  vec3 cyan = vec3(0.0, 0.969, 1.0);
  gl_FragColor = vec4(cyan * ripple, ripple * fade * 0.5);
}
