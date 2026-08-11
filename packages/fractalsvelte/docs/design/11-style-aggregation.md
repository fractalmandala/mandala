---
id: 11-style-aggregation
title: How index.sass Aggregates Component Styles
type: design
tags: [sass, aggregation, build]
summary: Explains how index.sass aggregates every component-level stylesheet via @use statements.
relates_to: [07-class-registry, fractaldocs]
updated: 2026-07-18
---


**Source:** `index.sass`

---

## Entry Point

The single SASS entry point is `src/lib/styles/index.sass`, imported in `+layout.svelte`:

```ts
import '$lib/styles/index.sass';
```

## Import Order

```sass
@forward 'mixins'                    // Breakpoint mixins (bp-xs, bp-sm, ...)
@use 'tokens'                        // CSS custom properties + SASS variable layer
@use 'typography'                    // Font scale + utility classes
@use 'globals'                       // Reset, body, button.blank, .truncate
@use 'primitives'                    // .box, .row, .grid layout primitives
@use 'components/layout'             // Page shell, header, footer, theme dropdown
@use '../modules/ide/styles/sidebar'  // IDE sidebar tree
@use '../modules/ide/styles/editor'   // IDE CodeMirror editor
@use '../modules/ide/styles/terminal' // IDE terminal emulator
@use 'components/appdock'            // Workspace app dock
@use 'components/ai'                 // AI global message display
@use '../modules/designer/styles/tile' // Designer draggable tile panels (moved)
@use '../modules/designer/styles/canvas' // Designer infinite canvas substrate (moved)
@use '../modules/designer/styles/designcanvas' // Designer canvas rendering
@use '../modules/designer/styles/designblock' // Designer layout block rendering
@use '../modules/designer/styles/layers' // Designer layers management
@use '../modules/designer/styles/designinspector' // Designer property inspector
@use '../modules/designer/styles/exportpanel' // Designer export panel styles
@use '../modules/designer/styles/componentlibrary' // Designer library panel
@use '../modules/designer/styles/draggable' // Designer drag-and-drop indicators (moved)
@use 'components/dock'               // Bottom tile dock launcher
@use 'components/minimap'            // Minimap overlay
@use 'components/settings'           // Settings dialog
@use 'components/commandpalette'     // Command palette overlay
@use 'components/templategallery'    // Template gallery dialog
@use '../modules/designer/styles/designtemplategallery' // Designer templates
@use '../modules/notes/styles/notes' // Notes workspace editor
@use 'components/ai-elements'        // AI shared code/copy actions
@use 'components/ai-data'            // AI shared context meter
@use '../modules/ai/styles/ai-layout' // AI workspace 3-pane layout
@use '../modules/ai/styles/ai-sidebar' // AI session sidebar
@use '../modules/ai/styles/ai-chat-column' // AI session tabs + conversation
@use '../modules/ai/styles/ai-work-panel' // AI work panel
@use 'components/searchoverlay'      // Global search overlay
@use 'components/tooltip'            // Global tooltip overlay
@use 'components/splitpanes'         // Pane splitting primitives
@use '../modules/bookmarks/styles/bookmarks' // Bookmarks manager
@use '../modules/media/styles/media' // Media browser
@use '../modules/fractaldocs/styles/layout' as fractaldocs // FractalDocs wiki layout
@use '../modules/browser/styles/browser-shell' // In-app browser shell
@use '../modules/browser/styles/tabstrip' // In-app browser tabs
@use '../modules/browser/styles/omnibox' // In-app browser URL bar
@use '../modules/browser/styles/vault' // In-app browser password vault
@use '../modules/browser/styles/history' // In-app browser history
@use '../modules/dev/styles/codegraph' // Developer codegraph
@use '../modules/ide/styles/marketplaces' // IDE models/skills marketplaces (split)
@use '../modules/ai/styles/prompt-input' // AI prompt input area (split)
@use '../modules/ai/styles/ai-elements-exclusive' // AI exclusive chat elements (split)
@use '../modules/ai/styles/ai-checkpoint-exclusive' // AI exclusive checkpoint rows (split)
```

## Also Imported

Additionally, `virtual:fractals-styler.css` (the JIT-generated utility stylesheet from the `fractals-styler` workspace package) is imported separately in `+layout.svelte`:

```ts
import 'virtual:fractals-styler.css';
```

## Dependency Flow

```
+layout.svelte
  ├── index.sass
  │    ├── mixins (forwarded)
  │    ├── tokens
  │    ├── typography
  │    ├── globals
  │    ├── primitives
  │    └── components/* (each may @use '../tokens')
  └── virtual:fractals-styler.css (JIT generated)
```
