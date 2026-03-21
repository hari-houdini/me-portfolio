/**
 * warp-stars.shader.frag — warp speed star streak fragment shader
 *
 * Stars appear as elongated bright streaks along the Z axis (toward the camera).
 * The radial glow makes them feel like light sources rather than points.
 * The streak axis is created by squishing the point sprite's Y coordinate.
 */

varying float vOpacity;
varying float vStreak;

void main() {
    // Remap point coord to [-0.5, 0.5]
    vec2 uv = gl_PointCoord - 0.5;

    // Elongate along Y to simulate a streak along the camera axis
    // The streak ratio increases with depthFactor (stars near camera streak more)
    float streakRatio = 1.0 + vStreak * 4.0;
    float dist = length(vec2(uv.x, uv.y * streakRatio));

    if (dist > 0.5) discard;

    // Radial glow
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    strength = pow(strength, 1.2);

    // Colour: white core, slight blue-white tint at edges
    vec3 color = mix(vec3(0.7, 0.8, 1.0), vec3(1.0, 1.0, 1.0), strength);

    gl_FragColor = vec4(color, strength * vOpacity);
}
