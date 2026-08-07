---
id: 13-control-text-taxonomy
title: Button, Text-Role, and Sidebar-Tab Taxonomy
type: design
tags: [css-classes, buttons, typography, tabs, sidebars, taxonomy]
summary: The single canonical class families for buttons (btn-*), panel/list text roles (text-*), and sidebar tabs (sidebar-tab-item) — and the legacy classes they replaced.
relates_to: [03-typography, 05-utility-primitives, 07-class-registry]
updated: 2026-07-16
---

# Button, Text-Role, and Sidebar-Tab Taxonomy

One class family per control concept. These are the **only** base classes for
buttons, panel/list typography, and sidebar tabs. Do not introduce parallel
conventions (`icon-button`, `panel-text-*`, `*-tab` variants are all retired —
see [Retired classes](#retired-classes)).

**Sources:**
[_commons.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_commons.sass) (buttons, tabs) ·
[_typography.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_typography.sass) (text roles)

---

## Buttons — `btn-*`

| Class | Use for | Notes |
|-------|---------|-------|
| `.btn-icon` | Icon-only buttons | No chrome; flex-centered; `--control-target-min` hit area; `gap: --sz-4` if content wraps |
| `.btn-icon-text` | Icon + text label | Transparent; icons are desaturated until hover; inner text uses `.button-text` |
| `.btn-text` | Bare text button, no visuals | Quiet inline actions |
| `.btn-app` | Filled, visual button | `--background40` + border; `:hover`/`.activated` → `--background50` |

Module-specific skins layer **on top of** a base class, never replace it —
e.g. the designer inspector's align buttons are
`class="btn-icon inspector-icon-btn"` where `inspector-icon-btn` only adds
size/color deltas ([_designinspector.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/designer/styles/_designinspector.sass)).

The contribution registry maps header actions onto this family:
`kind: 'strip'` renders `.btn-icon-text`, `kind: 'icon'` renders `.btn-icon`
([contributions.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/contributions.svelte.ts)).

## Text roles — `text-*`

| Class | Role | Size / color |
|-------|------|--------------|
| `.text-header` | Sidebar/section header text | `--text-md` w500; `.muted` → tertiary |
| `.text-item` | Standard list/tree item text | `--text-sm` primary; `.accent` → theme, `.muted` → tertiary |
| `.text-item-lg` | Emphasized item title (e.g. note titles) | `--text-md` w500 primary |
| `.text-item-sm` | Description under an item title | `--text-xs` tertiary; `.alive` → primary |
| `.text-meta` | Tags, pills, counters, uppercase section labels | `--text-xs` uppercase tertiary |

Color modifiers chain as extra classes: `class="text-item muted"`,
`class="text-item-sm alive"`.

## Sidebar tabs — `.sidebar-tab-item`

Every tab strip in a sidebar header uses the same button:

```html
<div role="tablist">
	<button type="button" class="sidebar-tab-item"
		class:active={current === 'x'} role="tab" aria-selected={current === 'x'}>
		<img src="..." alt="" class="icon-svg-sm" />
		<span class="sidebar-tab-item-text">Label</span>
	</button>
</div>
```

Rules:

- **Mark the active tab with `.active`** — never mark the inactive ones
  (the old designer `class:muted` inversion is retired).
- Icons inside tabs are always `icon-svg-sm`; text is always
  `.sidebar-tab-item-text`.
- Active state = `--background40` pill + primary text; inactive = tertiary
  text, hover = `--state-hover`.
- Module containers may add layout-only deltas — e.g. the AI module's
  segmented bar sets `flex: 1` on tabs via `.ai-sidebar-tabs`
  ([_ai-sidebar.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/modules/ai/styles/_ai-sidebar.sass)).

Adopters: `AIChat.svelte` (AI/History/Style/Export), `DesignLayout.svelte`
(Layers/Components, Style/Export/AI), `AiSidebar.svelte` (History/Code).

## Icon sizing in sidebars

- Sidebar header icons: `icon-svg-large` (or `icon-svg` where the header is dense)
- Tree rows, list items, tabs: `icon-svg-sm`
- Inline affordances (chevrons, ruler corner): `icon-svg-xs`

## Retired classes

Deleted in the 2026-07 consolidation; if you see one, it is a bug:

| Retired | Replaced by |
|---------|-------------|
| `.icon-button` | `.btn-icon` |
| `.strip-button` | `.btn-icon-text` |
| `.panel-button-std` | `.btn-app` |
| `.inspector-icon-btn` (as base) | `.btn-icon` + skin deltas |
| `.panel-text-label` | `.text-header` |
| `.panel-text-std`, `.panel-text-bs` | `.text-item` |
| `.panel-text-std-accent` / `-muted` | `.text-item.accent` / `.muted` |
| `.panel-text-desc` / `-alive` | `.text-item-sm` / `.alive` |
| `.panel-text-small` | `.text-meta` |
| `.sidebar-tab-pill`, `.ai-sidebar-tab`, `.ai-tab-btn` | `.sidebar-tab-item` |
| `.file-title` / `.file-desc` (notes rows) | `.text-item-lg` / `.text-item-sm` |
