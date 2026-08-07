---
id: ai-module-plan
title: AI Module Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# AI Module — Two-Stream Build Plan (new feature module)

**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**This is a FEATURE BUILD, not a relocation.** The parallel-safety mechanism is
therefore different from the extraction plans: a **frozen contract** (types, state API,
placeholder layout component) is committed to `master` in Phase 0 BEFORE the agents
branch. Stream A implements state + shell integration; Stream B implements components +
styles + docs. Both compile independently in their own worktrees because both build
against the Phase 0 contract. The contract's public API, paths, class names, and
user-facing strings are FROZEN — neither stream may rename anything in it.

You are one of two agents. Your operator will tell you whether you are **Agent A
(Stream A — state & shell integration)** or **Agent B (Stream B — components, styles,
docs)**.

- Agent A: branch `ai-module-state`.
- Agent B: branch `ai-module-ui`.
- Each agent works in its own worktree from the same post-Phase-0 `master` commit.
- Phase 3 (integration, e2e authoring, verification) runs once after both merge.

---

## 1. What we are building

A full AI workspace template ("fractalAI"), modeled on the Claude Desktop app layout,
selectable from the home template gallery alongside code/notes/design. Since agents
cannot look at Claude Desktop, the layout is specified concretely here:

```
┌────────────────────────────────────────────────────────────────────────┐
│ app header (shell — scoped buttons added for the ai template)          │
├───────────┬───────────────────────────────────────────┬────────────────┤
│ AiSidebar │ ChatColumn                                │ WorkPanel      │
│ 260px     │ (flexible)                                │ 400px,         │
│           │ ┌───────────────────────────────────────┐ │ collapsible,   │
│ [Home]    │ │ session tab strip (open sessions, ×,  │ │ resizable      │
│ [Code]    │ │ + new)                                │ │                │
│  ← seg-   │ ├───────────────────────────────────────┤ │ [Files]        │
│  mented   │ │                                       │ │ [Terminal]     │
│  tabs     │ │ chat conversation + composer          │ │ [Browser]      │
│           │ │ (embeds the existing AIChat.svelte    │ │  ← tab bar     │
│ [+ New    │ │  with showHeader={false} — this is    │ │                │
│  session] │ │  how ALL existing AI features are     │ │ active tab     │
│           │ │  retained: providers, models, local   │ │ hosts the      │
│ Pinned    │ │  models, streaming, attachments,      │ │ existing       │
│  · item   │ │  context meter, checkpoints)          │ │ component      │
│  · item   │ │                                       │ │                │
│ Recents   │ │                                       │ │                │
│  · item   │ └───────────────────────────────────────┘ │                │
│  · item   │                                           │                │
└───────────┴───────────────────────────────────────────┴────────────────┘
```

Key behaviors:

- **Left sidebar (`AiSidebar`)**: segmented Home/Code tabs at top. Home lists chat
  sessions; Code lists sessions whose metadata `kind === 'code'` (v1 interpretation:
  a session created while the Code tab is active gets `kind: 'code'`). Below the tabs:
  a prominent "New session" button; then a "Pinned" section, then "Recents" (sorted by
  last-opened, from the kernel's ADR-011 session list). Each row: title + relative
  time; hover reveals a pin/unpin toggle. Collapsible.
- **Middle (`ChatColumn`)**: a session tab strip (open sessions as closable tabs plus a
  `+` tab) above the conversation. **Constraint: only ONE conversation is live at a
  time** — the kernel has a single `chatMessages`/`currentSessionId`; tabs are quick
  switchers that call the kernel's `loadChatSession`, NOT parallel chats. Do not
  attempt concurrent streaming. Closing the active tab activates its successor and is
  ONE atomic undo entry (mirror the IDE tab-close pattern).
- **Right (`WorkPanel`)**: collapsible, resizable (pointer + keyboard resize per
  ADR-014's document-level pattern; resize gestures undoable). Tab bar: **Files** hosts
  `$lib/modules/ide/components/Sidebar.svelte`, **Terminal** hosts
  `$lib/modules/ide/components/Terminal.svelte`, **Browser** hosts
  `$lib/components/Browser.svelte`. These are accepted ai→ide module edges (precedent:
  `tileKinds`); the ADR records them.
- **Existing AI features are retained by embedding, not rewriting.** `AIChat.svelte`
  (core) already implements providers/models/local-models/streaming/history/attachments
  and accepts `showHeader?: boolean`. Neither stream edits `AIChat.svelte`,
  `ai-elements/**`, or the kernel's AI sections. The ONE exception is listed in A4.

## 2. Frozen contract (Phase 0 — operator commits this to master before branching)

Three files, created exactly as specified, committed to `master` in one commit
(`chore: AI module contract skeleton`). Verify `git status` is clean first.

### 2a. `src/lib/modules/ai/types.ts`

```ts
export type AiSidebarTab = 'home' | 'code';
export type AiWorkTab = 'files' | 'terminal' | 'browser';

export interface AiSessionMeta {
	id: string;            // kernel session id (ADR-011)
	title: string;         // display title (kernel-provided or user-renamed)
	kind: AiSidebarTab;    // which sidebar tab lists it
	pinned: boolean;
	lastOpenedAt: number;  // ms epoch, drives Recents ordering
}
```

### 2b. `src/lib/modules/ai/state/ai.svelte.ts` — skeleton

The PUBLIC API below is frozen (names, signatures, storage keys). Bodies here are
minimal-but-working for layout state; session methods are stubs Stream A replaces.

```ts
import { registerUndoDomain } from '$lib/state/undo.svelte';
import type { AiSessionMeta, AiSidebarTab, AiWorkTab } from '../types';

const LAYOUT_KEY = 'fractalengine:ai-workspace';
const META_KEY = 'ai:session-meta';

interface AiLayoutSnapshot {
	sidebarCollapsed: boolean;
	workPanelCollapsed: boolean;
	workPanelWidth: number;
	sidebarTab: AiSidebarTab;
	workTab: AiWorkTab;
	openTabIds: string[];
	pinnedIds: string[];
}

class AiWorkspaceState {
	sidebarCollapsed = $state(false);
	workPanelCollapsed = $state(true);
	workPanelWidth = $state(400);
	sidebarTab = $state<AiSidebarTab>('home');
	workTab = $state<AiWorkTab>('files');
	openTabIds = $state<string[]>([]);
	activeTabId = $state<string | null>(null);
	sessions = $state<AiSessionMeta[]>([]);   // merged kernel list + local meta overlay
	sessionsError = $state<string | null>(null);
	private undoStack: AiLayoutSnapshot[] = [];
	private redoStack: AiLayoutSnapshot[] = [];

	// layout actions (undoable)
	toggleSidebar(): void { this.pushUndo(); this.sidebarCollapsed = !this.sidebarCollapsed; this.persist(); }
	toggleWorkPanel(): void { this.pushUndo(); this.workPanelCollapsed = !this.workPanelCollapsed; this.persist(); }
	setWorkPanelWidth(width: number): void { if (Number.isFinite(width)) { this.workPanelWidth = Math.max(280, Math.min(720, width)); this.persist(); } }
	setSidebarTab(tab: AiSidebarTab): void { this.pushUndo(); this.sidebarTab = tab; this.persist(); }
	setWorkTab(tab: AiWorkTab): void { this.pushUndo(); this.workTab = tab; this.persist(); }
	beginResizeGesture(): void {}    // Stream A: ADR-014 gesture snapshot
	endResizeGesture(): void {}

	// session actions (Stream A implements against the kernel's ADR-011 API)
	async refreshSessions(): Promise<void> {}
	async newSession(): Promise<void> {}             // kind = current sidebarTab
	async openSession(id: string): Promise<void> {}  // loads + adds tab + bumps lastOpenedAt
	closeTab(id: string): void {}                    // atomic: close + successor selection = one undo
	togglePin(id: string): void {}                   // undoable
	renameSession(id: string, title: string): void {}

	// undo domain (layout + pins/tabs snapshots)
	pushUndo(): void { this.undoStack.push(this.snapshot()); if (this.undoStack.length > 100) this.undoStack.shift(); this.redoStack = []; }
	undo(): void { const p = this.undoStack.pop(); if (!p) return; this.redoStack.push(this.snapshot()); this.restore(p); }
	redo(): void { const n = this.redoStack.pop(); if (!n) return; this.undoStack.push(this.snapshot()); this.restore(n); }

	private snapshot(): AiLayoutSnapshot {
		return { sidebarCollapsed: this.sidebarCollapsed, workPanelCollapsed: this.workPanelCollapsed, workPanelWidth: this.workPanelWidth, sidebarTab: this.sidebarTab, workTab: this.workTab, openTabIds: [...this.openTabIds], pinnedIds: this.sessions.filter(s => s.pinned).map(s => s.id) };
	}
	private restore(s: AiLayoutSnapshot): void {
		this.sidebarCollapsed = s.sidebarCollapsed; this.workPanelCollapsed = s.workPanelCollapsed; this.workPanelWidth = s.workPanelWidth; this.sidebarTab = s.sidebarTab; this.workTab = s.workTab; this.openTabIds = [...s.openTabIds];
		this.sessions = this.sessions.map(m => ({ ...m, pinned: s.pinnedIds.includes(m.id) }));
		this.persist();
	}
	persist(): void {
		if (typeof localStorage === 'undefined') return;
		try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(this.snapshot())); } catch { /* ignore */ }
	}
}

export const aiWorkspace = new AiWorkspaceState();

registerUndoDomain({
	id: 'ai',
	undo: () => aiWorkspace.undo(),
	redo: () => aiWorkspace.redo(),
	pushUndo: () => aiWorkspace.pushUndo(),
});
```

(`META_KEY` is intentionally unused in the skeleton — Stream A wires it.)

### 2c. `src/lib/modules/ai/components/AiLayout.svelte` — placeholder

```svelte
<script lang="ts">
	import { aiWorkspace } from '../state/ai.svelte';
</script>

<div class="ai-layout box w100 h100">
	<span class="panel-text-std-muted">AI workspace loading… ({aiWorkspace.sidebarTab})</span>
</div>
```

Stream B replaces this file entirely (B owns it after Phase 0).

### 2d. Frozen strings, keys, and class names

| Contract item | Value |
|---|---|
| Template id / name / summary | `ai` / `fractalAI` / `AI chat, sessions, and working context.` |
| Template image | reuse `fractalzero.png` (operator swaps art later; agents create NO binary assets) |
| localStorage keys | `fractalengine:ai-workspace`, `ai:session-meta` |
| Undo domain id / TEMPLATE_DOMAIN entry | `ai` / `ai: 'ai'` |
| Header button aria-labels | `Toggle AI sessions sidebar`, `Toggle AI work panel`, `New AI session` |
| Palette labels (category "AI") | `New AI Session`, `Toggle AI Sessions Sidebar`, `Toggle AI Work Panel`, `Open Files Panel`, `Open Terminal Panel` |
| Top-level CSS classes (B defines; e2e will select on them) | `.ai-layout`, `.ai-sidebar`, `.ai-sidebar-tab`, `.ai-session-row`, `.ai-session-pin`, `.ai-new-session`, `.ai-chat-column`, `.ai-session-tabstrip`, `.ai-session-tab`, `.ai-work-panel`, `.ai-work-tab`, `.ai-work-resizer` |

### 2e. Hard rules (both streams)

- Svelte 5 runes only; `let x = $derived(val)` (never `$derived(() => val)`); no
  `<style>` blocks in components; indented SASS with tabs; **semantic tokens only** —
  no hardcoded colors/sizes/radii/shadows (consume `--background10`, `--border-secondary`,
  `--text-primary`, `--theme-color`, etc. from `src/lib/styles/_tokens.sass`).
- No native `<input type="color">` anywhere (rule 8 — not expected here anyway).
- **No `ipc.ts` / `ipc-mock.ts` changes.** V1 uses only existing IPC (the ADR-011
  session commands already work in the browser mock — this keeps `pnpm dev` fully
  functional for free).
- Read-only files for BOTH streams: `AIChat.svelte`, `ai-elements/**`,
  `modules/ide/**`, `Browser.svelte`, `ipc*.ts`, and the kernel `ide.svelte.ts`
  **except** Stream A's single whitelisted edit in A4.

### 2f. File-ownership manifest (disjoint, post-Phase-0)

**Stream A owns:** `modules/ai/state/ai.svelte.ts` (internals; public API frozen),
`modules/ai/types.ts` (may extend, not change), `src/lib/data/templates.ts`,
`src/lib/state/undo.svelte.ts` (TEMPLATE_DOMAIN line only), `src/routes/+page.svelte`,
`src/routes/+layout.svelte` (optional shortcut only), `CommandPalette.svelte`,
`SettingsDialog.svelte` (verify/extend), `ide.svelte.ts` (A4 whitelist only),
`tests/unit/ai-workspace.test.ts` (new).

**Stream B owns:** `modules/ai/components/**` (including replacing the placeholder),
`modules/ai/styles/**`, `src/lib/styles/index.sass`, `docs/**`, `AGENTS.md`.

---

## 3. Stream A — State & shell integration (Agent A)

Branch `ai-module-state`. Do not touch `modules/ai/components/**` (placeholder
included), `styles/**`, `docs/**`, `AGENTS.md`.

### A1. Inventory first (do not skip)

Grep the kernel's ADR-011 section (`ide.svelte.ts` ~line 1866+) and record the exact
names of: the sessions list state, `refreshSessions()`, `loadChatSession(sessionId)`,
`currentSessionId`, the method that starts a fresh chat (resets `chatMessages` — find
its real name near line 1947), and how session titles/models are exposed by
`listSessions`. Bind to what EXISTS — do not duplicate session storage.

### A2. Implement `aiWorkspace` session logic

- `refreshSessions()`: call the kernel's refresh, then merge its list with the local
  meta overlay from `ai:session-meta` (a `Record<sessionId, {kind, pinned, title?}>`)
  into `sessions`. Kernel is the source of truth for existence/order; overlay only adds
  `kind`/`pinned`/renames. Persist overlay on every mutation. Sessions are
  project-scoped in the kernel (keyed by `rootPath`) — store the overlay per-session-id
  and tolerate ids that no longer exist (filter them out, don't crash).
- `newSession()`: delegate to the kernel's fresh-chat method; tag the new session's
  meta with `kind = this.sidebarTab`; open a tab for it and make it active.
- `openSession(id)`: kernel `loadChatSession(id)`; add to `openTabIds` if absent; set
  `activeTabId`; bump `lastOpenedAt`; persist overlay.
- `closeTab(id)`: ONE `pushUndo()` for close + successor selection (successor = next
  tab, else previous, else null). If the closed tab was active, load the successor
  session. Atomicity is rule-9-mandatory and will be e2e-tested.
- `togglePin(id)` / `renameSession(...)`: `pushUndo()` first, mutate, persist overlay.
- `beginResizeGesture`/`endResizeGesture`: ADR-014 gesture pattern (snapshot at start,
  push only if changed at end — copy the notes module's `beginLayoutGesture` shape).
- Malformed persisted data (bad JSON, wrong types, unknown ids) must fall back to
  defaults silently — mirror the defensive parsing style in `notes.svelte.ts`.

### A3. Shell integration

1. `src/lib/data/templates.ts`: add `'ai'` to `AppTemplateId`; append the TEMPLATES
   entry per the contract table (`tiles` can mirror the `code` template's shape — it is
   unused for non-canvas templates; verify how `notes`/`design` entries handle `tiles`
   and copy that convention). The home gallery card appears automatically
   (`HomeTilesLayout` iterates `TEMPLATES`).
2. `src/routes/+page.svelte`: add the `{:else if appState.activeTemplateId === 'ai'}`
   branches — header scoped buttons (the three contract aria-labels, following the
   notes template's `.icon-button`/`.strip-button` header pattern) and the lazy layout
   branch `{#await import('$lib/modules/ai/components/AiLayout.svelte')}` with loading/
   error states copied from the notes branch. Compiles against the placeholder.
3. `src/lib/state/undo.svelte.ts`: add `ai: 'ai'` to `TEMPLATE_DOMAIN`. (The domain
   registers from the module — already in the skeleton.)
4. `CommandPalette.svelte`: add the AI section, `appState.activeTemplateId === 'ai'`
   scoped, with the five contract labels, each a **dynamic** import of
   `$lib/modules/ai/state/ai.svelte` (follow the notes section's shape exactly).
5. `SettingsDialog.svelte`: verify AI provider/model settings already cover the module
   (they live in the kernel and are template-agnostic — expected: no change; add
   nothing speculative).

### A4. The ONE whitelisted kernel edit

If (and only if) the fresh-chat method or sessions list is `private`, change its
visibility to public — no logic changes, no renames. Anything more: STOP and report.

### A5. Unit test

`tests/unit/ai-workspace.test.ts` (vitest): overlay merge (kernel list × meta overlay),
malformed-overlay fallback, `closeTab` successor selection + single-undo-entry
atomicity, pin round-trip through undo/redo. Import pure logic or test through the
singleton with mocked localStorage — follow existing unit tests' conventions.

### A6. Verify and commit

`pnpm check` (0/0) → `pnpm build` → `npx vitest run` → `npx playwright test` (full
suite; must stay green with the template added — specs unedited). In the dev server,
switching to the fractalAI template must render the placeholder without console
errors. Commit.

---

## 4. Stream B — Components, styles, docs (Agent B)

Branch `ai-module-ui`. Do not touch anything in Stream A's manifest. Build against the
Phase-0 skeleton — layout/toggle/tab state works; session methods are stubs, so lists
render empty in your worktree. That is expected; code defensively against empty
`sessions` (show a "No sessions yet" empty state — you need one anyway).

### B1. Components (`modules/ai/components/`)

Replace the placeholder `AiLayout.svelte` and add: `AiSidebar.svelte`,
`ChatColumn.svelte`, `WorkPanel.svelte` (plus small internals like
`SessionRow.svelte` as you see fit — keep the frozen class names on the elements the
contract lists).

- `AiLayout`: CSS grid `sidebar | chat | workpanel`; collapsed states animate with
  `slide` + `quadIn/quadOut` like `NotesLayout` (read it first — it is the house
  pattern for 3-pane layouts, including the separator drag wiring to
  `beginResizeGesture`/`setWorkPanelWidth`/`endResizeGesture` and keyboard-adjustable
  resizers with ARIA per ADR-014).
- `AiSidebar`: segmented Home/Code tabs (`aiWorkspace.sidebarTab`/`setSidebarTab`);
  "New session" button → `newSession()`; Pinned section (`sessions.filter(s => s.pinned && s.kind === tab)`),
  Recents (unpinned, sorted by `lastOpenedAt` desc); rows call `openSession(id)`, hover
  pin toggle calls `togglePin(id)`. Relative time: write a tiny local helper (no new
  dependency).
- `ChatColumn`: session tab strip (`openTabIds` → resolve meta from `sessions`; active
  = `activeTabId`; `×` → `closeTab(id)`; `+` → `newSession()`); body embeds
  `<AIChat showHeader={false} />`. Read `AIChat.svelte`'s existing usage in
  `NotesLayout`/`DesignLayout` first to match how it is hosted. Do not edit it.
- `WorkPanel`: tab bar (Files/Terminal/Browser → `workTab`/`setWorkTab`); active tab
  mounts `modules/ide` `Sidebar`/`Terminal` or core `Browser` (one-line comment at the
  imports: documented ai→ide module edge, see ADR). Collapse toggle mirrors
  `aiWorkspace.workPanelCollapsed`.

All state access goes through `aiWorkspace`'s frozen API — if you need state the
contract lacks, keep it component-local (`$state` in the component); do NOT add
members to the shared state file (Stream A owns it).

### B2. Styles

`modules/ai/styles/_ai-layout.sass`, `_ai-sidebar.sass`, `_ai-chat-column.sass`,
`_ai-work-panel.sass` — tabs, no braces/semicolons, semantic tokens only, header
comment naming the component each styles. Register all four in
`src/lib/styles/index.sass` (append in the module block alongside the other
`../modules/...` lines). Aim for Claude-Desktop-ish restraint: quiet surfaces
(`--background10`-family), 1px `--border-secondary` separators, subtle hover states,
compact type for session rows.

### B3. Verify

`pnpm check` (0/0), `pnpm build`, and drive the dev server (browser, ipc-mock): switch
to fractalAI, exercise every toggle/tab/resizer, confirm empty states, confirm zero
console errors and no unstyled elements.

### B4. Docs (AGENTS.md rule 10)

Routing docs for each new component + the state module + types (path-encoded names,
`app-documenter` conventions); design-doc updates for the new sass
(`styling-docs-builder`, update `DESIGN.md`); `doc-frontmatter` to regenerate
`docs/INDEX.md` rows; **ADR-024** (`adr-writing`): the AI module — embed-don't-rewrite
decision around `AIChat`, the meta-overlay-over-kernel-sessions design, single-live-
conversation constraint, accepted ai→ide edges, no-new-IPC constraint; AGENTS.md:
add `src/lib/modules/ai/` to the directory structure. Commit.

---

## 5. Phase 3 — Integration & verification (run ONCE after both merge)

1. Merge `ai-module-state`, then `ai-module-ui`. Only intentional overlap is none —
   any conflict means a stray edit; investigate.
2. `pnpm check` && `pnpm build` && `npx vitest run` && `npx playwright test` — green,
   existing specs unedited.
3. **Author `tests/ai.spec.ts`** (new, this phase — it needs both streams' work):
   open fractalAI from home; sidebar renders with New-session button; create a session;
   send a message and get a (mock) reply; pin it; toggle Home/Code tabs; open the work
   panel and switch Files/Terminal/Browser tabs; close the active session tab →
   successor activates and ONE `Cmd+Z` restores it; sidebar toggle undoes; reload →
   layout, pins, and recents persist. Select on the contract class names/aria-labels.
4. Browser smoke of anything the spec can't reach; then rule-12 sweep: mutation
   inventory (every aiWorkspace mutation has one atomic undo entry), malformed
   `ai:session-meta` fixture tolerated, palette/header/shortcut cross-check.
5. `pnpm tauri dev` (operator): real provider chat, local model selection, session
   history across restarts, terminal + files tabs against a real workspace.

## Out of scope (do not improvise)

- Concurrent/parallel chat streaming; multi-window; new IPC commands or Rust changes
  (native menu gets no `tpl_ai` entry this phase — note in ADR).
- Editing `AIChat.svelte`, `ai-elements/**`, kernel AI internals (beyond A4), or any
  other module.
- New npm dependencies, new binary assets, artifact/preview panes beyond the three
  work tabs.
