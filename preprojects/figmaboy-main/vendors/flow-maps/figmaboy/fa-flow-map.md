# Figmaboy Architecture — Flow Map

- **Target:** Figmaboy v0.3.0 (Tauri + SvelteKit + Svelte 5)
- **Scope:** Full application architecture — routes, editor subsystem, persistence, MCP bridge
- **Date:** 2026-08-07
- **Edge key:** Solid = containment (parent → child). Dashed = data/state/event/navigation.

```mermaid
flowchart TD
  subgraph APP["SvelteKit App"]
    ROOT["+layout.svelte<br/>ssr=false, SPA mode"]

    subgraph ROUTES["Routes"]
      HOME["/ — +page.svelte<br/>Library: projects, files, recents, drafts, trash"]
      EDITOR["/editor/[id] — +page.svelte<br/>Editor shell: panels, toolbar, save orchestration"]
    end

    ROOT --> HOME
    ROOT --> EDITOR
  end

  subgraph EDITOR_SUBSYSTEM["Editor Subsystem"]
    SESSION["EditorSession<br/>src/lib/editor/editor.svelte.ts<br/>State machine: $state runes, undo/redo, mutations, gestures"]
    CANVAS["EditorCanvas.svelte<br/>1,144 lines<br/>Pointer modes, pan/zoom, draw, select, resize, rotate"]
    CANVAS_NODE["CanvasNode.svelte<br/>Recursive SVG renderer (11 node types)"]
    LAYER_ROW["LayerRow.svelte<br/>Recursive tree rows"]
    INSPECTOR["Inspector.svelte<br/>Properties, prototype, export"]
    LEFT_PANEL["LeftPanel.svelte<br/>Pages, layers, icon assets"]
    TOOLBAR["Toolbar.svelte<br/>Tools, zoom, shape menu, terminal toggle"]
    TERMINAL["TerminalPanel.svelte<br/>xterm.js embedded PTY"]

    SESSION --> CANVAS
    CANVAS --> CANVAS_NODE
    CANVAS_NODE --> CANVAS_NODE
    SESSION --> LAYER_ROW
    SESSION --> INSPECTOR
    LAYER_ROW --> LAYER_ROW
    SESSION --> LEFT_PANEL
    SESSION --> TOOLBAR
    SESSION --> TERMINAL
  end

  EDITOR --> SESSION

  subgraph DOMAIN["Domain Layer"]
    TYPES["domain.ts<br/>11 node types, Paint, Document, Project, File"]
    GEOMETRY["geometry.ts<br/>2D Matrix math, world transforms, snapping"]
    TEXT_LAYOUT["text-layout.ts<br/>Text wrapping, measurement, truncation"]
    VALIDATION["document-validation.ts<br/>Trust boundary: sanitize, repair, normalize"]
    SELECTION["canvas-selection.ts<br/>Figma-style depth resolution"]
    RPC["editor-rpc.ts<br/>MCP operations → EditorSession commands"]
  end

  SESSION --> TYPES
  SESSION --> GEOMETRY
  SESSION --> VALIDATION
  CANVAS --> SELECTION
  EDITOR --> RPC
  RPC --> SESSION

  subgraph PERSISTENCE["Persistence"]
    REPO_INTF["Repository interface<br/>23 methods: CRUD, import/export, assets"]
    BROWSER_REPO["BrowserRepository<br/>localStorage + backup, sanitize on read"]
    TAURI_REPO["TauriRepository<br/>invoke() → Rust SQLite"]
    RUST_DB["lib.rs — 1,596 lines<br/>SQLite WAL mode, 30 commands, image storage"]

    REPO_INTF --> BROWSER_REPO
    REPO_INTF --> TAURI_REPO
    TAURI_REPO --> RUST_DB
  end

  HOME --> REPO_INTF
  EDITOR --> REPO_INTF

  subgraph MCP["MCP Bridge"]
    MCP_SERVER["figmaboy-mcp (sidecar)<br/>17 tools: offline SQLite reads + live bridge operations"]
    BRIDGE["editor_bridge.rs<br/>TCP loopback, token auth, Tauri events"]
    MCP_SERVER --> |"stdin/stdout"| MCP_SERVER
    MCP_SERVER --> |"TCP JSON-RPC"| BRIDGE
    BRIDGE --> |"Tauri event"| EDITOR
    MCP_SERVER --> |"read-only"| RUST_DB
  end

  HOME -.-> |"goto('/editor/[id]')"| EDITOR
  SESSION -.-> |"changeToken"| RPC
  CANVAS -.-> |"beginGesture/commitGesture"| SESSION
  VALIDATION -.-> |"sanitize on every read"| REPO_INTF
  MCP_SERVER -.-> |"external agent operations"| RPC
