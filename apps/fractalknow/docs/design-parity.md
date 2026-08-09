# Design Parity Map

Date: 2026-07-31  
Scope: FractalKnow Svelte/Tauri shell vs OpenKnowledge React source chrome

This document maps each FractalKnow surface to the source-app intent it replicates.

## Shell chrome

| FractalKnow | Source intent | Notes |
| --- | --- | --- |
| [AppShell.svelte](../src/lib/components/AppShell.svelte) | `App.tsx` shell grid | Sidebar + workspace + status footer; skip link + landmarks |
| [ShellToolbar.svelte](../src/lib/components/ShellToolbar.svelte) | App menubar / mode switcher chrome | Segmented editor modes, palette entry |
| [ShellSidebar.svelte](../src/lib/components/ShellSidebar.svelte) | `FileSidebar.tsx` + `sidebar.tsx` | Tree semantics, sections Files/Skills/Docs/Recent, lucide icons |
| [CommandPalette.svelte](../src/lib/components/CommandPalette.svelte) | `CommandPalette.tsx` / cmdk | Search, grouped commands, keyboard navigation |
| [DialogHost.svelte](../src/lib/components/DialogHost.svelte) | `components/ui/dialog.tsx` + dialog variants | Settings, create/clone/publish, consent, crash, update, trash, unsaved |
| Status footer badges | bridge / server / update indicators | `StatusBadge.svelte` |

## Editor surfaces

| FractalKnow | Source intent | Notes |
| --- | --- | --- |
| [EditorSurface.svelte](../src/lib/components/EditorSurface.svelte) | `EditorPane.tsx` | Mode switcher, terminal dock, document panel |
| [DocumentHeader.svelte](../src/lib/components/editor/DocumentHeader.svelte) | Document title/breadcrumb/status row | Word count + save indicator |
| [FrontmatterEditor.svelte](../src/lib/components/editor/FrontmatterEditor.svelte) | Metadata/frontmatter editor | YAML fence editor with per-field validation |
| [RichEditor.svelte](../src/lib/components/editor/RichEditor.svelte) | TipTap rich pane | Markdown canonical serialization |
| [SourceEditor.svelte](../src/lib/components/editor/SourceEditor.svelte) | CodeMirror source pane | Find/replace, diagnostics toggle (Mod+F2) |
| [MarkdownViewer.svelte](../src/lib/components/editor/MarkdownViewer.svelte) | Preview + Mermaid | Safe links + mermaid render |
| [AssetViewer.svelte](../src/lib/components/editor/AssetViewer.svelte) | Image/binary preview | Zoomable fit container |
| [DiffViewer.svelte](../src/lib/components/editor/DiffViewer.svelte) | Diff surface | Tokenized added/removed/context colors |
| [SkillViewer.svelte](../src/lib/components/editor/SkillViewer.svelte) | Skill file viewer | Frontmatter + body preview |

## Tokens & motion

| FractalKnow | Source intent |
| --- | --- |
| [_tokens.sass](../src/lib/styles/_tokens.sass) | `globals.css` / `cmd-f.css` color, radius, shadow, z, motion |
| [_mixins.sass](../src/lib/styles/_mixins.sass) | Shared focus ring, kbd chip, scrollbar, reduced-motion |
| [global.sass](../src/lib/styles/global.sass) | Theme data attributes + skip link + reduced-motion |

## Overlay primitives

| FractalKnow | Source intent |
| --- | --- |
| [Tooltip.svelte](../src/lib/components/ui/Tooltip.svelte) | Hover-delay tooltip with side placement + arrow |
| [Popover.svelte](../src/lib/components/ui/Popover.svelte) | Anchored popover with focus trap + restore-focus |
| [DropdownMenu.svelte](../src/lib/components/ui/DropdownMenu.svelte) | Keyboard menu (item / checkbox / radio / separator) |
| [Toast.svelte](../src/lib/components/ui/Toast.svelte) | Toast host for success/warning/danger/info |
| [focus-trap.ts](../src/lib/components/ui/focus-trap.ts) | Shared Tab trap used by dialogs, palette, popovers |

DialogHost and CommandPalette restore focus on close and trap Tab while open. Esc closes overlays.

## Icons

Local lucide-style SVGs live in [src/lib/icons/](../src/lib/icons/) (`Icon.svelte`, `fileTypeIcon.ts`) and replace unicode glyphs in the sidebar tree and actions.

## Verification scripts

- `pnpm run lint:tokens` — hard-coded colors outside token files fail
- `pnpm run test:sass` — SASS compile smoke for tokens/mixins/global
