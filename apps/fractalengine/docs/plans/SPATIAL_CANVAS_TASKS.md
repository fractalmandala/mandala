---
id: spatial-canvas-tasks
title: Spatial Canvas Tasks Plan
type: plan
tags: [canvas, plan]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Spatial Canvas Migration — Task Breakdown (2-Agent Parallel Plan)

Source plan: [SPATIAL_CANVAS_MIGRATION.md](SPATIAL_CANVAS_MIGRATION.md). This doc just
re-sequences that plan into two independent work streams so two agents can execute
concurrently with minimal blocking. Each task references the relevant section(s) of the
source doc — read those sections before starting the task.

Guardrails from the source doc (§8) apply to **both** streams, always:
- Svelte 5 runes only. Indented Sass, single-tab, no braces/semicolons. No hardcoded colors.
- Filesystem/shell only through `ipc.ts` / `ipc-mock.ts`; must keep working in BROWSER mock mode.
- Don't delete existing components — adapt in place.
- App must boot and existing themes must keep working after every task.

**Scope correction vs. the source doc:** fractalengine today is an IDE only — confirmed
components are `Editor`, `Terminal`, `Browser`, `AIChat`, `Sidebar`, `CommandPalette`,
`ModelMarketplace`, `SkillsMarketplace`. There is no design canvas, mail, DB inspector, wiki/
notes vault, or any other module — those were illustrative in the source doc's §3/§4, not
real features. **This pass builds the canvas/tile engine and re-houses only the IDE features
that exist today.** Every other module (`design`, `wiki`, `mail`, `db`, `run`, `review`
templates; `DocEditor`, `MailView`, `DbInspector`, `BacklinkGraph`, `ResultsGrid`, `Preview`,
`Diagnostics` tile bodies) is **deferred** — do not build placeholder/stub components for
them. Instead, the engine must make adding them later a pure data-layer change (new
`TileKind` + `TILE_KINDS` entry + template), with zero rework of `Canvas.svelte`/`Tile.svelte`.
The template gallery and dock should visually reserve space for these future modules (as
disabled/"coming soon" entries) so the UI communicates what's coming without anyone having
to build it now.

---

## Phase 0 — Shared prerequisite (sequential, ~1 task, blocks both streams)

**Owner: whichever agent starts first; the other waits on this only.**

- **T0. Scaffold the state layer.** Create `src/lib/state/canvas.svelte.ts` per §2: `Tile`/
  `Viewport`/`WorkspaceTemplate` interfaces, `CanvasStore` class with `tiles`, `viewport`,
  `activeId`, `focusedId` state and the methods listed (`addTile`, `removeTile`, `moveTile`,
  `resizeTile`, `raise`, `focusTile`, `applyTemplate`, `saveAsTemplate`, `fit`). Export the
  `canvas` singleton. No UI yet — just types and logic.
  - **`TileKind` is scoped to what exists today**, not the full §2 list:
    ```ts
    export type TileKind =
    	| 'fileTree' | 'editor' | 'terminal' | 'browser' | 'ai'
    	| 'modelMarketplace' | 'skillsMarketplace'
    ```
    It's a plain string union — adding `'doc' | 'mail' | 'db' | ...` later when those
    features actually ship is a one-line change here plus a `TILE_KINDS` entry (B1) and
    nothing else. Don't pre-declare kinds that have no component.
  - **Why this blocks everything:** both streams import `TileKind`, `Tile`, and
    `WorkspaceTemplate` from this file (Stream B's `tileKinds.ts`/`templates.ts`, Stream A's
    `Tile.svelte`/`Canvas.svelte`).
  - Done when: file compiles, exports match §2 (minus the scoped-down `TileKind`), no other
    file imports it yet.

Once T0 lands, **Stream A and Stream B run fully in parallel.** Only one later checkpoint
(Phase 3) requires both streams to have merged.

---

## Stream A — Board mechanics & shell (Agent 1)

Owns: the canvas/tile rendering engine, the app shell swap, and board-level chrome
(dock, minimap, persistence). Reference §1, §4 (Canvas/Tile/Minimap/TileDock), §5, §6, §7
steps 2/3/4/7/9.

1. **A1. Tile chrome.** Build `Tile.svelte` + `styles/components/_tile.sass` (§4, §5 — copy
   the example sass verbatim, it's already spec'd). Render 2-3 hardcoded `Tile` instances in
   a temporary throwaway route (e.g. `/dev/tiles`) to verify drag, resize, and `raise()`
   work before wiring into the real board. Delete the throwaway route once A2 lands.
2. **A2. Board.** Build `Canvas.svelte` + `_canvas.sass` (§4, §5): dotted-grid background,
   translate/scale transform driven by `canvas.viewport`, pan (space-drag / middle-mouse /
   trackpad two-finger), zoom (ctrl/cmd+wheel toward cursor, clamp 0.4–2.0), `{#each
   canvas.tiles as tile (tile.id)}` → `<Tile {tile} />`. Stub `<Minimap />` / `<TileDock />`
   as empty placeholder components for now (A5 fills them in) so Canvas can render today.
3. **A3. Swap the shell.** Edit `+page.svelte` per §1: replace `workspace-wrapper` and the
   three `*Collapsed` branches with `<main class="board-region box w100 h100
   overflow-hidden"><Canvas /></main>`. Delete `leftSidebarCollapsed` / `browserCollapsed` /
   `rightSidebarCollapsed` from `ideState` and any other reads of them. Update `_layout.sass`
   to retarget header (fixed height) · `.board-region` (flex:1) · footer. **App must boot
   into an empty/dev board after this task** — this is the first fully-integrated checkpoint.
4. **A4. New tokens.** Add the canvas/tile/z-index tokens from §5 to `_tokens.sass` (module
   legend tokens too, even though Stream B consumes them in `tileKinds.ts`/`Tile.svelte`'s
   `data-module` attr — keep all token additions in one place to avoid merge conflicts).
   Add `@import` lines for `_canvas.sass`/`_tile.sass` to `index.sass`.
5. **A5. Dock + minimap.** Build `Minimap.svelte` + `_minimap.sass` (scaled overview of tile
   bounds + draggable viewport rect) and `TileDock.svelte` + `_dock.sass` per §4/§6: one
   **enabled** button per module that has real kinds today (`code` → fileTree/editor/
   terminal, `system` → ai), calling `canvas.addTile(kind)`. Add **disabled, greyed-out**
   placeholder buttons for `design`/`wiki`/`mail`/`db` labeled with a "coming soon" tooltip —
   this is the only future-module surface Stream A needs to build; it's pure UI, no logic,
   and reserves the visual slot without anyone building the feature. Wire dock + minimap
   into `Canvas.svelte` in place of the A2 stubs.
6. **A6. Persistence.** Per §6/§7 step 9: persist `canvas.viewport` and `canvas.tiles` to disk
   via `ipc.ts` (fall back to `localStorage` in browser/mock mode via `ipc-mock.ts`) so a
   workspace reopens where it was left. Load on mount in `Canvas.svelte` or `+page.svelte`.

**Stream A does not need Stream B's templates or tile bodies to do any of the above** —
A1/A2 use hardcoded/dummy tiles, A5's dock just calls `addTile(kind)` with whatever kinds
exist in the registry at integration time.

---

## Stream B — Data, content, and templates (Agent 2)

Owns: the tile-kind registry, the IDE-only starter templates, adapting existing panels into
tile bodies, the template gallery, and command-palette integration. Reference §3, §4
(existing-component adaptation + TemplateGallery), §5 (`_templategallery.sass`), §6, §7 steps
5/6/8 — **skip §7 step 10 entirely** (future module stubs are out of scope for this pass).

1. **B1. Tile-kind registry.** Build `src/lib/data/tileKinds.ts` per §3, scoped to real
   components only:
   ```ts
   export const TILE_KINDS: Record<TileKind, TileKindMeta> = {
   	fileTree:         { label: 'Explorer',    module: 'code',   component: Sidebar,          defaultW: 220, defaultH: 600 },
   	editor:           { label: 'Editor',      module: 'code',   component: Editor,           defaultW: 640, defaultH: 460 },
   	terminal:         { label: 'Terminal',    module: 'code',   component: Terminal,         defaultW: 640, defaultH: 200 },
   	browser:          { label: 'Browser',     module: 'design', component: Browser,          defaultW: 480, defaultH: 360 },
   	ai:               { label: 'AI Copilot',  module: 'system', component: AIChat,           defaultW: 360, defaultH: 520 },
   	modelMarketplace: { label: 'Models',      module: 'system', component: ModelMarketplace, defaultW: 480, defaultH: 480 },
   	skillsMarketplace:{ label: 'Skills',      module: 'system', component: SkillsMarketplace,defaultW: 480, defaultH: 480 },
   }
   ```
   `Browser` keeping the `design` module tag is intentional — it's the closest thing to a
   visual/preview surface that exists today, and gives the future design-canvas module a
   module color to inherit rather than inventing one now. **No stub components, no entries
   for kinds that don't exist.**
2. **B2. Adapt existing panel components.** Per §4 "Existing components — adapt, don't
   rewrite" and §5: strip outer width/height/positioning/collapse logic from `Editor`,
   `Terminal`, `Browser`, `AIChat`, `Sidebar`, `ModelMarketplace`, `SkillsMarketplace`. Edit
   `_sidebar.sass`, `_browser.sass`, `_editor.sass`, `_terminal.sass`, `_ai.sass` to remove
   absolute/column positioning and collapse rules — each should fill `100%` of its tile body
   and nothing more. **Do not delete these components**, only their outer chrome.
3. **B3. IDE-only templates.** Build `src/lib/data/templates.ts` per §3, but only the
   templates that existing tiles can actually fill:
   - `home` — **Project Home**, built only from existing pieces: `fileTree` (as a "recent
     files" view) + `ai`. Drop the `tasks`/`diagnostics` tiles from the source doc's
     illustrative layout — those features don't exist; don't reserve empty board space for
     them either, just leave room to drop tiles in later once they do.
   - `code` — **Code — Classic**: `fileTree`, `editor`, `terminal`. Drop the `inspector`
     tile (no such component exists); if you want a fourth slot, use `ai` instead.
   - `focus` — **Focus / Zen**: single `editor` tile, then `canvas.focusTile(id)`.
   - `blank` — **Blank Canvas**: empty `tiles: []`, as in the source doc.
   Do **not** add `design`, `wiki`, `mail`, `db`, `run`, or `review` template entries — there
   is nothing for them to contain yet. (B4 below reserves their *gallery* slot visually
   without `templates.ts` needing matching data.)
4. **B4. Template gallery.** Build `TemplateGallery.svelte` + `_templategallery.sass` per §4:
   cards for the four real `TEMPLATES` entries, each calling `canvas.applyTemplate`. Also add
   "Save layout as template" → `canvas.saveAsTemplate`. Additionally render **disabled
   "coming soon" cards** for Design, Wiki/Notes Vault, Mail, and DB — static, non-clickable,
   no template data behind them — so the gallery visually communicates the eventual room set
   without any of those modules being built. When one of those features ships later, swap its
   card from disabled to a real `TEMPLATES` entry; no gallery rework needed.
5. **B5. Command palette integration.** Per §4/§7 step 8: extend `CommandPalette` with a
   "tile palette" mode — typing can add a tile (`canvas.addTile`, limited to the kinds in B1)
   or apply a template (`canvas.applyTemplate`, limited to the four in B3). This is the one
   task that meaningfully touches a file Stream A doesn't own, but it's additive (new mode
   inside existing palette), so it's safe to do independently.

---

## Phase 3 — Integration checkpoint (both agents, after both streams finish)

Do this together once Stream A's A3 (shell swap) and Stream B's B1/B3/B4 (registry +
templates + gallery) are all done — whichever agent finishes first should wait/ping rather
than guess at the other's exports:

1. Wire `<TemplateGallery />` into `+page.svelte` as the overlay shown on first load /
   "New workspace" (§1), with **Project Home** (`templates.ts`'s `home` entry) as the
   default-applied template.
2. Confirm `TileDock.svelte` (A5) renders one enabled button per real `ModuleId` from
   `tileKinds.ts` (B1) plus the disabled future-module placeholders, and that
   `canvas.addTile(kind)` produces a tile whose body resolves correctly via
   `TILE_KINDS[tile.kind].component` (B1).
3. Smoke-test: app boots straight into Project Home, drag/resize/raise work on every tile
   kind, switching templates via the gallery and via CommandPalette (B5) both work, viewport
   + layout persist across reload (A6), and BROWSER mock mode still works end-to-end.
4. Fix any prop/shape mismatches between `Tile.svelte`'s `props` spreading (A1) and what the
   real B2-adapted components actually expect.
5. Confirm the gallery's disabled "coming soon" cards (B4) and the dock's disabled module
   buttons (A5) read their labels from a single shared list (avoid two hardcoded copies of
   "Design / Wiki / Mail / DB" drifting out of sync) — put that list in `tileKinds.ts` or a
   small adjacent `futureModules.ts` constant, whichever stream owns it.

---

## Parallelism summary

| | Stream A (Agent 1) | Stream B (Agent 2) |
|---|---|---|
| Blocks on | T0 only | T0 only |
| Touches | `Canvas.svelte`, `Tile.svelte`, `Minimap.svelte`, `TileDock.svelte`, `+page.svelte`, `_layout/_canvas/_tile/_minimap/_dock.sass`, `_tokens.sass`, `ipc` persistence | `tileKinds.ts`, `templates.ts`, `TemplateGallery.svelte`, `CommandPalette.svelte`, existing panel components + their sass |
| File overlap with other stream | `_tokens.sass` (A4 owns; B reads), `CommandPalette.svelte` (B5, additive only) | none structural |
| Hard sync point | Phase 3, after A3 + B1/B3/B4 | Phase 3, after A3 + B1/B3/B4 |

If true zero-contact parallelism is preferred over the small `_tokens.sass` / palette
overlap, Stream A can stub the module-legend tokens itself in A4 and Stream B can skip B5
until after Phase 3 — but the overlap above is small enough that it's usually fine to run
concurrently.

## What got cut, and where it goes later

Everything below was illustrative scaffolding in the source doc, not a real feature — it is
**not** built in this pass, and there are no stub files, stub `TileKind`s, or stub
`WorkspaceTemplate`s for any of it:
- Tile kinds: `doc`, `mail`, `db`, `query`, `results`, `preview`, `diagnostics`, `logs`,
  `tasks`, `home` (as a kind — `home` the *template* still exists), `inspector`, `graph`.
- Components: `DocEditor`, `MailView`, `DbInspector`, `BacklinkGraph`, `ResultsGrid`,
  `Preview`, `Diagnostics`, `Tasks`, `ProjectHome`, `Inspector`.
- Templates: `design`, `wiki`, `mail`, `db`, `run`, `review`.

When one of these modules is actually built later, the addition is: one `TileKind` union
member (`canvas.svelte.ts`), one `TILE_KINDS` entry pointing at the new component
(`tileKinds.ts`), and either a new `WorkspaceTemplate` or a slot in an existing one
(`templates.ts`) — plus flipping its gallery card / dock button from disabled to live. No
changes to `Canvas.svelte`, `Tile.svelte`, or the drag/resize/persistence engine are expected.
That decoupling is the actual point of doing the canvas migration now, ahead of those features.
