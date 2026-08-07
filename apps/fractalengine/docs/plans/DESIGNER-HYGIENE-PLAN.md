---
id: designer-hygiene-plan
title: Designer Hygiene Feature Build-Out Plan
type: plan
tags: [plan, designer, canvas, roadmap]
status: in-progress
updated: 2026-07-16
---

# Designer Module — Hygiene Feature Build-Out (Two-Stream Orchestration)

Goal: bring `src/lib/modules/designer/` to parity with the standard/hygiene feature set of a Figma-class tool (canvas, tools, selection, layers, styling, typography, components/styles, layout, history, import/export, files/pages, prototyping baseline, handoff, productivity). **Collaboration/multiplayer is explicitly out of scope.**

Orchestrator: Claude (main session). Two parallel agent streams execute each phase; the orchestrator verifies at each phase boundary before issuing the next.

---

## 1. Current inventory (do NOT rebuild these)

Already implemented in the module (verified 2026-07-16):

- **Viewport**: infinite canvas, wheel zoom/pan, `zoomIn/zoomOut/resetZoom/centerView/animateViewport`, hand tool + space-pan, rulers with draggable user guides (create/drag/delete, snap to block edges).
- **Tools**: arrow, hand, drag-to-draw rectangle/ellipse/line/arrow/polygon/star, pen tool (bezier `VectorPath`/`PathPoint`, close/open paths, vector edit mode, `fitVectorToPaths`), text, frame; SVG import (`importSvg`, primitive→path conversion), HTML import, image insert from data URL.
- **Selection/manipulation**: click select, marquee (+shift additive), drag with smart-alignment guides (`activeGuides`) + grid snap (`isSnapping`), resize engine w/ handles, rotate engine, nudge, context menus, measure (alt-hover distance), lock/hide, rename.
- **Structure**: scene graph with `parentId`/`children`, group/frame-selection/ungroup, reparent via canvas drop or layer tree drag, clip toggle, z-order (`moveForward/moveBackward/bringToFront/sendToBack`), Layers panel with tree, collapse.
- **Clipboard**: copy/cut/paste/duplicate blocks, copy/paste style.
- **Align/distribute**: 6 aligns + horizontal/vertical distribute.
- **Styling (basic)**: fill (single solid + hex), stroke (width/style parsing), corner radius (single), opacity, one shadow, font size/weight, text align, text content editing.
- **Components**: user components (save/insert/rename/duplicate/delete, localStorage persistence), template gallery + Dock, ComponentLibrary sidebar with pointer-drag insertion (do not add native HTML drag — see designer area gotchas).
- **History**: full undo/redo via `UndoHistory` designer domain, gesture batching (`recordGestureStart/commitGesture`), localStorage scene persistence + sanitizers.
- **Export**: codegen to Svelte/HTML (`engine/codegen.ts`, ExportPanel).
- **AI**: block annotations queue.

Key files: `state/designcanvas.svelte.ts` (~3800 lines, `CanvasState` class — the central scene/state), `engine/` (Drag/Resize/Rotate/Selection/CanvasViewport engines, svgpath, codegen, patterns), `components/` (DesignLayout, DesignBlock, DesignInspector, Layers, ComponentLibrary, Dock, ExportPanel), `styles/*.sass`, `contributions.ts`.

## 2. Gap list → phases

Missing hygiene features, grouped into 6 phases of two parallel streams. **Stream A owns state/engine/canvas-interaction files. Stream B owns inspector/panels/rendering/codegen files.** Exact ownership per phase below; an agent must not edit the other stream's owned files in the same phase.

| Phase | Stream A (state/engine/canvas) | Stream B (inspector/panels/render) |
|---|---|---|
| 1 | Viewport & navigation completion; clipboard/selection hygiene | Fills, strokes, effects, corners, blend modes overhaul |
| 2 | Manipulation completeness (flip, scale tool, tidy-up, select-same); shortcut coverage | Typography system |
| 3 | Boolean ops, flatten, outline stroke, masks, corner smoothing | Shared styles (color/text/effect), color-picker upgrades, asset panel |
| 4 | Constraints/pinning + auto-layout | Raster/vector export (PNG/JPG/SVG, scales, batch), copy-as |
| 5 | Pages + version history | Layers panel upgrades + inspect/handoff mode |
| 6 | Prototyping baseline (links, preview) | Productivity polish (tooltips, prefs, context-menu completeness, perf pass) |

### Phase 1

**A1 — Viewport & navigation completion + clipboard/selection hygiene**
Owns: `state/designcanvas.svelte.ts`, `engine/CanvasViewport.svelte.ts`, `engine/DragEngine.svelte.ts`, `engine/ResizeEngine.svelte.ts`, `components/DesignLayout.svelte` (canvas/toolbar region only), `contributions.ts`, `styles/_designcanvas.sass`.

1. Zoom-to-fit (all content) and zoom-to-selection; zoom presets 25/50/100/200/400; commands + shortcuts (`Cmd+0` = 100%, `Cmd+1` = fit, `Cmd+2` = selection, `Cmd+=`/`Cmd+-` = in/out) declared in `contributions.ts`.
2. Zoom % indicator/menu in the canvas toolbar (uses existing token classes; no new hardcoded values).
3. Pixel grid rendered at zoom ≥ 4× (cheap CSS/SVG overlay, toggleable).
4. Canvas background color control (state + persistence; the UI control is a plain swatch button in the toolbar that opens the existing custom picker — never native `<input type="color">`).
5. Snapping controls: independent toggles for snap-to-grid / snap-to-objects / snap-to-guides (currently one `isSnapping` flag) + a View options dropdown in the toolbar.
6. Clipboard hygiene: paste-in-place (`Cmd+Shift+V`), paste-over-selection, alt-drag duplicate (DragEngine), repeat-duplicate offset (`Cmd+D` repeats last offset).
7. Selection hygiene: select-all (`Cmd+A`, scoped to current container when in deep-select), select-inverse, select-same (fill / stroke / type) from context menu; Escape walks selection up the parent chain.
8. Big-nudge with Shift+Arrow = 10px (make both nudge amounts settings-ready constants).
9. Every new mutation wrapped in the designer undo domain (one atomic entry per user action); gesture batching for continuous ops (bg color drag, etc.).

**B1 — Paint & effects overhaul**
Owns: `components/DesignInspector.svelte`, `components/DesignBlock.svelte`, `engine/codegen.ts`, `styles/_designinspector.sass`, `styles/_designblock.sass`, new `engine/paint.ts` (paint model + CSS mapping helpers).

1. Paint model in `engine/paint.ts`: typed `Paint` union — solid, linear-gradient, radial-gradient, image (fill/fit/crop/tile modes) — plus (de)serialization to/from the block `style` record and CSS. Multiple fills per block (ordered stack, per-fill opacity + visibility toggle).
2. Inspector Fill section: fill stack UI (add/remove/reorder/toggle), gradient editor (stops, angle, type switch) built on the existing custom spectrum/hex picker popover — never native color input.
3. Strokes: color, weight, align (inside/center/outside where renderable), dash pattern, cap/join, per-side strokes for box blocks, arrowheads for line/arrow blocks.
4. Corners: per-corner radius (linked/unlinked chain control).
5. Opacity slider + blend modes (CSS `mix-blend-mode` set).
6. Effects stack: multiple drop shadows, inner shadow, layer blur, background blur — add/remove/toggle each.
7. `DesignBlock.svelte` renders all of the above; `codegen.ts` emits equivalent CSS so export stays truthful.
8. All edits flow through `updateBlockStyleWithUndo`/`transact` — one undo entry per committed edit, gesture batching for slider drags.
9. Backwards compatibility: existing saved scenes (plain `background`/`stroke` style keys) must load unchanged — write migration/fallback in the paint deserializer and cover it with fixture tests (malformed, legacy, boundary values).

Shared-file rule for Phase 1: A1 does not touch DesignBlock/DesignInspector/codegen; B1 does not touch designcanvas.svelte.ts or engines. If B1 needs a new state field, it defines it in `engine/paint.ts` or requests it via the phase report.

### Phase 2

**A2 — Manipulation completeness**: flip horizontal/vertical (via paint/transform model from B1), scale tool (K — proportionally scales geometry + strokes + text + effects of selection), tidy-up/equal-spacing action, smart-distance indicators while dragging (extend `activeGuides` with spacing badges), deep-select drill (double-click enters group, click-outside exits; breadcrumb), constrain-proportions lock respected by ResizeEngine, comprehensive shortcut audit (single-key tool switching V/H/R/O/L/P/T/F, brackets for z-order) declared in contributions so the palette/cheatsheet render automatically.

**B2 — Typography system**: full text section in inspector — font family picker (searchable, previews, from a curated bundled list + system fonts), weight/style, size, line height, letter spacing, paragraph spacing, horizontal align incl. justify, vertical align in box, auto-width/auto-height/fixed sizing modes, decoration (underline/strikethrough), case transforms, truncation with ellipsis; text rendering + codegen parity; missing-font fallback notice. Rich-text-within-block is out of scope (note as deferred).

### Phase 3

**A3 — Vector & geometry power**: boolean ops union/subtract/intersect/exclude on shape/vector blocks (extend `engine/svgpath.ts`; result is a vector block; keep source recoverable via undo), flatten selection, outline stroke (stroke→path), mask-by-shape (clip a sibling group by a shape; scene-graph representation + rendering hook contract for B), corner smoothing param for shape corners.

**B3 — Shared styles & assets**: new `state/designstyles.svelte.ts` — named color styles, text styles, effect styles (create from selection, apply, rename, edit-updates-all-consumers, detach); persistence alongside scene; document colors + recently-used colors surfaced in the picker popover; ComponentLibrary upgrades (search, section for styles, thumbnails); swap-component-instance action.

### Phase 4

**A4 — Layout systems**: constraints/pinning per child (left/right/leftright/center/scale, top/bottom/…) applied when a frame resizes (ResizeEngine); auto-layout for frames — direction, gap, padding, primary/counter alignment, hug-contents/fill-container sizing, drag-to-reorder children with insertion indicator, absolute-position escape per child. This is the largest single task in the plan; it may consume the whole phase for Stream A.

**B4 — Real export**: new `engine/exporter.ts` — render selection/frame/page to PNG/JPG at 1x/2x/3x/custom and to standalone SVG (serialize the scene subtree; html-to-canvas approaches acceptable for raster, document limitations); per-block export settings (format+scale list) stored on the block; batch export UI in ExportPanel; copy-as-SVG and copy-as-PNG in context menu (context-menu entry itself is one line in a file A owns — coordinate via phase report if needed); export presets.

### Phase 5

**A5 — Pages & version history**: multiple pages per design document (page list state, per-page scene + viewport, page CRUD with undo, migration of existing single-scene storage), named version snapshots (save/restore/list, capped history, persisted via existing storage/IPC boundary — mock parity required if IPC is touched).

**B5 — Layers & handoff**: Layers panel — search/filter, per-type icons, batch rename with pattern (`Item $n`), hover-highlights-canvas, drag-multiselect; Inspect/handoff mode — read-only panel showing selected block's geometry, paints, typography as copyable values + CSS snippet, alt-hover spacing redlines between siblings (reuse `measure`).

### Phase 6

**A6 — Prototyping baseline**: frame-to-frame links (trigger: click/tap; action: navigate; transition: instant/dissolve/slide), connection arrows rendered on canvas when prototype tab active, preview/present mode (renders start frame in an overlay, interactive navigation, Escape exits), flow starting point.

**B6 — Productivity & hygiene polish**: tooltips with shortcut hints across designer toolbars/panels, context-menu completeness audit (every canvas/layer action reachable), designer preferences (nudge amounts, snap toggles, pixel-grid threshold) in SettingsDialog, performance pass (virtualize Layers tree if needed, avoid whole-scene re-render on drag — measure with a 1000-block fixture), final docs sweep of all six phases.

## 3. Coordination protocol

1. **Isolation**: each stream works in its own git worktree/branch per phase: `designer-hygiene/a<phase>` and `designer-hygiene/b<phase>` off `master`. Merge A then B (rebase) at phase end after orchestrator review. If the user runs both agents in one checkout instead, the file-ownership table becomes mandatory law.
2. **Definition of done per task** (both streams, every phase):
   - `pnpm check` (svelte-check) clean; `pnpm test` (or targeted vitest) green including `docs-contracts`, `contribution-contracts`, `undo-history`, `html-boundary`, `ipc-contract` where applicable.
   - Every new user-visible mutation has one atomic undo entry (AGENTS.md rule 9); adversarial fixtures for persisted-data changes (rule 12).
   - Tokens only, indented SASS, no `<style>` blocks, no native color inputs, Svelte 5 runes only (rules 1–8).
   - Docs updated: `docs/areas/designer.md`, ADR for real decisions, `pnpm docs:filetables` after new files, INDEX regenerated via `agents/skills/doc-frontmatter` (rule 10); contributions/settings check (rule 11).
   - A short **phase report** appended to `docs/plans/DESIGNER-HYGIENE-PLAN.md` under §4: what shipped, what's deferred, any cross-stream requests.
3. **Orchestrator gate**: after the user confirms both streams done, orchestrator re-runs checks, reviews diffs, exercises the app via the `run-fractalengine` skill, then issues the next phase's briefs.

## 4. Phase reports

_(appended by agents at each phase end)_

### Phase 2 — Stream A (A2) — 2026-07-16

Implemented manipulation completion in the canvas-owned boundary: undo-batched flip and proportional scaling (geometry, stroke/corner/effect/text metrics), horizontal and vertical tidy-up, persisted constrain-proportions support in the resize engine, distance badges during drag, deep-select isolation with breadcrumb and click-outside/Escape exit, and the single-key tool/z-order routes registered as design contributions. Completed Phase 1 carryovers with a spectrum/hex canvas-background popover, Alt-drag duplicate, and Cmd+D repeat-offset duplication. No inspector, block renderer, paint model, or codegen files were changed.

### Phase 1 — Stream A (A1) — 2026-07-16

Shipped viewport fit/selection zoom, presets and registered commands; an accessible zoom and View toolbar; persisted canvas background, pixel-grid and independent snapping preferences; paste-in-place; scoped select-all, inverse/same selection helpers, parent-chain Escape, and settings-ready nudge constants. Viewport and preference mutations use the designer undo boundary. Deferred: a full spectrum/hex background picker integration and alt-drag/repeat-offset duplication require the shared block pointer contract and remain for the next Stream A pass. No Stream B files changed.

---

### Phase 1, Stream B (B1) — 2026-07-16

**State**: Complete. All checks green (pnpm check = 0 errors, vitest = 117/117 pass including 28 paint-model tests).

**Files changed** (owned by Stream B):
- **`engine/paint.ts`** (new) — typed Paint model: `Paint` union (solid, linear-gradient, radial-gradient, image), `StrokeData`, `Corners`, `Effect` (drop-shadow, inner-shadow, layer-blur, background-blur), `BlendMode`. Full serialization/deserialization to/from block `style` record. CSS generation via `paintStyleToDecls`. Legacy migration via `migrateLegacyStyle`.
- **`components/DesignInspector.svelte`** — Major overhaul:
  - Fill stack UI (add/remove/reorder/toggle fills, type selector)
  - Gradient editor (linear angle, radial center, stop list with add/remove)
  - Image fill editor (URL + mode selector)
  - Stroke section: weight, style (solid/dashed/dotted), cap/join/align selectors
  - Corner radius: per-corner with linked/unlinked toggle
  - Effects stack: add/remove/toggle drop-shadow, inner-shadow, layer-blur, background-blur
  - Blend mode selector
- **`components/DesignBlock.svelte`** — Added `mix-blend-mode` inline style rendering.
- **`engine/codegen.ts`** — `styleToDecls` now skips internal `_`-prefixed paint keys and delegates complex paint/effects to `paintStyleToDecls()`.
- **`styles/_designinspector.sass`** — Comprehensive new styles: fill stack, gradient editor, effect rows, stroke detail, pill-sm buttons, etc.
- **`tests/unit/paint-model.test.ts`** (new) — 28 tests covering:
  - Legacy backwards compatibility (7 tests): background, border, border-radius, box-shadow, inset shadow, migrateLegacyStyle, idempotent, malformed JSON
  - Round-trips (4 tests): fill write→read, stroke, corners, effects
  - CSS generation (5 tests): background, border, border-radius, box-shadow, mix-blend-mode
  - Blend mode (3 tests): set/read, remove, default
  - Edge cases (6 tests): empty styles, degenerate inputs

**Design decisions**:
- Paint data stored in block `style` map as JSON-serialized `_fills`, `_strokes`, `_corners`, `_effects` keys alongside CSS-compatible values (e.g., `background`, `border`, `box-shadow`).
- Legacy blocks with only `background`/`border`/etc. keys are migrated on first read by `migrateLegacyStyle`; no migration on load is required (lazy, idempotent).
- Invisible fills/strokes/effects are persisted in the `_`keys but excluded from CSS rendering — toggling visibility in the inspector works on the persisted stack.
- Paint model uses `Record<string, string | number>` as the shared style interface, compatible with the existing `updateBlockStyle` API and block persistence.
- Custom spectrum/hex picker popover is used instead of native `<input type="color">` (Rule 8 compliance).
- All inspector paint mutations are wrapped in `recordGestureStart/commitGesture` (Rule 9 compliance).

**Cross-stream coordination**:
- No new state fields were added to `designcanvas.svelte.ts`.
- `paintStyleToDecls` is exported for codegen use; `migrateLegacyStyle` is available for Stream A blocks that need to read paint data.
- All undo/redo goes through existing gesture API — Stream A's undo system is untouched.

**Deferred**:
- Reordering fills via drag (the `moveFill` function is defined but not wired to a UI; reordering is done via add/remove for now).
- Rich-text-within-block (explicitly out of scope per plan).
- Canvas-side rendering of gradient editor gradient bar (uses stop position inputs instead).
- Arrowhead and per-side stroke controls are modeled in `StrokeData` but UI only uses the uniform `'all'` side with basic style selectors.

---

### Phase 2, Stream B (B2) — 2026-07-16

Completed the whole-block typography system. The inspector now provides a searchable curated/system font-family picker with in-context previews and a browser fallback notice, plus weight, italic style, size, line height, letter spacing, paragraph spacing, horizontal/vertical alignment, fixed/auto-width/auto-height sizing, underline/strikethrough, case transforms, and ellipsis truncation. `engine/typography.ts` owns typed style-record serialization with legacy CSS-key fallback; `DesignBlock` and all HTML/CSS/SASS export paths render the same values. `tests/unit/typography-model.test.ts` covers legacy, malformed, round-trip, and semantic export fixtures. Rich-text-within-block remains explicitly deferred.
