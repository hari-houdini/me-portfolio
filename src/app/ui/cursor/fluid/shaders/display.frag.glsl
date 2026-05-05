precision highp float;
precision highp sampler2D;
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 texelSize;
uniform bool uShading;

void main () {
  vec3 c = texture2D(uTexture, vUv).rgb;
  if (uShading) {
    vec2 vL = vUv - vec2(texelSize.x, 0.0);
    vec2 vR = vUv + vec2(texelSize.x, 0.0);
    vec2 vT = vUv + vec2(0.0, texelSize.y);
    vec2 vB = vUv - vec2(0.0, texelSize.y);
    vec3 lc = texture2D(uTexture, vL).rgb;
    vec3 rc = texture2D(uTexture, vR).rgb;
    vec3 tc = texture2D(uTexture, vT).rgb;
    vec3 bc = texture2D(uTexture, vB).rgb;

    float dx = length(rc) - length(lc);
    float dy = length(tc) - length(bc);

    vec3 n = normalize(vec3(dx, dy, length(texelSize)));
    vec3 l = vec3(0.0, 0.0, 1.0);

    float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
    c *= diffuse;
  }
  float a = max(c.r, max(c.g, c.b));
  gl_FragColor = vec4(c, a);
}
