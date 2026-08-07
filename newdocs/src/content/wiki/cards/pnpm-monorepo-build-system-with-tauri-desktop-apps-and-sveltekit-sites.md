---
title: pnpm Monorepo Build System with Tauri Desktop Apps and SvelteKit Sites
description: This monorepo uses a pnpm workspace to manage multiple SvelteKit applications, Tauri desktop apps, and publishable npm packages under a single build system. The build architecture combines JavaScript…
tags: [build_system]
type: card
module: repo
path: apps/fracta
created: 2026-08-05
updated: 2026-08-06
---

This monorepo uses a pnpm workspace to manage multiple SvelteKit applications, Tauri desktop apps, and publishable npm packages under a single build system. The build architecture combines JavaScript/TypeScript tooling (Vite, SvelteKit, TypeScript) with Rust compilation for native desktop backends.

**Workspace Structure and Package Management**
The root `package.json` defines workspace-wide scripts that delegate to individual projects via `pnpm --filter`. The `pnpm-workspace.yaml` configures which directories are included (`apps/*`, `sites/*`, `packages/*` while explicitly excluding `apps/fractalai` as a separate Bun workspace. Security policies are enforced through `allowBuilds` and `strictDepBuilds: false`, with explicit overrides for security vulnerabilities (dompurify, esbuild, js-yaml).

**Desktop Applications (Tauri + SvelteKit)**
Two desktop apps follow the same pattern: `apps/fracta` and `apps/shradhapp`. Each contains:
- A SvelteKit frontend built with Vite (`vite dev`, `vite build`
- A Rust backend in `src-tauri/` using Tauri v2 for native capabilities
- `tauri.conf.json` configuring window properties, CSP security, bundle targets, and icons
- `Cargo.toml` defining Rust dependencies (rusqlite, serde_json, tauri plugins)
- `build.rs` delegating to `tauri_build::build()`

The root `package.json` provides unified commands like `fracta:dev`, `fracta:build`, `fracta:tauri` that chain frontend and native builds.

**Static Sites**
Sites under `sites/` use SvelteKit with static adapter for deployment. Each has standard scripts: `dev`, `build`, `preview`, `check`, `lint`, `format`. Some sites support both Node.js and Deno toolchains (e.g., `fractalagentic` has `dev:deno` and `build:deno`. Post-build tasks include search indexing (pagefind), Open Graph image generation, and sitemap creation.

**Publishable Packages**
Packages under `packages/` follow npm publishing conventions with:
- `prepack` hooks running `svelte-package && publint` for validation
- Explicit `exports` field mapping subpath imports
- `files` field controlling published content
- Peer dependencies for shared runtime requirements (Svelte 5, motion libraries)
- Separate test suites using Vitest

**Build Conventions**
- All projects use TypeScript with strict checking via `svelte-check`
- Code formatting enforced through Prettier with Svelte plugin
- Rust code quality enforced via `cargo clippy --all-targets -- -D warnings`
- Visual regression testing with Playwright for desktop apps
- Workspace-level dependency version pinning for security fixes
- Git hooks setup via `setup:hooks` script pointing to `.githooks` directory

**Version Management**
Each project maintains independent versions in their respective `package.json` and `Cargo.toml` files. Desktop app versions are synchronized between the frontend package and Tauri configuration.
