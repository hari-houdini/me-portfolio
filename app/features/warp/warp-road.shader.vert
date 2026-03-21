/**
 * warp-road.shader.vert — neon grid road vertex shader
 *
 * The road grid is rendered as a LineSegments mesh with vertices from
 * warp.generator.ts. This vertex shader animates the Z offset so the grid
 * appears to scroll toward the camera continuously (infinite road illusion).
 *
 * uScrollZ: accumulated Z scroll offset, increases each frame
 * uRoadDepth: total depth of the grid (grid wraps with mod)
 */

uniform float uScrollZ;
uniform float uRoadDepth;
uniform float uOpacity;

varying float vDepthFactor;
varying float vOpacity;

void main() {
    vOpacity = uOpacity;

    vec3 pos = position;

    // Scroll grid lines along Z — wrap using mod for infinite illusion
    pos.z = mod(pos.z - uScrollZ, uRoadDepth);
    // Keep in [-uRoadDepth, 0] range
    if (pos.z > 0.0) pos.z -= uRoadDepth;

    // Depth factor: 0=far, 1=near — drives line brightness in fragment
    vDepthFactor = 1.0 - abs(pos.z) / uRoadDepth;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
