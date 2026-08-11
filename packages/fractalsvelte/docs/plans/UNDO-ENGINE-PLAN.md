---
id: undo-engine-plan
title: Undo Engine Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**Goal:** Replace the five hand-rolled undo stacks (kernel, canvas, notes, designer×2,
ai) with one core snapshot-transaction engine. Rule 9's invariant — every mutation is
one atomic undo entry — becomes structural: mutations run inside `transact()`, nested
transactions coalesce into the outermost, and gesture coalescing/redo-invalidation/
capacity live in exactly one tested class instead of five divergent copies.

**Scope decision (read before objecting):** this is a snapshot-transaction engine, NOT
a command-object-per-mutation pattern. Every existing domain is snapshot-based
(capture/restore), and the audits' pain points are stack *semantics* (atomicity,
coalescing, redo clearing, caps), not snapshot shapes. Command objects would rewrite
hundreds of mutations for no additional guarantee. Domains keep their snapshot shapes;
the engine owns everything else.

**Kernel honesty:** `ideState` (28 `pushUndo()` sites over a ~2,500-line kernel)
adopts the ENGINE (its hand-rolled stack code is deleted; `pushUndo/undo/redo` become
engine delegates with its exact current semantics: capacity 50, dedupe-identical-top,
skip-equal-top-on-undo) — but converting all 28 kernel call sites to `transact()` is
deferred to the kernel-decomposition phase. The four module/canvas domains convert
fully to `transact()`. The ADR records both facts.

**The regression net:** `tests/design.spec.ts` and `tests/ai.spec.ts` exercise gesture
and layout undo. **All retained Playwright specs must pass unedited.**

**Prerequisite:** clean `git status` on `master`.

You are one of two agents. Operator assigns **Agent A (kernel + canvas + ai)** or
**Agent B (notes + designer + engine tests + docs)**.

- Agent A: branch `undo-engine-core`.
- Agent B: branch `undo-engine-modules`.
- Both branch from post-Phase-0 `master`; Phase 3 runs once after merge.

---

## Phase 0 — Frozen contract (operator commits BEFORE branching)

One commit (`chore: core undo engine`) adding exactly one file.

### 0a. `src/lib/state/undoHistory.svelte.ts` — create exactly this

```ts
import { nextHistorySequence } from './historyClock';

export interface UndoHistoryOptions<S> {
	capture: () => S;
	restore: (snapshot: S) => void;
	capacity?: number;                  // default 100 (kernel passes 50)
	equals?: (a: S, b: S) => boolean;   // default: JSON.stringify equality
}

interface HistoryEntry<S> {
	snapshot: S;
	order: number;   // historyClock sequence — enables composite-domain ordering
}

export class UndoHistory<S> {
	private undoStack = $state<HistoryEntry<S>[]>([]);
	private redoStack = $state<HistoryEntry<S>[]>([]);
	private gestureSnapshot: S | null = null;
	private transactionDepth = 0;
	private transactionBefore: S | null = null;
	private readonly capture: () => S;
	private readonly restore: (snapshot: S) => void;
	private readonly capacity: number;
	private readonly equals: (a: S, b: S) => boolean;

	constructor(options: UndoHistoryOptions<S>) {
		this.capture = options.capture;
		this.restore = options.restore;
		this.capacity = options.capacity ?? 100;
		this.equals = options.equals ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b));
	}

	private pushEntry(snapshot: S): void {
		const top = this.undoStack.at(-1);
		if (top && this.equals(top.snapshot, snapshot)) return;   // dedupe identical top
		this.undoStack.push({ snapshot, order: nextHistorySequence() });
		if (this.undoStack.length > this.capacity) this.undoStack.shift();
		this.redoStack = [];
	}

	/** Pre-mutation push, for call sites not yet converted to transact(). */
	push(): void {
		if (this.transactionDepth > 0) return;   // outer transaction already owns this mutation
		this.pushEntry(this.capture());
	}

	/** One atomic undo entry per outermost transaction; no entry if nothing changed. */
	transact<T>(fn: () => T): T {
		if (this.transactionDepth === 0) this.transactionBefore = this.capture();
		this.transactionDepth++;
		try {
			return fn();
		} finally {
			this.transactionDepth--;
			if (this.transactionDepth === 0) {
				const before = this.transactionBefore as S;
				this.transactionBefore = null;
				if (!this.equals(before, this.capture())) this.pushEntry(before);
			}
		}
	}

	beginGesture(): void {
		if (this.gestureSnapshot === null) this.gestureSnapshot = this.capture();
	}

	endGesture(): void {
		const before = this.gestureSnapshot;
		this.gestureSnapshot = null;
		if (before === null || this.equals(before, this.capture())) return;
		this.pushEntry(before);
	}

	undo(): void {
		let entry = this.undoStack.pop();
		if (!entry) return;
		const current = this.capture();
		// Skip an entry identical to the live state (kernel's historical behavior).
		if (this.equals(entry.snapshot, current)) {
			const next = this.undoStack.pop();
			if (!next) { this.undoStack.push(entry); return; }
			entry = next;
		}
		this.redoStack.push({ snapshot: current, order: nextHistorySequence() });
		this.restore(entry.snapshot);
	}

	redo(): void {
		const entry = this.redoStack.pop();
		if (!entry) return;
		this.undoStack.push({ snapshot: this.capture(), order: nextHistorySequence() });
		this.restore(entry.snapshot);
	}

	clear(): void {
		this.undoStack = [];
		this.redoStack = [];
		this.gestureSnapshot = null;
	}

	get canUndo(): boolean { return this.undoStack.length > 0; }
	get canRedo(): boolean { return this.redoStack.length > 0; }
	get nextUndoOrder(): number { return this.undoStack.at(-1)?.order ?? -1; }
	get nextRedoOrder(): number { return this.redoStack.at(-1)?.order ?? -1; }
}

/**
 * Composite domain over multiple histories (the designer pattern): undo/redo route to
 * whichever history holds the most recent entry; pushUndo routes to `primary`.
 * Returns the exact shape `registerUndoDomain` expects.
 */
export function compositeUndoDomain(
	id: string,
	histories: UndoHistory<unknown>[],
	primary: UndoHistory<unknown>,
): { id: string; undo: () => void; redo: () => void; pushUndo: () => void } {
	const latestBy = (key: 'nextUndoOrder' | 'nextRedoOrder') =>
		histories.reduce((a, b) => (b[key] > a[key] ? b : a));
	return {
		id,
		undo: () => latestBy('nextUndoOrder').undo(),
		redo: () => latestBy('nextRedoOrder').redo(),
		pushUndo: () => primary.push(),
	};
}
```

The engine's public API is FROZEN. Stream A may fix bugs in it (both streams depend on
it; any fix must keep the API and be flagged in the report); Stream B tests it.

### Hard rules (both streams)

1. **Zero behavioral change**, with ONE sanctioned delta: a `transact()` whose function
   changes nothing produces NO undo entry (today some paths push a phantom no-op
   entry). All Playwright specs must still pass unedited — if a spec fails on this
   delta, STOP and report; do not edit specs.
2. Snapshot shapes, persistence keys, and public state APIs are unchanged.
   `ideState.pushUndo/undo/redo/captureSnapshot` keep their signatures — the notes
   module's vault ops call them.
3. Per-domain semantics preserved: kernel capacity **50**, all others **100**;
   `registerUndoDomain` and `TEMPLATE_DOMAIN` in `undo.svelte.ts` are untouched (the
   coordinator neither knows nor cares that domains now share an engine).
4. Restore paths never create entries: workspace/vault/snapshot restoration
   (`restoreSnapshot`, `restoreFromWorkspaceSnapshot`, layout `restore*` methods) and
   `undo()/redo()` themselves must run OUTSIDE `transact()` — exactly as they push
   nothing today.
5. After migration, `grep -rn "undoStack\|redoStack" src | grep -v undoHistory` must
   return ZERO hits — no hand-rolled stack survives.
6. Indented SASS/docs disciplines as always; no new dependencies.

### File-ownership manifest (disjoint)

**Stream A owns:** `src/lib/state/ide.svelte.ts` (undo internals only),
`src/lib/state/canvas.svelte.ts`, `src/lib/modules/ai/state/ai.svelte.ts`,
`src/lib/state/undoHistory.svelte.ts` (bugfixes only, API frozen).

**Stream B owns:** `src/lib/modules/notes/state/notes.svelte.ts`,
`src/lib/modules/designer/state/design.svelte.ts`,
`src/lib/modules/designer/state/designcanvas.svelte.ts`,
`tests/unit/undo-history.test.ts` (new), `docs/**`, `AGENTS.md`.

Neither stream touches `src/lib/state/undo.svelte.ts` — if a change there seems
needed, STOP and report.

---

## Stream A — Kernel, canvas, ai (Agent A)

Branch `undo-engine-core`.

### A1. Inventory first

For each of your three domains, list: every `pushUndo()` call site (kernel has 28),
every direct `undoStack`/`redoStack` manipulation (including the kernel's
dedupe-at-push and pop-if-equal-on-undo tricks, and any `= []` clears), and every
gesture begin/end pair. Any stack manipulation that is NOT plain push/undo/redo/clear
must be explained in your report before you migrate it.

### A2. Kernel (`ide.svelte.ts`) — engine adoption, NOT transact conversion

Replace the private `undoStack`/`redoStack` fields and the bodies of
`pushUndo()`/`undo()`/`redo()` with a private
`history = new UndoHistory<string>({ capture: () => JSON.stringify(this.takeSnapshot()), restore: s => this.restoreSnapshot(JSON.parse(s)), capacity: 50, equals: (a, b) => a === b })`
and one-line delegates. Direct stack clears become `history.clear()`. Public method
signatures unchanged. The 28 `this.pushUndo()` call sites stay where they are (engine
`push()` has identical pre-mutation semantics). Verify the kernel's two historical
tricks are covered by the engine (dedupe-identical-top in `pushEntry`, skip-equal-top
in `undo`) rather than re-implemented locally.

### A3. Canvas (`canvas.svelte.ts`) — full transact conversion

Engine instance over `CanvasSnapshot` (capacity 100). Convert every mutating method
(`addTile`, `removeTile`, `applySpatialTemplate`, and any other `pushUndo`-then-mutate
site) to `this.history.transact(() => { ...mutation + saveLayout()... })`.
`beginGesture`/`endGesture` delegate to the engine (delete `gestureSnapshot` and
`snapshotsEqual`). `removeTile`'s close-and-reselect stays one transact block —
atomicity now structural.

### A4. AI workspace (`modules/ai/state/ai.svelte.ts`) — full transact conversion

Engine over `AiLayoutSnapshot`. Convert `toggleSidebar`, `toggleWorkPanel`,
`setSidebarTab`, `setWorkTab`, `closeTab` (close + successor + kernel session switch =
one transact), `togglePin`, `renameSession`; resize gesture delegates to engine
gestures. `newSession`/`openSession` currently push no undo — keep it that way (do not
wrap). Keep the domain's `registerUndoDomain` block, now pointing at engine methods.

### A5. Verify and commit

Rule-5 grep clean for your three files → `pnpm check` (0/0) → `pnpm build` →
`npx vitest run` → **`npx playwright test` (full suite, unedited)** → dev-server
manual pass: in blank canvas, add/remove/drag tiles and undo each atomically; in ai,
close the active session tab and confirm ONE `Cmd+Z` restores tab + selection; in the
IDE, close a tab and undo (kernel delegate path). Commit with your inventory table.

---

## Stream B — Notes, designer, engine tests, docs (Agent B)

Branch `undo-engine-modules`.

### B1. Notes (`modules/notes/state/notes.svelte.ts`) — full transact conversion

Engine over `PersistedLayout` (capacity 100). Convert `setCollapsed`,
`toggleSidebar1/2/3` to transact; `setSidebarWidth`/`setEditorSplitRatio` stay
push-free (they are gesture-interior today);
`beginLayoutGesture`/`endLayoutGesture` delegate to engine gestures; delete the
hand-rolled stacks and `layoutGestureSnapshot`. Keep `pushUndo/undo/redo` public
(the registration block and coordinator call them). The vault ops' calls to
`ideState.pushUndo()` are the KERNEL's domain — do not touch them. Restore paths
(`restoreLayout`, `restoreFromWorkspaceSnapshot`) stay outside transact.

### B2. Designer — two engines + core composite

- `design.svelte.ts`: engine over `PersistedLayout`; its order-tuple stack
  (`{snapshot, order}`) is replaced by the engine's built-in order stamping;
  `nextUndoOrder`/`nextRedoOrder` getters now proxy the engine's. Convert its
  pushUndo-then-mutate methods to transact.
- `designcanvas.svelte.ts`: engine over its string scene snapshot
  (`equals: (a, b) => a === b`); the parallel `undoStack`/`undoOrder` arrays and
  `gestureStartSnapshot` machinery collapse into engine + engine gestures;
  `resetScene`'s stack clear → `history.clear()`. Its snapshot-on-gesture-end
  behavior maps directly to `beginGesture`/`endGesture`.
- Replace the hand-written composite registration block at the bottom of
  `designcanvas.svelte.ts` with
  `registerUndoDomain(compositeUndoDomain('design', [designHistory, sceneHistory], designHistory))`
  — same routing semantics (most-recent-order wins; pushUndo → design), now from the
  tested core helper. The histories need to be reachable across the two files; export
  each domain's history (or a narrow accessor) from its own state file — do not merge
  the two stores.

### B3. `tests/unit/undo-history.test.ts` — the engine's contract

Test the engine class directly with a toy state object: (1) transact = exactly one
entry; (2) nested transacts coalesce into one; (3) no-change transact = zero entries;
(4) push/transact clears redo; (5) gesture with no net change = zero entries; (6)
capacity trims oldest (test both 50 and 100); (7) dedupe-identical-top; (8) undo
skips an entry equal to live state; (9) undo/redo round-trip restores exact
snapshots; (10) `compositeUndoDomain` routes undo/redo to the history with the
highest order across interleaved edits, and pushUndo to the primary. Make failures
name the violated invariant.

### B4. Docs

Routing docs: new `undoHistory.svelte.ts` doc; update the five domain state docs and
the `undo.svelte.ts` doc (coordinator unchanged, domains now engine-backed).
`doc-frontmatter` → INDEX regen. **ADR-026** (`adr-writing`): snapshot-transaction
engine — motivation (rule 9 enforced per-audit across five divergent stacks), decision
(engine + transact; kernel adopts engine, kernel transact-conversion deferred to
decomposition), the sanctioned no-op-transaction delta, composite helper for designer.
**AGENTS.md rule 9**: rewrite to "wrap user-editable mutations in the domain's
`UndoHistory.transact()` (or delegate to an engine-backed `pushUndo`); define snapshot
capture/restore in the domain's state module" — and rule 12's mutation-inventory
bullet gains "verify new mutations run inside `transact()`".

### B5. Verify and commit

`pnpm check` (0/0) → `pnpm build` → `npx vitest run` (your engine test + all existing)
→ **`npx playwright test`** (design + remediation specs exercise YOUR domains'
separators and zoom undo — they are your behavioral proof) → manual pass: notes
sidebar toggles/separators undo; design block drag + panel toggle interleaved, undo
order matches action order (composite routing). Commit.

---

## Phase 3 — Integration & verification (run ONCE after merge)

1. Merge `undo-engine-core`, then `undo-engine-modules`. Conflicts = strayed agent.
2. Rule-5 grep repo-wide: `grep -rn "undoStack\|redoStack" src | grep -v undoHistory`
   → zero hits.
3. `pnpm check` && `pnpm build` && `npx vitest run` && `npx playwright test` — green,
   specs unedited.
4. Mutation check on the engine test: locally break `transact` (e.g. skip the
   depth-0 push), confirm the test fails with a named invariant, revert.
5. Cross-domain smoke (browser): in each of the five templates, perform two distinct
   undoable actions, then undo twice and redo twice — state walks back and forward
   exactly. Interleave design panel + scene edits and verify composite ordering.
   Close-active-tab atomicity in both IDE and AI templates.
6. `pnpm tauri dev` (operator): native-menu Undo/Redo per template still routes
   correctly (coordinator untouched, but this is the end-to-end proof).

## Explicitly out of scope (do not improvise)

- Command-object-per-mutation; undo labels/descriptions; undo UI (history panel).
- Converting the kernel's 28 `pushUndo` call sites to `transact()` (kernel
  decomposition phase).
- Touching `undo.svelte.ts` (coordinator + TEMPLATE_DOMAIN), the VaultBridge, or any
  persistence shape.
- Cross-domain/global undo ordering changes; capacity changes; making
  width-setters undoable outside gestures.
