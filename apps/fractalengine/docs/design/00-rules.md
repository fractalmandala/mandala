---
id: 00-rules
title: Established Design Rules
type: design
tags: [design-tokens, css-variables]
summary: List of mandatory styling rules to follow.
relates_to: [02-sass-variables, 12-token-theme-mapping]
updated: 2026-07-16
---

# Established Design Rules

Each of these rules MUST be followed:

1. In the `<header>` and `<footer>`, buttons with an icon and text must use class `btn-icon-text`, images inside them must be class `icon-svg`, and text should be inside `<span>` tags with class `button-text`. Example:

```html
<button class="btn-icon-text">
	<img src"/dummylink" alt="image title" class="icon-svg"/>
	<span class="button-text">Text</span>
</button>
```

2. In the `<header>` and `<footer>`, if buttons only contain image/icon and no text, they must use class `btn-icon`, and images inside them must use class `icon-svg`.

3. Only border-radius of 4px and 5px is allowed.

4. Always use the clases in `_primitives.sass` as much as possible, and avoid creating new classes in-line in markup for styling that could be achieved by the `_primitives.sass` styles.

5. These are the spacing guidelines:
- use units of 8, 16, 24, 32, 64
- available padding classes: pad, padleft, padright, padbot, padtop. Add unit suffixes, ex: `pad8`, `padleft32`, `padtop16`, and so on.
- similarly, available margin classes, use with unit suffixes: margin, marginleft, marginright, margintop, marginbot.
- available gap classes: gap, cgap (column-gap), rgap (row-gap). Use with unit suffixes.

6. Apply class `truncate` for all text that needs overflow: hidden, text-overflow: ellipsis, white-space: nowrap.

7. Button inside tree nodes to use class `tree-folder-btn` and `tree-file-btn`, text inside these buttons should be in `<span>` tags with class `text-item`.

8. All other general buttons in sidebars use the `btn-*` family: `btn-app` for filled visual buttons (with `:hover` / `.activated` states), `btn-text` for bare text buttons, `btn-icon` for icon-only, `btn-icon-text` for icon + text. Never introduce a new base button class — see [13-control-text-taxonomy](13-control-text-taxonomy.md).

9. Header/Label text for sidebars should be in `<span>` tags with class `text-header`. Tabs in sidebar headers use `sidebar-tab-item` with a `<span class="sidebar-tab-item-text">` label and `icon-svg-sm` icons; mark the active tab with `.active` (never mark the inactive one).

10. Panel/list typography uses the `text-*` roles: `text-item` (standard rows, with chainable `muted`/`accent` modifiers), `text-item-lg` (item titles), `text-item-sm` (descriptions, `alive` modifier for emphasis), `text-meta` (tags/pills/counters). The retired `panel-text-*` family must not reappear.

11. While design consistency is key, some hardcoded styling (colors, spacing, shadows, sizes) is approved on a case-by-case basis (specifically, for local styling properties used in up to 2 places in the application, in order to prevent over-tokenization of the global token sheet).

