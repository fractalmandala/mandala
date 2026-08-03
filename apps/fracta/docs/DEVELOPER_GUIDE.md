# Fracta developer guide

## Stack and principles

Fracta uses Tauri 2, SvelteKit 2, Svelte 5 runes, TypeScript, indented Sass, and Rust. The selected vault/project folder is the source of truth. Derived state—SQLite FTS, preferences, and transient UI state—must not pollute user content.

Key rules:

- Use Svelte runes (`$state`, `$derived`, `$effect`) for new state.
- Use tab-indented `.sass`, never SCSS or Tailwind.
- Keep Tauri commands thin; put domain behavior under `src-tauri/src/`.
- Preserve vault containment, encoding, dialect, and read-only guarantees at the Rust boundary.

## Local setup

Requirements: Node.js, npm, Rust/Cargo, and the Tauri platform prerequisites. On macOS, local GGUF support additionally needs `llama-server` on `PATH` (for example, `brew install llama.cpp`).

```sh
npm install
npm run tauri dev
```

Useful commands:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Browser-only Svelte development surface. |
| `npm run tauri dev` | Desktop development application. |
| `npm run check` | Svelte type and diagnostics check. |
| `npm run build` | Static production frontend build. |
| `npm run test:visual` | Playwright visual and interaction checks. |
| `npm run verify` | Full frontend, Rust, MCP, visual, and Clippy gate. |

## Repository map

```text
src/
  routes/+page.svelte              application shell
  lib/components/                  workspace, editors, viewers, Ask, terminal
  lib/state/                       Svelte rune state models
  lib/markdown.ts                  Markdown parsing/rendering and round trips
  lib/ipc.ts                       typed Tauri command surface
  lib/styles/                      token-driven indented Sass
src-tauri/src/
  workspace.rs                     contained file operations and viewers
  search.rs                        vault-scoped SQLite FTS5 index
  vault.rs                         capture-note vault lifecycle
  frontmatter.rs                   YAML metadata parsing
  gguf.rs                          managed local llama-server lifecycle
  bin/fracta-mcp.rs                local stdio MCP server
tests/                             frontend, motion, markdown, JSON, visual tests
```

## Workspace backend

`workspace.rs` owns path resolution and classification. Never bypass it for filesystem operations. It classifies editable Markdown, TXT, CSV/TSV, and JSON; treats DOCX/PDF as read-only; and treats all other files as attachments.

The writer validates JSON and CSV before touching disk. It preserves UTF-8 BOM, UTF-16LE/BE, newline styles, CSV delimiter/quoting behavior, and containment. New functionality that reads a vault path must use the same canonical containment checks.

`search.rs` stores FTS5 databases under Fracta configuration, keyed from the canonical project path. File watcher events call incremental index updates; `.fractaignore` changes rebuild the index.

## Frontend architecture

`Workspace.svelte` owns the three-pane workspace composition, document mode selection, local Ask context selection, print preview, sheets, and grid interactions. `workspace.svelte.ts` centralizes workspace lifecycle and typed calls from `ipc.ts`.

Keep parsers and mutations testable in `src/lib/utils/` where practical. Examples include `json-tree.ts`, `json-source.ts`, and `csv-grid.ts`. Avoid moving security or persistence rules into Svelte; enforce those in Rust.

Markdown authoring uses TipTap in `WorkspaceMarkdownEditor.svelte`. The conversion boundary is `markdown.ts`; add round-trip cases in `tests/markdown.test.ts` whenever adding portable Markdown syntax.

## Viewers and local media

`PdfViewer.svelte` uses PDF.js with local bytes returned by Tauri. `DocxImage.svelte` uses contained archive-image requests. `RenderedMarkdown.svelte` creates and revokes local object URLs for images and media. Do not introduce remote document rendering or host filesystem URLs in the webview.

## Agent and MCP integrations

The Ask column streams through `agent/openai-compat.ts`. `agent/local-prompt.ts` defines the local-source citation contract; update `tests/agent-prompt.test.ts` if that contract changes. Local GGUF mode starts a managed `llama-server` and uses the same compatible API client.

`fracta-mcp --vault /absolute/path` is a stdio JSON-RPC server. It exposes contained list/read/search, CRUD, templates, assets, link/graph inspection, structured-file conversion/validation, and workflow tools. New MCP operations must call workspace domain functions rather than duplicate filesystem logic, and must receive contract coverage in `src-tauri/src/bin/fracta-mcp.rs`.

## Design, motion, and accessibility

Tokens live in `src/lib/styles/_tokens.sass`; `DESIGN.md` is the design-system reference and `/design` is the visual preview. Use the evergreen semantic palette sparingly and preserve dark-mode tokens.

Only `transform`, `opacity`, and `clip-path` may transition. Never use `transition: all` or animate layout-affecting properties. The global reduced-motion rule disables transforms/loops and restricts opacity duration. `tests/motion.test.ts` enforces these constraints across all Sass.

Controls need 40px hit targets, primary actions 44px, named labels, focus indicators, and predictable Escape/return-focus behavior. Add a focused Playwright assertion whenever a sheet, dialog, or keyboard workflow changes.

## Testing and release gate

`npm run verify` is the required completion gate. It runs:

1. Svelte check and production build.
2. Markdown, agent prompt, JSON/grid, style hygiene, and motion tests.
3. Playwright visual regression tests for light, dark, compact, workspace, dialog, and Ask-focus states.
4. Rust unit tests, MCP contract tests, and Clippy with warnings denied.

Run the smallest relevant test while iterating, then run the full gate before handoff. The PDF.js worker can trigger Vite’s chunk-size warning; treat it as expected unless the bundle behavior changes unexpectedly.
