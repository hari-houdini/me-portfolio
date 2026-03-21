/**
 * rain.frag — rain particle fragment shader
 *
 * Renders each rain drop as a small, semi-transparent streak.
 * Colour is a desaturated cyan to pick up the neon reflections.
 */

varying float vOpacity;

void main() {
    float alpha = (1.0 - gl_PointCoord.y) * 0.6 * vOpacity;
    gl_FragColor = vec4(0.6, 0.8, 0.9, alpha);
}
