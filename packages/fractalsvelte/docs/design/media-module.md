---
id: media-module
title: Media Module Design
type: design
tags: [media, gallery, panes, sass, tokens]
summary: Documents the Media module's three-pane owned-library UI and token-only media gallery styles.
relates_to: [media-module-plan, 11-style-aggregation]
updated: 2026-07-17
---


`MediaLayout.svelte` composes a PaneForge horizontal shell: smart sections and folders at left, a fixed `--sz-128` toolbar plus flexible row-windowed uniform grid and `--sz-24` progress strip in the middle, and a collapsible inspector at right. Pane widths are PaneForge local preferences rather than undo state. Native Finder drops resolve the hovered folder/grid as their copy-in destination; cards provide internal in-library drag moves.

All Media styles live in `src/lib/modules/media/styles/_media.sass` and are aggregated by `src/lib/styles/index.sass`. The module uses only existing semantic theme tokens such as `--background20`, `--border-primary`, `--text-primary`, `--text-secondary`, and `--theme-color`; it adds no primitive or semantic tokens.

| Style group | Consumers | Purpose |
|---|---|---|
| `.media-header`, `.media-viewer`, `.media-strip` | Layout, toolbar, grid, progress strip | Holds the reserved header/grid/progress vertical structure. |
| `.media-grid`, `.media-card*` | Grid and card | Row-windowed uniform thumbnail cells, selected outline, video/gif previews, persisted video thumbnails, and metadata chips. |
| `.media-smart-sections`, `.media-folder-*` | Sidebar | Fixed smart-section choices, tag disclosure, and real-folder tree. |
| `.media-inspector-*` | Inspector | Preview, facts, editable name, tag editor, and batched pin controls. |
