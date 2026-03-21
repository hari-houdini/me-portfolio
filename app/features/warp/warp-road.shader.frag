/**
 * warp-road.shader.frag — neon grid road fragment shader
 *
 * Grid lines are rendered with a violet primary colour and cyan accent
 * (centre lines get the cyan highlight). Brightness falls off with distance
 * to give perspective depth. Additive blending in the component amplifies
 * the glow effect without requiring explicit bloom uniforms here.
 */

varying float vDepthFactor;
varying float vOpacity;

void main() {
    // Primary grid colour: violet (#9d00ff) → cyan (#00f5ff) based on depth
    // Near lines appear more cyan (high energy), far lines more violet (fading)
    vec3 violet = vec3(0.616, 0.0, 1.0);
    vec3 cyan   = vec3(0.0, 0.961, 1.0);
    vec3 color  = mix(violet, cyan, vDepthFactor * 0.7);

    // Brightness: near lines are bright, far lines fade to darkness
    float brightness = 0.3 + vDepthFactor * 0.7;
    color *= brightness;

    gl_FragColor = vec4(color, brightness * vOpacity);
}
