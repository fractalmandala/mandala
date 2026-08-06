---
kind: dependency_management
name: Monorepo Dependency Management with pnpm, Cargo, and Lockfiles
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-workspace.yaml
    - pnpm-lock.yaml
    - apps/fracta/package.json
    - apps/shradhapp/package.json
    - apps/fracta/src-tauri/Cargo.toml
    - apps/shradhapp/src-tauri/Cargo.toml
    - apps/shradhapp/pnpm-lock.yaml
    - sites/fractalagentic/deno.json
---

This repository manages dependencies across a multi-language monorepo using three coordinated systems: pnpm workspaces for JavaScript/TypeScript packages, Cargo (Rust) for Tauri native backends, and Deno for select site tooling. The approach is centralized at the workspace root with explicit overrides and strict build policies.

**pnpm Workspace System**
The root `package.json` declares `"private": true` and pins the package manager via `packageManager: "pnpm@11.13.1+sha512..."`, ensuring deterministic installs across environments. `pnpm-workspace.yaml` defines the workspace scope (`apps/*`, `sites/*`, `packages/*`) while explicitly excluding `apps/fractalai` (a separate Bun workspace). All third-party Node.js dependencies are declared per-package in each app/site/package's own `package.json`; there are no root-level runtime dependencies except shared Tauri plugins and paneforge.

**Lockfile Strategy**
A single `pnpm-lock.yaml` (lockfileVersion 9.0) lives at the repo root and tracks every transitive dependency resolution. Peer dependencies are auto-installed (`autoInstallPeers: true`). Each app also carries its own lockfile variant — `apps/shradhapp/pnpm-lock.yaml` — allowing independent version pinning where needed.

**Security Overrides and Patches**
The workspace root enforces security fixes through `overrides` in both `pnpm-workspace.yaml` and the lockfile:
- `dompurify >= 3.4.11`
- `esbuild >= 0.28.1` (fixing GHSA-g7r4-m6w7-qqqr arbitrary file read)
- `js-yaml@<3.15.0: 3.15.0`
These overrides cascade to all workspace members.

**Build Script Policy**
`allowBuilds` explicitly whitelists native build dependencies (`@parcel/watcher`, `@prisma/engines`, `@swc/core`, esbuild, prisma, `@tailwindcss/oxide`) while blocking others (notably `sharp: false`). `strictDepBuilds: false` keeps untrusted scripts blocked by default — this is documented as an intentional policy decision, not an installation failure.

**Rust/Cargo Dependencies**
Each Tauri app has its own `src-tauri/Cargo.toml` declaring Rust dependencies with pinned versions (e.g., `tauri = "2.11.2"`, `rusqlite = { version = "0.32", features = ["bundled"] }`). Platform-specific dependencies use `[target.'cfg(target_os = "macos")'.dependencies]` syntax for macOS-only crates like `objc2-*`. Each Cargo project maintains its own `Cargo.lock` for reproducible builds.

**Deno Integration**
Some sites (e.g., `sites/fractalagentic/deno.json`) use Deno tasks that invoke npm packages via `deno run -A npm:<package>`, creating a dual dependency surface alongside pnpm.

**Conventions Observed**
- Version ranges use caret (`^`) for most dependencies, allowing compatible updates
- Internal packages reference sibling packages by name from the workspace (e.g., `fractalsvelte`, `fractals-styler`, `@fractaldesign/svelte-icons`)
- Each app maintains its own `packageManager` field when it differs from the root
- Native dependencies require explicit allowlist approval via `allowBuilds`
- Security patches are applied centrally rather than per-package