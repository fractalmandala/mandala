---
id: design-index
title: Design System Entry Point
type: design
tags: [index, design-system]
summary: Progressive-discovery entry point indexing every numbered design-system reference document.
relates_to: [01-tokens, 07-class-registry, fractaldocs]
updated: 2026-07-22
---


This directory contains the complete design system reference for the FractalEngine Studio codebase, split into focused documentation files. Each file covers one aspect of the styling architecture.

## Architecture Overview

The styling system follows a **two-layer token architecture** (see [ADR-003](../adr/ADR-003-css-token-system-with-sass.md)):

1. **Layer 1 — SASS Variables** (`_tokens.sass`): Primitive SASS variables that abstract CSS custom properties.
2. **Layer 2 — CSS Custom Properties** (`:root` tokens): Semantic variables consumed directly by components.

All styles are written in **indented SASS** (`.sass`) with no `<style>` blocks in Svelte components. Each component has a corresponding `.sass` file in `src/lib/styles/components/`.

The app shell now follows the template-routing/state-domain architecture in [ADR-015](../adr/ADR-015-app-template-routing-and-state-domains.md): `appState` selects the active stream, `Canvas.svelte` remains the spatial home canvas, `ClassicIdeLayout`, `NotesLayout`, `DesignLayout`, and `AiLayout` render their dedicated streams, and shared surfaces such as AI chat/settings/command palette move through domain stores.

Spatial layout interaction now has a complete visual-state history boundary: tile move/resize, minimap pan, board pan/zoom, tile add/remove, and layout templates snapshot once per discrete gesture and restore through the active-template undo coordinator. Persisted panel/canvas geometry is type-checked and clamped before rendering, so invalid local data cannot generate off-screen panels, negative sizes, or non-finite transforms.

Buttons, panel/list text, and sidebar tabs each have exactly one class family — `btn-*`, `text-*` roles, and `.sidebar-tab-item` — defined in `_commons.sass`/`_typography.sass` and documented in [13-control-text-taxonomy](13-control-text-taxonomy.md) (decision record: [ADR-031](../adr/ADR-031-single-control-and-text-class-taxonomy.md)). The legacy `.icon-button`, `.strip-button`, `.panel-button-std`, and `panel-text-*` classes are retired.

The design template right rail uses the shared primitives (`.box`, `.panel-label`, `.sidebar-tab-item`) to switch between Style (`DesignInspector.svelte`), Export (`ExportPanel.svelte`), and AI (`AIChat.svelte`) without adding a separate stylesheet surface. The inspector adds token-driven object action buttons and content controls through `_designinspector.sass`: selected text blocks can edit copy and typography, selected images can edit source/alt/fit, and link-style blocks can edit `href`.

Panel navigation has one visual owner: `DesignLayout` renders the right-rail Style/Export/AI tabs, while its embedded `AIChat` suppresses the reusable chat header. Context-menu styling remains centralized in `_layers.sass`; interaction overlays isolate pointer-down from the canvas gesture surface so menu actions and outside dismissal work without changing the established token-driven appearance.

Component-library cards and saved-component rows use `touch-action: none` in `_componentlibrary.sass`. This preserves their existing token-driven card appearance while allowing pointer-captured drag insertion on mouse, pen, and touch; native HTML drag remains available as a parallel desktop path.

Canvas text uses two interaction states without new visual tokens: read-only preview mode participates in object dragging, while double-click editing enables the existing `.design-block-text` content surface and focuses it. Transform gestures use captured pointer continuation so movement, resize, and rotation remain active outside the original node bounds.

The application dock expands through the compound `.appdock.is-active` selector in `_appdock.sass`. The active modifier belongs to the dock element itself; treating it as a descendant leaves the dock positioned below the viewport and makes all template-navigation buttons unreachable.

Collapsed docks are also interaction-collapsed (`visibility`, `inert`, and `aria-hidden`) and reopen from the footer Apps control or Meta+Space. Shared browser chrome lives in a token-driven global drawer outside the code template. Resize separators and all other keyboard-focusable controls use the global semantic `--focus-ring`; recoverable Notes save failures use semantic feedback background/border tokens rather than literal status colors.

Design canvas blocks support visible auto-layout classes in `_designblock.sass`: `.layout-row`, `.layout-column`, and `.layout-grid` convert frame/container children from absolute positioning into flow layout for page-builder work. Text blocks intentionally allow pointer events so inline content editing works on the canvas, while image blocks consume `object-fit` from the selected block style map.

Draw-tool blocks and text-tool blocks are created through the canonical `designcanvas.createBlockAt()` path, so their dimensions, props, selected state, persistence, and undo boundary match inserted templates and imported components.

The layers panel is styled by `_layers.sass`. Hidden layers remain visible in the tree with `.layer-row.is-hidden` so users can show them again; locked rows use `.layer-row.is-locked` to distinguish non-editable layers without removing selection affordances.

The design export path in `src/lib/designcanvas/codegen.ts` now mirrors those page-builder semantics: free containers export as absolute-positioned blocks, auto-layout containers export as flex/grid, child blocks inside auto-layout export as relative items, and text/image/link content uses the same `props` and `style` fields as the canvas renderer.

Standalone browser styling lives in `src/lib/styles/components/_browser.sass`: `.browser-standalone-view` owns the route wrapper, `.browser-panel` and `.browser-header` own the Svelte chrome, and `.browser-native-status` / `.browser-native-placeholder` support the native child-webview mode introduced in ADR-007.

Modal interaction is part of the design system, not an optional component detail: Settings, Command Palette, and the nested Add Model dialog use `role="dialog"`, `aria-modal="true"`, Escape dismissal, and the shared `trapFocus` action. File-tree controls remain unavailable until workspace initialization completes, preventing transient layout state from overriding a user action.

Settings uses semantic maximum-size, sidebar-width, and viewport-inset tokens. Its grid columns and scroll body clamp within the current viewport, keeping the transactional footer reachable at the desktop minimum size. Design panel separators expose the same visible focus treatment and keyboard resizing contract as Notes; their persisted width/collapse changes participate in undo/redo.

Workspace header pane controls share one icon contract: left-side surfaces render `sidebarL.svelte`, right-side surfaces render `sidebarR.svelte`, and each component receives the corresponding workspace profile's collapsed state instead of switching between separate expand/collapse SVG assets.

The Code terminal surface now uses one xterm instance per terminal tab inside `.terminal-pty-surface`; it explicitly uses `"JetBrains Mono", monospace`, while `_terminal.sass` owns the tab strip, host sizing, focus ring, placeholder overlay, and xterm viewport/screen background fill rules.

Notes file lists expose an inline new-note form in the selected-folder header. The form, compact add action, duplicate/error feedback, and focusable buttons use semantic surface, border, text, error, and small-control-radius tokens. AI model selection uses a combobox/listbox contract and preserves the full model label instead of appending a misleading ellipsis.

Settings and Notes remediation surfaces consume the semantic spacing, type-scale, control-radius, dialog-shadow, and control-transition tokens. Settings is capped at a minimum-window-safe height, provider prerequisites use `.settings-guidance`, and Notes empty states expose token-styled Open Vault/New Note actions. The AI prompt footer’s local-model status uses `.local-model-status` in `_ai.sass` with three variants — `.is-missing` (error feedback tokens), `.is-ready` (accent surface/ring tokens), `.is-loaded` (success surface/border tokens) — and the AI Models settings tab reports action outcomes via `.settings-status-success` in `_settings.sass`, all consuming semantic feedback tokens rather than literal red or green values. No component-local literal spacing, font size, radius, shadow, or transition was introduced.

Theme foreground inheritance is established at `.app-root-shell`, and native buttons inherit that semantic foreground instead of retaining the browser's black default in dark mode. Compact icon actions use `--control-target-min`; panel separators use a wider `--resize-hit-target` with a narrow visual line. The Home grid uses `--home-grid-size` so its square fits between the header and footer at the 940×600 native minimum. Marketplace search and destructive/drag/layer states consume semantic tokens rather than inline or literal colors.

The global search overlay (`_searchoverlay.sass`) and the Bookmarks workspace (`_bookmarks.sass` in the bookmarks module) were added in the Stream B data-layer implementation (see ADR-027). Both follow the two-layer token architecture: no colors, font sizes, radii, or shadows are hardcoded — all visuals reference semantic CSS variables from `_tokens.sass`.

---

## Quick-Reference: What to Read When...

| If you need... | Start here |
|----------------|------------|
| **Color values, sizes, z-indices** → | [01-tokens.md](01-tokens.md) (CSS custom properties) |
| **SASS variable names used in `.sass` files** → | [02-sass-variables.md](02-sass-variables.md) |
| **Font sizes, weights, line-heights** → | [03-typography.md](03-typography.md) |
| **Page shell, header, footer layout** → | [04-layout-system.md](04-layout-system.md) |
| **Flex/Grid utility classes (`.box`, `.row`, `.grid`)** → | [05-utility-primitives.md](05-utility-primitives.md) |
| **Keyframe animations** → | [06-animations.md](06-animations.md) |
| **What class styles what component** → | [07-class-registry.md](07-class-registry.md) |
| **Which font each component uses** → | [08-font-usage.md](08-font-usage.md) |
| **Responsive breakpoints** → | [09-mixins-breakpoints.md](09-mixins-breakpoints.md) |
| **CodeMirror editor theme + syntax highlighting** → | [10-editor-theme.md](10-editor-theme.md) |
| **How styles are imported and ordered** → | [11-style-aggregation.md](11-style-aggregation.md) |

---

## Progressive Discovery Guide

For agents working with this codebase, follow this reading order to build context efficiently:

### 1. Core Rules (always read)
-- **[00-rules.md](00-rules.md)** - The mandatory rules to follow always.
- **[01-tokens.md](01-tokens.md)** — All CSS custom properties you can reference.
- **[03-typography.md](03-typography.md)** — Available type scales and font stacks.
- **[05-utility-primitives.md](05-utility-primitives.md)** — Layout primitives for positioning.

### 2. When modifying a specific component
- **[07-class-registry.md](07-class-registry.md)** — Find which SASS file styles your component
- Then read that specific SASS file for the full rule context

### 3. When creating a new component
- **[04-layout-system.md](04-layout-system.md)** — Understand the page shell
- **[02-sass-variables.md](02-sass-variables.md)** — Available SASS variables to `@use`
- **[11-style-aggregation.md](11-style-aggregation.md)** — Where to register new stylesheets

### 4. When debugging visual issues
- **[08-font-usage.md](08-font-usage.md)** — Verify expected font stack
- **[07-class-registry.md](07-class-registry.md)** — Check if a class exists and maps correctly

### 5. When working with the code editor
- **[10-editor-theme.md](10-editor-theme.md)** — CodeMirror theme + syntax highlighting config

---

## Source Map

```
docs/design/                    ← You are here
├── DESIGN.md                   ← This file — index with progressive discovery
├── 01-tokens.md                ← CSS custom properties (:root tokens)
├── 02-sass-variables.md        ← SASS variable primitives
├── 03-typography.md            ← Font scale, utilities, font stacks
├── 04-layout-system.md         ← Page shell, header, footer, theme dropdown
├── 05-utility-primitives.md    ← .box, .row, .grid classes
├── 06-animations.md            ← Keyframe animations
├── 07-class-registry.md        ← Full class → component → SASS mapping
├── 08-font-usage.md            ← Per-component font family/size reference
├── 09-mixins-breakpoints.md    ← Responsive breakpoint mixins
├── 10-editor-theme.md          ← CodeMirror theme + syntax highlighting
├── 11-style-aggregation.md     ← Import order, dependency flow
└── graph-reports.md            ← Dev Area graph report styling (token-exempt)
```

Corresponding source files are at `src/lib/styles/` and `src/lib/editorTheme.ts`.

## 2026-07-13 semantic utility additions

Static component styling remains outside Svelte markup. Shared `.icon-dimmed`, `.icon-emphasis`, `.icon-muted`, `.text-underline`, and `.text-strikethrough` primitives consume semantic tokens; component-specific attachment, notes, browser-action, and main-layout rules live in their existing component stylesheets.

## 2026-07-13 interaction-state audit

The durability and validation remediation introduced no new visual values, selectors, or inline styles. The restored-note failure reuses the existing token-driven `.notes-save-status.is-error` treatment, while viewport persistence changes only interaction state. The two-layer token and external indented-SASS boundaries remain unchanged.

Template-dock thumbnails now use semantic `--template-category-*` aliases and category modifier classes. Their placeholder geometry moved from inline custom properties into `_designtemplategallery.sass`; no component-owned color, spacing, or radius values remain in that preview path.

The project-context and accessibility remediation adds no selectors. Terminal collapse now removes the existing terminal surface from layout and focus navigation, provider sections reuse the established settings rows/guidance styles, and workspace toggle labels are semantic markup only. The semantic `--z-overlay` layer is `1000`, above design-canvas rulers (`600`), so global Settings/Notes/Browser overlays cannot be visually pierced by workspace chrome; the external indented-SASS and two-layer token boundaries remain unchanged.

## 2026-07-13 full token and asset convergence

Every application stylesheet now consumes semantic CSS custom properties for color, type size, spacing, radii, and shadows. The expanded scale in `_tokens.sass` preserves the existing rendered values while removing literal component values; canvas/tile/module aliases replace the remaining component-facing SASS variables. Undefined fallback tokens were removed, and the formerly orphaned `designcomponents.sass` layout rules now live in the aggregated `_designblock.sass` surface.

Visible controls use repository assets from `static/iconset/`. Unicode drag/check glyphs, handwritten inline icon SVGs, the data-URI select chevron, and CSS-drawn component thumbnails were replaced with the closest established assets. The design block's SVG remains intentionally code-native because it renders user-authored vector paths rather than approximating an interface icon.

## 2026-07-13 runtime-contract remediation

The Notes rich-editor toolbar, slash menu, and disabled canvas dock modules now use repository SVG assets throughout; text-symbol and initial-letter icon stand-ins were removed. Lazy CodeMirror and TipTap failures render token-driven, accessible fallback surfaces. The code renderer's component-owned `--ai-code-max-h` value is consumed with `--ai-code-max-height` as its semantic fallback, preserving the public `maxHeight` prop without introducing a hardcoded component value.

## 2026-07-15 IDE resize separator alignment

Classic IDE sidebars use `.resize-handle-v` from `_sidebar.sass` as an 8px pointer hit target with a 1px semantic divider. The left and right sidebar variants pin the visible `::before` hairline to the panel edge (`right: 4px` for the left handle, `left: 4px` for the right handle) so both rest-state separators remain visible while still using `--border-primary` and hover `--theme-color`.

## 2026-07-15 IDE welcome actions

The empty editor's existing `.splash-shortcuts` card now presents Open File, Open Folder, and Open Workspace actions. The actions reuse existing shared control classes and semantic tokens; no new visual tokens or component-local styling were introduced.

## 2026-07-15 compact context meter

The `.ctx-compact` modifier was added to `_ai-data.sass` for the token-usage meter when rendered in the PromptInput toolbar. It applies `transform: scale(0.8)`, reduced opacity (0.7), and full opacity on hover. No new visual tokens were introduced.

## 2026-07-15 FractalDocs workspace completion

FractalDocs uses token-driven pane bounds, reading measure, spacing, separator treatment, and Markdown typography from `_tokens.sass`. Its three panes use the same focusable-resize and undoable-layout interaction contract as the other dedicated workspaces; all static presentation remains in `modules/fractaldocs/styles/_layout.sass`.

## 2026-07-17 module workspace transition

Direct transitions between Code, Notes, Design, Agent, Web, and Docs use a named View Transition surface in `_layout.sass`. The incoming workspace reveals top-to-bottom with `module-vertical-wipe`; persistent shell chrome and the browser drawer are outside the snapshot. Home and Blank remain instantaneous, as do reduced-motion and unsupported-webview fallbacks.

## 2026-07-17 Dictation controls

Dictation reuses the existing token-driven chat action, PromptInput icon, Settings row, and guidance classes. No component-local styles or visual tokens were introduced: the `record.svg` icon inherits the established compact action control treatment, and listening/error copy uses the existing semantic text and feedback surfaces.

## 2026-07-18 graph report visualizations

Nine Dev Area graph reports now ship as self-contained `<name>graph.svelte` + `<name>graph.sass` pairs under `src/lib/modules/dev/`, registered in `index.sass` lines 46–54. The owner granted a one-off exemption from the two-layer token rule for these dev-only visualizations; the indented-SASS and no-`<style>`-block rules still apply, and every selector is scoped under a per-report root class (`.ahs`, `.healthgraph`, `.flowgraph`, `.atlasgraph`, `.wikigraph`) so aggregation cannot leak into app chrome. The five module-flow graphs share one 524-line stylesheet (the `.ahs` registry) copied verbatim per report; node/edge palettes are TypeScript-owned in `graphLayout.ts`. The four split standalone reports were converted mechanically by `docs/context-temporary/split-report.mjs` with `position: fixed` chrome rewritten to container-absolute. Full reference: [graph-reports.md](graph-reports.md); decisions: ADR-041, ADR-042.

## 2026-07-19 New Design canvas grid

The New Design canvas is a module-local viewport rather than a layout background. `CanvasGrid.svelte` renders the grid from semantic border and canvas tokens while its transformed world layer holds units; `CanvasGridControls.svelte` uses the established `.btn-icon` control base with a module skin. The module stylesheet keeps the viewport, world transform, controls, and unit treatment under `.newdesign-*` selectors. Camera position and zoom remain dynamic Svelte style directives, so no component-local style block or raw visual value is introduced. See [New Design Area](../areas/newdesign.md) and ADR-045.

## 2026-07-19 New Design canvas background pattern picker

The canvas viewport now accepts a swappable vendor background pattern. `CanvasPatternSelect.svelte` renders a Bits UI `DropdownMenu` gallery in the shell header (tester template only): live preview tiles grouped into Gradient Glow, Fade Grids, Diagonal Cross, Dashed Grids, Masked, and Textures & Lines, drawn from the 64 light geometric patterns statically extracted into `data/canvasPatterns.ts`. The dropdown portals to `.app-root-shell` (theme-scoped tokens do not resolve under `body`). Selection lives in `newdesign.canvasPatternId` inside the domain undo history. `CanvasGrid.svelte` splits the backdrop across two derived inline styles: base color on the viewport (or the camera-driven grid position/size for the Default Grid), artwork and masks on a `.newdesign-canvas-grid-pattern` overlay beneath the world layer, so masked/faded patterns never lose their light base. Token-only classes in `_newdesign.sass`: `.newdesign-pattern-trigger` (ellipsis cap on `.btn-icon-text`), `.newdesign-pattern-menu` (dropdown surface reusing `--background30`, `--border-secondary`, `--shadow-canvas-float`, `calc(var(--z-overlay) + 10)`), `.newdesign-pattern-grid`/`-tile` (3-column gallery with accent highlight and selected ring), `.newdesign-pattern-preview(-inner)`/`-thumb(-inner)` (scaled live mini previews). See [New Design Area](../areas/newdesign.md) and ADR-047.


## 2026-07-22 IDE module state-layer refinement

The Code module stylesheets (`modules/ide/styles/_editor.sass`, `_sidebar.sass`, `_terminal.sass`) received a state-completeness pass with no new tokens and no markup changes. Interactive surfaces — editor file tabs, terminal tabs, terminal action/close buttons, context-menu items, workspace list buttons, tree toggle, and the nav-back button — now share the established 150ms ease hover/active/`--focus-ring` convention (property-scoped transitions only, never `transition: all`). Terminal tab selection moved from a `--theme-color` border swap to a surface-over-stroke fill change (`--background10` fill + 500 label weight), matching the editor tab's fill-first pattern; `.editor-file-tab` gained a `--background30` hover step beneath its `--background40` active fill. The tree context menu now sits on the semantic `--z-overlay` layer (backdrop at `calc(var(--z-overlay) - 1)`) and plays a GPU-only 180ms `cubic-bezier(0.23, 1, 0.32, 1)` opacity/scale entrance from the top-left corner, disabled under `prefers-reduced-motion`. Violations fixed: `.log-input` no longer hardcodes `#45a01e` (mapped to the closest semantic accent, `--theme-color-alt` — recorded gap: no dedicated log-echo token exists), `.terminal-tab-status` uses `--control-radius-round` instead of `999px`, and the unused `.button-sidebar-btn` class (which contained invalid CSS) was removed.
