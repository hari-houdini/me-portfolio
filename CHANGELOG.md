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
