uniform float uTime;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float t = uTime * 0.3;

  // Layered sine waves for aurora bands
  float y1 = sin(uv.x * 3.0 + t) * 0.15 + 0.5;
  float y2 = sin(uv.x * 5.0 - t * 1.3 + 1.2) * 0.1 + 0.55;
  float y3 = sin(uv.x * 2.0 + t * 0.7 + 2.4) * 0.12 + 0.45;

  float band1 = smoothstep(0.04, 0.0, abs(uv.y - y1));
  float band2 = smoothstep(0.035, 0.0, abs(uv.y - y2));
  float band3 = smoothstep(0.045, 0.0, abs(uv.y - y3));

  // Neon palette colours
  vec3 cyan    = vec3(0.0, 0.969, 1.0);    // #00F7FF
  vec3 green   = vec3(0.0, 1.0, 0.522);    // #00FF85
  vec3 magenta = vec3(1.0, 0.0, 0.6);      // #FF0099

  vec3 col = band1 * cyan + band2 * green + band3 * magenta;
  float alpha = clamp(band1 + band2 + band3, 0.0, 0.85);

  gl_FragColor = vec4(col, alpha);
}
