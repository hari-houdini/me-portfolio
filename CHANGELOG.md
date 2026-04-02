# [1.6.0](https://github.com/hari-houdini/me-portfolio/compare/v1.5.0...v1.6.0) (2026-04-02)


### Features

* **portfolio:** Phase 3 — accessible HTML shell with full CMS pipeline ([38bc39e](https://github.com/hari-houdini/me-portfolio/commit/38bc39ec7551cd1d4522f2615c74d7e83418d87c))
* **portfolio:** Phase 3 — accessible HTML shell with Server Components ([0d47d17](https://github.com/hari-houdini/me-portfolio/commit/0d47d176af89da9e5e57cb5b0e3024ee3a10c810))

# [1.5.0](https://github.com/hari-houdini/me-portfolio/compare/v1.4.0...v1.5.0) (2026-04-02)


### Bug Fixes

* **ci:** exclude auto-generated migrations/ from Biome lint ([72964d9](https://github.com/hari-houdini/me-portfolio/commit/72964d9d7a8be3bab7436277201abdb7abaa43e9))
* **cms:** stabilise Payload v3 dev setup — proper route structure and HMR fix ([230ad5f](https://github.com/hari-houdini/me-portfolio/commit/230ad5f091bb70533094d33a19449ecfcd381832))


### Features

* **cms:** add CMS service layer — Phase 2 ([cf23a71](https://github.com/hari-houdini/me-portfolio/commit/cf23a7126785f5f9e47d44be601b3ba59002e92a))

# [1.4.0](https://github.com/hari-houdini/me-portfolio/compare/v1.3.0...v1.4.0) (2026-03-27)


### Bug Fixes

* **ci:** guard SST Resource access and rewrite bundle-size for Next.js ([d737991](https://github.com/hari-houdini/me-portfolio/commit/d737991a73f13089ae94a322a83aab7661a490f5))
* **ci:** pass vitest when no test files exist in Phase 1 ([ed3e9ee](https://github.com/hari-houdini/me-portfolio/commit/ed3e9eef67b630b0408ac8603baba0dbbcb73716))


### Features

* **rewrite:** Phase 1 — Next.js 16 + Payload embedded + SST v3 foundation ([822bdbf](https://github.com/hari-houdini/me-portfolio/commit/822bdbfb7e45c32ba5ef878e9ee1cc1c466089ca))
* **sst:** upgrade to SST v4 with Resource.* best practices ([b208a06](https://github.com/hari-houdini/me-portfolio/commit/b208a06c109f9956174f1988338e27fb1212700f))

# [1.3.0](https://github.com/hari-houdini/me-portfolio/compare/v1.2.0...v1.3.0) (2026-03-26)


### Bug Fixes

* **3d:** resolve 4 Major issues from second Claude review ([e3ce0fc](https://github.com/hari-houdini/me-portfolio/commit/e3ce0fcd6a77f9612a924b931aff21b57688dc7a))
* **3d:** resolve 5 Major issues from Claude review ([144f4c9](https://github.com/hari-houdini/me-portfolio/commit/144f4c94ceeab4726ce1eec37f8eb38c69898ab7))
* **scroll:** tune Section 1→2 snap threshold for reliable engagement ([9b0426e](https://github.com/hari-houdini/me-portfolio/commit/9b0426e042b40174a9ac9d199bfd45915b7b189d))


### Features

* **phase-3/audio:** add Web Audio ambient synthesis and accessible toggle ([5b6425b](https://github.com/hari-houdini/me-portfolio/commit/5b6425be33cca5a38d2f5734580f43585c9c00ad))
* **phase-3/city:** add procedural cyberpunk city with rain, car lights, and neon signs ([28d877a](https://github.com/hari-houdini/me-portfolio/commit/28d877a867e881403f2789fa7011d0542fe479de))
* **phase-3/experience:** add R3F canvas, scroll-driven camera rig, and post-processing ([771b5a2](https://github.com/hari-houdini/me-portfolio/commit/771b5a230de156ca4a71bf6052416667adeaa0b2))
* **phase-3/galaxy:** add spiral galaxy particle system with GLSL shaders and 3D titles ([7904484](https://github.com/hari-houdini/me-portfolio/commit/790448498ae0bb8fad94a203709a79c32467b27b))
* **phase-3/integration:** wire full 3D experience into home route with GSAP snap and mobile fallback ([798d142](https://github.com/hari-houdini/me-portfolio/commit/798d14256885e8bd8d729aac73dcec4ef7cf6a4c)), closes [#050520](https://github.com/hari-houdini/me-portfolio/issues/050520)
* **phase-3/overlays:** add HTML content overlays for all three sections ([97dc7c1](https://github.com/hari-houdini/me-portfolio/commit/97dc7c1a7bb42488724c5e121b4d94b850cdec0b))
* **section1/hero:** GSAP scroll-driven title animation — centred to editorial ([03f9b3a](https://github.com/hari-houdini/me-portfolio/commit/03f9b3a758521615eb8e69a779df169660192911))
* **section3/warp:** replace city with cosmic neon warp tunnel ([afd1ff5](https://github.com/hari-houdini/me-portfolio/commit/afd1ff5bb08ff544da761f644f5651e0bd65b4a6)), closes [#9d00](https://github.com/hari-houdini/me-portfolio/issues/9d00) [#00f5](https://github.com/hari-houdini/me-portfolio/issues/00f5)

# [1.2.0](https://github.com/hari-houdini/me-portfolio/compare/v1.1.0...v1.2.0) (2026-03-25)


### Bug Fixes

* **tsconfig:** exclude cms/ from portfolio type-checking ([8ef7412](https://github.com/hari-houdini/me-portfolio/commit/8ef74126d886d2b0e51d084ff497d17ee66c4fc7))


### Features

* **cms/access:** add isAdmin access control and Users auth collection ([22c3d14](https://github.com/hari-houdini/me-portfolio/commit/22c3d14e4dc22f4aa49ab2c9c6a228c3dabcbdb2))
* **cms/collections:** add Media upload and Projects collections ([413b681](https://github.com/hari-houdini/me-portfolio/commit/413b6814d67f67ed405f742beb67de79389ed173))
* **cms/config:** add payload.config.ts and Next.js admin + API routes ([23d4658](https://github.com/hari-houdini/me-portfolio/commit/23d4658e1354a56e3eef063a0f4eac63c941c2d5))
* **cms/globals:** add SiteConfig, About, and Contact singleton globals ([39242df](https://github.com/hari-houdini/me-portfolio/commit/39242dfd57f20ad1321733d9c3bbb9593409d153))

# [1.1.0](https://github.com/hari-houdini/me-portfolio/compare/v1.0.0...v1.1.0) (2026-03-25)


### Bug Fixes

* **security:** harden claude-review workflow and settings ([7752a65](https://github.com/hari-houdini/me-portfolio/commit/7752a65d0ad5d3bda3576b1f84939accb84a59f1)), closes [#2](https://github.com/hari-houdini/me-portfolio/issues/2) [#3](https://github.com/hari-houdini/me-portfolio/issues/3) [#6](https://github.com/hari-houdini/me-portfolio/issues/6) [#7](https://github.com/hari-houdini/me-portfolio/issues/7) [#5](https://github.com/hari-houdini/me-portfolio/issues/5) [#1](https://github.com/hari-houdini/me-portfolio/issues/1) [#4](https://github.com/hari-houdini/me-portfolio/issues/4) [#8](https://github.com/hari-houdini/me-portfolio/issues/8) [#9](https://github.com/hari-houdini/me-portfolio/issues/9)


### Features

* **claude-review:** v2 — filtered diff, findings cache, severity tiers, hard gate ([94223c0](https://github.com/hari-houdini/me-portfolio/commit/94223c0d2b3b7f878798e0ff99809888b45cb27e))

# 1.0.0 (2026-03-23)


### Bug Fixes

* **ci:** add environment: production to release and claude-review jobs ([cd1647e](https://github.com/hari-houdini/me-portfolio/commit/cd1647ea2c5158bd634335e2a173ef682e59ed38))
* **ci:** resolve workflow failures on main ([3ebb0e7](https://github.com/hari-houdini/me-portfolio/commit/3ebb0e7b39b908d1a2a9a697bc8632c788d85ecf))
* **types:** add Cloudflare Workers types reference to workers/app.ts ([5e20c14](https://github.com/hari-houdini/me-portfolio/commit/5e20c14978ea702a38efe998f8faf77de9336d6a))


### Features

* **cms/access:** add isAdmin access control and Users auth collection ([b0ddf6c](https://github.com/hari-houdini/me-portfolio/commit/b0ddf6cccb5d8debaa8744e9be0782a6d6403d25))
* **cms/collections:** add Media upload and Projects collections ([9bdfff1](https://github.com/hari-houdini/me-portfolio/commit/9bdfff16703d8c2356eadfe6d8b7295eb8f2b4e3))
* **cms/config:** add payload.config.ts and Next.js admin + API routes ([bdbaa37](https://github.com/hari-houdini/me-portfolio/commit/bdbaa37bbf22fe1cf6a86ea5ba42d2921ba5fb42))
* **cms/globals:** add SiteConfig, About, and Contact singleton globals ([292d8a4](https://github.com/hari-houdini/me-portfolio/commit/292d8a498611110686e29be0b5ead6c1fcf61ab4))
* implement Phase 1 — foundation, service layer, test infrastructure ([7e0290c](https://github.com/hari-houdini/me-portfolio/commit/7e0290c2c3572a844f43ab2b702470510473f1dd))
