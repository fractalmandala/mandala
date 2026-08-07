---
id: project-history-log
title: Project History Log
type: archive
tags: [history]
updated: 2026-07-15
---

> **Historical project history log — kept as reference.**

# History

## 1. IDE Setup and Walkthrough History

### Setup, Architecture & Features Summary

We have successfully set up the independent **FractalEngine IDE** application inside `apps/fractalengine/` using Tauri 2 and SvelteKit (Svelte 5 runes). 

Here is a summary of the features, files, and configurations applied:

#### 1. Project Configurations
* **[package.json](file:///Users/amrit/fractals/apps/fractalengine/package.json)**: Configured with Svelte 5 (`^5.56.1`), Vite 8, Sass, and local dependency `"fractals-styler": "workspace:*"` along with `@tauri-apps/api` and `phosphor-svelte`.
* **[tsconfig.json](file:///Users/amrit/fractals/apps/fractalengine/tsconfig.json)**: Extends `.svelte-kit/tsconfig.json` for compilation settings.
* **[svelte.config.js](file:///Users/amrit/fractals/apps/fractalengine/svelte.config.js)**: Configures `@sveltejs/adapter-static` with fallback to `index.html` for single-page desktop builds.
* **[vite.config.ts](file:///Users/amrit/fractals/apps/fractalengine/vite.config.ts)**: Integrates both the standard `sveltekit()` plugin and the `fractalsStyler()` JIT styling plugin.

#### 2. Tauri 2 Desktop Configs
* **[Cargo.toml](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/Cargo.toml)**: Standard Rust manifest with Tauri 2 and window-state dependency.
* **[tauri.conf.json](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/tauri.conf.json)**: Configures window width/height, overlay title bar, and development URLs.
* **[default.json (capabilities)](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/capabilities/default.json)**: Enables core Tauri and window-state capabilities.
* **[build.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/build.rs)**: Calls `tauri_build::build()`.
* **[main.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/main.rs)** & **[lib.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs)**: Rust entry points declaring filesystem commands: `list_directory`, `read_file`, and `write_file`.

#### 3. Frontend Architecture (Runes & IPC Mock)
* **[ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts)**: Single module gateway managing directory and file loading/saving. It automatically falls back to browser mock if running outside Tauri.
* **[ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts)**: Virtual in-memory filesystem for browser development (`pnpm dev` preview).
* **[ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts)**: State Registry using Svelte 5 runes. Houses layout states (sidebars, terminal collapsed), terminal shell simulator, open tabs, active document edits, and **Undo/Redo history stacks** (saving window layouts and text content changes, mapped to `Cmd+Z`/`Ctrl+Z`).

#### 4. UI Components
* **[Sidebar.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Sidebar.svelte)**: Collapsible sidebar rendering. Left side displays the workspace folder tree and subfolder navigation — each file shows a filetype-aware icon (mapped via `getFileIcon()` from `src/lib/fileIcons.ts`) using IntelliJ-style SVGs from `static/iconset/`. Right side displays inspector details, characters/lines metrics, and a diagnostic panel.
* **[Editor.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Editor.svelte)**: Houses document tabs, line numbers column, file save shortcuts (`Cmd+S`), and a welcome keyboard shortcut splash screen when no document is active.
* **[Terminal.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Terminal.svelte)**: A terminal panel with a draggable title-bar header, scrollable logging frame, clear command, and prompt input for executing mock terminal commands (`help`, `ls`, `cat`, `save`, `run`, `clear`, `undo`, `redo`).

#### 5. Layout and Styling System
* **[index.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass)**: Aggregates custom indented Sass rules.
* **[_tokens.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_tokens.sass)**: Set up with a custom Dark Space developer palette.
* **[_globals.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_globals.sass)**: Global resets and body styling.
* Component specific indented styles:
  * **[components/_layout.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_layout.sass)**: Layout flex rows/cols, titlebar overrides, and highlighted drop overlay areas.
  * **[components/_sidebar.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_sidebar.sass)**: Directory row click states and diagnostics layout.
  * **[components/_editor.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_editor.sass)**: Tab bars, tab selection states, scrollbars, and monospace alignments.
  * **[components/_terminal.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_terminal.sass)**: Terminal log lines colors and prompt spacing.

#### 6. Drag-and-Drop Docking Logic
The terminal docking is handled dynamically via state:
1. The Terminal header uses standard HTML5 `draggable="true"`.
2. As dragging begins, `ondragover` drop targets in the Left Sidebar, Right Sidebar, and Middle-Bottom panels highlight with premium glowing overlays.
3. Dropping triggers `ideState.setTerminalLocation('left' | 'right' | 'bottom')`.
4. Svelte reactively moves the terminal component into the active zone, preserving the terminal's console history.

#### 7. Draggable Layout resizing & Workspace persistence
We implemented robust resizing and saving features:
* **Draggable Handles**: Added vertical and horizontal resize handles (`.resize-handle-v`, `.resize-handle-h`). Clicking and dragging resizes Left Sidebar width, Right Sidebar width, and Terminal height respectively, backed by Svelte state variables and mousemove listeners.
* **Workspace Saving**: Users can name and save their workspace (current root folder, open tabs, active file selection, panel positions) in `localStorage`. Saved workspaces are listed at the top of the Left Sidebar for instant reload.
* **SVG Iconset**: Swapped Phosphor icons with custom assets from `static/iconset/` (using `/iconset/folder.svg`, `/iconset/fileUnread.svg`, `/iconset/save.svg`, `/iconset/run.svg`, `/iconset/toolWindow.svg`, `/iconset/toolWindowConsole.svg`, etc.) to achieve a uniform IntelliJ look. Filetype-aware icons for the sidebar file tree are mapped via `src/lib/fileIcons.ts`, routing extensions (`.rs`, `.py`, `.ts`, `.js`, `.go`, `.md`, etc.) and exact filenames (`Makefile`, `Dockerfile`, `Cargo.toml`, `.gitignore`) to the corresponding IntelliJ-style SVG icon.
* **VS Code Theme Engine**: Imported `vendor/starterTemplates.js` as an ESM module, letting the user swap between hundreds of VS Code-compatible themes from a dropdown in the footer. Sessions persist active theme choices in `sessionStorage` (so refresh keeps them), and users can define default light and dark overrides (persisting long-term in `localStorage`).
* **Lean Panel Layouts**: Moved the editor status bar elements into the footer strip and shrunk the terminal header to a slim `24px` strip. When the terminal collapses, it hides completely from the middle panel.

#### 8. Running & Testing instructions
1. Run `pnpm install` in the monorepo root to link the workspace package and install other dependencies:
   ```bash
   pnpm install
   ```
2. Run the SvelteKit development server to test inside any browser (with virtual mock files):
   ```bash
   pnpm --filter @fractals/fractalengine dev
   ```
3. Run the desktop app under Tauri:
   ```bash
   pnpm --filter @fractals/fractalengine tauri dev
   ```
4. Generate custom application icons from `static/icon.png`:
   ```bash
   pnpm generate-icons
   ```

#### 9. Custom Application Icon Generation
We created a Node.js utility script **[generate-icons.js](file:///Users/amrit/fractals/apps/fractalengine/generate-icons.js)** in the app root:
- **Operation**: Resolves the 1024x1024 source image `static/icon.png` and executes Tauri's native icon compilation command (`tauri icon`).
- **Generated Assets**: Automatically generates all required app assets (including iOS/Android icon packages, Store logos, standard sizes `32x32`, `64x64`, `128x128`, `128x128@2x`, `icon.png`) and compiles native `.ico` (Windows) and `.icns` (macOS) binaries, replacing the placeholder icons inside `src-tauri/icons/`.

#### 10. In-App Browser & Password Vault
We implemented a full-featured in-app browser panel with an integrated Bitwarden-style password vault:
* **Interactive Browser Frame (`Browser.svelte`)**:
  - Embedded Svelte 5 viewport featuring back, forward, and reload navigation buttons.
  - Custom Address Bar resolving URL search terms or input addresses.
  - Standalone Window trigger opening a dedicated borderless Tauri `WebviewWindow` with overlay titlebar controls.
* **Integrated Bitwarden Password Manager Popover**:
  - **Match Tab**: Queries the host domain of the current browser page and displays matching accounts. Clicking expands to show copyable usernames/passwords (with toggled hide/show inputs) and a quick fill launcher.
  - **All Logins Tab**: Full search and navigation list of all vault items.
  - **CRUD forms**: Direct add, edit, and delete actions syncing reactively to state.
* **Tauri Database Persistence**:
  - On startup, Tauri reads `passwords.json` in the workspace directory. If absent, it automatically imports and converts `vendor/bitwarden_export_20260624203541.json` to initialize the database.
* **2FA Keypass TOTP Generator (`totp.ts`)**:
  - Custom TypeScript HMAC-SHA1 algorithm computes 6-digit 2FA OTP codes from Base32 secrets. Recalculates dynamically every 1 second with a 30s visual countdown boundary.

#### 11. UI Layout Fixes, Native Folder Picker, and Editor Flex Constraints
We resolved critical interface bugs, verified with `svelte-check` showing **0 errors** and **0 warnings**:
* **Native Folder Picker Integration**:
  - Replaced the browser `prompt()` fallback (which does nothing in desktop Tauri) with native OS file dialog bindings.
  - Implemented `selectAndLoadDirectory()` in `ideState` using the Tauri `select_download_directory` command.
  - Wired the "Open Folder" header button and Command Palette "Open Folder..." action to launch this native dialog.
* **Responsive Chat Input Model Selector**:
  - Updated the toolbar container in `AIChat.svelte` to use a wrapping flex layout (`row wrap ycenter xbetween margintop8 gap8`).
  - Added `margin-left: auto` to the model select wrapper container.
  - This allows the model selector and send button to cleanly wrap onto a new line under the tool buttons when the right sidebar is narrow, preventing any horizontal overflow/spill beyond the input container boundaries.
* **Editor Container Flex Constraints**:
  - Applied `min-width: 0` constraints to all parent containers of the editor (including `.middle-workspace-zone`, `.editor-workspace-wrapper`, `.editor-container`, and `.editor-workspace`).
  - This prevents flexbox items from expanding horizontally past the workspace viewport boundaries to fit long code lines.
  - CodeMirror lines now wrap cleanly to exactly 100% of the active editor workspace width.
  - Added the `.cm-scroller` style with `overflow: auto` to `customEditorTheme` to ensure independent scrollable views.
* **Accessibility and Compiler Auditing**:
  - Addressed and resolved Svelte a11y linter warnings by adding appropriate `svelte-ignore` comments to static overlays and draggable resize separators.
  - Verified a clean workspace with **0 compile errors** and **0 warnings** under Svelte/TypeScript compiler checks.

#### 12. Playwright End-to-End Testing
We successfully installed and configured Playwright to run end-to-end tests for catching visual overlaps, layout issues, and runtime interaction errors:
* **Installed Playwright**:
  - Installed `@playwright/test` dev dependency.
  - Downloaded and configured the Chromium testing browser binaries.
* **Configurations (`playwright.config.ts`)**:
  - Configured test runner directory to `./tests`.
  - Linked SvelteKit local server commands (`pnpm dev` on port `5173`) to launch and teardown the web server automatically during testing.
* **Test Script (`package.json`)**:
  - Added `"test:e2e": "playwright test"` to easily run tests in the development workflow.
* **E2E Test Suite (`tests/ide.spec.ts`)**:
  - Created a robust test suite that simulates user flows:
	1. **loads home screen and sidebar elements correctly**: Verifies that either the welcome splash or an open workspace editor is loaded, sidebars exist, and footer settings button is visible.
	2. **can open a file from explorer list**: Simulates user navigation in the file tree and checks that the active editor tab opens with CodeMirror.
	3. **chat prompt area elements and model selector do not spill**: Expands the right sidebar (if collapsed), switches to the AI Copilot tab, fills text, and mathematically validates that the model selector dropdown stays within the prompt card borders (verifying our CSS layout fix is 100% stable).
	4. **settings dialog opens and closes without layout issues**: Launches Settings from the status bar, navigates settings tabs, clicks cancel/close, and asserts clean dialog teardown.
  - All tests pass cleanly (`4 passed`).

---

## 2. Spatial Canvas Board Migration (Phase 0 & Stream A)

We migrated the IDE shell layout from a rigid three-column interface to an infinite panning and zoomable Spatial Canvas Board of draggable, resizable tile panels:
* **State Layer Scaffolding (`canvas.svelte.ts`)**: Built a Svelte 5 state store managing canvas coordinates, viewports, focus, raise actions, and templating.
* **Draggable, Resizable Tile Panels (`Tile.svelte`, `_tile.sass`)**: Re-housed IDE panels inside draggable and resizable tile containers featuring title headers, module legend indicator dots, and resize handles, with deltas divided by zoom factor.
* **Pannable, Zoomable Canvas substrate (`Canvas.svelte`, `_canvas.sass`)**: Created the infinite board substrate with a dotted grid background supporting pointer-drag panning, space-bar panning, and wheel zooming focused toward cursor coordinates.
* **Tile Dock launcher (`TileDock.svelte`, `_dock.sass`)**: Placed a launcher dock at the bottom-center featuring menus to launch active panels (Explorer, Editor, Terminal, Browser, AI Copilot, Models, Skills) and greyed-out disabled placeholder buttons for future modules (Wiki, Mail, Database).
* **Interactive Minimap (`Minimap.svelte`, `_minimap.sass`)**: Implemented a coordinates-mapped minimap in the bottom-right showing active tiles and the visible viewport boundary frame with pointer click-to-pan mapping.
* **Workspace Persistence**: Configured layout coordinates and tiles array to persist to workspace folder disk space (`canvas_layout.json` under Tauri) with fallback to `localStorage` in browser/mock mode.
* **Shell & Style Swaps**: Replaced the legacy workspace layout columns with the `<Canvas />` main board region in `+page.svelte`, removed obsolete collapsing properties from `ideState`, and updated `_layout.sass` with the `.board-region` flex layout.
* **Layout Cleanups**: Removed obsolete toggle commands (`toggleLeftSidebar`, `toggleRightSidebar`, `toggleTerminal`, `toggleBrowser`) from `CommandPalette.svelte` and the `Terminal Dock` status entry from `Sidebar.svelte` diagnostics.
* **Template Gallery Integration**: Integrated the `<TemplateGallery />` opening trigger via `canvas.showGallery = true` in `CommandPalette.svelte`, the main page header strip in `+page.svelte`, and the `TileDock.svelte` launcher strip. Added elegant close behaviors (dialog header close button in `TemplateGallery.svelte` and backdrop click handler in `+page.svelte`).
* **Stale Module Registry Consolidation**: Eliminated the redundant standalone `futureModules.ts` file and configured `TileDock.svelte` to import its list of future placeholders directly from the centralized `FUTURE_MODULES` in `tileKinds.ts`.
* **CSS Custom Variable Token Conversion**: Converted all SASS overlays, shadows, and minimap color primitives into `:root` semantic CSS custom variables in `_tokens.sass`, keeping component styles (`_minimap.sass`, `_dock.sass`, `_templategallery.sass`, `_commandpalette.sass`) strictly aligned with the two-layer CSS design token rule.
* **Classic IDE Layout Re-Integration**: Restored the classic three-column docked IDE workspace (Left/Right sidebars, Editor, Browser, bottom-draggable Terminal, resizing handlers, and drag-and-drop docking) in a dedicated `<ClassicIdeLayout />` component, which is conditionally loaded in `+page.svelte` when the active workspace template matches the `code` (Classic) layout. Re-implemented all layout states/toggles in `ideState` and updated `CommandPalette` to dynamically offer layout actions during classic layout mode.
* **13. Workspace File Dialog & Native Menu Bar Linkage**: Replaced browser `prompt` workspace saves with native file dialog save prompt commands using `.fractal-workspace` serialization files. Linked the macOS/system native File menu bar options (Open File, Open Folder, Open Workspace, Add Folder to Workspace, Save Current as Workspace, Close Window) to Svelte layout event listeners utilizing Tauri's global event emission gateway.
* **14. Notes & Wiki Workspace (TipTap WYSIWYG)**: Built a dedicated markdown notes workspace (`NotesLayout.svelte`) with a four-pane CSS grid (folder vault → file list → split-pane editor → AI Chat). The editor uses **TipTap 3** (ProseMirror) for true WYSIWYG rich-text editing with a formatting toolbar, slash commands (`/` menu for headings/lists/tables/code blocks), and three view modes (split, raw-only, rich-only). Markdown ↔ HTML two-way sync is handled by `marked` and `turndown`. Added the `notes` template to `templates.ts` and conditional routing in `+page.svelte`. New packages: `@tiptap/*`, `marked`, `turndown`, `lowlight` (see [ADR-012](docs/adr/ADR-012-markdown-notes-wiki-with-tiptap.md)).

---

## 3. AI API Providers and Custom Models Upgrade

We upgraded the AI Copilot settings and provider integration:
* **DeepSeek, xAI Grok, Z.ai First-Class Configuration**: Added dedicated forms inside `SettingsDialog.svelte` to persist API tokens and custom endpoints.
* **Custom Models Management Registry**: Restructured settings tab to keep the custom models registry table and addition forms permanently visible. Custom configured models populate reactively into the `AIChat.svelte` model selection dropdown.
* **Optgroup Selection Routing**: Grouped OpenAI, Anthropic, Google, Ollama, DeepSeek, xAI, Z.ai, and Custom models under distinct `<optgroup>` labels in the chat panel select dropdown.
* **API Client Gateway Routing**: Mapped DeepSeek, xAI, and Z.ai requests dynamically to the OpenAI completion endpoint inside `sendPrompt()`, overriding the base URL argument to pass to Tauri's Rust API (`runApiModel` command) without modifying Rust backend execution logic.

---

## 4. AI Elements Remaster — Modular Copilot Kit

We replaced the monolithic `AIChat.svelte` rendering with a composable kit of reusable primitives under [`src/lib/components/ai-elements/`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/), integrated cleanly with the Stream A state wiring:

* **Cross-stream contracts ([`ai-elements/types.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/types.ts))**: Established shared types (`ModelOption`, `ModelGroup`, `TokenUsage`) so Stream A (state) and Stream B (components) could be developed in parallel without coupling. `buildModelGroups()`, `onSelectModel()`, `checkpointAt()`, `restoreToCheckpoint()`, and `onAiUsage()` are all surface-stable contracts.
* **Conversation** ([`Conversation.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Conversation.svelte)): Slot-based scroll container with **polite auto-stick-to-bottom** via `IntersectionObserver`. Only auto-scrolls when the user has not scrolled up to read history; preserves the user's reading position otherwise. Disconnects cleanly on `onDestroy`.
* **Response** ([`Response.svelte`](file:///Users/amrit/fractalengine/src/lib/components/ai-elements/Response.svelte)): Markdown rendering via `marked`. Routed fenced code blocks: ```` ```mermaid ```` → [`Mermaid`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Mermaid.svelte); all other fences → [`Code`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte). Streams safely via the `isStreaming` prop.
* **Code** ([`Code.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte)): Read-only CodeMirror block with language detection (js/ts, html, markdown, sass, json) via the new `langExtensionFor()` helper in [`editorTheme.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts) and a "Copy" button.
* **Mermaid** ([`Mermaid.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Mermaid.svelte)): Lazy-imports the `mermaid` library on first render, draws diagrams, falls back to a `Code` block on error so failures degrade gracefully.
* **Reasoning** ([`Reasoning.svelte`](file:///Users/amrit/fractalengine/src/lib/components/ai-elements/Reasoning.svelte)): Collapsible chain-of-thought block. Auto-opens while streaming (`isStreaming={true}`) and folds into a compact summary once the final answer arrives.
* **CopyButton** ([`CopyButton.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/CopyButton.svelte)): Ghost button with `navigator.clipboard.writeText` and a transient "Copied!" label.
* **Actions** ([`Actions.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Actions.svelte)): Per-message row containing Retry, Copy, and a custom `children` snippet slot. `AIChat.svelte` injects a `✦ Checkpoint` button via the snippet.
* **ModelSelector** ([`ModelSelector.svelte`](file:///Users/amrit/fractalengine/src/lib/components/ai-elements/ModelSelector.svelte)): Searchable palette modeled on `CommandPalette.svelte`. Replaces the legacy native `<select>` dropdown. Renders `ModelGroup[]` with optgroup-style sections and a flat `value` key for selection. Keyboard-navigable, click-outside-to-close.
* **Checkpoint** ([`checkpoint/Checkpoint.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/checkpoint/Checkpoint.svelte)): Restore marker rendered after each assistant message. Clicking "Restore" calls back into `ideState.restoreToCheckpoint(msgId)`.
* **Context** ([`context/Context.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/context/Context.svelte)): Token-usage meter in the chat header. Subscribes to `onAiUsage()` events from the Rust API gateway and shows `currentUsage.totalTokens / maxTokens` with a progress bar.
* **Stylesheets ([`_ai-elements.sass`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_ai-elements.sass) + [`_ai-data.sass`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_ai-data.sass))**: All ai-element visual styles moved into SASS files under `src/lib/styles/components/`. Aggregated in [`_index.sass`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass) via `@use 'components/ai-elements'` and `@use 'components/ai-data'`. Token-only — no hardcoded colors, radii, or shadows.
* **AIChat integration** ([`AIChat.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte)): Rewritten as a thin composition shell — owns prompt input, autocomplete (`@` file references, `/` skill templates), drag-and-drop attach, and the conversation loop. Delegates all message rendering to the ai-elements kit. Autocomplete behavior, suggestion rendering, attached-file chip row, and drag-drop zone are unchanged from the prior version. Status checklist during streaming is preserved for visual continuity.
* **Documentation**: Per-component routing docs generated for every new file under [`docs/routing/`](file:///Users/amrit/fractals/apps/fractalengine/docs/routing/src--lib--components--ai-elements--types.ts.md) — 11 new files covering `types.ts`, `Conversation`, `Response`, `Code`, `Mermaid`, `Reasoning`, `CopyButton`, `Actions`, `ModelSelector`, `checkpoint/Checkpoint`, and `context/Context`. `AIChat.svelte.md` rewritten to reflect the new composition shell.
