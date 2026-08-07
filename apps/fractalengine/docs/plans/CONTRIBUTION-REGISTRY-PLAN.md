---
id: contribution-registry-plan
title: Contribution Registry Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Contribution Registry — Two-Stream Execution Plan

**Repo:** `apps/fractalengine` (SvelteKit + Tauri, Svelte 5 runes, indented SASS)
**Goal:** Replace the central touch-points (CommandPalette's per-template blocks,
`+layout`'s keydown/menu conditionals, `+page`'s per-template header buttons) with a
core contribution registry that modules declare into. After this phase, adding a module
command means editing that module's own `contributions.ts` — not three shared files —
and shortcut/handler drift becomes a failing unit test instead of an audit step.

**This is a behavioral-preserving refactor**: every palette label, category, icon,
shortcut, header button, and menu action must work EXACTLY as today. All existing
Playwright specs must pass unedited — they select on palette labels and header
aria-labels, which is the regression net for this phase.

**Prerequisite:** clean `git status` on `master` (commit or discard the stray
`canvas_layout.json` modification first).

You are one of two agents. Your operator assigns you **Agent A (Stream A — registry
consumers & contribution transcription)** or **Agent B (Stream B — contract test, docs,
rules)**.

- Agent A: branch `contrib-registry-code`.
- Agent B: branch `contrib-registry-docs`.
- Both branch from the same post-Phase-0 `master` commit; Phase 3 runs once after merge.

The streams are fully independent: A writes code against the Phase-0 registry; B writes
the contract test and docs against the same frozen contract. No shared files.

---

## Phase 0 — Frozen contract (operator commits to master BEFORE branching)

One commit (`chore: contribution registry contract`) containing **five files**: the
registry, and four stub contribution files (so Stream B's test can import them while
Stream A fills them).

### 0a. `src/lib/state/contributions.svelte.ts` — create exactly this

```ts
import type { AppTemplateId } from '$lib/data/templates';

export type ContributionScope = AppTemplateId | 'global';

export interface CommandContribution {
	id: string;                // '<module>.<action>', e.g. 'notes.openVault'
	label: string;             // EXACT current palette label — e2e selects on this
	category: string;          // EXACT current palette category
	icon: string;              // EXACT current icon path
	shortcutLabel?: string;    // display-only string, e.g. 'Cmd+Alt+O'
	scope: ContributionScope;
	run: () => void | Promise<void>;
}

export interface KeybindingContribution {
	combo: string;             // normalized via comboFromEvent(), e.g. 'cmd+alt+o'
	scope: ContributionScope;
	commandId: string;
}

export interface HeaderActionContribution {
	scope: ContributionScope;
	kind: 'strip' | 'icon';    // .strip-button vs .icon-button rendering
	ariaLabel: string;         // EXACT current aria-label
	title?: string;
	icon: string;
	commandId: string;
	order: number;             // ascending; preserves current visual order
}

export interface MenuActionContribution {
	menuActionId: string;      // the string arriving from the native Tauri menu
	commandId: string;
}

// Normalizes a KeyboardEvent to a combo string. 'cmd' means metaKey OR ctrlKey —
// identical to the existing isCmdOrCtrl semantics in +layout.svelte.
export function comboFromEvent(e: KeyboardEvent): string {
	const parts: string[] = [];
	if (e.metaKey || e.ctrlKey) parts.push('cmd');
	if (e.altKey) parts.push('alt');
	if (e.shiftKey) parts.push('shift');
	parts.push(e.key.toLowerCase());
	return parts.join('+');
}

class ContributionRegistry {
	private commands = new Map<string, CommandContribution>();
	private keybindings: KeybindingContribution[] = [];
	private headerActions: HeaderActionContribution[] = [];
	private menuActions = new Map<string, MenuActionContribution>();
	// Bumped on every registration so $derived consumers re-evaluate.
	private version = $state(0);

	registerCommands(items: CommandContribution[]): void {
		for (const item of items) {
			if (this.commands.has(item.id)) throw new Error(`Duplicate command id: ${item.id}`);
			this.commands.set(item.id, item);
		}
		this.version++;
	}
	registerKeybindings(items: KeybindingContribution[]): void {
		this.keybindings.push(...items);
		this.version++;
	}
	registerHeaderActions(items: HeaderActionContribution[]): void {
		this.headerActions.push(...items);
		this.version++;
	}
	registerMenuActions(items: MenuActionContribution[]): void {
		for (const item of items) {
			if (this.menuActions.has(item.menuActionId)) throw new Error(`Duplicate menu action: ${item.menuActionId}`);
			this.menuActions.set(item.menuActionId, item);
		}
		this.version++;
	}

	commandsFor(scope: AppTemplateId): CommandContribution[] {
		void this.version;
		return [...this.commands.values()].filter(c => c.scope === 'global' || c.scope === scope);
	}
	async run(commandId: string): Promise<void> {
		const command = this.commands.get(commandId);
		if (!command) throw new Error(`Unknown command id: ${commandId}`);
		await command.run();
	}
	// Returns the matching command id for a key event in the given scope, or null.
	matchKeybinding(e: KeyboardEvent, scope: AppTemplateId): string | null {
		void this.version;
		const combo = comboFromEvent(e);
		const hit = this.keybindings.find(k => k.combo === combo && (k.scope === 'global' || k.scope === scope));
		return hit ? hit.commandId : null;
	}
	headerActionsFor(scope: AppTemplateId): HeaderActionContribution[] {
		void this.version;
		return this.headerActions
			.filter(a => a.scope === 'global' || a.scope === scope)
			.sort((a, b) => a.order - b.order);
	}
	menuCommandFor(menuActionId: string): string | null {
		void this.version;
		return this.menuActions.get(menuActionId)?.commandId ?? null;
	}
	// For the contract test only — not for UI use.
	snapshot(): { commands: CommandContribution[]; keybindings: KeybindingContribution[]; headerActions: HeaderActionContribution[]; menuActions: MenuActionContribution[] } {
		return {
			commands: [...this.commands.values()],
			keybindings: [...this.keybindings],
			headerActions: [...this.headerActions],
			menuActions: [...this.menuActions.values()],
		};
	}
}

export const contributions = new ContributionRegistry();
```

### 0b. Four stub contribution files — create each with only this comment

- `src/lib/state/coreContributions.ts`
- `src/lib/modules/notes/contributions.ts`
- `src/lib/modules/designer/contributions.ts`
- `src/lib/modules/ai/contributions.ts`

```ts
// Contribution declarations for this scope. Populated by the contribution-registry
// phase (Stream A); imported for side effects from +layout.svelte and the contract test.
export {};
```

The registry's public API, the four file paths, and the type shapes above are FROZEN.
Stream A may not change signatures; Stream B may not touch the five files.

### Hard rules (both streams)

- Zero behavioral change: labels, categories, icons, shortcut behavior, header button
  order/appearance, and menu actions identical. Playwright specs unedited.
- Module commands keep their **dynamic imports inside `run()`** (e.g.
  `() => import('$lib/modules/notes/state/notes.svelte').then(({ notes }) => notes.openVaultFromFolder())`)
  — chunking must not change. Core commands may reference `ideState` directly, as the
  palette does today.
- `SettingsDialog.svelte` is UNTOUCHED this phase (settings sections are a future
  phase; AGENTS.md will say so explicitly — see B3).
- No new dependencies, no IPC changes, no Rust changes (native menu items are still
  defined in Rust; only the string→handler dispatch migrates).

### File-ownership manifest (disjoint)

**Stream A owns:** the four contribution files (filling them),
`src/lib/state/contributions.svelte.ts` (bugfixes only — API frozen),
`CommandPalette.svelte`, `src/routes/+layout.svelte`, `src/routes/+page.svelte`.

**Stream B owns:** `tests/unit/contribution-contracts.test.ts` (new), `docs/**`,
`AGENTS.md`.

---

## Stream A — Consumers & transcription (Agent A)

Branch `contrib-registry-code`. Do not touch `docs/**`, `AGENTS.md`, `tests/**`,
`SettingsDialog.svelte`.

### A1. Inventory (mandatory first step — produce it before editing)

Build a complete table of every existing entry with its exact strings:
1. **Palette commands**: every object in `CommandPalette.svelte`'s command arrays —
   global/workspace/editor entries, the browser/layout toggles, and the notes (8),
   design (4), and ai (5) scoped sections. Record label, category, shortcut string,
   icon, action body, and scope condition.
2. **Keydown shortcuts**: every `isCmdOrCtrl`/key conditional in `+layout.svelte`'s
   handler (~25 branches). Separate true commands (Cmd+Alt+O/A/S for notes, palette
   open, save, etc.) from non-command machinery (undo/redo routing, flush-on-quit) —
   **undo/redo and lifecycle handlers stay hand-written**; only command-shaped
   shortcuts migrate.
3. **Menu actions**: every `action === '...'` branch in `+layout.svelte`'s menu
   dispatch (`open_folder`, `tpl_*`, vault actions, …). Same command/non-command
   split.
4. **Header actions**: every template-scoped button in `+page.svelte`'s header strip
   (13 `activeTemplateId ===` branches). **Migrate only plain action buttons** (the
   toggle/open/new buttons with aria-labels). Complex header widgets — the notes
   Saved-Vaults dropdown, the vault-name save prompt, anything with its own local
   state or markup beyond a button — STAY as template branches. Record which is which;
   the count will NOT go to zero and that is correct.

### A2. Fill the contribution files

`coreContributions.ts`: global/workspace/editor commands + global keybindings + menu
actions for core (template-switch `tpl_*` actions call `appState.applyTemplate` via the
same code paths as today) + global header actions. The three module files: their scoped
commands, keybindings (`cmd+alt+o` / `cmd+alt+a` / `cmd+alt+s` scoped to `notes`, etc.),
and header actions, with command ids namespaced (`notes.*`, `designer.*`, `ai.*`,
`core.*`). Every `run()` body is the EXACT action expression from the inventory —
transcription, not redesign. `shortcutLabel` must match the palette's current display
strings; keybinding `combo`s must produce the same matches as the old conditionals
(verify each against `comboFromEvent`'s normalization).

### A3. Rewrite the consumers

1. `+layout.svelte`: add the four side-effect imports
   (`import '$lib/state/coreContributions';` + the three module files) near the top —
   this is what makes registration eager and deterministic. Replace the migrated
   keydown branches with one lookup:
   `const commandId = contributions.matchKeybinding(e, appState.activeTemplateId); if (commandId) { e.preventDefault(); void contributions.run(commandId); }`
   — keeping the non-migrated branches (undo/redo routing, quit flush) exactly where
   they are. Replace migrated menu-action branches with a
   `contributions.menuCommandFor(action)` lookup, keeping non-command branches.
2. `CommandPalette.svelte`: replace the hardcoded arrays with
   `let commandItems = $derived(contributions.commandsFor(appState.activeTemplateId))`
   mapped into the existing item shape (label/category/shortcut/icon/action →
   `contributions.run(id)` + close palette, matching today's close-after-run behavior
   per entry). Keep the palette's own chrome, search, and keyboard-selection logic
   untouched. Preserve current ordering (core entries first, then scoped) — if
   registration order isn't sufficient, sort by a stable key recorded in the inventory,
   not by label.
3. `+page.svelte`: render `contributions.headerActionsFor(appState.activeTemplateId)`
   in the header strip using the existing `.strip-button`/`.icon-button` markup
   patterns (kind selects which), with `aria-label`, `title`, and icon from the
   contribution. Remove only the branches whose buttons migrated; complex widgets stay.

### A4. Straggler check

`grep -n "activeTemplateId === " src/lib/components/CommandPalette.svelte` → zero hits.
In `+layout.svelte` and `+page.svelte`, every remaining template conditional must be on
the documented stay-behind list from your inventory — include the final lists in your
report.

### A5. Verify and commit

`pnpm check` (0/0) → `pnpm build` → `npx vitest run` → **`npx playwright test` (full
suite, specs unedited)** — the specs click palette items by label and header buttons by
aria-label, so they are the direct test of your transcription. Then a manual dev-server
pass: in each template, open the palette and execute every scoped command; press each
migrated shortcut; click each migrated header button. Commit with the inventory table
in the commit message body.

---

## Stream B — Contract test, docs, rules (Agent B)

Branch `contrib-registry-docs`. Do not touch any file in Stream A's manifest.

### B1. `tests/unit/contribution-contracts.test.ts`

Import the registry and the four contribution files (side-effect imports — they are
stubs in your worktree, so assertions are vacuous until merge; write them to validate
whatever is registered). Assert, over `contributions.snapshot()`:
1. Command ids are unique and match `/^(core|notes|designer|ai)\./`.
2. Every `KeybindingContribution.commandId`, `HeaderActionContribution.commandId`, and
   `MenuActionContribution.commandId` resolves to a registered command.
3. Every keybinding's scope is compatible with its command's scope (identical, or the
   command is global).
4. **Shortcut display ↔ binding consistency, both directions**: every command with a
   non-empty `shortcutLabel` that looks like a key chord (starts with `Cmd`) has a
   keybinding whose combo is the normalized form of that label, and every keybinding's
   command carries a matching `shortcutLabel`. (Labels like `"Header Click"` are
   display-only — exempt anything not starting with `Cmd`.)
5. Every `combo` is normalized (lowercase, modifiers in `cmd,alt,shift` order — assert
   round-trip through a small local normalizer).
6. `icon` paths that reference `/iconset/` or `/icontheme-allicon/` point at files that
   exist under `static/` (reuse the existing asset-check pattern from
   `style-contracts.test.ts`).

This test IS the replacement for rule 12's manual shortcut cross-check — write it to
fail loudly and specifically (message names the offending id).

### B2. Docs

1. Routing docs for the five new files (registry + four contribution files),
   `app-documenter` conventions; update the CommandPalette, `+layout`, and `+page`
   routing docs to describe registry-driven rendering (the plan's Phase-0 contract is
   your source of truth for the API; Stream A's consumers follow A3 exactly).
2. `doc-frontmatter` → regenerate affected `docs/INDEX.md` rows.
3. **ADR-025** via `adr-writing`: the contribution registry — motivation (rule 11 as
   symptom; three extraction phases each had to edit CommandPalette), decision
   (registry in core, modules declare, consumers render; frozen API), what stayed
   manual (SettingsDialog → future settings-sections phase; native menu item definition
   → Rust; undo/redo routing and lifecycle handlers in `+layout`; complex header
   widgets), and the contract test as rule 12's structural replacement.

### B3. AGENTS.md rules rewrite (the point of the whole phase)

- **Rule 11**: replace "edit `CommandPalette.svelte` and `SettingsDialog.svelte`
  accordingly" with: declare commands, keybindings, and header actions in your module's
  `contributions.ts` (or `coreContributions.ts` for shell features); the palette,
  shortcut handler, and header render from the registry. SettingsDialog additions are
  still manual until the settings-sections phase.
- **Rule 12**: replace the "cross-check every advertised shortcut against an actual
  handler" bullet with: run `tests/unit/contribution-contracts.test.ts`; extend it when
  adding a new contribution TYPE. Keep the rest of rule 12 intact.
- Directory-structure section: add the registry and contribution files.

### B4. Verify and commit

`npx vitest run tests/unit/contribution-contracts.test.ts` (green — vacuous on stubs is
expected; the assertions must be structured so they bite post-merge). Commit.

---

## Phase 3 — Integration & verification (run ONCE after both merge)

1. Merge `contrib-registry-code`, then `contrib-registry-docs`. Conflicts = strayed
   agent; investigate.
2. `pnpm check` && `pnpm build` && `npx vitest run` — the contract test now runs
   against the real contributions and must pass meaningfully (spot-check: temporarily
   break one commandId locally, confirm the test fails with a useful message, revert).
3. `npx playwright test` — full suite, unedited.
4. Browser smoke: per template — palette lists exactly the same commands as before the
   phase (compare against Stream A's inventory table), every migrated shortcut fires,
   every migrated header button works, notes Saved-Vaults dropdown and vault-name
   prompt still work (stay-behind widgets), native-menu dispatch via the dev fallback
   if reachable.
5. `pnpm tauri dev` (operator): native menu items (Open Folder, template switches,
   vault actions) all dispatch correctly through `menuCommandFor`.

## Explicitly out of scope (do not improvise)

- SettingsDialog / settings-section contributions (future phase).
- Generating native menu items from the registry (Rust work; menu definitions stay in
  `src-tauri`).
- Migrating undo/redo keyboard routing, quit/flush lifecycle handlers, or complex
  header widgets (Saved-Vaults dropdown, vault-name prompt).
- New commands, renamed labels, changed shortcuts, palette UX changes — transcription
  only.
- A generic plugin API, contribution priorities/overrides, or user-customizable
  keybindings.
