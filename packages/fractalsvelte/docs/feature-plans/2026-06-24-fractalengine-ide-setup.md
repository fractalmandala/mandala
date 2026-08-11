---
id: sp-plan-2026-06-24-fractalengine-ide-setup
title: "Superpowers Plan: 2026-06-24-fractalengine-ide-setup"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


This plan details the setup of a fresh, independent code editor IDE using Tauri and SvelteKit (Svelte 5 + Runes) in the `apps/fractalengine` workspace.

The application will feature a premium layout outline (header, left/right sidebars, footer, editor, and terminal) and follow all specific rules:
1. SvelteKit + Svelte 5 (Runes only)
2. TypeScript
3. pnpm package manager
4. `fractals-styler` as styling JIT utility system
5. Pure old SASS (no curly braces, no colons, single tab indent)
6. Collapsible sidebars based on the design mockup
7. A terminal at the bottom-middle that is collapsible and draggable into the left/right sidebars

> [!NOTE]
> All documentation, walkthroughs, specs, and plans for this project will be saved inside the project folder (`apps/fractalengine/docs/`) rather than the monorepo root.

---

## Future Layers Context & Architectural Foundations

To prepare for future layers (AI integration, graphics editor & web page builder, wiki/knowledge bank, email features, and SQLite/JSON database viewer):
- **State Registry**: We will configure a modular state registry `apps/fractalengine/src/lib/state/ide.svelte.ts` which uses Svelte 5 runes. This will accommodate new namespaces as features grow.
- **IPC Architecture**: All Tauri invocations will go through a single gateway module (`apps/fractalengine/src/lib/ipc.ts`) with a browser-compatible mock implementation (`apps/fractalengine/src/lib/ipc-mock.ts`). This ensures the app can run/render in a standard browser via `pnpm dev` without crashes, supporting quick UI iterations.
- **Layout Grid**: The layout grid will be designed dynamically to accommodate new side panels or inspector tabs.

---

## Proposed Architecture & Config Files

We will initialize the project under `apps/fractalengine`. To avoid interactive prompts and keep setup robust, we will write the configuration and boilerplate files directly.

### 1. Build and Config files [NEW]
* `apps/fractalengine/package.json`: Packages including Svelte 5, Vite 8, Sass, TypeScript, Tauri 2 CLI/API, and `fractals-styler`.
* `apps/fractalengine/tsconfig.json`: TypeScript configuration matching SvelteKit.
* `apps/fractalengine/svelte.config.js`: SvelteKit config, using `@sveltejs/adapter-static` for static/single-page desktop builds.
* `apps/fractalengine/vite.config.ts`: Vite config importing the `fractalsStyler` plugin.
* `apps/fractalengine/src-tauri/Cargo.toml`: Tauri 2 Cargo manifest.
* `apps/fractalengine/src-tauri/tauri.conf.json`: Tauri 2 configuration.
* `apps/fractalengine/src-tauri/capabilities/default.json`: Default Tauri permissions.
* `apps/fractalengine/src-tauri/src/main.rs` & `src-tauri/src/lib.rs`: Rust entry points.

### 2. Frontend Svelte App [NEW]
* `apps/fractalengine/src/app.html`: Root HTML template.
* `apps/fractalengine/src/routes/+layout.ts`: Disable SSR and enable pre-rendering for SPA desktop compilation.
* `apps/fractalengine/src/routes/+layout.svelte`: Global layout importing SASS and virtual styler stylesheet.
* `apps/fractalengine/src/routes/+page.svelte`: Main UI orchestrating sidebars, terminal, and editor.
* `apps/fractalengine/src/lib/components/Terminal.svelte`: Draggable, collapsible terminal.
* `apps/fractalengine/src/lib/components/Editor.svelte`: Text/code editing workspace.
* `apps/fractalengine/src/lib/components/Sidebar.svelte`: Collapsible panel template for left and right sidebars.
* `apps/fractalengine/src/lib/state/ide.svelte.ts`: Svelte 5 Runes state management for layout, terminal position, files, and console logs.

### 3. Styling System [NEW]
* Run `npx fractals-styler init src/lib/styles` (or mock-scaffold if needed) to generate token-based SASS assets.
* Edit Sass files to implement a premium dark theme. Every styling rule will use classic indented Sass (indent-only, no `{}` or `;` or `:`).

---

## Layout and Drag-and-Drop Design

### Core Layout
The page layout will be responsive to panel states (visible vs collapsed):
* **Header**: Top global bar for titles, quick settings, and actions.
* **Footer**: Bottom status bar showing terminal toggles, current file info, and coordinates.
* **Grid Area**:
  * **Left Sidebar**: File browser, outline, search. Collapsible.
  * **Middle Area**: Column flex containing:
    * **Editor**: Code viewing/editing surface.
    * **Bottom Terminal Zone**: Terminal workspace if terminal is docked here and not collapsed.
  * **Right Sidebar**: Inspector, diagnostics, mini-tools. Collapsible.

### Terminal Docking Mechanism
The terminal can be docked into:
* `bottom` (default middle-bottom)
* `left` (nested inside the left sidebar)
* `right` (nested inside the right sidebar)

We will use standard HTML5 drag-and-drop:
1. The Terminal header serves as the drag handle (`draggable="true"`).
2. On drag start, drag-over regions (drop zones) in the left sidebar, right sidebar, and bottom panel highlight with drop indicators.
3. Dropping the terminal on a zone updates the Svelte state rune `terminalLocation = 'left' | 'right' | 'bottom'`.
4. The terminal DOM is conditionally rendered in the active zone, preserving state (history/logs).

---

## Verification Plan

### Automated Steps
1. The user will run `pnpm install` at the workspace root to pull and link all packages.
2. The user will test compiling with `pnpm --filter @fractals/fractalengine build` or running `pnpm --filter @fractals/fractalengine dev` to inspect the layout.

### Manual Verification Checklist
- Check if all sidebar panels collapse/expand via clicks.
- Drag the terminal header and drop it in the Left Sidebar, Right Sidebar, or Bottom Panel to check if docking works smoothly.
- Collapse/expand the terminal.
- Verify that styling follows the strict Sass indentation rules (no `{}` or `;` or `:`).
