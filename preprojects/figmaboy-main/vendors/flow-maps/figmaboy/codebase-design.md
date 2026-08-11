# Figmaboy — Codebase Design Analysis

## Seams & Adapters

### 1. Repository (persistence seam) — 23 methods, 2 adapters ✓
| Adapter | Implementation | Verification |
|---------|---------------|-------------|
| `BrowserRepository` | `localStorage` + backup key, `normalizeBrowserState()` on every read | `repository.test.ts` |
| `TauriRepository` | `invoke()` → Rust SQLite (WAL mode) | Rust unit tests |

**Depth**: Deep. Callers open/save/list without knowing about storage medium. The interface is large (23 methods) but each method is a single clear operation. Would benefit from splitting into `LibraryRepository` + `SessionRepository` — most callers use 3-4 methods at a time.

### 2. Editor Bridge (external control seam) — 1 method, TCP loopback ✓
The `editor_bridge.rs` (203 lines) binds a random TCP port, writes `editor-bridge.json` with a token, authenticates JSON-RPC requests, forwards to Tauri events. The MCP sidecar only needs to read the bridge file and send one JSON line per operation.

**Depth**: Deep. One `editor_bridge_complete(id, result)` method hides socket binding, token auth, timeout, and event routing.

### 3. document-validation (trust boundary seam) — 1 function, multiple entry points ✓
Every document crossing a boundary (persistence load, import, clipboard paste, RPC replace) passes through `sanitizeDocument()`. Repairs cycles, invalid types, NaN/Infinity, orphaned children, bad paint structures, missing required fields. Unknown fields are preserved for forward compatibility.

**Depth**: Extremely deep. One function hides 217 lines of defensive logic. Every caller and external agent gets a valid document with zero knowledge of the repair implementation.

### 4. MCP / RPC (agent control seam) — 17 tools, 2 transport modes
| Mode | Transport | When |
|------|-----------|------|
| Offline | SQLite direct read | App closed; `designs_list`, `design_context_get` |
| Live | TCP bridge → Tauri event → Svelte frontend | App open; `operations_apply`, `selection_set`, etc. |

**Depth**: Deep. The MCP sidecar is a single binary that Codex or any CLI agent speaks to via stdio. The agent doesn't know or care whether the app is open — the tool just works.

## Module Depth Analysis

### Deep (high leverage)

| Module | Interface Size | Implementation | Leverage |
|--------|:---:|:---:|---|
| **EditorSession** | ~15 methods (mutate, undo, redo, select, add/delete/move/group/align) | 687 lines | Every canvas interaction, RPC operation, and keyboard shortcut benefits from undo/redo/gesture-coalescing without knowing the internals |
| **geometry** | ~15 pure functions (matrix ops, transforms, bounds) | 168 lines | Every screen→world coordinate conversion, rotation, and selection bound benefits from correct affine math without callers doing trig |
| **canvas-selection** | 1 function `canvasSelectionTarget()` | 76 lines | Every pointer click resolves Figma-style depth without canvas code knowing about scope tracking, ancestor locking, or group atomicity |
| **document-validation** | 1 function `sanitizeDocument()` | 217 lines | Every load/import/paste/RPC path gets a valid document. Callers never see repair logic |

### Shallow (opportunities to deepen)

| Module | Issue | Recommendation |
|--------|-------|----------------|
| **domain.ts** (347 lines) | Types only, no behaviour. 25+ fields on CommonNode — `Primitive Obsession` | Bundle related text fields into a `TextStyle` type, shadow effects into a typed collection. Extract factory functions into a `NodeFactory` module to hide default construction |
| **EditorCanvas.svelte** (1,144 lines) | Pointer mode state machine mixed with rendering, viewport, text editing, and gesture management | Extract `InteractionController` module behind an interface: `beginGesture()`, `updateGesture()`, `commitGesture()`, `cancelGesture()` |
| **repository.ts** (489 lines) | 23-method interface + 2 adapters + localStorage normalization + auto-detection in ONE file | Split into `types.ts` (interface), `browser.ts` (adapter), `tauri.ts` (adapter). The `Repository` interface itself should be split by concern: `LibraryQueries` vs `SessionIo` |
| **domain types** | `TextNode` carries `textTruncation`, `maxLines`, `paragraphSpacing`, `paragraphIndent` — these appear in the type but nothing renders or sets them | Remove (Speculative Generality) or implement properly |

## Duplication to Resolve

| Pattern | File 1 | File 2 | Recommendation |
|---------|--------|--------|---------------|
| `finite()` / `clamped()` / `string()` / `boolean()` helpers | `document-validation.ts:12-26` (permissive, returns fallback) | `editor-rpc.ts:51-55` (strict, throws) | Extract shared `src/lib/type-guards.ts` with both `coerce()` and `require()` variants |
| `removeFromParent()`, `insertIntoParent()`, `removeTree()` | `editor.svelte.ts:54-61` | `editor-rpc.ts:24-44` | Move shared hierarchy helpers into `domain.ts` — they operate on `PageDocument`, not on `EditorSession` |
| `childIds()` helper | `editor.svelte.ts:18-20` | duplicate pattern in `CanvasNode.svelte` | Move to `domain.ts` as `childrenOf(Document, Id): Id[]` |
| `cloneDocument()` via `JSON.parse(JSON.stringify())` | Used in `domain.ts`, `editor.svelte.ts`, `editor-rpc.ts` | — | Already DRY via the `domain.ts` export. Keep it that way. |

## Shotgun Surgery Hot Spots

Adding a new node property requires touching:
1. `domain.ts` — type definition
2. `document-validation.ts` — sanitizer
3. `editor-rpc.ts` — RPC validator  
4. `CanvasNode.svelte` — SVG renderer
5. `Inspector.svelte` — property panel
6. Possibly `defaultNode()` factory

This is a structural consequence of discriminated union nodes, not fixable in current architecture. The tradeoff is: type safety across 7 modules vs one loose `any`-shaped node. The current approach is correct for a Figma clone — these 6 files ARE the places that should change together because they represent the complete vertical slice of a property.

## Recommendations (Priority-Ordered)

1. **P0 — Extract `type-guards.ts`** (30 min): Single shared module for `finite/clamped/string/boolean` with both strict and permissive variants. Touches 2 files, prevents future drift.
2. **P0 — Move hierarchy helpers to `domain.ts`** (30 min): `removeFromParent`, `insertIntoParent`, `removeTree`, `childIds` — these are pure functions on `PageDocument`, not editor-specific. One source of truth, used by both EditorSession and editor-rpc.
3. **P1 — Split `repository.ts`** (1-2 hours): Types → `repository.ts`, Browser adapter → `browser-repository.ts`, Tauri adapter → `tauri-repository.ts`. Reduces Divergent Change smell.
4. **P1 — Extract `TextStyle` from `TextNode`** (1 hour): Bundles the 12 text-related fields into a `TextStyle` interface embedded in `TextNode`. Reduces Primitive Obsession, makes text operations cleaner.
5. **P2 — Extract `InteractionController` from `EditorCanvas`** (3-4 hours): The pointer mode state machine (idle, pan, draw, move, resize, rotate, marquee) deserves its own module. The canvas becomes a view + event forwarder, not an interaction god object.
6. **P3 — Audit `TextNode` dead fields** (1 hour): Check if `textTruncation`, `maxLines`, `paragraphSpacing`, `paragraphIndent` are rendered anywhere. If not, remove or implement.
