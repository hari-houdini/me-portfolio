/**
 * rain.vert — rain particle vertex shader
 *
 * Rain particles fall in a loop. The y position cycles via mod()
 * so particles that fall below the city floor reappear at the top.
 * The uTime uniform drives the fall animation.
 */

uniform float uTime;
uniform float uOpacity;
uniform float uFallHeight;
uniform float uFallSpeed;

varying float vOpacity;

void main() {
    vOpacity = uOpacity;

    vec3 pos = position;

    // Fall downward — wrap with modulo when below zero
    float fallOffset = mod(pos.y - uTime * uFallSpeed, uFallHeight);
    pos.y = fallOffset - uFallHeight * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Rain streaks — small elongated points
    gl_PointSize = 1.5;
}
