---
title: Bits UI Adoption Plan
type: plan
---


**Goal**: gradually replace hand-rolled UI patterns with a single set of styled Bits UI wrappers in `src/lib/fractalui/`, consumed everywhere, for design harmony, accessibility (focus traps, ARIA, keyboard nav), and simpler state.

**Status quo**: `bits-ui ^2.18.1` is already in `package.json`. The only usage is `src/lib/fractalui/tabs.svelte` — an unstyled demo stub imported by `AiSidebar.svelte`. Bits UI docs live in `docs/archive/bitsui-docs/components/`.

## House rules that shape the wrappers

- Bits UI is headless — perfect fit for Rule 6 (no `<style>` blocks). Each wrapper gets a `.sass` file under `src/lib/styles/components/fractalui/`, imported in `src/lib/styles/index.sass`, consuming semantic tokens only.
- Svelte 5 runes: use `bind:value` / `onValueChange` on Bits roots; wire mutations through the owning domain's `UndoHistory.transact()` (Rule 9) at the call site, not inside the wrapper.
- Rule 8 still applies: the custom spectrum/hex picker stays; Bits `Popover` becomes its container.
- When the fractalui layer is formalized, write an ADR (adr-writing skill) and design doc entry (styling-docs-builder skill), and regenerate `docs/INDEX.md` rows.

## Inventory of hand-rolled patterns → Bits UI primitive

### 1. Dialog (high value, high spread)
Hand-rolled overlays with manual Escape handling and no focus trap:
- `SettingsDialog.svelte` (own overlay + Escape listener ×2)
- `SearchOverlay.svelte`
- `CommandPalette.svelte` (overlay portion)
- `TemplateGallery.svelte`, `ModelMarketplace.svelte`, `SkillsMarketplace.svelte` (verify)
→ `Dialog` / `AlertDialog`. Gives portal, scroll lock, focus trap, Escape, aria wiring for free.

### 2. ContextMenu + DropdownMenu (highest duplication)
At least four independent x/y-positioned menu implementations with manual dismissal:
- Designer canvas menu: state in `designcanvas.svelte.ts` (`contextMenu = $state<{x,y,blockId}>`), rendered in `DesignLayout.svelte:1047`
- `Layers.svelte:30` — its own identical `contextMenu` $state
- `ide/TreeNode.svelte` — file-tree right-click menu
- `Browser.svelte`, `TileDock.svelte` — dropdown-style menus
→ one `ContextMenu` and one `DropdownMenu` wrapper kill all the manual positioning/outside-click/Escape code.

### 3. Popover
Manual open-state + `window.addEventListener('pointerdown', …, true)` dismissal:
- `DesignInspector.svelte:354` (`openColorPicker` + capture-phase pointerdown) — color picker popovers
- `ai-elements/ModelSelector.svelte`, `ai-elements/context/Context.svelte`
- `NotesEditor.svelte`, `DesignLayout.svelte` (canvas background picker)
→ `Popover` wrapper; custom color picker renders inside it.

### 4. Select (worst offender by count)
Native `<select>` elements that can't be token-styled:
- `DesignInspector.svelte` — **18** native selects
- `SettingsDialog.svelte` — 1
→ `Select` wrapper (typeahead, keyboard nav, styled listbox). `Combobox` variant for searchable lists.

### 5. Tabs
Hand-rolled active-tab state in: `Browser.svelte`, `SettingsDialog.svelte` (section nav), `AIChat.svelte`, `ai/WorkPanel.svelte`, `ai/AiChatMain.svelte`, `designer/Dock.svelte`, `designer/ExportPanel.svelte`.
→ finish the existing `fractalui/tabs.svelte` stub into a real snippet-based wrapper (props: `items`, `bind:value`, content snippet).

### 6. Tooltip
~80 `title=""` attributes as poor-man's tooltips (`NotesEditor` 22, `DesignInspector` 18, `Browser` 13, `DesignLayout` 11, …). Only one real tooltip impl (`ai-elements/context/Context.svelte`).
→ `Tooltip` wrapper + one `Tooltip.Provider` at app root; sweep `title=` off interactive controls over time.

### 7. Slider
- `DesignInspector.svelte:1270` (`type="range"`), `DesignLayout.svelte:1135` (canvas hue slider)
→ `Slider` wrapper; `onValueCommit` is the natural single-undo-entry boundary (Rule 9 — one transact per drag, not per tick).

### 8. Switch / Checkbox / ToggleGroup
- `SettingsDialog.svelte` checkboxes, `DesignInspector.svelte` `inspector-toggle`, `NotesEditor.svelte` `view-toggle-group`
→ `Switch`, `Checkbox`, `ToggleGroup` wrappers.

### 9. Collapsible / Accordion
`Reasoning.svelte` (collapsible CoT), `DesignInspector` sections, `ComponentLibrary`, `DocsSidebarLeft`, sidebar panels.
→ `Collapsible` for single sections, `Accordion` for inspector-style stacks.
**Exclusion**: `ide/TreeNode.svelte` and `notes/VaultTreeNode.svelte` recursive trees — keep custom (virtualization/recursion don't map cleanly), revisit later.

### 10. Command (later, careful)
`CommandPalette.svelte` and `ModelSelector.svelte` are both "filterable list + keyboard nav" — Bits `Command` inside `Dialog` matches exactly. But CommandPalette is contribution-registry-driven and has submodes; migrate only after Dialog/Popover wrappers are proven.

### 11. Low-priority polish
`Separator`, `ScrollArea`, `Meter` (token-usage meter in `ai-elements/context/`), `Progress`, `Avatar`.

## Suggested sequencing

1. **Phase 0 — foundation**: formalize `src/lib/fractalui/` (naming: PascalCase wrappers, one `.sass` per component under `styles/components/fractalui/`), root `Tooltip.Provider`, ADR for the layer.
2. **Phase 1 — Tabs + Dialog**: finish the tabs stub; migrate SettingsDialog + SearchOverlay to Dialog. Low risk, immediately visible harmony.
3. **Phase 2 — Menus**: ContextMenu/DropdownMenu wrappers; migrate designer canvas menu, Layers, TreeNode, Browser, TileDock.
4. **Phase 3 — Form controls**: Select, Slider, Switch, Checkbox; migrate DesignInspector (biggest win: 18 selects + toggles + slider) then SettingsDialog.
5. **Phase 4 — Tooltip sweep + Popover**: replace `title=` on interactive controls; move color pickers into Popover.
6. **Phase 5 — Command + polish**: CommandPalette/ModelSelector onto Command; Collapsible/Accordion, ScrollArea, Separator, Meter.

Each phase: migrate one call site first, verify in `pnpm dev` (ipc-mock), then fan out; update docs per Rule 10.
