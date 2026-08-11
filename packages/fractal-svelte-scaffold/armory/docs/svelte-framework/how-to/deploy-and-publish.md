---
title: "Deploy and publish"
description: "Prepare a SvelteKit app, library, or Tauri shell for build and deployment."
type: how-to
---

# Deploy and publish

Activate `svelte-deployment` and `vite-patterns` only when deployment, packaging, or
build configuration is in scope.

## Inspect before changing

Read `packageManager`, lockfiles, `package.json` scripts, `svelte.config.*`, and
`vite.config.*`. Do not replace a project's adapter or package manager by assumption.

## Choose the output

| Target | Typical decision |
| --- | --- |
| Node server | `@sveltejs/adapter-node` |
| Static site | `@sveltejs/adapter-static` plus prerender constraints |
| Cloudflare | `@sveltejs/adapter-cloudflare` and platform limitations |
| Component package | Svelte package exports, peer dependency, and build output |
| Tauri desktop app | SvelteKit frontend plus Rust/Tauri configuration and commands |

## Verify

Run the workspace check and build. For a package, run package exports/type checks. For a
Tauri app, run the frontend checks and the platform-specific Rust checks available in the
workspace. Record unavailable tooling as skipped with a reason.

Do not add adapters, plugins, or dependencies without explicit scope and a recorded
package-manifest change.
