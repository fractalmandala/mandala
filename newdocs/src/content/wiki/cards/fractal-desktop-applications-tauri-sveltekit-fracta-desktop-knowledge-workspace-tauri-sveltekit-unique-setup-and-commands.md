---
title: Fracta Desktop Knowledge Workspace (Tauri + SvelteKit) — Unique Setup and Commands
description: Development uses pnpm dev (Vite) alongside pnpm tauri dev; the full verification pipeline runs npm run verify which chains type checking, build, markdown/agent/json/hygiene/motion tests, Playwright v…
tags: [apps/fracta]
type: card
module: apps/fracta
path: apps/fracta
created: 2026-08-05
updated: 2026-08-06
---

Development uses `pnpm dev` (Vite) alongside `pnpm tauri dev`; the full verification pipeline runs `npm run verify` which chains type checking, build, markdown/agent/json/hygiene/motion tests, Playwright visual tests, `cargo test`, and `cargo clippy --all-targets -- -D warnings`. Rust linting can be invoked separately via `pnpm lint:rust`. The Tauri config (`tauri.conf.json` sets the dev URL to `http://localhost:5173` and builds the frontend via `pnpm build` before bundling.
