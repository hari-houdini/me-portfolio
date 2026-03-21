/**
 * galaxy.frag — galaxy particle fragment shader
 *
 * Renders each particle as a soft circular disc with:
 *  - A radial falloff glow (bright centre, transparent edge)
 *  - Colour interpolated from the vertex shader
 *  - Global opacity for fade transitions between sections
 */

varying vec3 vColor;
varying float vOpacity;

void main() {
    // Compute distance from centre of point sprite (0=centre, 1=edge)
    float dist = length(gl_PointCoord - vec2(0.5));

    // Discard fragments outside the circle
    if (dist > 0.5) discard;

    // Soft radial glow — bright core, transparent edges
    float strength = 1.0 - smoothstep(0.0, 0.5, dist);
    strength = pow(strength, 1.5);

    gl_FragColor = vec4(vColor, strength * vOpacity);
}
