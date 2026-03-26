/**
 * warp-stars.shader.vert — warp speed star streak vertex shader
 *
 * Each star is a point sprite. The "streak" effect is achieved by rendering
 * the star at two positions — the actual position and a slightly offset position
 * behind it along Z — using alpha in the fragment shader to create a directional
 * smear. The uSpeed uniform controls overall warp intensity.
 *
 * uTime drives the Z-cycling animation: stars move toward the camera (increasing Z)
 * and wrap back to -tunnelDepth when they pass the camera.
 */

attribute float aSpeed;

uniform float uTime;
uniform float uSpeed;     // Overall warp speed multiplier
uniform float uTunnelDepth;
uniform float uOpacity;

varying float vOpacity;
varying float vStreak;

void main() {
    vOpacity = uOpacity;

    vec3 pos = position;

    // Move star toward camera (+Z direction) at its individual speed
    float travel = mod(pos.z + uTime * uSpeed * aSpeed, uTunnelDepth);
    // Map back to [-tunnelDepth, 0] range
    pos.z = travel - uTunnelDepth;

    // Streak intensity: stars closer to the camera (higher z) appear longer
    // Normalised depth: 0=far, 1=camera
    float depthFactor = 1.0 - abs(pos.z) / uTunnelDepth;
    vStreak = depthFactor;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Point size: small at distance, large when close — adds depth cue
    float sizeAttenuation = 400.0 / -mvPosition.z;
    gl_PointSize = clamp((0.5 + depthFactor * 2.5) * sizeAttenuation, 0.5, 12.0);
}
