<script>
	// @ts-nocheck — ported legacy renderer, checked at runtime via #err

	const DATA = {
	"chunkNames": [
		"INDEX.md",
		"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
		"bitsui-docs",
		"bitsui-docs",
		"bitsui-docs",
		"paneforge",
		"superpowers",
		"superpowers",
		"design/04-layout-system.md",
		"plans/AI-MODULE-PLAN.md",
		"other",
		"daw"
	],
	"nodes": [
		{
			"i": "docs_index",
			"l": "Docs & Agents Index",
			"t": "document",
			"f": "docs/INDEX.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_001_tauri_sveltekit_framework",
			"l": "ADR-001: Use Tauri 2 + SvelteKit (Svelte 5 Runes) as the IDE",
			"t": "document",
			"f": "docs/adr/ADR-001-tauri-sveltekit-framework.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 7
		},
		{
			"i": "adr_adr_002_svelte_5_state_management",
			"l": "ADR-002: Svelte 5 Runes-Only State Management",
			"t": "document",
			"f": "docs/adr/ADR-002-svelte-5-state-management.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_003_css_token_system_with_sass",
			"l": "ADR-003: Two-Layer CSS Token System with Indented SASS",
			"t": "document",
			"f": "docs/adr/ADR-003-css-token-system-with-sass.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_004_single_ipc_gateway_module",
			"l": "ADR-004: Single IPC Gateway Module for All Tauri API Calls",
			"t": "document",
			"f": "docs/adr/ADR-004-single-ipc-gateway-module.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_005_spatial_canvas_layout",
			"l": "ADR-005: Adopt Spatial Canvas Board Layout with Draggable Ti",
			"t": "document",
			"f": "docs/adr/ADR-005-spatial-canvas-layout.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_006_undo_redo_boundary",
			"l": "ADR-006: Mandatory Undo/Redo Boundary for User-Editable Stat",
			"t": "document",
			"f": "docs/adr/ADR-006-undo-redo-boundary.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_007_browser_with_password_vault_and_2fa",
			"l": "ADR-007: In-App Browser with Integrated Password Vault and 2",
			"t": "document",
			"f": "docs/adr/ADR-007-browser-with-password-vault-and-2fa.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_008_workspace_serialization_format",
			"l": "ADR-008: Workspace Serialization Format and Native Menu Bar ",
			"t": "document",
			"f": "docs/adr/ADR-008-workspace-serialization-format.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_009_ai_providers_and_custom_models_settings",
			"l": "ADR-009: AI Providers and Custom Models Settings Integration",
			"t": "document",
			"f": "docs/adr/ADR-009-ai-providers-and-custom-models-settings.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_010_classic_ide_layout_integration",
			"l": "ADR-010: Classic IDE Layout Integration and Restoration",
			"t": "document",
			"f": "docs/adr/ADR-010-classic-ide-layout-integration.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"l": "ADR-011: Local-First AI Memory and Context Harness",
			"t": "document",
			"f": "docs/adr/ADR-011-local-first-ai-memory-and-context-harness.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 8
		},
		{
			"i": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"l": "ADR-012: Markdown Notes & Wiki Workspace with TipTap WYSIWYG",
			"t": "document",
			"f": "docs/adr/ADR-012-markdown-notes-wiki-with-tiptap.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_013_notes_vault_persistence",
			"l": "ADR-013: Notes-Template Vault Persistence",
			"t": "document",
			"f": "docs/adr/ADR-013-notes-vault-persistence.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_014_document_level_drag_resize_pattern",
			"l": "ADR-014: Document-Level Pointer and Keyboard Resize Pattern",
			"t": "document",
			"f": "docs/adr/ADR-014-document-level-drag-resize-pattern.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"design/04-layout-system.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_015_app_template_routing_and_state_domains",
			"l": "ADR-015: Adopt App Template Routing and Domain State Boundar",
			"t": "document",
			"f": "docs/adr/ADR-015-app-template-routing-and-state-domains.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 13
		},
		{
			"i": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"l": "ADR-016: Extract Shared AES-256-GCM Envelope Encryption into",
			"t": "document",
			"f": "docs/adr/ADR-016-shared-envelope-encryption-crypto-module.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_017_keep_provider_secrets_native",
			"l": "ADR-017: Keep Provider Secrets in Native Storage",
			"t": "document",
			"f": "docs/adr/ADR-017-keep-provider-secrets-native.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 8
		},
		{
			"i": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots",
			"l": "ADR-018: Contain Filesystem IPC to User-Selected Roots",
			"t": "document",
			"f": "docs/adr/ADR-018-contain-filesystem-ipc-to-user-selected-roots.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_019_separate_sveltekit_generation_directories",
			"l": "ADR-019: Separate SvelteKit Development and Production Gener",
			"t": "document",
			"f": "docs/adr/ADR-019-separate-sveltekit-generation-directories.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_020_isolate_built_artifact_browser_tests",
			"l": "ADR-020: Isolate Built-Artifact Browser Tests",
			"t": "document",
			"f": "docs/adr/ADR-020-isolate-built-artifact-browser-tests.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_021_designer_module_extraction",
			"l": "ADR-021: Designer Module Extraction",
			"t": "document",
			"f": "docs/adr/ADR-021-designer-module-extraction.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 10
		},
		{
			"i": "adr_adr_022_notes_module_extraction",
			"l": "ADR-022: Notes Module Extraction",
			"t": "document",
			"f": "docs/adr/ADR-022-notes-module-extraction.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 7
		},
		{
			"i": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"l": "ADR-029: Unify AI Model Registry and Native Discovery",
			"t": "document",
			"f": "docs/adr/ADR-029-unify-ai-model-registry-and-native-discovery.md",
			"u": "",
			"chunks": [
				"INDEX.md",
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 10
		},
		{
			"i": "adr_adr_001_tauri_sveltekit_framework_tauri",
			"l": "Tauri 2 Desktop Shell",
			"t": "rationale",
			"f": "docs/adr/ADR-001-tauri-sveltekit-framework.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_001_tauri_sveltekit_framework_sveltekit",
			"l": "SvelteKit with adapter-static",
			"t": "rationale",
			"f": "docs/adr/ADR-001-tauri-sveltekit-framework.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_002_svelte_5_state_management_runes",
			"l": "Svelte 5 Runes-Only Reactivity",
			"t": "rationale",
			"f": "docs/adr/ADR-002-svelte-5-state-management.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_004_single_ipc_gateway_module_ipc_gateway",
			"l": "Single IPC Gateway Pattern",
			"t": "rationale",
			"f": "docs/adr/ADR-004-single-ipc-gateway-module.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"l": "Infinite Spatial Canvas with Draggable Tiles",
			"t": "rationale",
			"f": "docs/adr/ADR-005-spatial-canvas-layout.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 8
		},
		{
			"i": "adr_adr_005_spatial_canvas_layout_tilekinds_registry",
			"l": "tileKinds.ts Panel Registry",
			"t": "concept",
			"f": "docs/adr/ADR-005-spatial-canvas-layout.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_006_undo_redo_boundary_snapshot_undo",
			"l": "Snapshot-Based Undo/Redo Boundary",
			"t": "rationale",
			"f": "docs/adr/ADR-006-undo-redo-boundary.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_008_workspace_serialization_format_fractal_workspace",
			"l": ".fractal-workspace JSON Format",
			"t": "rationale",
			"f": "docs/adr/ADR-008-workspace-serialization-format.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_008_workspace_serialization_format_menu_event_bridge",
			"l": "Native Menu → menu-event Bridge",
			"t": "rationale",
			"f": "docs/adr/ADR-008-workspace-serialization-format.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_009_ai_providers_and_custom_models_settings_custom_model_registry",
			"l": "Multi-Provider AI Settings & Custom Model Registry",
			"t": "rationale",
			"f": "docs/adr/ADR-009-ai-providers-and-custom-models-settings.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_010_classic_ide_layout_integration_classic_layout",
			"l": "ClassicIdeLayout Template Swap",
			"t": "rationale",
			"f": "docs/adr/ADR-010-classic-ide-layout-integration.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_011_local_first_ai_memory_and_context_harness_memory_harness",
			"l": "Local-First AI Memory Harness (SQLite)",
			"t": "rationale",
			"f": "docs/adr/ADR-011-local-first-ai-memory-and-context-harness.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_012_markdown_notes_wiki_with_tiptap_tiptap",
			"l": "TipTap WYSIWYG Notes Editor",
			"t": "rationale",
			"f": "docs/adr/ADR-012-markdown-notes-wiki-with-tiptap.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_013_notes_vault_persistence_notes_vault",
			"l": "Notes Vault Persistence (localStorage)",
			"t": "rationale",
			"f": "docs/adr/ADR-013-notes-vault-persistence.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_014_document_level_drag_resize_pattern_document_level_mousemove",
			"l": "Document-Level Mousemove Drag-Resize Pattern",
			"t": "rationale",
			"f": "docs/adr/ADR-014-document-level-drag-resize-pattern.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_015_app_template_routing_and_state_domains_template_router",
			"l": "appState Template Router & Domain State Boundaries",
			"t": "rationale",
			"f": "docs/adr/ADR-015-app-template-routing-and-state-domains.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_016_shared_envelope_encryption_crypto_module_envelope_encryption",
			"l": "AES-256-GCM Envelope Encryption (crypto.rs)",
			"t": "rationale",
			"f": "docs/adr/ADR-016-shared-envelope-encryption-crypto-module.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots_root_containment",
			"l": "Filesystem Root Containment Boundary",
			"t": "rationale",
			"f": "docs/adr/ADR-018-contain-filesystem-ipc-to-user-selected-roots.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_019_separate_sveltekit_generation_directories_dual_generation_dirs",
			"l": "Separate Dev/Prod SvelteKit Generation Directories",
			"t": "rationale",
			"f": "docs/adr/ADR-019-separate-sveltekit-generation-directories.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_020_isolate_built_artifact_browser_tests_isolated_preview_tests",
			"l": "Isolated Production-Preview E2E Testing",
			"t": "rationale",
			"f": "docs/adr/ADR-020-isolate-built-artifact-browser-tests.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_021_designer_module_extraction_module_pattern",
			"l": "src/lib/modules/<app>/ Module Pattern",
			"t": "rationale",
			"f": "docs/adr/ADR-021-designer-module-extraction.md",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "lib_ipc",
			"l": "ipc.ts (IPC Gateway)",
			"t": "code",
			"f": "src/lib/ipc.ts",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers",
				"design/04-layout-system.md",
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 19
		},
		{
			"i": "lib_ipc_mock",
			"l": "ipc-mock.ts (Browser Mock)",
			"t": "code",
			"f": "src/lib/ipc-mock.ts",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers",
				"design/04-layout-system.md",
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 9
		},
		{
			"i": "state_canvas_svelte",
			"l": "canvas.svelte.ts",
			"t": "code",
			"f": "src/lib/state/canvas.svelte.ts",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "state_ide_svelte",
			"l": "ide.svelte.ts (ideState)",
			"t": "code",
			"f": "src/lib/state/ide.svelte.ts",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 16
		},
		{
			"i": "state_undo_svelte",
			"l": "undo.svelte.ts (undoCoordinator)",
			"t": "code",
			"f": "src/lib/state/undo.svelte.ts",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "components_canvas",
			"l": "Canvas.svelte",
			"t": "code",
			"f": "src/lib/components/Canvas.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "components_tile",
			"l": "Tile.svelte",
			"t": "code",
			"f": "src/lib/components/Tile.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "components_tiledock",
			"l": "TileDock.svelte",
			"t": "code",
			"f": "src/lib/components/TileDock.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "components_minimap",
			"l": "Minimap.svelte",
			"t": "code",
			"f": "src/lib/components/Minimap.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "components_templategallery",
			"l": "TemplateGallery.svelte",
			"t": "code",
			"f": "src/lib/components/TemplateGallery.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "components_classicidelayout",
			"l": "ClassicIdeLayout.svelte",
			"t": "code",
			"f": "src/lib/modules/ide/components/ClassicIdeLayout.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "components_noteslayout",
			"l": "NotesLayout.svelte",
			"t": "code",
			"f": "src/lib/modules/notes/components/NotesLayout.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "components_noteseditor",
			"l": "NotesEditor.svelte",
			"t": "code",
			"f": "src/lib/modules/notes/components/NotesEditor.svelte",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 2
		},
		{
			"i": "notes_frontmatter",
			"l": "frontmatter.ts (Lossless Frontmatter Parser)",
			"t": "code",
			"f": "src/lib/modules/notes/frontmatter.ts",
			"u": "",
			"chunks": [
				"INDEX.md"
			],
			"d": 1
		},
		{
			"i": "src_lib",
			"l": "lib.rs (Tauri Backend)",
			"t": "code",
			"f": "src-tauri/src/lib.rs",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 12
		},
		{
			"i": "src_crypto",
			"l": "crypto.rs (Shared Envelope Encryption)",
			"t": "code",
			"f": "src-tauri/src/crypto.rs",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers"
			],
			"d": 7
		},
		{
			"i": "src_memory",
			"l": "memory.rs (Chat Memory Persistence)",
			"t": "code",
			"f": "src-tauri/src/memory.rs",
			"u": "",
			"chunks": [
				"INDEX.md",
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"l": "ADR-023: IDE Module Extraction and Kernel Deferral",
			"t": "document",
			"f": "docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_024_ai_module_embed_dont_rewrite",
			"l": "ADR-024: AI Module — Embed-don't-rewrite",
			"t": "document",
			"f": "docs/adr/ADR-024-ai-module-embed-dont-rewrite.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_025_contribution_registry",
			"l": "ADR-025: Contribution Registry",
			"t": "document",
			"f": "docs/adr/ADR-025-contribution-registry.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_026_core_undo_engine",
			"l": "ADR-026: Core Undo Engine (Snapshot Transactions)",
			"t": "document",
			"f": "docs/adr/ADR-026-core-undo-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 10
		},
		{
			"i": "adr_adr_027_data_layer_mock_engine",
			"l": "ADR-027: Data Layer — In-Memory Mock Engine & Search Index",
			"t": "document",
			"f": "docs/adr/ADR-027-data-layer-mock-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_028_security_boundaries_contract_ipc",
			"l": "ADR-028: Security Boundaries & Contract-Typed IPC",
			"t": "document",
			"f": "docs/adr/ADR-028-security-boundaries-contract-ipc.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 11
		},
		{
			"i": "adr_adr_030_single_add_model_flow",
			"l": "ADR-030: Single Add Model Flow (Superseded)",
			"t": "document",
			"f": "docs/adr/ADR-030-single-add-model-flow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 8
		},
		{
			"i": "adr_adr_031_single_control_and_text_class_taxonomy",
			"l": "ADR-031: Single Control and Text Class Taxonomy",
			"t": "document",
			"f": "docs/adr/ADR-031-single-control-and-text-class-taxonomy.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
				"design/04-layout-system.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_032_immediate_byok_model_configuration",
			"l": "ADR-032: Persist BYOK Models Immediately",
			"t": "document",
			"f": "docs/adr/ADR-032-immediate-byok-model-configuration.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 7
		},
		{
			"i": "adr_adr_033_unified_model_management_and_local_status_cue",
			"l": "ADR-033: Unified Model Management and Local Status Cue",
			"t": "document",
			"f": "docs/adr/ADR-033-unified-model-management-and-local-status-cue.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_034_snippet_rendered_virtual_list_rows",
			"l": "ADR-034: Snippet-Rendered Virtual List Rows",
			"t": "document",
			"f": "docs/adr/ADR-034-snippet-rendered-virtual-list-rows.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_035_envelope_encrypted_api_key_store",
			"l": "ADR-035: Envelope-Encrypted API-Key Store and Keyring Backen",
			"t": "document",
			"f": "docs/adr/ADR-035-envelope-encrypted-api-key-store.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_036_browser_module_rebuild",
			"l": "ADR-036: Rebuild the Browser as a Native Tab Module",
			"t": "document",
			"f": "docs/adr/ADR-036-browser-module-rebuild.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 8
		},
		{
			"i": "adr_adr_038_use_native_on_device_dictation_bridge",
			"l": "ADR-038: Use a Native On-Device Dictation Bridge",
			"t": "document",
			"f": "docs/adr/ADR-038-use-native-on-device-dictation-bridge.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_039_complete_owned_library_media_workflow",
			"l": "ADR-039: Complete the Owned-Library Media Workflow",
			"t": "document",
			"f": "docs/adr/ADR-039-complete-owned-library-media-workflow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 7
		},
		{
			"i": "archive_25_06_2026_code_fixing_auditing_v1",
			"l": "Code Fixing & Auditing Log June 2026",
			"t": "document",
			"f": "docs/archive/25-06-2026-code-fixing-auditing-v1.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "archive_history",
			"l": "Project History Log",
			"t": "document",
			"f": "docs/archive/HISTORY.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "archive_scanner",
			"l": "Foglamp Codebase Scan (scanner.md)",
			"t": "document",
			"f": "docs/archive/scanner.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "archive_scribbles",
			"l": "Scribble Pad (layout drafts, media module wishlist)",
			"t": "document",
			"f": "docs/archive/scribbles.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_023_ide_module_extraction_and_kernel_deferral_kernel_deferral",
			"l": "Kernel Deferral",
			"t": "rationale",
			"f": "docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_023_ide_module_extraction_and_kernel_deferral_undo_self_registration",
			"l": "Undo Domain Self-Registration",
			"t": "rationale",
			"f": "docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_023_ide_module_extraction_and_kernel_deferral_core_module_edges",
			"l": "Accepted Core-to-Module Import Edges",
			"t": "concept",
			"f": "docs/adr/ADR-023-ide-module-extraction-and-kernel-deferral.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_024_ai_module_embed_dont_rewrite_embed_dont_rewrite",
			"l": "Embed-Don't-Rewrite Principle",
			"t": "rationale",
			"f": "docs/adr/ADR-024-ai-module-embed-dont-rewrite.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_024_ai_module_embed_dont_rewrite_session_meta_overlay",
			"l": "Session Meta-Overlay",
			"t": "rationale",
			"f": "docs/adr/ADR-024-ai-module-embed-dont-rewrite.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_024_ai_module_embed_dont_rewrite_single_live_conversation",
			"l": "Single-Live-Conversation Constraint",
			"t": "concept",
			"f": "docs/adr/ADR-024-ai-module-embed-dont-rewrite.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_025_contribution_registry_contributionregistry",
			"l": "ContributionRegistry",
			"t": "concept",
			"f": "docs/adr/ADR-025-contribution-registry.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_025_contribution_registry_contract_test",
			"l": "Contribution Contract Test",
			"t": "concept",
			"f": "docs/adr/ADR-025-contribution-registry.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_026_core_undo_engine_undohistory",
			"l": "UndoHistory Engine",
			"t": "concept",
			"f": "docs/adr/ADR-026-core-undo-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 6
		},
		{
			"i": "adr_adr_026_core_undo_engine_transact",
			"l": "transact()",
			"t": "concept",
			"f": "docs/adr/ADR-026-core-undo-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_026_core_undo_engine_compositeundodomain",
			"l": "compositeUndoDomain()",
			"t": "concept",
			"f": "docs/adr/ADR-026-core-undo-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_027_data_layer_mock_engine_mock_engine",
			"l": "In-Memory Mock Engine",
			"t": "concept",
			"f": "docs/adr/ADR-027-data-layer-mock-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_027_data_layer_mock_engine_virtuallist",
			"l": "VirtualList Component",
			"t": "concept",
			"f": "docs/adr/ADR-027-data-layer-mock-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_027_data_layer_mock_engine_searchoverlay",
			"l": "SearchOverlay",
			"t": "concept",
			"f": "docs/adr/ADR-027-data-layer-mock-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"l": "Bookmarks Module",
			"t": "concept",
			"f": "docs/adr/ADR-027-data-layer-mock-engine.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 5
		},
		{
			"i": "adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
			"l": "IpcApi Contract Interface",
			"t": "concept",
			"f": "docs/adr/ADR-028-security-boundaries-contract-ipc.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
			"l": "Centralized sanitizeHtml Boundary",
			"t": "concept",
			"f": "docs/adr/ADR-028-security-boundaries-contract-ipc.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_028_security_boundaries_contract_ipc_trust_zones",
			"l": "Trust-Zone Threat Model",
			"t": "rationale",
			"f": "docs/adr/ADR-028-security-boundaries-contract-ipc.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_028_security_boundaries_contract_ipc_guard_tests",
			"l": "Security Guard Tests",
			"t": "concept",
			"f": "docs/adr/ADR-028-security-boundaries-contract-ipc.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_029_unify_ai_model_registry_and_native_discovery_model_registry_v2",
			"l": "Model Registry v2",
			"t": "concept",
			"f": "docs/adr/ADR-029-unify-ai-model-registry-and-native-discovery.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_030_single_add_model_flow_add_model_modal",
			"l": "Universal Add Model Modal",
			"t": "concept",
			"f": "docs/adr/ADR-030-single-add-model-flow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_030_single_add_model_flow_settings_bridge",
			"l": "Settings Bridge",
			"t": "concept",
			"f": "docs/adr/ADR-030-single-add-model-flow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_031_single_control_and_text_class_taxonomy_control_text_taxonomy",
			"l": "Control and Text Class Taxonomy",
			"t": "concept",
			"f": "docs/adr/ADR-031-single-control-and-text-class-taxonomy.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_032_immediate_byok_model_configuration_immediate_byok",
			"l": "Immediate BYOK Persistence",
			"t": "concept",
			"f": "docs/adr/ADR-032-immediate-byok-model-configuration.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_033_unified_model_management_and_local_status_cue_ai_models_tab",
			"l": "Unified AI Models Tab",
			"t": "concept",
			"f": "docs/adr/ADR-033-unified-model-management-and-local-status-cue.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_033_unified_model_management_and_local_status_cue_local_status_cue",
			"l": "Three-State Local Model Cue",
			"t": "concept",
			"f": "docs/adr/ADR-033-unified-model-management-and-local-status-cue.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_034_snippet_rendered_virtual_list_rows_snippet_rows",
			"l": "Snippet Row API",
			"t": "concept",
			"f": "docs/adr/ADR-034-snippet-rendered-virtual-list-rows.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 3
		},
		{
			"i": "adr_adr_035_envelope_encrypted_api_key_store_keyring_backend",
			"l": "Keyring Backend Defect",
			"t": "rationale",
			"f": "docs/adr/ADR-035-envelope-encrypted-api-key-store.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_035_envelope_encrypted_api_key_store_envelope_store",
			"l": "Envelope-Encrypted API-Key Store",
			"t": "concept",
			"f": "docs/adr/ADR-035-envelope-encrypted-api-key-store.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_036_browser_module_rebuild_native_tab_registry",
			"l": "Native Browser Tab Registry",
			"t": "concept",
			"f": "docs/adr/ADR-036-browser-module-rebuild.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 1
		},
		{
			"i": "adr_adr_036_browser_module_rebuild_session_snapshot",
			"l": "Sanitized Session Snapshot",
			"t": "concept",
			"f": "docs/adr/ADR-036-browser-module-rebuild.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_038_use_native_on_device_dictation_bridge_dictation_bridge",
			"l": "Native Dictation Bridge",
			"t": "concept",
			"f": "docs/adr/ADR-038-use-native-on-device-dictation-bridge.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 4
		},
		{
			"i": "adr_adr_039_complete_owned_library_media_workflow_media_undo",
			"l": "Operation-Backed Media Undo",
			"t": "concept",
			"f": "docs/adr/ADR-039-complete-owned-library-media-workflow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "adr_adr_039_complete_owned_library_media_workflow_watcher_reconciliation",
			"l": "Conservative Watcher Rename Reconciliation",
			"t": "concept",
			"f": "docs/adr/ADR-039-complete-owned-library-media-workflow.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "archive_scribbles_media_module_wishlist",
			"l": "Media Module Wishlist",
			"t": "concept",
			"f": "docs/archive/scribbles.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "archive_scribbles_module_layout_conventions",
			"l": "Module Layout Scaffolding Conventions",
			"t": "concept",
			"f": "docs/archive/scribbles.md",
			"u": "",
			"chunks": [
				"adr/ADR-023-ide-module-extraction-and-kernel-deferral.md"
			],
			"d": 2
		},
		{
			"i": "bitsui_docs_introduction_bits_ui",
			"l": "Bits UI Library",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/introduction.md",
			"u": "https://bits-ui.com",
			"chunks": [
				"bitsui-docs"
			],
			"d": 14
		},
		{
			"i": "bitsui_docs_getting_started_getting_started",
			"l": "Bits UI Getting Started Guide",
			"t": "document",
			"f": "docs/archive/bitsui-docs/getting-started.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "bitsui_docs_child_snippet_child_snippet",
			"l": "Child Snippet (Render Delegation)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 10
		},
		{
			"i": "bitsui_docs_child_snippet_floating_content",
			"l": "Floating Content Pattern (wrapperProps)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 11
		},
		{
			"i": "bitsui_docs_child_snippet_mergeprops",
			"l": "mergeProps Utility",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "bitsui_docs_dates_datevalue",
			"l": "DateValue Types (CalendarDate/CalendarDateTime/ZonedDateTime",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "bitsui_docs_dates_daterange",
			"l": "DateRange Type",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "bitsui_docs_dates_internationalized_date",
			"l": "@internationalized/date Package",
			"t": "code",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "https://react-spectrum.adobe.com/internationalized/date/index.html",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "bitsui_docs_figma_file_figma_ui_kit",
			"l": "Bits UI Figma UI Kit",
			"t": "document",
			"f": "docs/archive/bitsui-docs/figma-file.md",
			"u": "https://www.figma.com/community/file/1430229712135910564/bits-ui-kit",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "bitsui_docs_llms_llms_txt",
			"l": "llms.txt LLM-Friendly Documentation",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/llms.md",
			"u": "https://bits-ui.com/llms.txt",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "bitsui_docs_migration_guide_migration_guide",
			"l": "Bits UI v0.x to v1 Migration Guide",
			"t": "document",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 18
		},
		{
			"i": "bitsui_docs_ref_ref_prop",
			"l": "Bindable ref Prop",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/ref.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "bitsui_docs_ref_withelementref",
			"l": "WithElementRef Type Helper",
			"t": "code",
			"f": "docs/archive/bitsui-docs/ref.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "bitsui_docs_state_management_state_management",
			"l": "State Management (Two-Way & Function Binding)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/state-management.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "bitsui_docs_styling_styling",
			"l": "Styling (Data Attributes, CSS Variables, Classes)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/styling.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "bitsui_docs_transitions_transitions",
			"l": "Transitions & forceMount",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/transitions.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 11
		},
		{
			"i": "components_accordion_accordion",
			"l": "Accordion Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/accordion.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 6
		},
		{
			"i": "components_alert_dialog_alert_dialog",
			"l": "Alert Dialog Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/alert-dialog.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_aspect_ratio_aspect_ratio",
			"l": "Aspect Ratio Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/aspect-ratio.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_avatar_avatar",
			"l": "Avatar Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/avatar.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "components_button_button",
			"l": "Button Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/button.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_calendar_calendar",
			"l": "Calendar Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/calendar.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "components_checkbox_checkbox",
			"l": "Checkbox Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/checkbox.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "components_collapsible_collapsible",
			"l": "Collapsible Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/collapsible.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_combobox_combobox",
			"l": "Combobox Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/combobox.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "components_dialog_dialog",
			"l": "Dialog Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/transitions.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "components_popover_popover",
			"l": "Popover Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 9
		},
		{
			"i": "components_select_select",
			"l": "Select Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 7
		},
		{
			"i": "components_tooltip_tooltip",
			"l": "Tooltip Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 6
		},
		{
			"i": "components_dropdown_menu_dropdown_menu",
			"l": "Dropdown Menu Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 6
		},
		{
			"i": "components_menubar_menubar",
			"l": "Menubar Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 6
		},
		{
			"i": "components_link_preview_link_preview",
			"l": "Link Preview Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "components_date_picker_date_picker",
			"l": "Date Picker Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 7
		},
		{
			"i": "components_date_range_picker_date_range_picker",
			"l": "Date Range Picker Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/child-snippet.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 6
		},
		{
			"i": "components_date_field_date_field",
			"l": "Date Field Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "components_date_range_field_date_range_field",
			"l": "Date Range Field Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "components_range_calendar_range_calendar",
			"l": "Range Calendar Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_label_label",
			"l": "Label Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/components/checkbox.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_slider_slider",
			"l": "Slider Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_pin_input_pin_input",
			"l": "Pin Input Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_radio_group_radio_group",
			"l": "Radio Group Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "components_scroll_area_scroll_area",
			"l": "Scroll Area Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "components_context_menu_context_menu",
			"l": "Context Menu Component",
			"t": "code",
			"f": "docs/archive/bitsui-docs/migration-guide.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "components_command_command",
			"l": "Command",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/command.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_meter_meter",
			"l": "Meter",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/meter.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_navigation_menu_navigation_menu",
			"l": "Navigation Menu",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/navigation-menu.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "components_pagination_pagination",
			"l": "Pagination",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/pagination.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 0
		},
		{
			"i": "components_progress_progress",
			"l": "Progress",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/progress.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_rating_group_rating_group",
			"l": "Rating Group",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/rating-group.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "bitsui_docs_dates_dates",
			"l": "Bits UI Dates Documentation",
			"t": "document",
			"f": "docs/archive/bitsui-docs/dates.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "concept_portal_pattern",
			"l": "Portal Rendering Pattern",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/dialog.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 5
		},
		{
			"i": "concept_floating_ui",
			"l": "Floating UI Positioning Library",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/link-preview.md",
			"u": "https://floating-ui.com/",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "concept_internationalized_date",
			"l": "@internationalized/date Package",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/date-field.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "concept_input_otp",
			"l": "Input OTP Library (Guilherme Rodz)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/pin-input.md",
			"u": "https://github.com/guilhermerodz/input-otp",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "concept_compound_component_pattern",
			"l": "Compound Component Pattern",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/dialog.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "concept_form_hidden_input",
			"l": "Hidden Input for HTML Form Submission",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/radio-group.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_scroll_area_scrollarea",
			"l": "Scroll Area Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/scroll-area.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_separator_separator",
			"l": "Separator Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/separator.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 0
		},
		{
			"i": "components_switch_switch",
			"l": "Switch Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/switch.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_tabs_tabs",
			"l": "Tabs Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/tabs.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "components_time_field_timefield",
			"l": "Time Field Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/time-field.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_time_range_field_timerangefield",
			"l": "Time Range Field Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/time-range-field.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_toggle_group_togglegroup",
			"l": "Toggle Group Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/toggle-group.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_toggle_toggle",
			"l": "Toggle Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/toggle.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "components_toolbar_toolbar",
			"l": "Toolbar Component",
			"t": "document",
			"f": "docs/archive/bitsui-docs/components/toolbar.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_tooltip_tether",
			"l": "Tooltip Tether (Detached/Singleton Triggers)",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/tooltip.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_select_floating_ui",
			"l": "Floating UI Positioning",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/select.md",
			"u": "https://floating-ui.com/",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "components_select_function_binding",
			"l": "Fully Controlled State via Function Bindings",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/components/select.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 10
		},
		{
			"i": "type_helpers_with_element_ref_withelementref",
			"l": "WithElementRef Type Helper",
			"t": "document",
			"f": "docs/archive/bitsui-docs/type-helpers/with-element-ref.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 0
		},
		{
			"i": "type_helpers_without_child_withoutchild",
			"l": "WithoutChild Type Helper",
			"t": "document",
			"f": "docs/archive/bitsui-docs/type-helpers/without-child.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 3
		},
		{
			"i": "type_helpers_without_children_withoutchildren",
			"l": "WithoutChildren Type Helper",
			"t": "document",
			"f": "docs/archive/bitsui-docs/type-helpers/without-children.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "type_helpers_without_children_or_child_withoutchildrenorchild",
			"l": "WithoutChildrenOrChild Type Helper",
			"t": "document",
			"f": "docs/archive/bitsui-docs/type-helpers/without-children-or-child.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 4
		},
		{
			"i": "utilities_bits_config_bitsconfig",
			"l": "BitsConfig Global Context Provider",
			"t": "document",
			"f": "docs/archive/bitsui-docs/utilities/bits-config.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 2
		},
		{
			"i": "policies_changelog_conventions_changelog_conventions",
			"l": "Changelog Conventions Policy",
			"t": "document",
			"f": "docs/archive/bitsui-docs/policies/changelog-conventions.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 0
		},
		{
			"i": "policies_code_of_conduct_code_of_conduct",
			"l": "Code of Conduct",
			"t": "document",
			"f": "docs/archive/bitsui-docs/policies/code-of-conduct.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "policies_tracking_bugs_and_feature_requests_tracking_bugs_and_feature_requests",
			"l": "Tracking Bugs and Feature Requests Policy",
			"t": "document",
			"f": "docs/archive/bitsui-docs/policies/tracking-bugs-and-feature-requests.md",
			"u": "",
			"chunks": [
				"bitsui-docs"
			],
			"d": 1
		},
		{
			"i": "utilities_is_using_keyboard_isusingkeyboard",
			"l": "IsUsingKeyboard",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/is-using-keyboard.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 0
		},
		{
			"i": "utilities_merge_props_mergeprops",
			"l": "mergeProps",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/merge-props.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "utilities_merge_props_clsx",
			"l": "clsx",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/merge-props.md",
			"u": "https://www.npmjs.com/package/clsx",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "utilities_portal_portal",
			"l": "Portal",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/portal.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "utilities_portal_bitsconfig",
			"l": "BitsConfig",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/portal.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "utilities_use_id_useid",
			"l": "useId",
			"t": "concept",
			"f": "docs/archive/bitsui-docs/utilities/use-id.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 0
		},
		{
			"i": "daw_serum_serum_2",
			"l": "Serum 2 VST",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 6
		},
		{
			"i": "daw_serum_fractalbeats",
			"l": "FractalBeats Project",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "daw_serum_wavetable_oscillator",
			"l": "Wavetable Oscillator",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "daw_serum_multisample_oscillator",
			"l": "Multisample Oscillator",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "daw_serum_sample_oscillator",
			"l": "Sample Oscillator",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "daw_serum_granular_oscillator",
			"l": "Granular Oscillator",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "daw_serum_spectral_oscillator",
			"l": "Spectral Oscillator",
			"t": "concept",
			"f": "docs/archive/daw/serum.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_design_system_design_system_reference",
			"l": "FractalEngine Design System Reference (archived)",
			"t": "document",
			"f": "docs/archive/other/DESIGN-SYSTEM.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 3
		},
		{
			"i": "other_design_system_semantic_tokens",
			"l": "Semantic CSS Custom Property Tokens (Layer 2)",
			"t": "rationale",
			"f": "docs/archive/other/DESIGN-SYSTEM.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 3
		},
		{
			"i": "other_design_system_sass_primitives",
			"l": "SASS Primitive Variables (Layer 1)",
			"t": "rationale",
			"f": "docs/archive/other/DESIGN-SYSTEM.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "styles__tokens_sass",
			"l": "_tokens.sass",
			"t": "code",
			"f": "src/lib/styles/_tokens.sass",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 3
		},
		{
			"i": "other_design_system_typography_scale",
			"l": "Typography Scale (geometric --text-* tokens)",
			"t": "concept",
			"f": "docs/archive/other/DESIGN-SYSTEM.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_design_system_editortheme_codemirror",
			"l": "EditorTheme (CodeMirror)",
			"t": "concept",
			"f": "docs/archive/other/DESIGN-SYSTEM.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "lib_editortheme_editortheme",
			"l": "editorTheme.ts",
			"t": "code",
			"f": "src/lib/editorTheme.ts",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_plan",
			"l": "AI Elements Remaster Plan (Tier-1 Port + ADR-011 Phase 1)",
			"t": "document",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 6
		},
		{
			"i": "other_ai_elements_remaster_stream_a",
			"l": "Stream A (Backend, State, Data Components, Integration)",
			"t": "concept",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_elements_remaster_stream_b",
			"l": "Stream B (Presentational AI Components)",
			"t": "concept",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_cross_stream_contracts",
			"l": "Cross-Stream Contracts (ai-elements/types.ts)",
			"t": "rationale",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_adr_011_phase1_storage",
			"l": "ADR-011 Phase 1 Storage (per-project SQLite memory.db)",
			"t": "rationale",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_memory_rs",
			"l": "memory.rs (Rust session/message storage)",
			"t": "code",
			"f": "src-tauri/src/memory.rs",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "components_commandpalette_commandpalette",
			"l": "CommandPalette.svelte",
			"t": "code",
			"f": "src/lib/components/CommandPalette.svelte",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_modelselector",
			"l": "ModelSelector (searchable model palette)",
			"t": "concept",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_elements_remaster_marked",
			"l": "marked (markdown library)",
			"t": "concept",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_elements_remaster_mermaid",
			"l": "Mermaid diagram component",
			"t": "concept",
			"f": "docs/archive/other/ai-elements-remaster.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_features_overview",
			"l": "AI Features Overview (archived)",
			"t": "document",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 7
		},
		{
			"i": "other_ai_features_local_detection",
			"l": "Local CLI Agent Detection",
			"t": "concept",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_features_api_providers",
			"l": "API Provider Integration",
			"t": "concept",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_features_local_gguf_mlx",
			"l": "Built-in GGUF/MLX Local Model Runtime",
			"t": "concept",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_features_context_projects",
			"l": "Memory, History and Context Projects",
			"t": "concept",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_ai_features_marketplaces",
			"l": "Models and Skills Marketplaces",
			"t": "concept",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_ai_features_ai_elements_master",
			"l": "vendor/ai-elements-master kit",
			"t": "code",
			"f": "docs/archive/other/ai-features.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_app_modules_overview",
			"l": "App Modules Overview (archived)",
			"t": "document",
			"f": "docs/archive/other/app-modules.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 4
		},
		{
			"i": "other_app_modules_fractalcode",
			"l": "Fractalcode (IDE module)",
			"t": "concept",
			"f": "docs/archive/other/app-modules.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_app_modules_fractaldesign",
			"l": "Fractaldesign (design module)",
			"t": "concept",
			"f": "docs/archive/other/app-modules.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_app_modules_fractalnotes",
			"l": "Fractalnotes (markdown/wiki module)",
			"t": "concept",
			"f": "docs/archive/other/app-modules.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_app_modules_fractalai",
			"l": "FractalAI (AI module)",
			"t": "concept",
			"f": "docs/archive/other/app-modules.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_md_editor_spec",
			"l": "Markdown Editor Spec (archived)",
			"t": "document",
			"f": "docs/archive/other/md-editor.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "data_templates_templates",
			"l": "templates.ts",
			"t": "code",
			"f": "src/lib/data/templates.ts",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "other_starter_templates_themes_spec",
			"l": "Starter Templates and Themes Spec (archived)",
			"t": "document",
			"f": "docs/archive/other/starter_templates_themes.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "other_starter_templates_themes_theme_catalog",
			"l": "VSCode-style Theme Variable Catalog",
			"t": "concept",
			"f": "docs/archive/other/starter_templates_themes.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "data_startertemplates_startertemplates",
			"l": "starterTemplates.ts",
			"t": "code",
			"f": "docs/archive/other/starter_templates_themes.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_1_pane_group_panegroup",
			"l": "PaneGroup",
			"t": "concept",
			"f": "docs/archive/paneforge/1-pane-group.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 6
		},
		{
			"i": "paneforge_1_pane_group_panegroupstorage",
			"l": "PaneGroupStorage",
			"t": "concept",
			"f": "docs/archive/paneforge/1-pane-group.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_2_pane_resizer_paneresizer",
			"l": "PaneResizer",
			"t": "concept",
			"f": "docs/archive/paneforge/2-pane-resizer.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_3_pane_pane",
			"l": "Pane",
			"t": "concept",
			"f": "docs/archive/paneforge/3-pane.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 4
		},
		{
			"i": "paneforge_4_collapsible_panes_collapsible_panes",
			"l": "Collapsible Panes Example",
			"t": "document",
			"f": "docs/archive/paneforge/4-collapsible-panes.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_5_conditional_panes_conditional_panes",
			"l": "Conditional Panes Example",
			"t": "document",
			"f": "docs/archive/paneforge/5-conditional-panes.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_6_horizontal_groups_horizontal_groups",
			"l": "Horizontal Groups Example",
			"t": "document",
			"f": "docs/archive/paneforge/6-horizontal-groups.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_10_reactive_size_reactive_size",
			"l": "Reactive Size Example",
			"t": "document",
			"f": "docs/archive/paneforge/10-reactive-size.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_11_vertical_groups_vertical_groups",
			"l": "Vertical Groups Example",
			"t": "document",
			"f": "docs/archive/paneforge/11-vertical-groups.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 1
		},
		{
			"i": "paneforge_12_styling_styling",
			"l": "PaneForge Styling",
			"t": "document",
			"f": "docs/archive/paneforge/12-styling.md",
			"u": "",
			"chunks": [
				"paneforge"
			],
			"d": 2
		},
		{
			"i": "paneforge_7_nested_groups",
			"l": "PaneForge: Nested Groups Example",
			"t": "document",
			"f": "docs/archive/paneforge/7-nested-groups.md",
			"u": "https://github.com/svecosystem/paneforge/blob/main/sites/docs/src/lib/components/demos/nested-groups-demo.svelte",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "paneforge_8_overflowing_panes",
			"l": "PaneForge: Overflowing Panes Example",
			"t": "document",
			"f": "docs/archive/paneforge/8-overflowing-panes.md",
			"u": "https://github.com/svecosystem/paneforge/blob/main/sites/docs/src/lib/components/demos/overflow-demo.svelte",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "paneforge_9_persistent_layouts",
			"l": "PaneForge: Persistent Layouts Example",
			"t": "document",
			"f": "docs/archive/paneforge/9-persistent-layouts.md",
			"u": "https://github.com/svecosystem/paneforge/blob/main/sites/docs/src/lib/components/demos/storage-demo.svelte",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "paneforge_7_nested_groups_panegroup",
			"l": "PaneGroup Component",
			"t": "concept",
			"f": "docs/archive/paneforge/7-nested-groups.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "paneforge_7_nested_groups_pane",
			"l": "Pane Component",
			"t": "concept",
			"f": "docs/archive/paneforge/7-nested-groups.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "paneforge_7_nested_groups_paneresizer",
			"l": "PaneResizer Component",
			"t": "concept",
			"f": "docs/archive/paneforge/7-nested-groups.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "paneforge_9_persistent_layouts_autosaveid",
			"l": "autoSaveId Local Storage Persistence",
			"t": "rationale",
			"f": "docs/archive/paneforge/9-persistent-layouts.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "paneforge_9_persistent_layouts_cookie_persistence",
			"l": "Cookie-based SSR Layout Persistence",
			"t": "rationale",
			"f": "docs/archive/paneforge/9-persistent-layouts.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "performance_asset_load_code_splitting",
			"l": "Asset Load and Code Splitting Performance Report",
			"t": "document",
			"f": "docs/archive/performance/asset-load-code-splitting.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "performance_asset_load_code_splitting_lowlight_static_import",
			"l": "Lowlight createLowlight Static Import Fix",
			"t": "rationale",
			"f": "docs/archive/performance/asset-load-code-splitting.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "performance_asset_load_code_splitting_mermaid_lazy_boundary",
			"l": "Mermaid Lazy Import Boundary",
			"t": "rationale",
			"f": "docs/archive/performance/asset-load-code-splitting.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "performance_loading_speed",
			"l": "Loading Speed Optimization Audit",
			"t": "document",
			"f": "docs/archive/performance/loading-speed.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 6
		},
		{
			"i": "performance_loading_speed_initworkspace_chain",
			"l": "initWorkspace Async Boot Chain",
			"t": "concept",
			"f": "docs/archive/performance/loading-speed.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "performance_loading_speed_lazy_layout_loading",
			"l": "Lazy Layout Component Loading (R1/R2/R3)",
			"t": "rationale",
			"f": "docs/archive/performance/loading-speed.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "performance_loading_speed_loadlayout_reorder_rejected",
			"l": "canvas.loadLayout Reordering Rejected (R6)",
			"t": "rationale",
			"f": "docs/archive/performance/loading-speed.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "performance_loading_speed_totp_timer_gating",
			"l": "TOTP Timer Gated on Vault Visibility (R4)",
			"t": "rationale",
			"f": "docs/archive/performance/loading-speed.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "scans_index1",
			"l": "FractalEngine Studio Codebase Scan (interactive HTML)",
			"t": "document",
			"f": "docs/archive/scans/index1.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "scans_index2",
			"l": "FractalEngine Studio Code Health Scan (interactive HTML)",
			"t": "document",
			"f": "docs/archive/scans/index2.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "scans_index3",
			"l": "Wiki Atlas — 27,986 Documents Visualization (v1)",
			"t": "document",
			"f": "docs/archive/scans/index3.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "scans_index4",
			"l": "Wiki Atlas — 27,986 Documents Visualization (v2)",
			"t": "document",
			"f": "docs/archive/scans/index4.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "scans_index2_code_health_hotspots",
			"l": "Code Health Hotspots and Findings View",
			"t": "concept",
			"f": "docs/archive/scans/index2.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "scans_index3_wiki_atlas",
			"l": "Wiki Atlas Document Sky",
			"t": "concept",
			"f": "docs/archive/scans/index3.html",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_ai_providers_and_local_models_upgrade",
			"l": "Plan: AI Providers and Local Models Upgrade",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-ai-providers-and-local-models-upgrade.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "plans_2026_06_24_ai_providers_and_local_models_upgrade_run_local_model",
			"l": "run_local_model Command (GGUF/mmproj/MLX)",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-06-24-ai-providers-and-local-models-upgrade.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_codemirror_editor",
			"l": "Plan: CodeMirror Editor Integration and Dynamic Themes",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-codemirror-editor.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_06_24_codemirror_editor_token_theme_mapping",
			"l": "Token-Bound CodeMirror Theme (editorTheme.ts)",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-06-24-codemirror-editor.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade",
			"l": "Plan: Command Palette, Settings System, and AI Copilot Upgra",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-command-palette-settings-system-and-ai-copilot-upgrade.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade_run_api_model",
			"l": "run_api_model Rust Streaming Command",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-06-24-command-palette-settings-system-and-ai-copilot-upgrade.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_fractalengine_ide_setup",
			"l": "Plan: FractalEngine Code Editor IDE Setup",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-fractalengine-ide-setup.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_06_24_fractalengine_ide_setup_ipc_gateway",
			"l": "Single IPC Gateway with Browser Mock",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-06-24-fractalengine-ide-setup.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_06_24_fractalengine_ide_setup_terminal_docking",
			"l": "Terminal Drag-and-Drop Docking",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-06-24-fractalengine-ide-setup.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "plans_2026_06_24_in_app_browser",
			"l": "Plan: In-App Browser, Password Manager and TOTP Keypass",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-in-app-browser.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_06_24_in_app_browser_totp_engine",
			"l": "Pure-TypeScript TOTP Engine (totp.ts)",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-06-24-in-app-browser.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_in_app_browser_password_manager",
			"l": "Bitwarden-Style Password Manager (passwords.json)",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-06-24-in-app-browser.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_06_24_spatial_canvas_stream_a",
			"l": "Plan: Spatial Canvas Phase 0 and Stream A",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-06-24-spatial-canvas-stream-a.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "plans_2026_06_24_spatial_canvas_stream_a_canvasstore",
			"l": "CanvasStore State Registry (canvas.svelte.ts)",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-06-24-spatial-canvas-stream-a.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"l": "Plan: fractalMedia Module Two-Agent Execution Manual",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-07-15-fractalmedia-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 6
		},
		{
			"i": "plans_2026_07_15_fractalmedia_two_stream_implementation_watched_folders",
			"l": "D1: Real Watched Folders, Not a Virtual Library",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-07-15-fractalmedia-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "plans_2026_07_15_fractalmedia_two_stream_implementation_annotations_db",
			"l": "D2: Annotations Sidecar SQLite DB (media.sqlite)",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-07-15-fractalmedia-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_07_15_fractalmedia_two_stream_implementation_thumbnail_pipeline",
			"l": "D3: Split Thumbnail Pipeline",
			"t": "rationale",
			"f": "docs/archive/superpowers/plans/2026-07-15-fractalmedia-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "plans_2026_07_15_fractalmedia_two_stream_implementation_media_ipc_contract",
			"l": "fractalMedia Frozen IPC Contract (media* IpcApi members)",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-07-15-fractalmedia-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "plans_2026_07_15_shared_memory_mve_two_stream_implementation",
			"l": "Plan: Shared Memory MVE Two-Agent Execution Manual",
			"t": "document",
			"f": "docs/archive/superpowers/plans/2026-07-15-shared-memory-mve-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "plans_2026_07_15_shared_memory_mve_two_stream_implementation_memory_projection",
			"l": "Project-Memory Projection Experiment",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-07-15-shared-memory-mve-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "plans_2026_07_15_shared_memory_mve_two_stream_implementation_two_agent_protocol",
			"l": "Two-Agent Parallel Execution Protocol",
			"t": "concept",
			"f": "docs/archive/superpowers/plans/2026-07-15-shared-memory-mve-two-stream-implementation.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "specs_2026_06_24_ai_providers_and_local_models_upgrade_walkthrough",
			"l": "Spec: AI Providers and Local Models Upgrade Walkthrough",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-24-ai-providers-and-local-models-upgrade-walkthrough.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "specs_2026_06_24_codemirror_editor",
			"l": "Spec: CodeMirror Editor Integration and Dynamic Themes",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-24-codemirror-editor.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "specs_2026_06_24_codemirror_editor_cursor_preservation",
			"l": "Reactive Cursor Preservation Pattern",
			"t": "rationale",
			"f": "docs/archive/superpowers/specs/2026-06-24-codemirror-editor.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_06_25_notes_vault_tree_design",
			"l": "Spec: Notes Vault Tree Restructure Design",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vault-tree-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "specs_2026_06_25_notes_vault_tree_design_vaulttreenode",
			"l": "VaultTreeNode Recursive Component",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vault-tree-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_06_25_notes_vault_tree_design_adr_013",
			"l": "ADR-013: Notes Vault Persistence",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vault-tree-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_06_25_notes_vault_tree_design_adr_006",
			"l": "ADR-006: Undo/Redo Boundary",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vault-tree-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_06_25_notes_vaults_design",
			"l": "Notes Vaults + Menu Reorganization Spec",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vaults-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 8
		},
		{
			"i": "specs_2026_06_25_notes_vaults_design_savedvault",
			"l": "SavedVault Data Model",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-06-25-notes-vaults-design.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"l": "Shared Local Agent Memory and Context Harness Proposal",
			"t": "document",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 11
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_exchange_protocol",
			"l": "Serverless .fractal/memory Exchange Protocol",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_memory_kernel",
			"l": "Encrypted SQLite Memory Kernel",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_authority_firewall",
			"l": "Memory Authority Firewall (Provenance Tiers A-D)",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_minimum_viable_experiment",
			"l": "Memory Minimum Viable Experiment (Read-Only Projection)",
			"t": "concept",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_longmemeval",
			"l": "LongMemEval: Benchmarking Chat Assistants on Long-Term Inter",
			"t": "paper",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "https://arxiv.org/abs/2410.10813",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_longmemeval_v2",
			"l": "LongMemEval-V2: Evaluating Long-Term Agent Memory Toward Exp",
			"t": "paper",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "https://arxiv.org/abs/2605.12493",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "specs_2026_07_15_shared_agent_memory_harness_proposal_memgpt",
			"l": "MemGPT: Towards LLMs as Operating Systems",
			"t": "paper",
			"f": "docs/archive/superpowers/specs/2026-07-15-shared-agent-memory-harness-proposal.md",
			"u": "https://arxiv.org/abs/2310.08560",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "areas_ai",
			"l": "AI Area Doc",
			"t": "document",
			"f": "docs/areas/ai.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 5
		},
		{
			"i": "areas_bookmarks",
			"l": "Bookmarks Area Doc",
			"t": "document",
			"f": "docs/areas/bookmarks.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_browser",
			"l": "Browser Area Doc",
			"t": "document",
			"f": "docs/areas/browser.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "areas_contributions",
			"l": "Contributions Area Doc",
			"t": "document",
			"f": "docs/areas/contributions.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_designer",
			"l": "Designer Area Doc",
			"t": "document",
			"f": "docs/areas/designer.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 5
		},
		{
			"i": "areas_fractaldocs",
			"l": "FractalDocs Module Doc",
			"t": "document",
			"f": "docs/areas/fractaldocs.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 6
		},
		{
			"i": "areas_ide",
			"l": "IDE Area Doc",
			"t": "document",
			"f": "docs/areas/ide.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_ipc_and_data_layer",
			"l": "IPC and Data Layer Area Doc",
			"t": "document",
			"f": "docs/areas/ipc-and-data-layer.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 12
		},
		{
			"i": "areas_kernel",
			"l": "Kernel Area Doc",
			"t": "document",
			"f": "docs/areas/kernel.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "areas_media",
			"l": "Media Area Doc",
			"t": "document",
			"f": "docs/areas/media.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "areas_notes",
			"l": "Notes Area Doc",
			"t": "document",
			"f": "docs/areas/notes.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 5
		},
		{
			"i": "areas_security_boundaries",
			"l": "Security Boundaries Area Doc",
			"t": "document",
			"f": "docs/areas/security-boundaries.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "areas_shell_and_routes",
			"l": "Shell and Routes Area Doc",
			"t": "document",
			"f": "docs/areas/shell-and-routes.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_styling_system",
			"l": "Styling System Area Doc",
			"t": "document",
			"f": "docs/areas/styling-system.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_undo_system",
			"l": "Undo System Area Doc",
			"t": "document",
			"f": "docs/areas/undo-system.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "design_00_rules",
			"l": "Established Design Rules",
			"t": "document",
			"f": "docs/design/00-rules.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "design_02_sass_variables",
			"l": "SASS Variables (Layer 1: Primitives)",
			"t": "document",
			"f": "docs/design/02-sass-variables.md",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 3
		},
		{
			"i": "design_03_typography",
			"l": "Typography Design Doc",
			"t": "document",
			"f": "docs/design/03-typography.md",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 5
		},
		{
			"i": "src_storage",
			"l": "storage.rs (SQLite bookmarks + FTS5)",
			"t": "code",
			"f": "src-tauri/src/storage.rs",
			"u": "",
			"chunks": [
				"superpowers",
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 6
		},
		{
			"i": "src_docs_index",
			"l": "docs_index.rs (docs/INDEX.md rebuild)",
			"t": "code",
			"f": "src-tauri/src/docs_index.rs",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "browser_mod",
			"l": "browser/mod.rs (native browser engine)",
			"t": "code",
			"f": "src-tauri/src/browser/mod.rs",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "browser_session",
			"l": "browser/session.rs (session snapshots)",
			"t": "code",
			"f": "src-tauri/src/browser/session.rs",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "state_vault_svelte",
			"l": "vault.svelte.ts (browser password vault state)",
			"t": "code",
			"f": "src/lib/modules/browser/state/vault.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_undohistory_svelte",
			"l": "undoHistory.svelte.ts",
			"t": "code",
			"f": "src/lib/state/undoHistory.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_contributions_svelte",
			"l": "contributions.svelte.ts (contribution registry)",
			"t": "code",
			"f": "src/lib/state/contributions.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 5
		},
		{
			"i": "state_designcanvas_svelte",
			"l": "designcanvas.svelte.ts (designer canvas state)",
			"t": "code",
			"f": "src/lib/modules/designer/state/designcanvas.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_notes_svelte",
			"l": "notes.svelte.ts (notes module state)",
			"t": "code",
			"f": "src/lib/modules/notes/state/notes.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_bookmarks_svelte",
			"l": "bookmarks.svelte.ts (bookmarks module state)",
			"t": "code",
			"f": "src/lib/modules/bookmarks/state/bookmarks.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "state_media_svelte",
			"l": "media.svelte.ts (media module state)",
			"t": "code",
			"f": "src/lib/modules/media/state/media.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_docs_svelte",
			"l": "docs.svelte.ts (fractaldocs state)",
			"t": "code",
			"f": "src/lib/modules/fractaldocs/state/docs.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "state_ai_svelte",
			"l": "ai.svelte.ts (AI module state)",
			"t": "code",
			"f": "src/lib/modules/ai/state/ai.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "state_modelregistry_svelte",
			"l": "modelRegistry.svelte.ts (unified model registry)",
			"t": "code",
			"f": "src/lib/state/modelRegistry.svelte.ts",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md"
			],
			"d": 5
		},
		{
			"i": "components_aichat",
			"l": "AIChat.svelte (AI Copilot panel)",
			"t": "code",
			"f": "src/lib/components/AIChat.svelte",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md",
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 6
		},
		{
			"i": "lib_sanitizehtml",
			"l": "sanitizeHtml.ts (DOMPurify profiles)",
			"t": "code",
			"f": "src/lib/sanitizeHtml.ts",
			"u": "",
			"chunks": [
				"superpowers",
				"design/04-layout-system.md",
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 5
		},
		{
			"i": "lib_pathvalidation",
			"l": "pathValidation.ts",
			"t": "code",
			"f": "src/lib/pathValidation.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "styles_tokens",
			"l": "_tokens.sass (semantic token layer)",
			"t": "code",
			"f": "src/lib/styles/_tokens.sass",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "styles_primitives",
			"l": "_primitives.sass (primitive classes)",
			"t": "code",
			"f": "src/lib/styles/_primitives.sass",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "styles_typography",
			"l": "_typography.sass (type scale tokens)",
			"t": "code",
			"f": "src/lib/styles/_typography.sass",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 1
		},
		{
			"i": "engine_typography",
			"l": "typography.ts (designer typography adapter)",
			"t": "code",
			"f": "src/lib/modules/designer/engine/typography.ts",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_ipc_and_data_layer_authorizedpaths",
			"l": "AuthorizedPaths (filesystem grant guard)",
			"t": "concept",
			"f": "docs/areas/ipc-and-data-layer.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 3
		},
		{
			"i": "areas_ipc_and_data_layer_aistreamstate",
			"l": "AiStreamState (single-active-stream generation guard)",
			"t": "concept",
			"f": "docs/areas/ipc-and-data-layer.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 2
		},
		{
			"i": "areas_undo_system_undohistory",
			"l": "UndoHistory (transaction-based undo engine)",
			"t": "concept",
			"f": "docs/areas/undo-system.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "areas_undo_system_registerundodomain",
			"l": "registerUndoDomain (domain snapshot registration)",
			"t": "concept",
			"f": "docs/areas/undo-system.md",
			"u": "",
			"chunks": [
				"superpowers"
			],
			"d": 4
		},
		{
			"i": "design_04_layout_system",
			"l": "Layout System (Flex/Grid, Spacing, Containers)",
			"t": "document",
			"f": "docs/design/04-layout-system.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 6
		},
		{
			"i": "design_05_utility_primitives",
			"l": "Utility Primitives",
			"t": "document",
			"f": "docs/design/05-utility-primitives.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 5
		},
		{
			"i": "design_06_animations",
			"l": "Animation Keyframes, Durations, Easings",
			"t": "document",
			"f": "docs/design/06-animations.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_07_class_registry",
			"l": "Master Class Registry",
			"t": "document",
			"f": "docs/design/07-class-registry.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 8
		},
		{
			"i": "design_08_font_usage",
			"l": "Font Usage by Component",
			"t": "document",
			"f": "docs/design/08-font-usage.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_09_mixins_breakpoints",
			"l": "SASS Mixins & Breakpoints",
			"t": "document",
			"f": "docs/design/09-mixins-breakpoints.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 4
		},
		{
			"i": "design_10_editor_theme",
			"l": "CodeMirror Editor Theme",
			"t": "document",
			"f": "docs/design/10-editor-theme.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_11_style_aggregation",
			"l": "Style Aggregation (index.sass)",
			"t": "document",
			"f": "docs/design/11-style-aggregation.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 4
		},
		{
			"i": "design_13_control_text_taxonomy",
			"l": "Button, Text-Role, and Sidebar-Tab Taxonomy",
			"t": "document",
			"f": "docs/design/13-control-text-taxonomy.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 7
		},
		{
			"i": "design_ai_memory_architecture",
			"l": "Local-First AI Memory & Context Harness Design",
			"t": "document",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 11
		},
		{
			"i": "design_design",
			"l": "Design System Entry Point (DESIGN.md)",
			"t": "document",
			"f": "docs/design/DESIGN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 8
		},
		{
			"i": "design_media_module",
			"l": "Media Module Design",
			"t": "document",
			"f": "docs/design/media-module.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "guides_add_a_command_or_keybinding",
			"l": "Guide: Adding a Command or Keybinding",
			"t": "document",
			"f": "docs/guides/add-a-command-or-keybinding.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "guides_add_a_module",
			"l": "Guide: Adding a Module",
			"t": "document",
			"f": "docs/guides/add-a-module.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 6
		},
		{
			"i": "guides_add_an_ipc_function",
			"l": "Guide: Adding an IPC Function",
			"t": "document",
			"f": "docs/guides/add-an-ipc-function.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 3
		},
		{
			"i": "guides_render_external_html",
			"l": "Guide: Rendering External HTML",
			"t": "document",
			"f": "docs/guides/render-external-html.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "guides_write_a_two_stream_plan",
			"l": "Guide: Writing a Two-Stream Plan",
			"t": "document",
			"f": "docs/guides/write-a-two-stream-plan.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "performance_ai_chat_performance",
			"l": "AI Chat Performance Diagnosis (remediated)",
			"t": "document",
			"f": "docs/performance/ai-chat-performance.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 11
		},
		{
			"i": "plans_ai_layer_fresh_plan",
			"l": "Fresh AI Layer Implementation Plan",
			"t": "document",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 7
		},
		{
			"i": "plans_ai_layer_remediation_plan",
			"l": "AI Layer Remediation Plan (Two-Stream, executed)",
			"t": "document",
			"f": "docs/plans/AI-LAYER-REMEDIATION-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 14
		},
		{
			"i": "design_01_tokens",
			"l": "CSS Custom Property Tokens Reference",
			"t": "document",
			"f": "docs/design/01-tokens.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_12_token_theme_mapping",
			"l": "Token-Theme Mapping Reference",
			"t": "document",
			"f": "docs/design/12-token-theme-mapping.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_04_layout_system_app_shell",
			"l": "App Shell Full-Viewport Flex Layout",
			"t": "concept",
			"f": "docs/design/04-layout-system.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_05_utility_primitives_box_row_grid",
			"l": "Box/Row/Grid Layout Utility Classes",
			"t": "concept",
			"f": "docs/design/05-utility-primitives.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_06_animations_module_vertical_wipe",
			"l": "module-vertical-wipe View Transition",
			"t": "concept",
			"f": "docs/design/06-animations.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_09_mixins_breakpoints_breakpoint_mixins",
			"l": "Breakpoint Mixins (bp-xs/sm/bs/lg/xl)",
			"t": "concept",
			"f": "docs/design/09-mixins-breakpoints.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_10_editor_theme_customeditortheme",
			"l": "customEditorTheme (CodeMirror token-mapped theme)",
			"t": "concept",
			"f": "docs/design/10-editor-theme.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_13_control_text_taxonomy_btn_family",
			"l": "btn-* Button Class Family",
			"t": "concept",
			"f": "docs/design/13-control-text-taxonomy.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_13_control_text_taxonomy_text_roles",
			"l": "text-* Panel/List Text Roles",
			"t": "concept",
			"f": "docs/design/13-control-text-taxonomy.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_13_control_text_taxonomy_sidebar_tab_item",
			"l": ".sidebar-tab-item Sidebar Tab Family",
			"t": "concept",
			"f": "docs/design/13-control-text-taxonomy.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_design_two_layer_token_architecture",
			"l": "Two-Layer Token Architecture",
			"t": "concept",
			"f": "docs/design/DESIGN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 3
		},
		{
			"i": "design_ai_memory_architecture_memoryitem",
			"l": "MemoryItem (typed atomic memory unit)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_ai_memory_architecture_memory_pipeline",
			"l": "Capture-Extract-Embed-Consolidate Pipeline",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_ai_memory_architecture_agentmemory",
			"l": "agentmemory (prior-art system)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_ai_memory_architecture_memu",
			"l": "memU (prior-art system)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "design_ai_memory_architecture_honcho",
			"l": "Honcho (prior-art system)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_ai_memory_architecture_graphiti",
			"l": "Graphiti (prior-art system)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "design_ai_memory_architecture_trellis",
			"l": "Trellis (prior-art system)",
			"t": "concept",
			"f": "docs/design/AI-MEMORY-ARCHITECTURE.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "plans_ai_layer_fresh_plan_provideradapter",
			"l": "ProviderAdapter Interface",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "plans_ai_layer_fresh_plan_unified_model_registry",
			"l": "Single Model Registry + activeModelId Pointer",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "plans_ai_layer_fresh_plan_runid_stream_contract",
			"l": "Generation-Stamped Stream Contract (runId/seq)",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "plans_ai_layer_fresh_plan_aiipc",
			"l": "AiIpc Gateway Interface with Mock Parity",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "plans_ai_layer_fresh_plan_pitfalls_ledger",
			"l": "Pitfalls Ledger (debugged predecessor defects)",
			"t": "rationale",
			"f": "docs/plans/AI-LAYER-FRESH-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "plans_ai_layer_remediation_plan_frozen_contract",
			"l": "Frozen Contract (modelRegistry.contract.ts)",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-REMEDIATION-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 3
		},
		{
			"i": "plans_ai_layer_remediation_plan_two_stream_ownership",
			"l": "Two-Stream File Ownership Matrix",
			"t": "concept",
			"f": "docs/plans/AI-LAYER-REMEDIATION-PLAN.md",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 1
		},
		{
			"i": "styles_index",
			"l": "src/lib/styles/index.sass",
			"t": "code",
			"f": "src/lib/styles/index.sass",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 4
		},
		{
			"i": "styles__tokens",
			"l": "src/lib/styles/_tokens.sass",
			"t": "code",
			"f": "src/lib/styles/_tokens.sass",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "styles__commons",
			"l": "src/lib/styles/_commons.sass",
			"t": "code",
			"f": "src/lib/styles/_commons.sass",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 3
		},
		{
			"i": "lib_editortheme",
			"l": "src/lib/editorTheme.ts",
			"t": "code",
			"f": "src/lib/editorTheme.ts",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "components_settingsdialog",
			"l": "src/lib/components/SettingsDialog.svelte",
			"t": "code",
			"f": "src/lib/components/SettingsDialog.svelte",
			"u": "",
			"chunks": [
				"design/04-layout-system.md"
			],
			"d": 2
		},
		{
			"i": "plans_ai_module_plan",
			"l": "AI Module Plan",
			"t": "document",
			"f": "docs/plans/AI-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_bits_ui_adoption_plan",
			"l": "Bits UI Adoption Plan",
			"t": "document",
			"f": "docs/plans/BITS-UI-ADOPTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_browser_module_plan",
			"l": "Browser Module Ground-Up Implementation Plan",
			"t": "document",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 7
		},
		{
			"i": "plans_browser_module_tasks",
			"l": "Browser Module Execution Task Streams",
			"t": "document",
			"f": "docs/plans/BROWSER-MODULE-TASKS.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_contribution_registry_plan",
			"l": "Contribution Registry Plan",
			"t": "document",
			"f": "docs/plans/CONTRIBUTION-REGISTRY-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_data_layer_plan",
			"l": "Data Layer Plan",
			"t": "document",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_designer_extraction_plan",
			"l": "Designer Extraction Plan",
			"t": "document",
			"f": "docs/plans/DESIGNER-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_designer_hygiene_plan",
			"l": "Designer Hygiene Feature Build-Out Plan",
			"t": "document",
			"f": "docs/plans/DESIGNER-HYGIENE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_docs_migration_plan",
			"l": "Docs Migration Plan",
			"t": "document",
			"f": "docs/plans/DOCS-MIGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_ide_extraction_plan",
			"l": "IDE Extraction Plan",
			"t": "document",
			"f": "docs/plans/IDE-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_macos_dictation_feature_spec",
			"l": "macOS Dictation Feature Spec",
			"t": "document",
			"f": "docs/plans/MACOS-DICTATION-FEATURE-SPEC.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 4
		},
		{
			"i": "plans_notes_extraction_plan",
			"l": "Notes Extraction Plan",
			"t": "document",
			"f": "docs/plans/NOTES-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_security_contract_plan",
			"l": "Security Contract Plan",
			"t": "document",
			"f": "docs/plans/SECURITY-CONTRACT-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_skaa_integration_plan",
			"l": "SKAA Integration Plan",
			"t": "document",
			"f": "docs/plans/SKAA-INTEGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_spatial_canvas_migration",
			"l": "Spatial Canvas Migration Plan",
			"t": "document",
			"f": "docs/plans/SPATIAL_CANVAS_MIGRATION.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_spatial_canvas_tasks",
			"l": "Spatial Canvas Tasks Plan",
			"t": "document",
			"f": "docs/plans/SPATIAL_CANVAS_TASKS.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_undo_engine_plan",
			"l": "Undo Engine Plan",
			"t": "document",
			"f": "docs/plans/UNDO-ENGINE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_media_module_plan",
			"l": "Media Module Plan (fractalMedia Owned-Library)",
			"t": "document",
			"f": "docs/plans/media-module-plan.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_memory_and_harness_module",
			"l": "Memory and Harness Module Plan (Shared Memory MVE)",
			"t": "document",
			"f": "docs/plans/memory-and-harness-module.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "src_app_html",
			"l": "app.html SvelteKit Shell",
			"t": "code",
			"f": "src/app.html",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 0
		},
		{
			"i": "plans_ai_module_plan_fractalai",
			"l": "fractalAI Workspace Template",
			"t": "concept",
			"f": "docs/plans/AI-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_bits_ui_adoption_plan_fractalui",
			"l": "fractalui Bits UI Wrapper Layer",
			"t": "concept",
			"f": "docs/plans/BITS-UI-ADOPTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_browser_module_plan_browser_module",
			"l": "Browser Module",
			"t": "concept",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 6
		},
		{
			"i": "plans_browser_module_plan_browserregistry",
			"l": "BrowserRegistry (window/tab engine)",
			"t": "concept",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_browser_module_plan_password_vault_v2",
			"l": "Password Vault v2",
			"t": "concept",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_browser_module_plan_overlaycoordinator",
			"l": "overlayCoordinator",
			"t": "concept",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "unit_browser_demolition_test",
			"l": "browser-demolition.test.ts",
			"t": "code",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "lib_ipc_ipcapi",
			"l": "IpcApi Contract Interface",
			"t": "code",
			"f": "docs/plans/SECURITY-CONTRACT-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "unit_html_boundary_test",
			"l": "html-boundary.test.ts",
			"t": "code",
			"f": "docs/plans/SECURITY-CONTRACT-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_contribution_registry_plan_contributionregistry",
			"l": "ContributionRegistry",
			"t": "concept",
			"f": "docs/plans/CONTRIBUTION-REGISTRY-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "unit_contribution_contracts_test",
			"l": "contribution-contracts.test.ts",
			"t": "code",
			"f": "docs/plans/CONTRIBUTION-REGISTRY-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_data_layer_plan_data_layer",
			"l": "App-Global SQLite Data Layer (fractalengine.db)",
			"t": "concept",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 5
		},
		{
			"i": "plans_data_layer_plan_bookmarks_module",
			"l": "Bookmarks Module (fractalMarks)",
			"t": "concept",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "components_virtuallist",
			"l": "VirtualList.svelte",
			"t": "code",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "components_searchoverlay",
			"l": "SearchOverlay.svelte (Search Everything)",
			"t": "code",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_designer_extraction_plan_designer_module",
			"l": "Designer Module",
			"t": "concept",
			"f": "docs/plans/DESIGNER-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_designer_hygiene_plan_paint_model",
			"l": "Paint Model (engine/paint.ts)",
			"t": "concept",
			"f": "docs/plans/DESIGNER-HYGIENE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "state_designcanvas_svelte_canvasstate",
			"l": "CanvasState (designcanvas.svelte.ts)",
			"t": "code",
			"f": "docs/plans/DESIGNER-HYGIENE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_docs_migration_plan_docs_areas",
			"l": "Four-Layer Docs System (areas/guides/plans/archive)",
			"t": "concept",
			"f": "docs/plans/DOCS-MIGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "unit_docs_contracts_test",
			"l": "docs-contracts.test.ts",
			"t": "code",
			"f": "docs/plans/DOCS-MIGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_ide_extraction_plan_ide_module",
			"l": "IDE Module",
			"t": "concept",
			"f": "docs/plans/IDE-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "state_ide_svelte_idestate",
			"l": "ideState Kernel (ide.svelte.ts)",
			"t": "code",
			"f": "docs/plans/IDE-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 5
		},
		{
			"i": "state_ide_svelte_vaultbridge",
			"l": "VaultBridge Seam",
			"t": "code",
			"f": "docs/plans/NOTES-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_notes_extraction_plan_notes_module",
			"l": "Notes Module",
			"t": "concept",
			"f": "docs/plans/NOTES-EXTRACTION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "state_undohistory_svelte_undohistory",
			"l": "UndoHistory Engine",
			"t": "code",
			"f": "docs/plans/UNDO-ENGINE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "state_undohistory_svelte_compositeundodomain",
			"l": "compositeUndoDomain Helper",
			"t": "code",
			"f": "docs/plans/UNDO-ENGINE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_macos_dictation_feature_spec_dictation_controller",
			"l": "Dictation Controller",
			"t": "concept",
			"f": "docs/plans/MACOS-DICTATION-FEATURE-SPEC.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_macos_dictation_feature_spec_surface_adapter",
			"l": "Dictation Surface-Adapter Contract",
			"t": "concept",
			"f": "docs/plans/MACOS-DICTATION-FEATURE-SPEC.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_skaa_integration_plan_skaa_contract",
			"l": "SKAA Memory Contract",
			"t": "concept",
			"f": "docs/plans/SKAA-INTEGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "plans_spatial_canvas_migration_spatial_canvas",
			"l": "Spatial Canvas (Board / Tile / Template)",
			"t": "concept",
			"f": "docs/plans/SPATIAL_CANVAS_MIGRATION.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 4
		},
		{
			"i": "state_canvas_svelte_canvasstore",
			"l": "CanvasStore (canvas.svelte.ts)",
			"t": "code",
			"f": "docs/plans/SPATIAL_CANVAS_MIGRATION.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "data_tilekinds",
			"l": "tileKinds.ts Registry",
			"t": "code",
			"f": "docs/plans/SPATIAL_CANVAS_MIGRATION.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "data_templates",
			"l": "templates.ts (App Templates)",
			"t": "code",
			"f": "docs/plans/SPATIAL_CANVAS_MIGRATION.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_media_module_plan_media_module",
			"l": "fractalMedia Module (Owned Library)",
			"t": "concept",
			"f": "docs/plans/media-module-plan.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 6
		},
		{
			"i": "plans_media_module_plan_import_engine",
			"l": "Media Import Engine",
			"t": "concept",
			"f": "docs/plans/media-module-plan.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_media_module_plan_paneforge",
			"l": "PaneForge Pane Shell Standard",
			"t": "concept",
			"f": "docs/plans/media-module-plan.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "plans_memory_and_harness_module_memory_projection",
			"l": "Project-Memory Projection (memory-mve/v1)",
			"t": "concept",
			"f": "docs/plans/memory-and-harness-module.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "plans_memory_and_harness_module_evaluation_harness",
			"l": "Memory MVE Evaluation Harness",
			"t": "concept",
			"f": "docs/plans/memory-and-harness-module.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "adr_007",
			"l": "ADR-007 (Browser/Vault, partially stale)",
			"t": "document",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "adr_011",
			"l": "ADR-011 Local-First AI Memory and Context Harness",
			"t": "document",
			"f": "docs/plans/SKAA-INTEGRATION-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "adr_024",
			"l": "ADR-024 AI Module Embed-Don't-Rewrite",
			"t": "document",
			"f": "docs/plans/AI-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "adr_025",
			"l": "ADR-025 Contribution Registry",
			"t": "document",
			"f": "docs/plans/CONTRIBUTION-REGISTRY-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "adr_026",
			"l": "ADR-026 Snapshot-Transaction Undo Engine",
			"t": "document",
			"f": "docs/plans/UNDO-ENGINE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 2
		},
		{
			"i": "adr_027",
			"l": "ADR-027 Data Layer / Mock Engine",
			"t": "document",
			"f": "docs/plans/DATA-LAYER-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "adr_028",
			"l": "ADR-028 Security Boundaries and Contract-Typed IPC",
			"t": "document",
			"f": "docs/plans/SECURITY-CONTRACT-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 3
		},
		{
			"i": "adr_029",
			"l": "ADR-029 Browser Module Rebuild (planned)",
			"t": "document",
			"f": "docs/plans/BROWSER-MODULE-PLAN.md",
			"u": "",
			"chunks": [
				"plans/AI-MODULE-PLAN.md"
			],
			"d": 1
		},
		{
			"i": "other_sidebar_tabs_sidebar_tabs",
			"l": "Sidebar Tabs Mockup",
			"t": "image",
			"f": "docs/archive/other/sidebar-tabs.png",
			"u": "",
			"chunks": [
				"other"
			],
			"d": 3
		},
		{
			"i": "other_sidebar_tabs_tab_group",
			"l": "Segmented Tab Group (Current Tab / Other Tab / Other Tab)",
			"t": "concept",
			"f": "docs/archive/other/sidebar-tabs.png",
			"u": "",
			"chunks": [
				"other"
			],
			"d": 3
		},
		{
			"i": "other_sidebar_tabs_active_tab_state",
			"l": "Active Tab Highlight State",
			"t": "concept",
			"f": "docs/archive/other/sidebar-tabs.png",
			"u": "",
			"chunks": [
				"other"
			],
			"d": 1
		},
		{
			"i": "other_sidebar_tabs_sidebar_panel",
			"l": "Sidebar Panel Layout",
			"t": "concept",
			"f": "docs/archive/other/sidebar-tabs.png",
			"u": "",
			"chunks": [
				"other"
			],
			"d": 2
		},
		{
			"i": "other_sidebar_tabs_dark_theme",
			"l": "Dark Theme UI Styling",
			"t": "concept",
			"f": "docs/archive/other/sidebar-tabs.png",
			"u": "",
			"chunks": [
				"other"
			],
			"d": 1
		},
		{
			"i": "daw_serum_serum_ui",
			"l": "Serum 2 Synthesizer UI Screenshot",
			"t": "image",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 9
		},
		{
			"i": "daw_serum_serum2_synth",
			"l": "Serum 2 (Xfer Records Wavetable Synth)",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 1
		},
		{
			"i": "daw_serum_oscillator_section",
			"l": "Oscillator Section (Sub, Osc A/B Wavetable, Osc C Granular, ",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 2
		},
		{
			"i": "daw_serum_wavetable_visualization",
			"l": "3D Wavetable Visualization",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 1
		},
		{
			"i": "daw_serum_filter_section",
			"l": "Dual Filter Section (Cutoff, Res, Drive, Damp, Mix)",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 1
		},
		{
			"i": "daw_serum_modulation_system",
			"l": "Modulation System (Envelopes, LFOs, Velo/Note Curves)",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 2
		},
		{
			"i": "daw_serum_macro_controls",
			"l": "Macro Controls Panel (8 Assignable Macros)",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 1
		},
		{
			"i": "daw_serum_lfo_path_editor",
			"l": "LFO Path Editor (2D Bezier Curve Modulation)",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 2
		},
		{
			"i": "daw_serum_keyboard_arp_bar",
			"l": "Bottom Keyboard/Arp/Clip Bar",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 1
		},
		{
			"i": "daw_serum_dark_knob_design",
			"l": "Dense Dark-Theme Knob-Grid Design Language",
			"t": "rationale",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 2
		},
		{
			"i": "daw_serum_daw_ui_reference",
			"l": "DAW UI Reference Collection",
			"t": "concept",
			"f": "docs/archive/daw/serum.png",
			"u": "",
			"chunks": [
				"daw"
			],
			"d": 2
		}
	],
	"links": [
		{
			"s": "docs_index",
			"t": "adr_adr_001_tauri_sveltekit_framework",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_001_tauri_sveltekit_framework",
			"t": "adr_adr_002_svelte_5_state_management",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_001_tauri_sveltekit_framework",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_001_tauri_sveltekit_framework",
			"t": "adr_adr_003_css_token_system_with_sass",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_001_tauri_sveltekit_framework",
			"t": "adr_adr_001_tauri_sveltekit_framework_tauri",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_001_tauri_sveltekit_framework",
			"t": "adr_adr_001_tauri_sveltekit_framework_sveltekit",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_002_svelte_5_state_management",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_002_svelte_5_state_management",
			"t": "adr_adr_002_svelte_5_state_management_runes",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_canvas_svelte",
			"t": "adr_adr_002_svelte_5_state_management_runes",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte",
			"t": "adr_adr_002_svelte_5_state_management_runes",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_004_single_ipc_gateway_module",
			"t": "adr_adr_004_single_ipc_gateway_module_ipc_gateway",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc",
			"t": "adr_adr_004_single_ipc_gateway_module_ipc_gateway",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc_mock",
			"t": "adr_adr_004_single_ipc_gateway_module_ipc_gateway",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc",
			"t": "lib_ipc_mock",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc",
			"t": "src_lib",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte",
			"t": "lib_ipc",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_004_single_ipc_gateway_module",
			"t": "adr_adr_007_browser_with_password_vault_and_2fa",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_005_spatial_canvas_layout",
			"t": "adr_adr_010_classic_ide_layout_integration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_005_spatial_canvas_layout",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_canvas",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tile",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tiledock",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_minimap",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_templategallery",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_canvas_svelte",
			"t": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tiledock",
			"t": "adr_adr_005_spatial_canvas_layout_tilekinds_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_006_undo_redo_boundary",
			"t": "adr_adr_002_svelte_5_state_management",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_006_undo_redo_boundary",
			"t": "adr_adr_005_spatial_canvas_layout",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_006_undo_redo_boundary",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_006_undo_redo_boundary",
			"t": "adr_adr_006_undo_redo_boundary_snapshot_undo",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_undo_svelte",
			"t": "adr_adr_006_undo_redo_boundary_snapshot_undo",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte",
			"t": "adr_adr_006_undo_redo_boundary_snapshot_undo",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_008_workspace_serialization_format",
			"t": "adr_adr_005_spatial_canvas_layout",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_008_workspace_serialization_format",
			"t": "adr_adr_008_workspace_serialization_format_fractal_workspace",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_008_workspace_serialization_format",
			"t": "adr_adr_008_workspace_serialization_format_menu_event_bridge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_lib",
			"t": "adr_adr_008_workspace_serialization_format_menu_event_bridge",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_008_workspace_serialization_format_menu_event_bridge",
			"t": "state_ide_svelte",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_009_ai_providers_and_custom_models_settings",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_009_ai_providers_and_custom_models_settings",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_009_ai_providers_and_custom_models_settings",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_009_ai_providers_and_custom_models_settings",
			"t": "adr_adr_009_ai_providers_and_custom_models_settings_custom_model_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte",
			"t": "adr_adr_009_ai_providers_and_custom_models_settings_custom_model_registry",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_010_classic_ide_layout_integration",
			"t": "adr_adr_005_spatial_canvas_layout",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_010_classic_ide_layout_integration",
			"t": "adr_adr_010_classic_ide_layout_integration_classic_layout",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_classicidelayout",
			"t": "adr_adr_010_classic_ide_layout_integration_classic_layout",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness_memory_harness",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_memory",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness_memory_harness",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"t": "adr_adr_013_notes_vault_persistence",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"t": "adr_adr_014_document_level_drag_resize_pattern",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"t": "adr_adr_012_markdown_notes_wiki_with_tiptap_tiptap",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_noteseditor",
			"t": "adr_adr_012_markdown_notes_wiki_with_tiptap_tiptap",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "notes_frontmatter",
			"t": "adr_adr_012_markdown_notes_wiki_with_tiptap_tiptap",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_013_notes_vault_persistence",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_013_notes_vault_persistence",
			"t": "adr_adr_008_workspace_serialization_format",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_013_notes_vault_persistence",
			"t": "adr_adr_013_notes_vault_persistence_notes_vault",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte",
			"t": "adr_adr_013_notes_vault_persistence_notes_vault",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_013_notes_vault_persistence_notes_vault",
			"t": "lib_ipc",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_014_document_level_drag_resize_pattern",
			"t": "adr_adr_010_classic_ide_layout_integration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_014_document_level_drag_resize_pattern",
			"t": "adr_adr_014_document_level_drag_resize_pattern_document_level_mousemove",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_noteslayout",
			"t": "adr_adr_014_document_level_drag_resize_pattern_document_level_mousemove",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_classicidelayout",
			"t": "adr_adr_014_document_level_drag_resize_pattern_document_level_mousemove",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_noteseditor",
			"t": "components_noteslayout",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_015_app_template_routing_and_state_domains",
			"t": "adr_adr_010_classic_ide_layout_integration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_015_app_template_routing_and_state_domains",
			"t": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_015_app_template_routing_and_state_domains",
			"t": "adr_adr_015_app_template_routing_and_state_domains_template_router",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_015_app_template_routing_and_state_domains_template_router",
			"t": "state_ide_svelte",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"t": "adr_adr_007_browser_with_password_vault_and_2fa",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"t": "adr_adr_016_shared_envelope_encryption_crypto_module_envelope_encryption",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_crypto",
			"t": "adr_adr_016_shared_envelope_encryption_crypto_module_envelope_encryption",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_lib",
			"t": "src_crypto",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_memory",
			"t": "src_crypto",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots_root_containment",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_lib",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots_root_containment",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "lib_ipc_mock",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots_root_containment",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_019_separate_sveltekit_generation_directories",
			"t": "adr_adr_001_tauri_sveltekit_framework",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_019_separate_sveltekit_generation_directories",
			"t": "adr_adr_019_separate_sveltekit_generation_directories_dual_generation_dirs",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_020_isolate_built_artifact_browser_tests",
			"t": "adr_adr_019_separate_sveltekit_generation_directories",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_020_isolate_built_artifact_browser_tests",
			"t": "adr_adr_020_isolate_built_artifact_browser_tests_isolated_preview_tests",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_020_isolate_built_artifact_browser_tests_isolated_preview_tests",
			"t": "adr_adr_019_separate_sveltekit_generation_directories_dual_generation_dirs",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_021_designer_module_extraction",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_021_designer_module_extraction",
			"t": "adr_adr_003_css_token_system_with_sass",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_021_designer_module_extraction",
			"t": "adr_adr_021_designer_module_extraction_module_pattern",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_022_notes_module_extraction",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_022_notes_module_extraction",
			"t": "adr_adr_021_designer_module_extraction_module_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_022_notes_module_extraction",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_013_notes_vault_persistence_notes_vault",
			"t": "adr_adr_008_workspace_serialization_format_fractal_workspace",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "adr_adr_016_shared_envelope_encryption_crypto_module_envelope_encryption",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots_root_containment",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "adr_adr_005_spatial_canvas_layout_spatial_canvas",
			"t": "adr_adr_010_classic_ide_layout_integration_classic_layout",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_011_local_first_ai_memory_and_context_harness_memory_harness",
			"t": "adr_adr_004_single_ipc_gateway_module_ipc_gateway",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_009_ai_providers_and_custom_models_settings_custom_model_registry",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness_memory_harness",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_022_notes_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_010_classic_ide_layout_integration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral_kernel_deferral",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral_undo_self_registration",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral_core_module_edges",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_025_contribution_registry",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite_embed_dont_rewrite",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite_session_meta_overlay",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite_single_live_conversation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_024_ai_module_embed_dont_rewrite_session_meta_overlay",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_022_notes_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry",
			"t": "adr_adr_025_contribution_registry_contract_test",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_025_contribution_registry_contract_test",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_023_ide_module_extraction_and_kernel_deferral_undo_self_registration",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_022_notes_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_023_ide_module_extraction_and_kernel_deferral",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine",
			"t": "adr_adr_026_core_undo_engine_undohistory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine_transact",
			"t": "adr_adr_026_core_undo_engine_undohistory",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine_compositeundodomain",
			"t": "adr_adr_026_core_undo_engine_undohistory",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_026_core_undo_engine_undohistory",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_026_core_undo_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_027_data_layer_mock_engine_mock_engine",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_027_data_layer_mock_engine_virtuallist",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_027_data_layer_mock_engine_searchoverlay",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine",
			"t": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine_searchoverlay",
			"t": "adr_adr_027_data_layer_mock_engine_virtuallist",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine_searchoverlay",
			"t": "adr_adr_027_data_layer_mock_engine_mock_engine",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"t": "adr_adr_027_data_layer_mock_engine_virtuallist",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"t": "adr_adr_026_core_undo_engine_undohistory",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"t": "adr_adr_026_core_undo_engine_transact",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_027_data_layer_mock_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_028_security_boundaries_contract_ipc_trust_zones",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc",
			"t": "adr_adr_028_security_boundaries_contract_ipc_guard_tests",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc_trust_zones",
			"t": "adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
			"r": "rationale_for",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc_guard_tests",
			"t": "adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc_guard_tests",
			"t": "adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
			"t": "adr_adr_027_data_layer_mock_engine_mock_engine",
			"r": "shares_data_with",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_009_ai_providers_and_custom_models_settings",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_028_security_boundaries_contract_ipc",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery_model_registry_v2",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_030_single_add_model_flow",
			"t": "adr_adr_009_ai_providers_and_custom_models_settings",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_030_single_add_model_flow",
			"t": "adr_adr_030_single_add_model_flow_add_model_modal",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_030_single_add_model_flow",
			"t": "adr_adr_030_single_add_model_flow_settings_bridge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_030_single_add_model_flow",
			"t": "adr_adr_032_immediate_byok_model_configuration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_031_single_control_and_text_class_taxonomy",
			"t": "adr_adr_003_css_token_system_with_sass",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_031_single_control_and_text_class_taxonomy",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_031_single_control_and_text_class_taxonomy",
			"t": "adr_adr_031_single_control_and_text_class_taxonomy_control_text_taxonomy",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_031_single_control_and_text_class_taxonomy_control_text_taxonomy",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scribbles_module_layout_conventions",
			"t": "adr_adr_031_single_control_and_text_class_taxonomy_control_text_taxonomy",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "adr_adr_032_immediate_byok_model_configuration",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_032_immediate_byok_model_configuration",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_032_immediate_byok_model_configuration",
			"t": "adr_adr_030_single_add_model_flow",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_032_immediate_byok_model_configuration",
			"t": "adr_adr_032_immediate_byok_model_configuration_immediate_byok",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_032_immediate_byok_model_configuration_immediate_byok",
			"t": "adr_adr_030_single_add_model_flow_settings_bridge",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_030_single_add_model_flow",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_032_immediate_byok_model_configuration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_033_unified_model_management_and_local_status_cue_ai_models_tab",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue",
			"t": "adr_adr_033_unified_model_management_and_local_status_cue_local_status_cue",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue_ai_models_tab",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery_model_registry_v2",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_033_unified_model_management_and_local_status_cue_ai_models_tab",
			"t": "adr_adr_032_immediate_byok_model_configuration_immediate_byok",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_034_snippet_rendered_virtual_list_rows",
			"t": "adr_adr_027_data_layer_mock_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_034_snippet_rendered_virtual_list_rows",
			"t": "adr_adr_028_security_boundaries_contract_ipc",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_034_snippet_rendered_virtual_list_rows",
			"t": "adr_adr_034_snippet_rendered_virtual_list_rows_snippet_rows",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_034_snippet_rendered_virtual_list_rows_snippet_rows",
			"t": "adr_adr_027_data_layer_mock_engine_virtuallist",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_034_snippet_rendered_virtual_list_rows_snippet_rows",
			"t": "adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store",
			"t": "adr_adr_028_security_boundaries_contract_ipc",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store",
			"t": "adr_adr_032_immediate_byok_model_configuration",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store",
			"t": "adr_adr_035_envelope_encrypted_api_key_store_keyring_backend",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store",
			"t": "adr_adr_035_envelope_encrypted_api_key_store_envelope_store",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store_keyring_backend",
			"t": "adr_adr_035_envelope_encrypted_api_key_store_envelope_store",
			"r": "rationale_for",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store_envelope_store",
			"t": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "adr_adr_035_envelope_encrypted_api_key_store_envelope_store",
			"t": "adr_adr_032_immediate_byok_model_configuration_immediate_byok",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_006_undo_redo_boundary",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_007_browser_with_password_vault_and_2fa",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_016_shared_envelope_encryption_crypto_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_028_security_boundaries_contract_ipc",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_036_browser_module_rebuild_native_tab_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild",
			"t": "adr_adr_036_browser_module_rebuild_session_snapshot",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_036_browser_module_rebuild_session_snapshot",
			"t": "adr_adr_039_complete_owned_library_media_workflow_watcher_reconciliation",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge",
			"t": "adr_adr_025_contribution_registry",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge",
			"t": "adr_adr_026_core_undo_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge",
			"t": "adr_adr_028_security_boundaries_contract_ipc",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge",
			"t": "adr_adr_038_use_native_on_device_dictation_bridge_dictation_bridge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge_dictation_bridge",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_038_use_native_on_device_dictation_bridge_dictation_bridge",
			"t": "adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_018_contain_filesystem_ipc_to_user_selected_roots",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_025_contribution_registry",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_026_core_undo_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_027_data_layer_mock_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_039_complete_owned_library_media_workflow_media_undo",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow",
			"t": "adr_adr_039_complete_owned_library_media_workflow_watcher_reconciliation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "adr_adr_039_complete_owned_library_media_workflow_media_undo",
			"t": "adr_adr_026_core_undo_engine_transact",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_25_06_2026_code_fixing_auditing_v1",
			"t": "adr_adr_013_notes_vault_persistence",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_history",
			"t": "adr_adr_012_markdown_notes_wiki_with_tiptap",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_history",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "archive_history",
			"t": "adr_adr_007_browser_with_password_vault_and_2fa",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "archive_history",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite_embed_dont_rewrite",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "archive_scanner",
			"t": "adr_adr_026_core_undo_engine_undohistory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scanner",
			"t": "adr_adr_038_use_native_on_device_dictation_bridge_dictation_bridge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scanner",
			"t": "adr_adr_025_contribution_registry_contributionregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scanner",
			"t": "adr_adr_027_data_layer_mock_engine_bookmarks_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scanner",
			"t": "adr_adr_004_single_ipc_gateway_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scribbles",
			"t": "archive_scribbles_media_module_wishlist",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scribbles",
			"t": "archive_scribbles_module_layout_conventions",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "archive_scribbles_media_module_wishlist",
			"t": "adr_adr_039_complete_owned_library_media_workflow",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "archive_scribbles",
			"t": "adr_adr_036_browser_module_rebuild",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "bitsui_docs_child_snippet_child_snippet",
			"t": "bitsui_docs_child_snippet_mergeprops",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_child_snippet_child_snippet",
			"t": "bitsui_docs_styling_styling",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_child_snippet_child_snippet",
			"t": "bitsui_docs_transitions_transitions",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_child_snippet_floating_content",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_combobox_combobox",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_dropdown_menu_dropdown_menu",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_link_preview_link_preview",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_menubar_menubar",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_popover_popover",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_select_select",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tooltip_tooltip",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_dates_datevalue",
			"t": "bitsui_docs_dates_internationalized_date",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_dates_daterange",
			"t": "bitsui_docs_dates_datevalue",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_field_date_range_field",
			"t": "bitsui_docs_dates_daterange",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "bitsui_docs_dates_daterange",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_range_calendar_range_calendar",
			"t": "bitsui_docs_dates_daterange",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_calendar_calendar",
			"t": "bitsui_docs_dates_datevalue",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_field_date_field",
			"t": "bitsui_docs_dates_datevalue",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "bitsui_docs_dates_datevalue",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_figma_file_figma_ui_kit",
			"t": "components_aspect_ratio_aspect_ratio",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_figma_file_figma_ui_kit",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_getting_started_getting_started",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_getting_started_getting_started",
			"t": "components_accordion_accordion",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_getting_started_getting_started",
			"t": "components_button_button",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_getting_started_getting_started",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_getting_started_getting_started",
			"t": "bitsui_docs_state_management_state_management",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_introduction_bits_ui",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_introduction_bits_ui",
			"t": "bitsui_docs_styling_styling",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_llms_llms_txt",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_llms_llms_txt",
			"t": "components_accordion_accordion",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "bitsui_docs_ref_ref_prop",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "bitsui_docs_transitions_transitions",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_accordion_accordion",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_alert_dialog_alert_dialog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_button_button",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_checkbox_checkbox",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_combobox_combobox",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_context_menu_context_menu",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_dropdown_menu_dropdown_menu",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_menubar_menubar",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_pin_input_pin_input",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_popover_popover",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_radio_group_radio_group",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_scroll_area_scroll_area",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_select_select",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_slider_slider",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_migration_guide_migration_guide",
			"t": "components_tooltip_tooltip",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_ref_ref_prop",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_ref_ref_prop",
			"t": "bitsui_docs_ref_withelementref",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_styling_styling",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_styling_styling",
			"t": "bitsui_docs_child_snippet_mergeprops",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_styling_styling",
			"t": "components_accordion_accordion",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_transitions_transitions",
			"t": "bitsui_docs_child_snippet_child_snippet",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_transitions_transitions",
			"t": "components_dialog_dialog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_transitions_transitions",
			"t": "components_popover_popover",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "bitsui_docs_transitions_transitions",
			"t": "bitsui_docs_child_snippet_floating_content",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_checkbox_checkbox",
			"t": "components_label_label",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_combobox_combobox",
			"t": "bitsui_docs_child_snippet_mergeprops",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_accordion_accordion",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_alert_dialog_alert_dialog",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_aspect_ratio_aspect_ratio",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_avatar_avatar",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_button_button",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_calendar_calendar",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_checkbox_checkbox",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_collapsible_collapsible",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_combobox_combobox",
			"t": "bitsui_docs_introduction_bits_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_accordion_accordion",
			"t": "components_collapsible_collapsible",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_combobox_combobox",
			"t": "components_select_select",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_alert_dialog_alert_dialog",
			"t": "components_dialog_dialog",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_checkbox_checkbox",
			"t": "bitsui_docs_state_management_state_management",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_collapsible_collapsible",
			"t": "bitsui_docs_state_management_state_management",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_calendar_calendar",
			"t": "bitsui_docs_state_management_state_management",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_command_command",
			"t": "components_dialog_dialog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_command_command",
			"t": "bitsui_docs_state_management_state_management",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_context_menu_context_menu",
			"t": "bitsui_docs_transitions_transitions",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_context_menu_context_menu",
			"t": "concept_portal_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_dialog_dialog",
			"t": "concept_portal_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_dialog_dialog",
			"t": "concept_compound_component_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_dropdown_menu_dropdown_menu",
			"t": "concept_portal_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_dropdown_menu_dropdown_menu",
			"t": "bitsui_docs_transitions_transitions",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_menubar_menubar",
			"t": "concept_portal_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_menubar_menubar",
			"t": "bitsui_docs_transitions_transitions",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_popover_popover",
			"t": "concept_portal_pattern",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_popover_popover",
			"t": "bitsui_docs_transitions_transitions",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_field_date_field",
			"t": "bitsui_docs_dates_dates",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_field_date_field",
			"t": "concept_internationalized_date",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "bitsui_docs_dates_dates",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "components_date_field_date_field",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "components_calendar_calendar",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "components_popover_popover",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_picker_date_picker",
			"t": "concept_internationalized_date",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_field_date_range_field",
			"t": "components_date_field_date_field",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_field_date_range_field",
			"t": "bitsui_docs_dates_dates",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_field_date_range_field",
			"t": "concept_internationalized_date",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "components_date_range_field_date_range_field",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "components_range_calendar_range_calendar",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "components_popover_popover",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_date_range_picker_date_range_picker",
			"t": "bitsui_docs_dates_dates",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_range_calendar_range_calendar",
			"t": "bitsui_docs_dates_dates",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_link_preview_link_preview",
			"t": "concept_floating_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_link_preview_link_preview",
			"t": "bitsui_docs_transitions_transitions",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_link_preview_link_preview",
			"t": "components_popover_popover",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_popover_popover",
			"t": "concept_floating_ui",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_meter_meter",
			"t": "components_progress_progress",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_progress_progress",
			"t": "components_meter_meter",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_meter_meter",
			"t": "components_progress_progress",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_radio_group_radio_group",
			"t": "components_label_label",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_radio_group_radio_group",
			"t": "concept_form_hidden_input",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_rating_group_rating_group",
			"t": "concept_form_hidden_input",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_pin_input_pin_input",
			"t": "concept_input_otp",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_context_menu_context_menu",
			"t": "components_dropdown_menu_dropdown_menu",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_menubar_menubar",
			"t": "components_dropdown_menu_dropdown_menu",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_rating_group_rating_group",
			"t": "components_radio_group_radio_group",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "components_navigation_menu_navigation_menu",
			"t": "components_menubar_menubar",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "components_scroll_area_scrollarea",
			"t": "type_helpers_without_child_withoutchild",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_select_select",
			"t": "type_helpers_without_children_withoutchildren",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_slider_slider",
			"t": "type_helpers_without_children_withoutchildren",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_switch_switch",
			"t": "type_helpers_without_children_or_child_withoutchildrenorchild",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_time_field_timefield",
			"t": "type_helpers_without_children_or_child_withoutchildrenorchild",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_select_select",
			"t": "components_select_floating_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tooltip_tooltip",
			"t": "components_select_floating_ui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_time_range_field_timerangefield",
			"t": "components_time_field_timefield",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tooltip_tooltip",
			"t": "components_tooltip_tether",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "utilities_bits_config_bitsconfig",
			"t": "components_tooltip_tooltip",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_select_select",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_slider_slider",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_switch_switch",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tabs_tabs",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_toggle_toggle",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_toggle_group_togglegroup",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_toolbar_toolbar",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_tooltip_tooltip",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_time_field_timefield",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_time_range_field_timerangefield",
			"t": "components_select_function_binding",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "components_toggle_group_togglegroup",
			"t": "components_toggle_toggle",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "components_toolbar_toolbar",
			"t": "components_toggle_group_togglegroup",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_switch_switch",
			"t": "components_toggle_toggle",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "components_select_select",
			"t": "components_scroll_area_scrollarea",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "type_helpers_without_children_or_child_withoutchildrenorchild",
			"t": "type_helpers_without_child_withoutchild",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "type_helpers_without_children_or_child_withoutchildrenorchild",
			"t": "type_helpers_without_children_withoutchildren",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "type_helpers_without_child_withoutchild",
			"t": "type_helpers_without_children_withoutchildren",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.9
		},
		{
			"s": "policies_code_of_conduct_code_of_conduct",
			"t": "policies_tracking_bugs_and_feature_requests_tracking_bugs_and_feature_requests",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "utilities_bits_config_bitsconfig",
			"t": "components_tooltip_tether",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "utilities_merge_props_mergeprops",
			"t": "utilities_merge_props_clsx",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "utilities_portal_portal",
			"t": "utilities_portal_bitsconfig",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "utilities_merge_props_mergeprops",
			"t": "paneforge_12_styling_styling",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "daw_serum_serum_2",
			"t": "daw_serum_fractalbeats",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_wavetable_oscillator",
			"t": "daw_serum_serum_2",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_multisample_oscillator",
			"t": "daw_serum_serum_2",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_sample_oscillator",
			"t": "daw_serum_serum_2",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_granular_oscillator",
			"t": "daw_serum_serum_2",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_spectral_oscillator",
			"t": "daw_serum_serum_2",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_design_system_design_system_reference",
			"t": "styles__tokens_sass",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles__tokens_sass",
			"t": "other_design_system_semantic_tokens",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles__tokens_sass",
			"t": "other_design_system_sass_primitives",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_design_system_sass_primitives",
			"t": "other_design_system_semantic_tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_design_system_design_system_reference",
			"t": "other_design_system_typography_scale",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_design_system_design_system_reference",
			"t": "other_design_system_editortheme_codemirror",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_design_system_editortheme_codemirror",
			"t": "lib_editortheme_editortheme",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_plan",
			"t": "components_commandpalette_commandpalette",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_plan",
			"t": "lib_editortheme_editortheme",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_plan",
			"t": "other_ai_features_ai_elements_master",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_plan",
			"t": "other_ai_elements_remaster_marked",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_plan",
			"t": "other_ai_elements_remaster_mermaid",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_stream_a",
			"t": "other_ai_elements_remaster_cross_stream_contracts",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_stream_b",
			"t": "other_ai_elements_remaster_cross_stream_contracts",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_memory_rs",
			"t": "other_ai_elements_remaster_adr_011_phase1_storage",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_modelselector",
			"t": "components_commandpalette_commandpalette",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_elements_remaster_stream_b",
			"t": "other_ai_elements_remaster_modelselector",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_local_detection",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_api_providers",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_local_gguf_mlx",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_context_projects",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_marketplaces",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_features_ai_elements_master",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_ai_features_overview",
			"t": "other_ai_elements_remaster_plan",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "other_ai_features_context_projects",
			"t": "other_ai_elements_remaster_adr_011_phase1_storage",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "other_ai_features_local_gguf_mlx",
			"t": "other_app_modules_fractalai",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "other_app_modules_overview",
			"t": "other_app_modules_fractalcode",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_app_modules_overview",
			"t": "other_app_modules_fractaldesign",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_app_modules_overview",
			"t": "other_app_modules_fractalnotes",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_app_modules_overview",
			"t": "other_app_modules_fractalai",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_md_editor_spec",
			"t": "other_app_modules_fractalnotes",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "other_md_editor_spec",
			"t": "data_templates_templates",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_starter_templates_themes_spec",
			"t": "data_startertemplates_startertemplates",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_starter_templates_themes_spec",
			"t": "other_starter_templates_themes_theme_catalog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_starter_templates_themes_theme_catalog",
			"t": "other_design_system_semantic_tokens",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "paneforge_3_pane_pane",
			"t": "paneforge_1_pane_group_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_2_pane_resizer_paneresizer",
			"t": "paneforge_1_pane_group_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_1_pane_group_panegroup",
			"t": "paneforge_1_pane_group_panegroupstorage",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_4_collapsible_panes_collapsible_panes",
			"t": "paneforge_3_pane_pane",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_5_conditional_panes_conditional_panes",
			"t": "paneforge_3_pane_pane",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_6_horizontal_groups_horizontal_groups",
			"t": "paneforge_1_pane_group_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_11_vertical_groups_vertical_groups",
			"t": "paneforge_1_pane_group_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_10_reactive_size_reactive_size",
			"t": "paneforge_3_pane_pane",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_12_styling_styling",
			"t": "paneforge_1_pane_group_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_7_nested_groups",
			"t": "paneforge_7_nested_groups_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_7_nested_groups",
			"t": "paneforge_7_nested_groups_pane",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_7_nested_groups",
			"t": "paneforge_7_nested_groups_paneresizer",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_8_overflowing_panes",
			"t": "paneforge_7_nested_groups_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_8_overflowing_panes",
			"t": "paneforge_7_nested_groups_pane",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_9_persistent_layouts",
			"t": "paneforge_7_nested_groups_panegroup",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_9_persistent_layouts",
			"t": "paneforge_9_persistent_layouts_autosaveid",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_9_persistent_layouts",
			"t": "paneforge_9_persistent_layouts_cookie_persistence",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_9_persistent_layouts_autosaveid",
			"t": "paneforge_7_nested_groups_panegroup",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_asset_load_code_splitting",
			"t": "performance_asset_load_code_splitting_lowlight_static_import",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_asset_load_code_splitting",
			"t": "performance_asset_load_code_splitting_mermaid_lazy_boundary",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed",
			"t": "performance_loading_speed_initworkspace_chain",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed",
			"t": "performance_loading_speed_lazy_layout_loading",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed",
			"t": "performance_loading_speed_loadlayout_reorder_rejected",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed",
			"t": "performance_loading_speed_totp_timer_gating",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed",
			"t": "performance_asset_load_code_splitting_mermaid_lazy_boundary",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed_loadlayout_reorder_rejected",
			"t": "performance_loading_speed_initworkspace_chain",
			"r": "rationale_for",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_asset_load_code_splitting",
			"t": "performance_loading_speed",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "scans_index2",
			"t": "scans_index2_code_health_hotspots",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "scans_index3",
			"t": "scans_index3_wiki_atlas",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "scans_index4",
			"t": "scans_index3_wiki_atlas",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "scans_index1",
			"t": "scans_index2",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "plans_2026_06_24_ai_providers_and_local_models_upgrade",
			"t": "plans_2026_06_24_ai_providers_and_local_models_upgrade_run_local_model",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_ai_providers_and_local_models_upgrade",
			"t": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade_run_api_model",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_ai_providers_and_local_models_upgrade",
			"t": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "specs_2026_06_24_ai_providers_and_local_models_upgrade_walkthrough",
			"t": "plans_2026_06_24_ai_providers_and_local_models_upgrade",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "specs_2026_06_24_ai_providers_and_local_models_upgrade_walkthrough",
			"t": "plans_2026_06_24_ai_providers_and_local_models_upgrade_run_local_model",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_codemirror_editor",
			"t": "plans_2026_06_24_codemirror_editor_token_theme_mapping",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_24_codemirror_editor",
			"t": "plans_2026_06_24_codemirror_editor",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "specs_2026_06_24_codemirror_editor",
			"t": "plans_2026_06_24_codemirror_editor_token_theme_mapping",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_24_codemirror_editor",
			"t": "specs_2026_06_24_codemirror_editor_cursor_preservation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_codemirror_editor",
			"t": "plans_2026_06_24_fractalengine_ide_setup",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade",
			"t": "plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade_run_api_model",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_fractalengine_ide_setup",
			"t": "plans_2026_06_24_fractalengine_ide_setup_ipc_gateway",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_fractalengine_ide_setup",
			"t": "plans_2026_06_24_fractalengine_ide_setup_terminal_docking",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_in_app_browser",
			"t": "plans_2026_06_24_in_app_browser_totp_engine",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_in_app_browser",
			"t": "plans_2026_06_24_in_app_browser_password_manager",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_06_24_in_app_browser",
			"t": "plans_2026_06_24_fractalengine_ide_setup_ipc_gateway",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed_totp_timer_gating",
			"t": "plans_2026_06_24_in_app_browser_totp_engine",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "plans_2026_06_24_spatial_canvas_stream_a",
			"t": "plans_2026_06_24_spatial_canvas_stream_a_canvasstore",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_loading_speed_initworkspace_chain",
			"t": "plans_2026_06_24_spatial_canvas_stream_a_canvasstore",
			"r": "shares_data_with",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_fractalmedia_two_stream_implementation_watched_folders",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_fractalmedia_two_stream_implementation_annotations_db",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_fractalmedia_two_stream_implementation_thumbnail_pipeline",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_fractalmedia_two_stream_implementation_media_ipc_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation_media_ipc_contract",
			"t": "plans_2026_06_24_fractalengine_ide_setup_ipc_gateway",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_shared_memory_mve_two_stream_implementation",
			"t": "plans_2026_07_15_shared_memory_mve_two_stream_implementation_memory_projection",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_shared_memory_mve_two_stream_implementation",
			"t": "plans_2026_07_15_shared_memory_mve_two_stream_implementation_two_agent_protocol",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_shared_memory_mve_two_stream_implementation_two_agent_protocol",
			"r": "implements",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation",
			"t": "plans_2026_07_15_shared_memory_mve_two_stream_implementation",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "specs_2026_06_25_notes_vault_tree_design",
			"t": "specs_2026_06_25_notes_vault_tree_design_vaulttreenode",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vault_tree_design",
			"t": "specs_2026_06_25_notes_vault_tree_design_adr_013",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vault_tree_design",
			"t": "specs_2026_06_25_notes_vault_tree_design_adr_006",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "paneforge_9_persistent_layouts_autosaveid",
			"t": "plans_2026_06_24_spatial_canvas_stream_a_canvasstore",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "plans_2026_07_15_fractalmedia_two_stream_implementation_annotations_db",
			"t": "plans_2026_06_24_in_app_browser_password_manager",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.65
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "specs_2026_06_25_notes_vaults_design_savedvault",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "state_canvas_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "areas_notes",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "specs_2026_06_25_notes_vaults_design",
			"t": "areas_undo_system_undohistory",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "src_memory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_exchange_protocol",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_memory_kernel",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_authority_firewall",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_minimum_viable_experiment",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal_exchange_protocol",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_memory_kernel",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal_authority_firewall",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_memory_kernel",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_longmemeval",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_longmemeval_v2",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "specs_2026_07_15_shared_agent_memory_harness_proposal_memgpt",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "specs_2026_07_15_shared_agent_memory_harness_proposal",
			"t": "src_crypto",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "areas_ai",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ai",
			"t": "state_ai_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ai",
			"t": "state_modelregistry_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ai",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ai",
			"t": "areas_ipc_and_data_layer",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_designer",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_notes",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_bookmarks",
			"t": "state_bookmarks_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_browser",
			"t": "browser_mod",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_browser",
			"t": "browser_session",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_browser",
			"t": "src_storage",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_browser",
			"t": "state_vault_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_contributions",
			"t": "state_contributions_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_designer",
			"t": "state_designcanvas_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_designer",
			"t": "engine_typography",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_designer",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_fractaldocs",
			"t": "state_docs_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_fractaldocs",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_fractaldocs",
			"t": "areas_shell_and_routes",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_fractaldocs",
			"t": "areas_ipc_and_data_layer",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_fractaldocs",
			"t": "areas_security_boundaries",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ide",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "src_memory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "src_storage",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "src_crypto",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "src_docs_index",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "areas_ipc_and_data_layer_authorizedpaths",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_ipc_and_data_layer",
			"t": "areas_ipc_and_data_layer_aistreamstate",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_lib",
			"t": "areas_ipc_and_data_layer_authorizedpaths",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "src_lib",
			"t": "areas_ipc_and_data_layer_aistreamstate",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_kernel",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_media",
			"t": "state_media_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_media",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_media",
			"t": "areas_ide",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_notes",
			"t": "state_notes_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_notes",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_security_boundaries",
			"t": "lib_sanitizehtml",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_security_boundaries",
			"t": "lib_pathvalidation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_security_boundaries",
			"t": "areas_ipc_and_data_layer_authorizedpaths",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_shell_and_routes",
			"t": "state_canvas_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_styling_system",
			"t": "styles_tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_styling_system",
			"t": "styles_primitives",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_undo_system",
			"t": "state_undohistory_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_undo_system",
			"t": "areas_undo_system_undohistory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_undo_system",
			"t": "areas_undo_system_registerundodomain",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_undohistory_svelte",
			"t": "areas_undo_system_undohistory",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_designcanvas_svelte",
			"t": "areas_undo_system_registerundodomain",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_media_svelte",
			"t": "areas_undo_system_registerundodomain",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_docs_svelte",
			"t": "areas_undo_system_registerundodomain",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_notes_svelte",
			"t": "areas_undo_system_undohistory",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_00_rules",
			"t": "styles_primitives",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_00_rules",
			"t": "design_02_sass_variables",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_02_sass_variables",
			"t": "styles_tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_03_typography",
			"t": "styles_typography",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_03_typography",
			"t": "engine_typography",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_03_typography",
			"t": "areas_designer",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_modelregistry_svelte",
			"t": "src_crypto",
			"r": "shares_data_with",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "state_vault_svelte",
			"t": "src_crypto",
			"r": "shares_data_with",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "areas_fractaldocs",
			"t": "areas_notes",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "areas_contributions",
			"t": "state_contributions_svelte",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_bookmarks",
			"t": "areas_ipc_and_data_layer",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "areas_media",
			"t": "src_storage",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "design_04_layout_system",
			"t": "design_05_utility_primitives",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_04_layout_system",
			"t": "design_09_mixins_breakpoints",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_04_layout_system",
			"t": "design_01_tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_04_layout_system",
			"t": "design_04_layout_system_app_shell",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_05_utility_primitives",
			"t": "design_04_layout_system",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_05_utility_primitives",
			"t": "design_07_class_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_05_utility_primitives",
			"t": "design_05_utility_primitives_box_row_grid",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_06_animations",
			"t": "design_06_animations_module_vertical_wipe",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_07_class_registry",
			"t": "design_05_utility_primitives",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_07_class_registry",
			"t": "design_11_style_aggregation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_07_class_registry",
			"t": "adr_adr_014_document_level_drag_resize_pattern",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_07_class_registry",
			"t": "styles__commons",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_08_font_usage",
			"t": "design_03_typography",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_08_font_usage",
			"t": "lib_editortheme",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_09_mixins_breakpoints",
			"t": "design_04_layout_system",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_09_mixins_breakpoints",
			"t": "design_02_sass_variables",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_09_mixins_breakpoints",
			"t": "design_09_mixins_breakpoints_breakpoint_mixins",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_10_editor_theme",
			"t": "design_12_token_theme_mapping",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_10_editor_theme",
			"t": "design_10_editor_theme_customeditortheme",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_editortheme",
			"t": "design_10_editor_theme_customeditortheme",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_11_style_aggregation",
			"t": "design_07_class_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_11_style_aggregation",
			"t": "styles_index",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles_index",
			"t": "styles__tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "design_03_typography",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "design_07_class_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "design_13_control_text_taxonomy_btn_family",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "design_13_control_text_taxonomy_text_roles",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "design_13_control_text_taxonomy_sidebar_tab_item",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles__commons",
			"t": "design_13_control_text_taxonomy_btn_family",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles__commons",
			"t": "design_13_control_text_taxonomy_sidebar_tab_item",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_13_control_text_taxonomy",
			"t": "state_contributions_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "adr_adr_003_css_token_system_with_sass",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "adr_adr_031_single_control_and_text_class_taxonomy",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "adr_adr_027_data_layer_mock_engine",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "design_01_tokens",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "design_07_class_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "design_13_control_text_taxonomy",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design",
			"t": "design_design_two_layer_token_architecture",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_design_two_layer_token_architecture",
			"t": "adr_adr_003_css_token_system_with_sass",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "styles__tokens",
			"t": "design_design_two_layer_token_architecture",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_media_module",
			"t": "design_11_style_aggregation",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_media_module",
			"t": "styles_index",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "adr_adr_011_local_first_ai_memory_and_context_harness",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_memoryitem",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_memory_pipeline",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_agentmemory",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_memu",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_honcho",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_graphiti",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "design_ai_memory_architecture_trellis",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "design_ai_memory_architecture",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_command_or_keybinding",
			"t": "state_contributions_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "adr_adr_015_app_template_routing_and_state_domains",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "adr_adr_021_designer_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "adr_adr_022_notes_module_extraction",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "adr_adr_024_ai_module_embed_dont_rewrite",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "state_contributions_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_a_module",
			"t": "styles_index",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_an_ipc_function",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_an_ipc_function",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_add_an_ipc_function",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "guides_render_external_html",
			"t": "lib_sanitizehtml",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "guides_write_a_two_stream_plan",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "state_modelregistry_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "components_settingsdialog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "adr_adr_030_single_add_model_flow",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "performance_ai_chat_performance",
			"t": "plans_ai_layer_remediation_plan",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "plans_ai_layer_fresh_plan_provideradapter",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "plans_ai_layer_fresh_plan_unified_model_registry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "plans_ai_layer_fresh_plan_runid_stream_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "plans_ai_layer_fresh_plan_aiipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan_pitfalls_ledger",
			"t": "plans_ai_layer_fresh_plan",
			"r": "rationale_for",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan",
			"t": "performance_ai_chat_performance",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "plans_ai_layer_fresh_plan_aiipc",
			"t": "lib_ipc",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "plans_ai_layer_remediation_plan_frozen_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "plans_ai_layer_remediation_plan_two_stream_ownership",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_modelregistry_svelte",
			"t": "plans_ai_layer_remediation_plan_frozen_contract",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "state_ide_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "state_modelregistry_svelte",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "components_settingsdialog",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "src_lib",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "adr_adr_029_unify_ai_model_registry_and_native_discovery",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "adr_adr_030_single_add_model_flow",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_remediation_plan",
			"t": "adr_adr_017_keep_provider_secrets_native",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_layer_fresh_plan_unified_model_registry",
			"t": "plans_ai_layer_remediation_plan_frozen_contract",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "design_ai_memory_architecture_agentmemory",
			"t": "design_ai_memory_architecture_memu",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.75
		},
		{
			"s": "plans_ai_module_plan",
			"t": "plans_ai_module_plan_fractalai",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_module_plan_fractalai",
			"t": "components_aichat",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_module_plan",
			"t": "adr_024",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_module_plan",
			"t": "adr_011",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ai_module_plan_fractalai",
			"t": "plans_ide_extraction_plan_ide_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_bits_ui_adoption_plan",
			"t": "plans_bits_ui_adoption_plan_fractalui",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "plans_bits_ui_adoption_plan",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "plans_browser_module_plan_browser_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_browser_module",
			"t": "plans_browser_module_plan_browserregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_browser_module",
			"t": "plans_browser_module_plan_password_vault_v2",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_browser_module",
			"t": "plans_browser_module_plan_overlaycoordinator",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_browser_module",
			"t": "unit_browser_demolition_test",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_browser_module",
			"t": "src_storage",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan_password_vault_v2",
			"t": "state_ide_svelte_idestate",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "adr_007",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "adr_029",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "adr_028",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_plan",
			"t": "plans_data_layer_plan_bookmarks_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_browser_module_tasks",
			"t": "plans_browser_module_plan",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_contribution_registry_plan",
			"t": "plans_contribution_registry_plan_contributionregistry",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_contribution_registry_plan_contributionregistry",
			"t": "unit_contribution_contracts_test",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_contribution_registry_plan",
			"t": "adr_025",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan",
			"t": "plans_data_layer_plan_data_layer",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan_data_layer",
			"t": "src_storage",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan_data_layer",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan",
			"t": "plans_data_layer_plan_bookmarks_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan_bookmarks_module",
			"t": "components_virtuallist",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan_data_layer",
			"t": "components_searchoverlay",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_data_layer_plan",
			"t": "adr_027",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_designer_extraction_plan",
			"t": "plans_designer_extraction_plan_designer_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_designer_hygiene_plan",
			"t": "plans_designer_extraction_plan_designer_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_designer_hygiene_plan",
			"t": "plans_designer_hygiene_plan_paint_model",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_designer_hygiene_plan",
			"t": "state_designcanvas_svelte_canvasstate",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_designer_hygiene_plan_paint_model",
			"t": "state_designcanvas_svelte_canvasstate",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_docs_migration_plan",
			"t": "plans_docs_migration_plan_docs_areas",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_docs_migration_plan_docs_areas",
			"t": "unit_docs_contracts_test",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ide_extraction_plan",
			"t": "plans_ide_extraction_plan_ide_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ide_extraction_plan",
			"t": "state_ide_svelte_idestate",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_ide_extraction_plan_ide_module",
			"t": "data_tilekinds",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec",
			"t": "plans_macos_dictation_feature_spec_dictation_controller",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec_dictation_controller",
			"t": "plans_macos_dictation_feature_spec_surface_adapter",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec_dictation_controller",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec",
			"t": "adr_026",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec",
			"t": "adr_028",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_macos_dictation_feature_spec",
			"t": "adr_025",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_notes_extraction_plan",
			"t": "plans_notes_extraction_plan_notes_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_notes_extraction_plan",
			"t": "state_ide_svelte_vaultbridge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_notes_extraction_plan_notes_module",
			"t": "state_ide_svelte_vaultbridge",
			"r": "implements",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte_vaultbridge",
			"t": "state_ide_svelte_idestate",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_notes_extraction_plan_notes_module",
			"t": "state_ide_svelte_idestate",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_security_contract_plan",
			"t": "lib_ipc_ipcapi",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc_ipcapi",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_ipc_ipcapi",
			"t": "lib_ipc_mock",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_security_contract_plan",
			"t": "lib_sanitizehtml",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_sanitizehtml",
			"t": "unit_html_boundary_test",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "lib_sanitizehtml",
			"t": "components_virtuallist",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_security_contract_plan",
			"t": "adr_028",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_skaa_integration_plan",
			"t": "plans_skaa_integration_plan_skaa_contract",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_skaa_integration_plan",
			"t": "adr_011",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_skaa_integration_plan",
			"t": "adr_025",
			"r": "cites",
			"c": "AMBIGUOUS",
			"sc": 0.2
		},
		{
			"s": "plans_skaa_integration_plan_skaa_contract",
			"t": "plans_memory_and_harness_module_memory_projection",
			"r": "semantically_similar",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "plans_spatial_canvas_migration",
			"t": "plans_spatial_canvas_migration_spatial_canvas",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_spatial_canvas_migration_spatial_canvas",
			"t": "state_canvas_svelte_canvasstore",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_spatial_canvas_migration_spatial_canvas",
			"t": "data_tilekinds",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_spatial_canvas_migration_spatial_canvas",
			"t": "data_templates",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_spatial_canvas_tasks",
			"t": "plans_spatial_canvas_migration",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_undo_engine_plan",
			"t": "state_undohistory_svelte_undohistory",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_undohistory_svelte_undohistory",
			"t": "state_undohistory_svelte_compositeundodomain",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_undo_engine_plan",
			"t": "adr_026",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "state_ide_svelte_idestate",
			"t": "state_undohistory_svelte_undohistory",
			"r": "calls",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan",
			"t": "plans_media_module_plan_media_module",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan_media_module",
			"t": "plans_media_module_plan_import_engine",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan_media_module",
			"t": "plans_media_module_plan_paneforge",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan_media_module",
			"t": "lib_ipc",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan_media_module",
			"t": "src_storage",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_media_module_plan_media_module",
			"t": "plans_data_layer_plan_data_layer",
			"r": "shares_data_with",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_memory_and_harness_module",
			"t": "plans_memory_and_harness_module_memory_projection",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_memory_and_harness_module",
			"t": "plans_memory_and_harness_module_evaluation_harness",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_memory_and_harness_module",
			"t": "adr_011",
			"r": "cites",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "plans_memory_and_harness_module_evaluation_harness",
			"t": "plans_memory_and_harness_module_memory_projection",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_sidebar_tabs_sidebar_tabs",
			"t": "other_sidebar_tabs_tab_group",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_sidebar_tabs_sidebar_tabs",
			"t": "other_sidebar_tabs_sidebar_panel",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_sidebar_tabs_tab_group",
			"t": "other_sidebar_tabs_active_tab_state",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "other_sidebar_tabs_tab_group",
			"t": "other_sidebar_tabs_sidebar_panel",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "other_sidebar_tabs_sidebar_tabs",
			"t": "other_sidebar_tabs_dark_theme",
			"r": "references",
			"c": "INFERRED",
			"sc": 0.95
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_serum2_synth",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_oscillator_section",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_filter_section",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_modulation_system",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_macro_controls",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_lfo_path_editor",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_keyboard_arp_bar",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_oscillator_section",
			"t": "daw_serum_wavetable_visualization",
			"r": "references",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_modulation_system",
			"t": "daw_serum_lfo_path_editor",
			"r": "conceptually_related",
			"c": "EXTRACTED",
			"sc": 1
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_dark_knob_design",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "daw_serum_serum_ui",
			"t": "daw_serum_daw_ui_reference",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.85
		},
		{
			"s": "daw_serum_dark_knob_design",
			"t": "daw_serum_daw_ui_reference",
			"r": "conceptually_related",
			"c": "INFERRED",
			"sc": 0.65
		}
	],
	"hyper": [
		{
			"i": "module_extraction_pattern",
			"l": "src/lib/modules Extraction Pattern",
			"m": [
				"adr_adr_015_app_template_routing_and_state_domains",
				"adr_adr_021_designer_module_extraction",
				"adr_adr_021_designer_module_extraction_module_pattern",
				"adr_adr_022_notes_module_extraction",
				"adr_adr_023_ide_module_extraction_and_kernel_deferral",
				"adr_adr_024_ai_module_embed_dont_rewrite"
			]
		},
		{
			"i": "undo_boundary_domains",
			"l": "Domain Undo/Redo Boundary Participants",
			"m": [
				"adr_adr_006_undo_redo_boundary_snapshot_undo",
				"adr_adr_013_notes_vault_persistence_notes_vault",
				"adr_adr_014_document_level_drag_resize_pattern_document_level_mousemove",
				"state_ide_svelte",
				"state_undo_svelte"
			]
		},
		{
			"i": "ipc_three_layer_contract",
			"l": "Three-Layer IPC Contract (Rust / Gateway / Mock)",
			"m": [
				"adr_adr_004_single_ipc_gateway_module_ipc_gateway",
				"lib_ipc",
				"lib_ipc_mock",
				"src_lib"
			]
		},
		{
			"i": "byok_model_management_evolution",
			"l": "BYOK Model Management Evolution",
			"m": [
				"adr_adr_029_unify_ai_model_registry_and_native_discovery",
				"adr_adr_030_single_add_model_flow",
				"adr_adr_032_immediate_byok_model_configuration",
				"adr_adr_033_unified_model_management_and_local_status_cue",
				"adr_adr_035_envelope_encrypted_api_key_store"
			]
		},
		{
			"i": "security_posture_enforcement",
			"l": "Structural Security Posture Enforcement",
			"m": [
				"adr_adr_028_security_boundaries_contract_ipc_guard_tests",
				"adr_adr_028_security_boundaries_contract_ipc_ipcapi_contract",
				"adr_adr_028_security_boundaries_contract_ipc_sanitizehtml_boundary",
				"adr_adr_028_security_boundaries_contract_ipc_trust_zones"
			]
		},
		{
			"i": "floating_positioned_components",
			"l": "Floating UI Positioned Content Components",
			"m": [
				"bitsui_docs_child_snippet_floating_content",
				"components_combobox_combobox",
				"components_date_picker_date_picker",
				"components_date_range_picker_date_range_picker",
				"components_dropdown_menu_dropdown_menu",
				"components_link_preview_link_preview",
				"components_menubar_menubar",
				"components_popover_popover",
				"components_select_select",
				"components_tooltip_tooltip"
			]
		},
		{
			"i": "date_time_component_family",
			"l": "Date and Time Component Family",
			"m": [
				"bitsui_docs_dates_datevalue",
				"bitsui_docs_dates_internationalized_date",
				"components_calendar_calendar",
				"components_date_field_date_field",
				"components_date_picker_date_picker",
				"components_date_range_field_date_range_field",
				"components_date_range_picker_date_range_picker",
				"components_range_calendar_range_calendar"
			]
		},
		{
			"i": "headless_customization_system",
			"l": "Bits UI Headless Customization System",
			"m": [
				"bitsui_docs_child_snippet_child_snippet",
				"bitsui_docs_ref_ref_prop",
				"bitsui_docs_state_management_state_management",
				"bitsui_docs_styling_styling",
				"bitsui_docs_transitions_transitions"
			]
		},
		{
			"i": "bitsui_date_component_family",
			"l": "Bits UI Date/Time Component Family",
			"m": [
				"bitsui_docs_dates_dates",
				"components_calendar_calendar",
				"components_date_field_date_field",
				"components_date_picker_date_picker",
				"components_date_range_field_date_range_field",
				"components_date_range_picker_date_range_picker",
				"components_range_calendar_range_calendar",
				"concept_internationalized_date"
			]
		},
		{
			"i": "bitsui_menu_component_pattern",
			"l": "Bits UI Menu Component Pattern",
			"m": [
				"components_context_menu_context_menu",
				"components_dropdown_menu_dropdown_menu",
				"components_menubar_menubar"
			]
		},
		{
			"i": "bitsui_portalled_floating_content",
			"l": "Portalled Floating Content Pattern",
			"m": [
				"components_dialog_dialog",
				"components_link_preview_link_preview",
				"components_popover_popover",
				"concept_floating_ui",
				"concept_portal_pattern"
			]
		},
		{
			"i": "wrapper_component_type_helpers",
			"l": "Type Helpers for Reusable Wrapper Components",
			"m": [
				"type_helpers_with_element_ref_withelementref",
				"type_helpers_without_child_withoutchild",
				"type_helpers_without_children_or_child_withoutchildrenorchild",
				"type_helpers_without_children_withoutchildren"
			]
		},
		{
			"i": "controlled_state_function_binding_pattern",
			"l": "Two-Way Binding vs Fully Controlled State Pattern",
			"m": [
				"components_select_function_binding",
				"components_select_select",
				"components_slider_slider",
				"components_switch_switch",
				"components_tabs_tabs",
				"components_time_field_timefield",
				"components_time_range_field_timerangefield",
				"components_toggle_group_togglegroup",
				"components_toggle_toggle",
				"components_toolbar_toolbar",
				"components_tooltip_tooltip"
			]
		},
		{
			"i": "bitsui_governance_policies",
			"l": "Bits UI Project Governance Policies",
			"m": [
				"policies_changelog_conventions_changelog_conventions",
				"policies_code_of_conduct_code_of_conduct",
				"policies_tracking_bugs_and_feature_requests_tracking_bugs_and_feature_requests"
			]
		},
		{
			"i": "paneforge_layout_primitives",
			"l": "PaneForge Resizable Layout Primitives",
			"m": [
				"paneforge_1_pane_group_panegroup",
				"paneforge_2_pane_resizer_paneresizer",
				"paneforge_3_pane_pane"
			]
		},
		{
			"i": "ai_elements_remaster_two_streams",
			"l": "Tier-1 AI Elements Port — Two Parallel Streams",
			"m": [
				"other_ai_elements_remaster_adr_011_phase1_storage",
				"other_ai_elements_remaster_cross_stream_contracts",
				"other_ai_elements_remaster_stream_a",
				"other_ai_elements_remaster_stream_b"
			]
		},
		{
			"i": "fractalengine_module_suite",
			"l": "FractalEngine App Module Suite",
			"m": [
				"other_app_modules_fractalai",
				"other_app_modules_fractalcode",
				"other_app_modules_fractaldesign",
				"other_app_modules_fractalnotes"
			]
		},
		{
			"i": "paneforge_pane_layout_system",
			"l": "PaneForge Pane Layout System",
			"m": [
				"paneforge_7_nested_groups_pane",
				"paneforge_7_nested_groups_panegroup",
				"paneforge_7_nested_groups_paneresizer"
			]
		},
		{
			"i": "ai_copilot_upgrade_lineage",
			"l": "AI Copilot Upgrade Lineage (palette/settings plan -> providers plan ->",
			"m": [
				"plans_2026_06_24_ai_providers_and_local_models_upgrade",
				"plans_2026_06_24_command_palette_settings_system_and_ai_copilot_upgrade",
				"specs_2026_06_24_ai_providers_and_local_models_upgrade_walkthrough"
			]
		},
		{
			"i": "layout_persistence_pattern",
			"l": "Layout Persistence Across Reloads Pattern",
			"m": [
				"paneforge_9_persistent_layouts_autosaveid",
				"plans_2026_06_24_spatial_canvas_stream_a_canvasstore",
				"specs_2026_06_25_notes_vault_tree_design_vaulttreenode"
			]
		},
		{
			"i": "undo_domain_registration",
			"l": "Module state stores registered as undo domains",
			"m": [
				"state_bookmarks_svelte",
				"state_designcanvas_svelte",
				"state_docs_svelte",
				"state_media_svelte",
				"state_notes_svelte",
				"state_undohistory_svelte"
			]
		},
		{
			"i": "crypto_envelope_consumers",
			"l": "Shared AES-256-GCM keychain envelope pattern",
			"m": [
				"src_crypto",
				"src_memory",
				"state_modelregistry_svelte",
				"state_vault_svelte"
			]
		},
		{
			"i": "ipc_gateway_parity",
			"l": "Single IPC gateway with browser-mock parity",
			"m": [
				"lib_ipc",
				"lib_ipc_mock",
				"src_lib"
			]
		},
		{
			"i": "two_layer_token_system",
			"l": "Two-Layer Design Token System",
			"m": [
				"adr_adr_003_css_token_system_with_sass",
				"design_01_tokens",
				"design_design",
				"design_design_two_layer_token_architecture",
				"styles__tokens"
			]
		},
		{
			"i": "ai_layer_remediation_lineage",
			"l": "AI Layer Diagnosis-Remediation-Redesign Lineage",
			"m": [
				"adr_adr_029_unify_ai_model_registry_and_native_discovery",
				"adr_adr_030_single_add_model_flow",
				"performance_ai_chat_performance",
				"plans_ai_layer_fresh_plan",
				"plans_ai_layer_remediation_plan"
			]
		},
		{
			"i": "single_ipc_gateway_pattern",
			"l": "Single IPC Gateway with Browser Mock Parity",
			"m": [
				"guides_add_an_ipc_function",
				"lib_ipc",
				"lib_ipc_mock",
				"src_lib"
			]
		},
		{
			"i": "two_stream_plan_method",
			"l": "Two-Stream Frozen-Contract Execution Method",
			"m": [
				"plans_ai_module_plan",
				"plans_contribution_registry_plan",
				"plans_data_layer_plan",
				"plans_designer_extraction_plan",
				"plans_docs_migration_plan",
				"plans_ide_extraction_plan",
				"plans_notes_extraction_plan",
				"plans_security_contract_plan",
				"plans_undo_engine_plan"
			]
		},
		{
			"i": "ipc_gateway_mock_parity",
			"l": "Single IPC Gateway with Enforced Mock Parity",
			"m": [
				"lib_ipc",
				"lib_ipc_ipcapi",
				"lib_ipc_mock"
			]
		},
		{
			"i": "per_module_undo_domains",
			"l": "Per-Module Undo Domains over the UndoHistory Engine",
			"m": [
				"plans_ai_module_plan_fractalai",
				"plans_browser_module_plan_password_vault_v2",
				"plans_data_layer_plan_bookmarks_module",
				"plans_media_module_plan_media_module",
				"state_undohistory_svelte_undohistory"
			]
		}
	]
};
	let { activated = false } = $props();

	const CDN = [];

	function loadScript(src) {
		return new Promise((resolve, reject) => {
			const el = document.createElement('script');
			el.src = src;
			el.onload = () => resolve();
			el.onerror = () => reject(new Error('failed to load ' + src));
			document.head.appendChild(el);
		});
	}

	$effect(() => {
		if (!activated) return;
		let destroyed = false;
		const run = () => {
			if (destroyed) return;

"use strict";
const errBox = document.getElementById("err");
addEventListener("error", e => { errBox.textContent = "ERR: " + e.message + " @ " + (e.lineno || "?"); });
// DATA injected by component scope
const TAU = Math.PI * 2;
const canvas = document.getElementById("stage");
const __rect = () => canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = n => n.toLocaleString("en-US");
const GA = 0.6180339887498949;
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

const TYPE_COLOR = { document: "#7aa2f7", concept: "#e9c46a", code: "#4ade80", rationale: "#f472b6", paper: "#c084fc", image: "#fb923c", other: "#94a3b8" };
const REL_COLOR = { references: "#5b6b8c", cites: "#8b7ec8", implements: "#4ade80", conceptually_related: "#e9c46a", semantically_similar: "#e9c46a", calls: "#4ade80", shares_data_with: "#38bdf8", rationale_for: "#f472b6" };
const TOGGLES = { hyper: true, inferred: true, document: true, concept: true, code: true, rationale: true, paper: true, image: true, other: true };

/* ---------- build graph ---------- */
const N = [], byId = {};
DATA.nodes.forEach(n => {
  const node = { id: n.i, label: n.l, type: n.t, file: n.f, url: n.u, chunks: n.chunks, deg: n.d,
    bridge: n.chunks.length > 1, hyper: false, x: 0, y: 0, vx: 0, vy: 0 };
  const h = hash(n.i);
  node.x = Math.cos(h * GA * TAU) * (300 + h % 500);
  node.y = Math.sin(h * GA * TAU) * (300 + (h >> 3) % 500);
  N.push(node); byId[n.i] = node;
});
const L = [];
DATA.links.forEach(l => {
  const s = byId[l.s], t = byId[l.t];
  if (s && t && s !== t) L.push({ s, t, rel: l.r, conf: l.c });
});
DATA.hyper.forEach(hd => {
  const hub = { id: "◇" + hd.i, label: hd.l, type: "hyper", file: "", url: "", chunks: [], deg: hd.m.length,
    bridge: false, hyper: true, x: 0, y: 0, vx: 0, vy: 0 };
  const members = hd.m.map(m => byId[m]).filter(Boolean);
  if (!members.length) return;
  hub.x = members.reduce((a, m) => a + m.x, 0) / members.length;
  hub.y = members.reduce((a, m) => a + m.y, 0) / members.length;
  N.push(hub); byId[hub.id] = hub;
  members.forEach(m => L.push({ s: hub, t: m, rel: "pattern", conf: "HYPER" }));
});

/* ---------- force layout (synchronous, deterministic) ---------- */
(function layout() {
  const ITER = 380, REP = 2600, DAMP = 0.86;
  for (let it = 0; it < ITER; it++) {
    const cool = 1 - it / ITER;
    for (let i = 0; i < N.length; i++) {
      const a = N[i];
      for (let j = i + 1; j < N.length; j++) {
        const b = N[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = (hash(a.id + b.id) % 7) - 3; dy = (hash(b.id + a.id) % 7) - 3; d2 = dx * dx + dy * dy + 0.1; }
        if (d2 > 260000) continue;
        const f = REP * cool / d2, d = Math.sqrt(d2);
        dx /= d; dy /= d;
        a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      a.vx -= a.x * 0.012 * cool; a.vy -= a.y * 0.012 * cool; // gravity
    }
    for (const l of L) {
      const ideal = l.rel === "pattern" ? 150 : 46 + 130 / Math.sqrt(1 + Math.min(l.s.deg, l.t.deg));
      let dx = l.t.x - l.s.x, dy = l.t.y - l.s.y;
      const d = Math.max(Math.hypot(dx, dy), 0.1);
      const f = (d - ideal) * 0.028 * cool;
      dx /= d; dy /= d;
      l.s.vx += dx * f; l.s.vy += dy * f; l.t.vx -= dx * f; l.t.vy -= dy * f;
    }
    for (const a of N) { a.x += a.vx * DAMP * 0.5; a.y += a.vy * DAMP * 0.5; a.vx *= 0.5; a.vy *= 0.5; }
  }
})();
let minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
N.forEach(a => { minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x); minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y); });
const CX = (minX + maxX) / 2, CY = (minY + maxY) / 2, WORLD = Math.max(maxX - minX, maxY - minY) / 2 + 90;

/* adjacency for panels + highlight */
const adj = new Map();
L.forEach(l => {
  if (!adj.has(l.s)) adj.set(l.s, []); if (!adj.has(l.t)) adj.set(l.t, []);
  adj.get(l.s).push({ n: l.t, rel: l.rel, conf: l.conf });
  adj.get(l.t).push({ n: l.s, rel: l.rel, conf: l.conf });
});

/* ---------- view ---------- */
let W = 0, H = 0, DPR = Math.min(devicePixelRatio || 1, 2);
const view = { x: 0, y: 0, k: 1 };
function fit() {
  view.k = Math.min(W, H) / (WORLD * 2);
  view.x = W / 2 - CX * view.k; view.y = H / 2 - CY * view.k;
}
const toS = (x, y) => [x * view.k + view.x, y * view.k + view.y];
let hover = null, selected = null;

/* ---------- draw ---------- */
function nodeVisible(a) { return a.hyper ? TOGGLES.hyper : TOGGLES[a.type] !== false; }
function draw() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = "#0b0e14"; ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.translate(view.x, view.y); ctx.scale(view.k, view.k);
  const selAdj = selected ? new Set([selected, ...(adj.get(selected) || []).map(x => x.n)]) : null;
  /* edges */
  for (const l of L) {
    if (!nodeVisible(l.s) || !nodeVisible(l.t)) continue;
    if (l.conf === "INFERRED" && !TOGGLES.inferred) continue;
    if (l.conf === "HYPER" && !TOGGLES.hyper) continue;
    let alpha = l.conf === "HYPER" ? 0.28 : l.conf === "INFERRED" ? 0.13 : 0.22;
    if (selAdj) alpha = (selAdj.has(l.s) && selAdj.has(l.t)) ? 0.75 : 0.04;
    else if (hover && (l.s === hover || l.t === hover)) alpha = 0.6;
    ctx.strokeStyle = (REL_COLOR[l.rel] || "#5b6b8c") + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.lineWidth = (selAdj && selAdj.has(l.s) && selAdj.has(l.t) ? 1.6 : 0.9) / view.k * (view.k < 0.4 ? 0.4 : view.k);
    ctx.lineWidth = Math.max(ctx.lineWidth, 0.4 / view.k);
    ctx.setLineDash(l.conf === "INFERRED" || l.conf === "HYPER" ? [4 / view.k, 4 / view.k] : []);
    ctx.beginPath(); ctx.moveTo(l.s.x, l.s.y); ctx.lineTo(l.t.x, l.t.y); ctx.stroke();
  }
  ctx.setLineDash([]);
  /* nodes */
  for (const a of N) {
    if (!nodeVisible(a)) continue;
    const dim = selAdj && !selAdj.has(a);
    const r = a.hyper ? 7 + Math.min(a.deg, 14) * 0.5 : 2.4 + Math.log2(1 + a.deg) * 1.7;
    a._r = r;
    ctx.globalAlpha = dim ? 0.12 : 1;
    if (a.hyper) {
      ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(Math.PI / 4);
      ctx.fillStyle = "#c084fc"; ctx.shadowColor = "#c084fc"; ctx.shadowBlur = 12;
      const s = r * 0.85; ctx.fillRect(-s / 1.4, -s / 1.4, s * 1.43, s * 1.43);
      ctx.restore();
    } else {
      ctx.fillStyle = TYPE_COLOR[a.type] || TYPE_COLOR.other;
      if (a === hover || a === selected) { ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14; } else ctx.shadowBlur = 0;
      ctx.beginPath(); ctx.arc(a.x, a.y, r, 0, TAU); ctx.fill();
      ctx.shadowBlur = 0;
      if (a.bridge) { ctx.strokeStyle = "#ffffffcc"; ctx.lineWidth = 1.1 / view.k + 0.6; ctx.beginPath(); ctx.arc(a.x, a.y, r + 2.6, 0, TAU); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  /* labels in screen space */
  const top = N.filter(a => !a.hyper && nodeVisible(a)).sort((p, q) => q.deg - p.deg).slice(0, 34);
  ctx.textAlign = "center";
  for (const a of top) {
    if (selAdj && !selAdj.has(a)) continue;
    const [sx, sy] = toS(a.x, a.y);
    if (sx < -80 || sx > W + 80 || sy < -20 || sy > H + 20) continue;
    ctx.font = (a.deg > 20 ? "600 11.5px" : "500 10px") + " Inter";
    ctx.fillStyle = "rgba(11,14,20,.75)";
    ctx.fillText(a.label, sx + 1, sy - a._r - 5 + 1);
    ctx.fillStyle = selAdj && selAdj.has(a) ? "#e8edf7" : "#aab3c5cc";
    ctx.fillText(a.label, sx, sy - a._r - 5);
  }
  if (hover && !hover.hyper) {
    const [sx, sy] = toS(hover.x, hover.y);
    ctx.font = "600 12px Inter"; ctx.fillStyle = "#fff";
    ctx.fillText(hover.label, sx, sy - hover._r - 7);
  }
}

/* ---------- interaction ---------- */
function resize() {
  W = canvas.parentElement.clientWidth; H = canvas.parentElement.clientHeight;
  canvas.width = W * DPR; canvas.height = H * DPR;
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  draw();
}
new ResizeObserver(() => resize()).observe(canvas.parentElement);
function pick(mx, my) {
  const gx = (mx - view.x) / view.k, gy = (my - view.y) / view.k;
  let best = null, bd = 1e9;
  for (const a of N) {
    if (!nodeVisible(a)) continue;
    const d = Math.hypot(a.x - gx, a.y - gy) - (a._r || 3);
    if (d < bd) { bd = d; best = a; }
  }
  return best && bd <= Math.max(9 / view.k, 4) ? best : null;
}
let drag = null, moved = false;
canvas.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y }; moved = false; canvas.classList.add("dragging"); });
addEventListener("pointermove", e => {
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
    view.x = drag.vx + dx; view.y = drag.vy + dy; draw(); return;
  }
  const pt = pick(e.clientX - __rect().left, e.clientY - __rect().top);
  if (pt !== hover) { hover = pt; canvas.style.cursor = pt ? "pointer" : "grab"; draw(); }
  if (pt) showTip(pt, e); else hideTip();
});
addEventListener("pointerup", e => {
  canvas.classList.remove("dragging");
  if (drag && !moved) { const pt = pick(e.clientX - __rect().left, e.clientY - __rect().top); if (pt) { selected = pt; openPanel(pt); } else { selected = null; closePanel(); } draw(); }
  drag = null;
});
canvas.addEventListener("wheel", e => {
  e.preventDefault();
  const f = e.deltaY < 0 ? 1.13 : 1 / 1.13;
  const k2 = Math.min(Math.max(view.k * f, 0.12), 14);
  const __lx = e.clientX - __rect().left; view.x = __lx - ((__lx - view.x) / view.k) * k2;
  const __ly = e.clientY - __rect().top; view.y = __ly - ((__ly - view.y) / view.k) * k2;
  view.k = k2; draw();
}, { passive: false });
canvas.addEventListener("dblclick", () => { fit(); draw(); });

/* tooltip */
const tip = document.getElementById("tooltip");
function showTip(pt, e) {
  tip.querySelector(".tt-k").textContent = pt.hyper ? "cross-cutting pattern" : pt.type + (pt.bridge ? " · bridge" : "");
  tip.querySelector(".tt-n").textContent = pt.label;
  tip.style.display = "block";
  let x = e.clientX + 14, y = e.clientY + 12;
  const r = tip.getBoundingClientRect();
  if (x + r.width > innerWidth - 10) x = e.clientX - r.width - 14;
  if (y + r.height > innerHeight - 10) y = e.clientY - r.height - 12;
  tip.style.left = x + "px"; tip.style.top = y + "px";
}
function hideTip() { tip.style.display = "none"; }

/* panel */
const panel = document.getElementById("panel");
function centerOn(a) {
  const k = Math.max(view.k, 0.9);
  view.k = k; view.x = W / 2 - a.x * k; view.y = H / 2 - a.y * k;
}
function openPanel(pt) {
  const k = document.getElementById("p-kind"), nm = document.getElementById("p-name"),
        fl = document.getElementById("p-file"), bd = document.getElementById("p-body");
  k.textContent = pt.hyper ? "cross-cutting pattern" : pt.type + (pt.bridge ? " · bridge node" : "");
  k.style.color = pt.hyper ? "#c084fc" : (TYPE_COLOR[pt.type] || "#7aa2f7");
  nm.textContent = pt.label;
  fl.textContent = pt.file || "";
  const nb = (adj.get(pt) || []).slice().sort((a, b) => b.n.deg - a.n.deg);
  const rels = {};
  nb.forEach(x => { rels[x.rel] = (rels[x.rel] || 0) + 1; });
  let html = `<span class="metric"><b>${nb.length}</b> relations</span>` +
    (pt.chunks.length ? `<span class="metric">in <b>${pt.chunks.length}</b> scan${pt.chunks.length > 1 ? "s" : ""}</span>` : "");
  if (pt.url) html += `<div class="p-row" style="margin-top:6px"><a class="p-link" href="${esc(pt.url)}" target="_blank" rel="noopener">${esc(pt.url.slice(0, 64))}</a></div>`;
  if (pt.chunks.length) html += `<div class="p-sec">found in scans</div><div>${pt.chunks.map(c => `<span class="p-tag">${esc(c)}</span>`).join("")}</div>`;
  html += `<div class="p-sec">relation types</div><div>${Object.entries(rels).sort((a, b) => b[1] - a[1]).map(([r, c]) =>
    `<span class="p-tag" style="border-left:2px solid ${REL_COLOR[r] || "#5b6b8c"}">${esc(r)} · ${c}</span>`).join("")}</div>`;
  html += `<div class="p-sec">connections</div>` + nb.slice(0, 40).map((x, i) =>
    `<div class="p-row"><span class="p-link" data-nid="${esc(x.n.id)}">${esc(x.n.label)}</span> <span class="dim">· ${esc(x.rel)}${x.conf === "INFERRED" ? " (inferred)" : ""}</span></div>`).join("");
  if (nb.length > 40) html += `<div class="dim" style="margin-top:6px">+ ${nb.length - 40} more</div>`;
  bd.innerHTML = html;
  bd.querySelectorAll(".p-link[data-nid]").forEach(el => el.addEventListener("click", () => {
    const t = byId[el.getAttribute("data-nid")];
    if (t) { selected = t; centerOn(t); openPanel(t); draw(); }
  }));
  panel.classList.add("open");
}
function closePanel() { panel.classList.remove("open"); }
document.getElementById("p-close").onclick = () => { selected = null; closePanel(); draw(); };
addEventListener("keydown", e => { if (e.key === "Escape") { selected = null; closePanel(); draw(); } });

/* chips + stats */
[["hyper", "◆ patterns"], ["inferred", "inferred edges"],
 ["document", "documents"], ["concept", "concepts"], ["code", "code"], ["rationale", "rationale"], ["paper", "papers"], ["image", "images"]].forEach(([key, label]) => {
  const b = document.createElement("button");
  b.className = "chip";
  b.innerHTML = (TYPE_COLOR[key] ? `<span class="dot" style="background:${TYPE_COLOR[key]}"></span>` : "") + label;
  b.onclick = () => { TOGGLES[key] = !TOGGLES[key]; b.classList.toggle("off", !TOGGLES[key]); draw(); };
  document.getElementById("chips").appendChild(b);
});
[["entities", DATA.nodes.length, "#7aa2f7"], ["relations", DATA.links.length, "#4ade80"],
 ["patterns", DATA.hyper.length, "#c084fc"], ["bridges", DATA.nodes.filter(n => n.chunks.length > 1).length, "#e9c46a"],
 ["scans", 12, "#f472b6"]].forEach(([l, v, c]) => {
  const d = document.createElement("div"); d.className = "stat";
  d.innerHTML = `<b style="color:${c}">${fmt(v)}</b><span>${l}</span>`;
  document.getElementById("stats").appendChild(d);
});

/* ---------- go ---------- */
requestAnimationFrame(() => {
  resize(); fit(); draw(); // resize BEFORE fit: fit() needs real W/H; later window resizes keep the user's pan/zoom
  const l = document.getElementById("loading");
  l.style.opacity = "0"; setTimeout(() => l.remove(), 550);
});

		};
		if (CDN.length) Promise.all(CDN.map(loadScript)).then(run).catch(() => {});
		else run();
		return () => { destroyed = true; };
	});
</script>

{#if activated}
<div class="wikigraph">
<canvas id="stage"></canvas>
<header>
  <h1><b>FractalEngine</b> · Corpus Atlas</h1>
  <p>One knowledge graph merged from 12 documentation scans — every ADR, spec, design doc, plan and UI-library note, and the relations an extractor found between them.</p>
</header>
<div id="chips"></div>
<div id="stats"></div>
<div id="legend">solid edge — extracted relation · dashed — inferred<br>white halo — appears in multiple scans (bridge node)<br>◆ purple — cross-cutting pattern (hyperedge)<br>scroll to zoom · drag to pan · click a node</div>
<div id="tooltip"><div class="tt-k"></div><div class="tt-n"></div></div>
<div id="panel"><button id="p-close">×</button><div id="p-kind"></div><div id="p-name"></div><div id="p-file"></div><div id="p-body"></div></div>
<div id="loading"><div class="ring"></div><p>assembling corpus</p></div>
<div id="err"></div>
</div>
{/if}
