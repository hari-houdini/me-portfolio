/**
 * galaxy.vert — galaxy particle vertex shader
 *
 * Each particle's position, colour, and size are driven by custom attributes
 * uploaded from galaxy-generator.ts. The vertex shader applies:
 *  - Distance-based size attenuation (particles far from camera appear smaller)
 *  - A slow rotation animation via a time uniform
 *  - Subtle vertical displacement based on time for a "breathing" effect
 */

attribute float aSize;
attribute vec3 aColor;
attribute float aAngle;

uniform float uTime;
uniform float uOpacity;

varying vec3 vColor;
varying float vOpacity;

void main() {
    vColor = aColor;
    vOpacity = uOpacity;

    vec3 pos = position;

    // Slow galaxy rotation — entire disk rotates as one body
    float rotationSpeed = 0.02;
    float angle = uTime * rotationSpeed;
    float c = cos(angle);
    float s = sin(angle);
    float x = pos.x * c - pos.z * s;
    float z = pos.x * s + pos.z * c;
    pos.x = x;
    pos.z = z;

    // Subtle vertical shimmer for twinkling effect
    float distFromCenter = length(pos.xz);
    pos.y += sin(uTime * 0.5 + distFromCenter * 0.3) * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Size attenuation — WebGL point sprites need manual size calculation
    float sizeAttenuation = 300.0 / -mvPosition.z;
    gl_PointSize = aSize * sizeAttenuation;
    gl_PointSize = clamp(gl_PointSize, 0.5, 8.0);
}
