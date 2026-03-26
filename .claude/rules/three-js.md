---
paths:
  - "**/*.client.component.tsx"
  - "app/features/experience/**"
  - "app/features/galaxy/**"
  - "app/features/warp/**"
  - "app/types/glsl.d.ts"
  - "**/*.glsl"
  - "**/*.vert"
  - "**/*.frag"
---

# Three.js / React Three Fiber Rules

## Resource lifecycle — the most critical section
Every GPU resource created in code MUST be explicitly disposed on unmount:

```tsx
const geometry = useMemo(() => new THREE.BufferGeometry(), []);
const material = useMemo(() => new THREE.ShaderMaterial({ ... }), []);

useEffect(() => () => {
  geometry.dispose();
  material.dispose();
}, [geometry, material]);
```

- `BufferGeometry`, `Material` (all subtypes), `Texture`, `WebGLRenderTarget` — always dispose
- R3F auto-disposes JSX-declared primitives (`<meshStandardMaterial />`), but NOT objects passed via `geometry={geo}` or `<primitive object={...} />`
- Never add a Three.js object to a `useMemo` dep array that changes on every frame (e.g., scroll offset) — this leaks GPU memory at 60fps

## Per-frame work
- Use `useFrame` inside `<Canvas>` for all per-frame logic — never `requestAnimationFrame` directly
- `useFrame` stops automatically on unmount; rAF loops must be manually cancelled (and often aren't)
- Update uniforms inside `useFrame`, not by changing `useMemo` dep arrays

## Scroll architecture
- `ScrollControls` (drei) is the scroll source inside the canvas — it injects its own internal scroll element
- GSAP `ScrollTrigger` must attach to `ScrollControls`' internal scroll element (not `window`, not the outer container)
- The outer container has `overflow: hidden` and never scrolls — never attach `ScrollTrigger` to it

## GLSL shaders
- All `.glsl`, `.vert`, `.frag` files are imported as typed strings via `vite-plugin-glsl` — never inline template literals
- Shader uniform names in TypeScript must match `uniform` declarations in GLSL exactly (case-sensitive)
- `app/types/glsl.d.ts` declares the module types — never delete or modify it

## SSR safety
- Three.js is never imported in server-side code paths
- Canvas components are always `React.lazy`-loaded and wrapped in `<Suspense>` at usage site
- No `window`, `document`, `navigator`, or `WebGLRenderingContext` access at module scope
