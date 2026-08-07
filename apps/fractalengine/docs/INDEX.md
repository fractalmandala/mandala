# Docs & Agents Index

Single manifest over `docs/adr/`, `docs/design/`, `docs/routing/`, and `agents/skills-and-agents.json`.
Read **this file** to find the relevant doc/skill/agent before opening any individual file — see the directive in AGENTS.md.

_48 ADRs · 20 design docs · 18 areas · 7 guides · 20 plans · 2 archive docs · 26 skills · 1 agents · mechanically rebuilt by `rebuild_docs_index` (frontmatter authored by `agents/skills/doc-frontmatter`)_

## ADRs (`docs/adr/`)

| ID | Title | Status | Tags | Relates To | File |
|---|---|---|---|---|---|
| ADR-001 | Use Tauri 2 + SvelteKit (Svelte 5 Runes) as the IDE Framework | accepted | framework, tauri, sveltekit, architecture | ADR-002, ADR-004 | [docs/adr/ADR-001-tauri-sveltekit-framework.md](docs/adr/ADR-001-tauri-sveltekit-framework.md) |
| ADR-002 | Svelte 5 Runes-Only State Management | accepted | state-management, svelte, runes | ADR-001, ADR-006 | [docs/adr/ADR-002-svelte-5-state-management.md](docs/adr/ADR-002-svelte-5-state-management.md) |
| ADR-003 | Two-Layer CSS Token System with Indented SASS | accepted | design-tokens, sass, styling | ADR-001 | [docs/adr/ADR-003-css-token-system-with-sass.md](docs/adr/ADR-003-css-token-system-with-sass.md) |
| ADR-004 | Single IPC Gateway Module for All Tauri API Calls | accepted | ipc, tauri, architecture | ADR-001 | [docs/adr/ADR-004-single-ipc-gateway-module.md](docs/adr/ADR-004-single-ipc-gateway-module.md) |
| ADR-005 | Adopt Spatial Canvas Board Layout with Draggable Tiles | accepted | canvas, layout, tiles | ADR-010 | [docs/adr/ADR-005-spatial-canvas-layout.md](docs/adr/ADR-005-spatial-canvas-layout.md) |
| ADR-006 | Mandatory Undo/Redo Boundary for User-Editable State | accepted | undo-redo, state-management, ide-state | ADR-002, ADR-005, ADR-015 | [docs/adr/ADR-006-undo-redo-boundary.md](docs/adr/ADR-006-undo-redo-boundary.md) |
| ADR-007 | In-App Browser with Integrated Password Vault and 2FA | superseded | browser, vault, 2fa, security | ADR-004, ADR-006, ADR-016, ADR-028, ADR-036 | [docs/adr/ADR-007-browser-with-password-vault-and-2fa.md](docs/adr/ADR-007-browser-with-password-vault-and-2fa.md) |
| ADR-008 | Workspace Serialization Format and Native Menu Bar Event Linkage | accepted | workspace, serialization, menu | ADR-005 | [docs/adr/ADR-008-workspace-serialization-format.md](docs/adr/ADR-008-workspace-serialization-format.md) |
| ADR-009 | AI Providers and Custom Models Settings Integration | superseded | ai, settings, providers | ADR-011, ADR-017 | [docs/adr/ADR-009-ai-providers-and-custom-models-settings.md](docs/adr/ADR-009-ai-providers-and-custom-models-settings.md) |
| ADR-010 | Classic IDE Layout Integration and Restoration | accepted | layout, ide, sidebar, editor | ADR-005 | [docs/adr/ADR-010-classic-ide-layout-integration.md](docs/adr/ADR-010-classic-ide-layout-integration.md) |
| ADR-011 | Local-First AI Memory and Context Harness | proposed | ai, memory, context | ADR-009 | [docs/adr/ADR-011-local-first-ai-memory-and-context-harness.md](docs/adr/ADR-011-local-first-ai-memory-and-context-harness.md) |
| ADR-012 | Markdown Notes & Wiki Workspace with TipTap WYSIWYG Editor | accepted | notes, wiki, tiptap, editor | ADR-013, ADR-014, ADR-018 | [docs/adr/ADR-012-markdown-notes-wiki-with-tiptap.md](docs/adr/ADR-012-markdown-notes-wiki-with-tiptap.md) |
| ADR-013 | Notes-Template Vault Persistence | accepted | notes, persistence, localstorage, undo-redo | ADR-006, ADR-012 | [docs/adr/ADR-013-notes-vault-persistence.md](docs/adr/ADR-013-notes-vault-persistence.md) |
| ADR-014 | Document-Level Pointer and Keyboard Resize Pattern | accepted | notes, layout, drag-resize, accessibility, undo-redo, svelte-5, runes | ADR-012, ADR-010, src/lib/modules/notes/components/NotesLayout.svelte, src/lib/modules/notes/components/NotesEditor.svelte, src/lib/modules/designer/components/DesignLayout.svelte | [docs/adr/ADR-014-document-level-drag-resize-pattern.md](docs/adr/ADR-014-document-level-drag-resize-pattern.md) |
| ADR-015 | Adopt App Template Routing and Domain State Boundaries | accepted | routing, templates, state-management, svelte-5 | ADR-002, ADR-005, ADR-006, ADR-010, ADR-012 | [docs/adr/ADR-015-app-template-routing-and-state-domains.md](docs/adr/ADR-015-app-template-routing-and-state-domains.md) |
| ADR-016 | Extract Shared AES-256-GCM Envelope Encryption into crypto.rs for Vault and Chat Memory | accepted | security, encryption, crypto, vault, memory | ADR-007, ADR-011 | [docs/adr/ADR-016-shared-envelope-encryption-crypto-module.md](docs/adr/ADR-016-shared-envelope-encryption-crypto-module.md) |
| ADR-017 | Keep Provider Secrets in Native Storage | accepted | security, keychain, ipc, ai-providers | ADR-004, ADR-016 | [docs/adr/ADR-017-keep-provider-secrets-native.md](docs/adr/ADR-017-keep-provider-secrets-native.md) |
| ADR-018 | Contain Filesystem IPC to User-Selected Roots | accepted | ipc, security, filesystem, workspace | ADR-004, src/lib/ipc.ts, src/lib/components/TreeNode.svelte | [docs/adr/ADR-018-contain-filesystem-ipc-to-user-selected-roots.md](docs/adr/ADR-018-contain-filesystem-ipc-to-user-selected-roots.md) |
| ADR-019 | Separate SvelteKit Development and Production Generation Directories | accepted | sveltekit, build, development, reliability | ADR-001 | [docs/adr/ADR-019-separate-sveltekit-generation-directories.md](docs/adr/ADR-019-separate-sveltekit-generation-directories.md) |
| ADR-020 | Isolate Built-Artifact Browser Tests | accepted | testing, playwright, build, reliability | ADR-019 | [docs/adr/ADR-020-isolate-built-artifact-browser-tests.md](docs/adr/ADR-020-isolate-built-artifact-browser-tests.md) |
| ADR-021 | Designer Module Extraction | accepted | designer, module, extraction, architecture | ADR-015 | [docs/adr/ADR-021-designer-module-extraction.md](docs/adr/ADR-021-designer-module-extraction.md) |
| ADR-022 | Notes Module Extraction | accepted | notes, module, extraction, architecture | ADR-015 | [docs/adr/ADR-022-notes-module-extraction.md](docs/adr/ADR-022-notes-module-extraction.md) |
| ADR-023 | IDE Module Extraction and Kernel Deferral | accepted | ide, module, extraction, architecture | ADR-010 | [docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md](docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md) |
| ADR-024 | AI Module — Embed-don’t-rewrite | accepted | ai, module, architecture, embedding, history | ADR-011, ADR-021, ADR-023, ADR-025 | [docs/adr/ADR-024-ai-module-embed-dont-rewrite.md](docs/adr/ADR-024-ai-module-embed-dont-rewrite.md) |
| ADR-025 | Contribution Registry | accepted | contributions, registry, commands, keybindings, architecture | ADR-021, ADR-022, ADR-023, ADR-024, src/lib/state/contributions.svelte.ts | [docs/adr/ADR-025-contribution-registry.md](docs/adr/ADR-025-contribution-registry.md) |
| ADR-026 | Core Undo Engine (Snapshot Transactions) | accepted | undo-redo, transactions, engine, state, architecture | ADR-006, ADR-015, ADR-021, ADR-022, ADR-024, fractaldocs, src/lib/state/undoHistory.svelte.ts, src/lib/state/undo.svelte.ts | [docs/adr/ADR-026-core-undo-engine.md](docs/adr/ADR-026-core-undo-engine.md) |
| ADR-027 | Data Layer — In-Memory Mock Engine & Search Index | accepted | data-layer, search, bookmarks, mock-engine, ipc | ADR-004, ADR-015, ADR-021, ADR-022, ADR-024, ADR-026, src/lib/ipc-mock.ts, src/lib/modules/bookmarks/ | [docs/adr/ADR-027-data-layer-mock-engine.md](docs/adr/ADR-027-data-layer-mock-engine.md) |
| ADR-028 | Security Boundaries & Contract-Typed IPC | accepted | security, ipc, sanitization, csp, capabilities, keychain, boundary | ADR-004, ADR-027, src/lib/ipc.ts, src/lib/sanitizeHtml.ts, tests/unit/ipc-contract.test.ts, tests/unit/html-boundary.test.ts, tests/unit/security-config.test.ts | [docs/adr/ADR-028-security-boundaries-contract-ipc.md](docs/adr/ADR-028-security-boundaries-contract-ipc.md) |
| ADR-029 | Unify AI Model Registry and Native Discovery | accepted | ai, model-registry, ipc, native, persistence | ADR-009, ADR-011, ADR-017, ADR-028 | [docs/adr/ADR-029-unify-ai-model-registry-and-native-discovery.md](docs/adr/ADR-029-unify-ai-model-registry-and-native-discovery.md) |
| ADR-030 | Single Add Model Flow | superseded | settings, ai-providers, model-registry | ADR-009, src/lib/data/aiProviders.ts, src/lib/state/modelRegistry.contract.ts | [docs/adr/ADR-030-single-add-model-flow.md](docs/adr/ADR-030-single-add-model-flow.md) |
| ADR-031 | Single Control and Text Class Taxonomy | accepted | styling, css-classes, buttons, typography, tabs, sidebars | ADR-003, 13-control-text-taxonomy, src/lib/styles/_commons.sass, src/lib/styles/_typography.sass | [docs/adr/ADR-031-single-control-and-text-class-taxonomy.md](docs/adr/ADR-031-single-control-and-text-class-taxonomy.md) |
| ADR-032 | Persist BYOK Models Immediately | accepted | ai, byok, settings, keychain, model-registry | ADR-017, ADR-029, ADR-030 | [docs/adr/ADR-032-immediate-byok-model-configuration.md](docs/adr/ADR-032-immediate-byok-model-configuration.md) |
| ADR-033 | Unified Model Management and Local Status Cue | accepted | ai, settings, model-registry, local-models, byok, status-cue | ADR-017, ADR-029, ADR-030, ADR-032 | [docs/adr/ADR-033-unified-model-management-and-local-status-cue.md](docs/adr/ADR-033-unified-model-management-and-local-status-cue.md) |
| ADR-034 | Snippet-Rendered Virtual List Rows | accepted | security, virtual-list, bookmarks, search, snippets, sanitization | ADR-027, ADR-028, src/lib/components/VirtualList.svelte, src/lib/sanitizeHtml.ts | [docs/adr/ADR-034-snippet-rendered-virtual-list-rows.md](docs/adr/ADR-034-snippet-rendered-virtual-list-rows.md) |
| ADR-035 | Envelope-Encrypted API-Key Store and Keyring Backend | accepted | security, keychain, ai-providers, byok, backend, encryption | ADR-017, ADR-028, ADR-032, src/lib.rs, src/crypto.rs | [docs/adr/ADR-035-envelope-encrypted-api-key-store.md](docs/adr/ADR-035-envelope-encrypted-api-key-store.md) |
| ADR-036 | Rebuild the Browser as a Native Tab Module | accepted | browser, native, tabs, session, vault, security | ADR-004, ADR-006, ADR-007, ADR-016, ADR-028 | [docs/adr/ADR-036-browser-module-rebuild.md](docs/adr/ADR-036-browser-module-rebuild.md) |
| ADR-037 | Composite Tokens Must Be Declared in Theme Scope, Not :root | accepted | design-tokens, css-variables, theming, sass | 01-tokens, 12-token-theme-mapping | [docs/adr/ADR-037-composite-tokens-live-in-theme-scope.md](docs/adr/ADR-037-composite-tokens-live-in-theme-scope.md) |
| ADR-038 | Use a Native On-Device Dictation Bridge | accepted | dictation, speech, macos, ipc, privacy, accessibility | ADR-004, ADR-025, ADR-026, ADR-028 | [docs/adr/ADR-038-use-native-on-device-dictation-bridge.md](docs/adr/ADR-038-use-native-on-device-dictation-bridge.md) |
| ADR-039 | Complete the Owned-Library Media Workflow | accepted | media, library, undo-redo, watcher, tauri, filesystem | ADR-018, ADR-025, ADR-026, ADR-027, media-module-plan | [docs/adr/ADR-039-complete-owned-library-media-workflow.md](docs/adr/ADR-039-complete-owned-library-media-workflow.md) |
| ADR-040 | Relocate Exclusive Component Styles to Modules | accepted | styling, sass, architecture, encapsulation, modules | ADR-003, ADR-015, ADR-021, ADR-023, ADR-024 | [docs/adr/ADR-040-relocate-exclusive-component-styles-to-modules.md](docs/adr/ADR-040-relocate-exclusive-component-styles-to-modules.md) |
| ADR-041 | Adopt the Module-Flow Scan Contract and AppHealth Renderer | accepted | module-flow, scan-contract, apphealth, visualization, dev | ADR-003, ADR-015, ADR-042, dev, graph-reports, add-a-module-graph-report | [docs/adr/ADR-041-module-flow-scan-contract.md](docs/adr/ADR-041-module-flow-scan-contract.md) |
| ADR-042 | Adopt Self-Contained Graph Components and the HTML-to-Svelte Report-Split Pipeline | accepted | dev, visualization, graph-components, report-split, sass, pipeline | ADR-003, ADR-041, dev, graph-reports, add-a-module-graph-report | [docs/adr/ADR-042-dev-graph-gallery-and-report-splitting.md](docs/adr/ADR-042-dev-graph-gallery-and-report-splitting.md) |
| ADR-043 | Make UndoHistory Gestures Reentrant-Safe | accepted | undo-redo, transactions, engine, designer, gestures, state | ADR-026, ADR-021 | [docs/adr/ADR-043-undo-history-reentrant-gestures.md](docs/adr/ADR-043-undo-history-reentrant-gestures.md) |
| ADR-044 | Project-Local Shared Annotations | accepted | annotations, sqlite, collaboration, agentation, ipc | ADR-004, ADR-018, ADR-027, ADR-028 | [docs/adr/ADR-044-project-local-shared-annotations.md](docs/adr/ADR-044-project-local-shared-annotations.md) |
| ADR-045 | Isolate the New Design Canvas Grid | accepted | newdesign, canvas, pan-zoom, undo-redo, isolation | ADR-026, ADR-043, newdesign | [docs/adr/ADR-045-isolate-new-design-canvas-grid.md](docs/adr/ADR-045-isolate-new-design-canvas-grid.md) |
| ADR-046 | Use a Shared Workspace Shell for Module Geometry | accepted | shell, layout, paneforge, persistence, undo-redo, modules | ADR-003, ADR-006, ADR-014, ADR-015, ADR-026, ADR-043 | [docs/adr/ADR-046-shared-workspace-shell.md](docs/adr/ADR-046-shared-workspace-shell.md) |
| ADR-047 | Adopt Vendor-Extracted Background Patterns for the New Design Canvas | accepted | newdesign, canvas, patterns, undo-redo, styling | ADR-026, ADR-045, newdesign | [docs/adr/ADR-047-newdesign-canvas-pattern-picker.md](docs/adr/ADR-047-newdesign-canvas-pattern-picker.md) |
| ADR-048 | Constrain Media Mutations to the Owned Fracta Library Root | accepted | media, filesystem, security, library, tauri | ADR-018, ADR-028, ADR-039, media | [docs/adr/ADR-048-constrain-media-to-owned-library-root.md](docs/adr/ADR-048-constrain-media-to-owned-library-root.md) |

## Design Docs (`docs/design/`)

| ID | Title | Tags | Relates To | File |
|---|---|---|---|---|
| 00-rules | Established Design Rules | design-tokens, css-variables | 02-sass-variables, 12-token-theme-mapping | [docs/design/00-rules.md](docs/design/00-rules.md) |
| 01-tokens | Two-Layer CSS Token System | design-tokens, css-variables, accessibility, feedback | 02-sass-variables, 12-token-theme-mapping, fractaldocs, ADR-037 | [docs/design/01-tokens.md](docs/design/01-tokens.md) |
| 02-sass-variables | Indented SASS Variable Definitions and Overrides | sass, variables | 01-tokens | [docs/design/02-sass-variables.md](docs/design/02-sass-variables.md) |
| 03-typography | Type Scale, Font Families, and Typographic Roles | typography, fonts, designer, codegen | 08-font-usage, designer | [docs/design/03-typography.md](docs/design/03-typography.md) |
| 04-layout-system | Flex/Grid Layout Patterns, Spacing Rhythm, Containers | layout, flexbox, grid, spacing, accessibility, browser | 05-utility-primitives, 09-mixins-breakpoints, fractaldocs, ADR-026 | [docs/design/04-layout-system.md](docs/design/04-layout-system.md) |
| 05-utility-primitives | Reusable Layout Utility Classes | utilities, layout, css-classes | 04-layout-system, 07-class-registry | [docs/design/05-utility-primitives.md](docs/design/05-utility-primitives.md) |
| 06-animations | Animation Keyframes, Durations, Easings | animation, transitions |  | [docs/design/06-animations.md](docs/design/06-animations.md) |
| 07-class-registry | Master Class Registry | css-classes, registry, documentation | 05-utility-primitives, 11-style-aggregation, fractaldocs | [docs/design/07-class-registry.md](docs/design/07-class-registry.md) |
| 08-font-usage | Font Face Declarations and Per-Component Font Assignments | fonts, typography | 03-typography | [docs/design/08-font-usage.md](docs/design/08-font-usage.md) |
| 09-mixins-breakpoints | Responsive Breakpoint Mixins and Helpers | responsive, breakpoints, mixins, sass | 04-layout-system, 02-sass-variables | [docs/design/09-mixins-breakpoints.md](docs/design/09-mixins-breakpoints.md) |
| 10-editor-theme | CodeMirror Theme Tokens and Variant Switching | editor, theme, codemirror | 12-token-theme-mapping | [docs/design/10-editor-theme.md](docs/design/10-editor-theme.md) |
| 11-style-aggregation | How index.sass Aggregates Component Styles | sass, aggregation, build | 07-class-registry, fractaldocs | [docs/design/11-style-aggregation.md](docs/design/11-style-aggregation.md) |
| 12-token-theme-mapping | Mapping Between Semantic Tokens and Theme Variants | design-tokens, theme, light-dark | 01-tokens, 10-editor-theme | [docs/design/12-token-theme-mapping.md](docs/design/12-token-theme-mapping.md) |
| 13-control-text-taxonomy | Button, Text-Role, and Sidebar-Tab Taxonomy | css-classes, buttons, typography, tabs, sidebars, taxonomy | 03-typography, 05-utility-primitives, 07-class-registry | [docs/design/13-control-text-taxonomy.md](docs/design/13-control-text-taxonomy.md) |
| 17-annotation-overlay | Shared Annotation Overlay | annotations, overlay, tokens, feedback, collaboration | 01-tokens, 04-layout-system, annotations | [docs/design/17-annotation-overlay.md](docs/design/17-annotation-overlay.md) |
| 18-workspace-shell | Shared Workspace Shell | shell, layout, panes, motion, sass, tokens | 01-tokens, 04-layout-system, 06-animations, ADR-003, ADR-046 | [docs/design/18-workspace-shell.md](docs/design/18-workspace-shell.md) |
| ai-memory-architecture | Local-First AI Memory & Context Harness Visual Contract | ai, memory, context, architecture | ADR-011 | [docs/design/AI-MEMORY-ARCHITECTURE.md](docs/design/AI-MEMORY-ARCHITECTURE.md) |
| design-index | Design System Entry Point | index, design-system | 01-tokens, 07-class-registry, fractaldocs | [docs/design/DESIGN.md](docs/design/DESIGN.md) |
| graph-reports | Graph Report Styling | dev, visualization, sass, graph-reports, token-exemption | ADR-041, ADR-042, 11-style-aggregation, dev | [docs/design/graph-reports.md](docs/design/graph-reports.md) |
| media-module | Media Module Design | media, gallery, panes, sass, tokens | media-module-plan, 11-style-aggregation | [docs/design/media-module.md](docs/design/media-module.md) |

## Areas (`docs/areas/`)

| ID | Title | Tags | Relates To | File |
|---|---|---|---|---|
| ai | AI Area | ai, chat, copilot, modules | ADR-009, ADR-011, ADR-024 | [docs/areas/ai.md](docs/areas/ai.md) |
| annotations | Shared Annotations Area | annotations, collaboration, sqlite, agentation, dev-server | ADR-004, ADR-027, ADR-028, ipc-and-data-layer, shell-and-routes | [docs/areas/annotations.md](docs/areas/annotations.md) |
| bookmarks | Bookmarks Area | bookmarks, state, modules | ADR-027 | [docs/areas/bookmarks.md](docs/areas/bookmarks.md) |
| browser | Browser Area | browser, tabs, history, bookmarks, vault, session | ADR-004, ADR-006, ADR-016, ADR-028, ADR-036 | [docs/areas/browser.md](docs/areas/browser.md) |
| contributions | Contributions Area | contributions, registry, commands | ADR-025 | [docs/areas/contributions.md](docs/areas/contributions.md) |
| designer | Designer Area | designer, canvas, modules | ADR-005, ADR-006, ADR-008, ADR-014, ADR-021, ADR-026, ADR-043 | [docs/areas/designer.md](docs/areas/designer.md) |
| dev | Dev Area | dev, state, modules, codegraph, visualization, graph-reports | ADR-041, ADR-042, graph-reports, add-a-module-graph-report | [docs/areas/dev.md](docs/areas/dev.md) |
| fractaldocs | FractalDocs | module, documentation, wiki, markdown, undo-redo | ADR-015, ADR-026, shell-and-routes, ipc-and-data-layer, security-boundaries | [docs/areas/fractaldocs.md](docs/areas/fractaldocs.md) |
| ide | IDE Area | ide, editor, codemirror, modules | ADR-006, ADR-010, ADR-023 | [docs/areas/ide.md](docs/areas/ide.md) |
| ipc-and-data-layer | IPC and Data Layer Area | ipc, data-layer, database, tauri, backend, commands, events, native | ADR-004, ADR-011, ADR-016, ADR-017, ADR-018, ADR-023, ADR-027, ADR-028, ADR-035 | [docs/areas/ipc-and-data-layer.md](docs/areas/ipc-and-data-layer.md) |
| kernel | Kernel Area | kernel, state, settings | ADR-004, ADR-009, ADR-015, ADR-017, ADR-026 | [docs/areas/kernel.md](docs/areas/kernel.md) |
| media | Media Area | media, library, gallery, modules | media-module-plan, ADR-018, ADR-026, ADR-027, ADR-048 | [docs/areas/media.md](docs/areas/media.md) |
| newdesign | New Design Area | newdesign, designer, canvas, drag-drop, resize, rotation, undo-redo | ADR-026, ADR-043, ADR-045, ADR-047 | [docs/areas/newdesign.md](docs/areas/newdesign.md) |
| notes | Notes Area | notes, wiki, tiptap, modules | ADR-006, ADR-012, ADR-013, ADR-014, ADR-015, ADR-022 | [docs/areas/notes.md](docs/areas/notes.md) |
| security-boundaries | Security Boundaries Area | security, sanitization, boundaries | ADR-004, ADR-016, ADR-018, ADR-028 | [docs/areas/security-boundaries.md](docs/areas/security-boundaries.md) |
| shell-and-routes | Shell and Routes Area | shell, routing, sveltekit | ADR-001, ADR-005, ADR-008, ADR-015 | [docs/areas/shell-and-routes.md](docs/areas/shell-and-routes.md) |
| styling-system | Styling System Area | styling, sass, tokens | ADR-003 | [docs/areas/styling-system.md](docs/areas/styling-system.md) |
| undo-system | Undo System Area | undo-redo, state, history | ADR-006, ADR-014, ADR-026 | [docs/areas/undo-system.md](docs/areas/undo-system.md) |

## Guides (`docs/guides/`)

| ID | Title | Tags | Relates To | File |
|---|---|---|---|---|
| add-a-command-or-keybinding | Adding a Command or Keybinding | contributions, keybindings, commands, guide | ADR-025 | [docs/guides/add-a-command-or-keybinding.md](docs/guides/add-a-command-or-keybinding.md) |
| add-a-module | Adding a Module | module, architectural, guide | ADR-015, ADR-021, ADR-022, ADR-024 | [docs/guides/add-a-module.md](docs/guides/add-a-module.md) |
| add-a-module-graph-report | Adding a Module Graph Report | dev, visualization, guide, graph-reports | ADR-041, ADR-042, graph-reports, dev | [docs/guides/add-a-module-graph-report.md](docs/guides/add-a-module-graph-report.md) |
| add-an-ipc-function | Adding an IPC Function | ipc, backend, tauri, guide | ADR-004, ADR-018, ADR-028 | [docs/guides/add-an-ipc-function.md](docs/guides/add-an-ipc-function.md) |
| add-styles-or-tokens | Adding Styles or Tokens | styling, sass, tokens, guide | ADR-003 | [docs/guides/add-styles-or-tokens.md](docs/guides/add-styles-or-tokens.md) |
| render-external-html | Rendering External HTML | security, html, sanitization, guide | ADR-028 | [docs/guides/render-external-html.md](docs/guides/render-external-html.md) |
| write-a-two-stream-plan | Writing a Two-Stream Plan | workflow, planning, guide |  | [docs/guides/write-a-two-stream-plan.md](docs/guides/write-a-two-stream-plan.md) |

## Plans (`docs/plans/`)

| ID | Title | Status | Tags | Relates To | File |
|---|---|---|---|---|---|
| ai-layer-fresh-plan | Fresh AI Layer Implementation Plan | proposed | plan, ai, architecture, providers, local-models, streaming |  | [docs/plans/AI-LAYER-FRESH-PLAN.md](docs/plans/AI-LAYER-FRESH-PLAN.md) |
| ai-layer-remediation-plan | AI Layer Remediation Plan | executed | plan, history |  | [docs/plans/AI-LAYER-REMEDIATION-PLAN.md](docs/plans/AI-LAYER-REMEDIATION-PLAN.md) |
| ai-module-plan | AI Module Plan | executed | plan, history |  | [docs/plans/AI-MODULE-PLAN.md](docs/plans/AI-MODULE-PLAN.md) |
| browser-module-plan | Browser Module — Ground-Up Implementation Plan | proposed | plan, browser, module, tabs, history, bookmarks, vault, passwords, tauri, webview |  | [docs/plans/BROWSER-MODULE-PLAN.md](docs/plans/BROWSER-MODULE-PLAN.md) |
| browser-module-tasks | Browser Module — Execution Task Streams (A/B/C) | proposed | plan, browser, tasks, streams, execution, parallel |  | [docs/plans/BROWSER-MODULE-TASKS.md](docs/plans/BROWSER-MODULE-TASKS.md) |
| contribution-registry-plan | Contribution Registry Plan | executed | plan, history |  | [docs/plans/CONTRIBUTION-REGISTRY-PLAN.md](docs/plans/CONTRIBUTION-REGISTRY-PLAN.md) |
| data-layer-plan | Data Layer Plan | executed | plan, history |  | [docs/plans/DATA-LAYER-PLAN.md](docs/plans/DATA-LAYER-PLAN.md) |
| designer-extraction-plan | Designer Extraction Plan | executed | plan, history |  | [docs/plans/DESIGNER-EXTRACTION-PLAN.md](docs/plans/DESIGNER-EXTRACTION-PLAN.md) |
| designer-hygiene-plan | Designer Hygiene Feature Build-Out Plan | in-progress | plan, designer, canvas, roadmap |  | [docs/plans/DESIGNER-HYGIENE-PLAN.md](docs/plans/DESIGNER-HYGIENE-PLAN.md) |
| docs-migration-plan | Docs Migration Plan | executed | plan, history |  | [docs/plans/DOCS-MIGRATION-PLAN.md](docs/plans/DOCS-MIGRATION-PLAN.md) |
| ide-extraction-plan | IDE Extraction Plan | executed | plan, history |  | [docs/plans/IDE-EXTRACTION-PLAN.md](docs/plans/IDE-EXTRACTION-PLAN.md) |
| macos-dictation-feature-spec | macOS Dictation — Feature and Function Specification | proposed | plan, macos, dictation, speech, accessibility, ipc, undo-redo | ADR-004, ADR-006, ADR-025, ADR-026, ADR-028 | [docs/plans/MACOS-DICTATION-FEATURE-SPEC.md](docs/plans/MACOS-DICTATION-FEATURE-SPEC.md) |
| media-module-plan | Media Module Plan | complete | media, plan |  | [docs/plans/media-module-plan.md](docs/plans/media-module-plan.md) |
| memory-and-harness-module | Memory and Harness Module Plan | executed | memory, plan |  | [docs/plans/memory-and-harness-module.md](docs/plans/memory-and-harness-module.md) |
| notes-extraction-plan | Notes Extraction Plan | executed | plan, history |  | [docs/plans/NOTES-EXTRACTION-PLAN.md](docs/plans/NOTES-EXTRACTION-PLAN.md) |
| security-contract-plan | Security Contract Plan | executed | plan, history |  | [docs/plans/SECURITY-CONTRACT-PLAN.md](docs/plans/SECURITY-CONTRACT-PLAN.md) |
| skaa-integration-plan | SKAA Integration Plan | executed | plan, history |  | [docs/plans/SKAA-INTEGRATION-PLAN.md](docs/plans/SKAA-INTEGRATION-PLAN.md) |
| spatial-canvas-migration | Spatial Canvas Migration Plan | executed | canvas, plan |  | [docs/plans/SPATIAL_CANVAS_MIGRATION.md](docs/plans/SPATIAL_CANVAS_MIGRATION.md) |
| spatial-canvas-tasks | Spatial Canvas Tasks Plan | executed | canvas, plan |  | [docs/plans/SPATIAL_CANVAS_TASKS.md](docs/plans/SPATIAL_CANVAS_TASKS.md) |
| undo-engine-plan | Undo Engine Plan | executed | plan, history |  | [docs/plans/UNDO-ENGINE-PLAN.md](docs/plans/UNDO-ENGINE-PLAN.md) |

## Archive (`docs/archive/`)

| ID | Title | Tags | Relates To | File |
|---|---|---|---|---|
| code-fixing-auditing-june-2026 | Code Fixing & Auditing June 2026 | audit, history |  | [docs/archive/25-06-2026-code-fixing-auditing-v1.md](docs/archive/25-06-2026-code-fixing-auditing-v1.md) |
| project-history-log | Project History Log | history |  | [docs/archive/HISTORY.md](docs/archive/HISTORY.md) |

## Skills (`agents/skills/`)

| ID | Title | Tags | Summary | Relates To | Status | Source |
|---|---|---|---|---|---|---|
| acontext-installer | acontext-installer | installer, memory, setup | Installs Acontext, handles login/init for an Acontext project, and adds skill memory to an agent. |  |  | [agents/skills/acontext-installer/SKILL.md](agents/skills/acontext-installer/SKILL.md) |
| adr-writing | adr-writing | adr, documentation | Creates Architecture Decision Records in standard ADR format (title, status, context, decision, consequences). | app-documenter, doc-frontmatter |  | [agents/skills/adr-writing/SKILL.md](agents/skills/adr-writing/SKILL.md) |
| algorithmic-art | algorithmic-art | art, generative-art, p5js | Creates algorithmic/generative art with p5.js using seeded randomness and interactive parameter exploration. | canvas-design |  | [agents/skills/algorithmic-art/SKILL.md](agents/skills/algorithmic-art/SKILL.md) |
| app-documenter | app-documenter | documentation, routing-docs, sveltekit | Generates per-component documentation in docs/routing/ by static analysis of SvelteKit pages and components. | adr-writing, styling-docs-builder, doc-frontmatter |  | [agents/skills/app-documenter/SKILL.md](agents/skills/app-documenter/SKILL.md) |
| brainstorming | brainstorming | planning, ideation | Explores user intent, requirements, and design through dialogue before any creative or feature work begins. | spec-writing, build-feature-end-to-end |  | [agents/skills/brainstorming/SKILL.md](agents/skills/brainstorming/SKILL.md) |
| browser-use | browser-use | browser, automation, testing | Automates browser interactions (navigation, form filling, screenshots, data extraction) via a persistent CLI daemon. |  |  | [agents/skills/browser-use/SKILL.md](agents/skills/browser-use/SKILL.md) |
| build-feature-end-to-end | Build Feature End to End | planning, workflow, feature-development | Guides the full pipeline of shipping a feature end to end, from scoping through review cycles. | brainstorming, spec-writing, subagent-driven-development |  | [agents/skills/build-feature-end-to-end/SKILL.md](agents/skills/build-feature-end-to-end/SKILL.md) |
| canvas-design | canvas-design | art, design, pdf | Creates static visual art (posters, designs) as .png/.pdf documents using an explicit design philosophy. | algorithmic-art |  | [agents/skills/canvas-design/SKILL.md](agents/skills/canvas-design/SKILL.md) |
| context-restore | context-restore | context-management, session | Restores working context that was previously saved by context-save. | context-save |  | [agents/skills/context-restore/SKILL.md](agents/skills/context-restore/SKILL.md) |
| context-save | context-save | context-management, session | Saves working context (files and state) so it can be restored in a later session via context-restore. | context-restore |  | [agents/skills/context-save/SKILL.md](agents/skills/context-save/SKILL.md) |
| continuous-learning | Continuous Learning Skill - DEPRECATED | deprecated, learning | Legacy v1 stop-hook pattern/learning extractor, superseded by continuous-learning-v2 — kept only for archival/backward compatibility. |  | superseded | [agents/skills/continuous-learning/SKILL.md](agents/skills/continuous-learning/SKILL.md) |
| dispatching-parallel-agents | Dispatching Parallel Agents | parallel-agents, orchestration | Delegates independent, state-isolated tasks to specialized subagents with precisely crafted context. | subagent-driven-development |  | [agents/skills/dispatching-parallel-agents/SKILL.md](agents/skills/dispatching-parallel-agents/SKILL.md) |
| doc-frontmatter | doc-frontmatter | documentation, frontmatter, registry, indexing | Adds/updates YAML frontmatter on docs/adr, docs/design, docs/routing files and maintains the agents/skills-and-agents.json registry. | adr-writing, app-documenter, styling-docs-builder |  | [agents/skills/doc-frontmatter/SKILL.md](agents/skills/doc-frontmatter/SKILL.md) |
| frontend-design | FractalEngine Studio Frontend Design Guidelines | design, styling, svelte, design-tokens | Design principles and styling rules for building and auditing the FractalEngine Studio UI (hierarchy, layout, typography, token consistency). | impeccable, web-design-guidelines, web-artifacts-builder |  | [agents/skills/frontend-design/SKILL.md](agents/skills/frontend-design/SKILL.md) |
| impeccable | Impeccable Design & Code Iteration for FractalEngine Studio | design, styling, svelte, polish | Designs, redesigns, audits, and polishes the FractalEngine Studio UI while enforcing Svelte 5 runes, indented SASS, tokens, IPC gateways, and undo boundaries. | frontend-design, web-design-guidelines, web-artifacts-builder |  | [agents/skills/impeccable/SKILL.md](agents/skills/impeccable/SKILL.md) |
| mcp-builder | MCP Server Development Guide | mcp, integration, api | Guides creation of high-quality MCP servers (Python FastMCP or Node/TypeScript SDK) that expose external services as well-designed tools. |  |  | [agents/skills/mcp-builder/SKILL.md](agents/skills/mcp-builder/SKILL.md) |
| performance-investigator | Performance Investigator | performance, audit, loading-speed, startup, ipc, reactivity | Statically traces src-tauri Rust + src TS/Svelte code to model loading time, IPC hot path, and reactivity waves, then writes a thorough investigation report to docs/performance/. | app-documenter, doc-frontmatter |  | [agents/skills/performance-investigator/SKILL.md](agents/skills/performance-investigator/SKILL.md) |
| shadcn-to-svelte | Component-to-Svelte: Extract Project Component to Standalone .svelte | svelte, conversion, components | Converts a project component folder (files, guide.md, index.ts) into a standalone Svelte 5 + TypeScript + indented Sass component. |  |  | [agents/skills/shadcn-to-svelte/SKILL.md](agents/skills/shadcn-to-svelte/SKILL.md) |
| skill-creator | Skill Creator | skill-authoring, evaluation | Creates, edits, and benchmarks skills, including running evals and optimizing a skill's description for triggering accuracy. | doc-frontmatter |  | [agents/skills/skill-creator/SKILL.md](agents/skills/skill-creator/SKILL.md) |
| spec-writing | Spec Writing | documentation, planning, spec | Guides context collection and produces structured technical specifications for any feature, fix, or task. | brainstorming, build-feature-end-to-end |  | [agents/skills/spec-writing/SKILL.md](agents/skills/spec-writing/SKILL.md) |
| styling-docs-builder | Styling & Design Documentation Builder | documentation, styling, design-tokens | Scans Svelte/SASS source to generate living documentation of layouts, components, typography, and style class usage in docs/design. | doc-frontmatter, frontend-design |  | [agents/skills/styling-docs-builder/SKILL.md](agents/skills/styling-docs-builder/SKILL.md) |
| subagent-driven-development | Subagent-Driven Development | orchestration, parallel-agents, implementation | Executes an implementation plan by dispatching one fresh implementer subagent per task plus a review pass after each. | dispatching-parallel-agents |  | [agents/skills/subagent-driven-development/SKILL.md](agents/skills/subagent-driven-development/SKILL.md) |
| theme-factory | FractalEngine Theme Factory | theme, editor, vscode-theme | Builds, modifies, and injects VS Code-compatible color themes for the FractalEngine editor. | frontend-design |  | [agents/skills/theme-factory/SKILL.md](agents/skills/theme-factory/SKILL.md) |
| using-superpowers | Using Skills | meta, skill-discovery | Establishes how to find and use available skills before responding to any request, including clarifying questions. |  |  | [agents/skills/using-superpowers/SKILL.md](agents/skills/using-superpowers/SKILL.md) |
| web-artifacts-builder | FractalEngine Studio Feature & Layer Builder | feature-development, svelte, ide-state | Guides building new multi-component workspace features/layers (AI panel, notes/wiki, email, DB inspector) integrated with Svelte 5 runes, SASS, and ideState. | frontend-design, impeccable |  | [agents/skills/web-artifacts-builder/SKILL.md](agents/skills/web-artifacts-builder/SKILL.md) |
| web-design-guidelines | FractalEngine Studio Web Interface Guidelines | audit, accessibility, styling, compliance | Audits and reviews frontend code for compliance with FractalEngine's IDE architecture, styling conventions, and interaction rules. | frontend-design, impeccable |  | [agents/skills/web-design-guidelines/SKILL.md](agents/skills/web-design-guidelines/SKILL.md) |

## Agents / Orchestrators (`agents/orchestrators/`)

| ID | Title | Tags | Summary | Relates To | Source |
|---|---|---|---|---|---|
| frontend-designer | Orchestrator: Frontend Designer (FractalEngine Studio) | frontend, design-tokens, orchestrator, svelte | Unified frontend-engineering and visual-design orchestrator for FractalEngine Studio; delegates to web-artifacts-builder, impeccable/frontend-design, and web-design-guidelines. | web-artifacts-builder, impeccable, frontend-design, web-design-guidelines | [agents/orchestrators/frontend-designer/AGENT.md](agents/orchestrators/frontend-designer/AGENT.md) |

## Needs Attention (not yet reflected above)

Files with no/invalid frontmatter — run `agents/skills/doc-frontmatter` on these:

- `docs/plans/BITS-UI-ADOPTION-PLAN.md`
- `docs/archive/backup-tokens.md`
- `docs/archive/log-of-moving-codes.md`
- `docs/archive/scanner.md`
- `docs/archive/scribbles.md`
- `docs/archive/scribbles2.md`
- `docs/archive/scribbles3.md`

Skill/agent folders missing from `agents/skills-and-agents.json` — run `doc-frontmatter`'s `scan-registry`/`apply-registry`:

- `agents/skills/shadcn-porting`

