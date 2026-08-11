# Figmaboy — Code Quality Report

## Summary

| Axis | Findings | Worst Issue |
|------|:---:|---|
| Smells | 8 | `EditorCanvas.svelte` at 1,144 lines — Feature Envy + god object (pointer modes, rendering, viewport, text editing, gestures all in one component) |
| Duplication | 3 | `finite()/clamped()/string()/boolean()` duplicated across `document-validation.ts` (permissive) and `editor-rpc.ts` (strict) |
| Structural | 2 | Shotgun Surgery (1 property = 6 file changes), Divergent Change (repository.ts = interface + 2 adapters + normalization in 1 file) |

## Smell Analysis

### 1. Primitive Obsession — TextNode (Medium)
**File:** `domain.ts:139-158`
**Quote:** 12 separate scalar fields on TextNode (fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing, textAlign, textAlignVertical, textCase, textDecoration, paragraphSpacing, paragraphIndent)
**Fix:** Bundle into `TextStyle { fontFamily, fontSize, fontWeight, fontStyle, lineHeight, letterSpacing }` and `TextLayout { textAlign, textAlignVertical, textCase, textDecoration }` subtypes. Embed in TextNode.

### 2. Feature Envy — EditorCanvas reaches into session internals (High)
**File:** `EditorCanvas.svelte` (throughout 1,144 lines)
**Quote:** Canvas directly mutates `session.document.nodes[id]` for live gesture previews, reads raw document fields for bounds computation, accesses `session.gestureBefore` state.
**Fix:** EditorSession should expose `beginPreviewMutation()`, `applyPreviewMutation()`, `discardPreview()` — the canvas becomes a view, not a document manipulator.

### 3. Divergent Change — repository.ts (Medium)
**File:** `repository.ts` (489 lines)
**Quote:** One file contains the Repository interface (23 methods), BrowserRepository adapter, TauriRepository adapter, localStorage normalization, browser state recovery, and Tauri detection.
**Fix:** Split into `repository-types.ts` (interface), `browser-repository.ts`, `tauri-repository.ts`.

### 4. Message Chains — ancestor traversal (Low)
**Files:** `editor.svelte.ts:134-143`, `editor.svelte.ts:257-263`, multiple locations in `canvas-selection.ts`
**Quote:** `document.nodes[node.parentId]?.parentId ?? null` repeated for ancestor walking.
**Fix:** Add `ancestorChain(Document, Node): Node[]` to domain.ts. Single traversal, used everywhere.

### 5. Duplicated Code — type guard helpers (Medium)
**Files:** `document-validation.ts:12-26` vs `editor-rpc.ts:51-55`
**Quote:** `finite()` appears in both — one returns fallback (`clamped()`), the other throws. Same contract name, different semantics.
**Fix:** Extract to `src/lib/type-guards.ts` with explicit naming: `coerceFinite()` vs `requireFinite()`.

### 6. Duplicated Code — hierarchy operations (Medium)
**Files:** `editor.svelte.ts:54-61` vs `editor-rpc.ts:24-44`
**Quote:** `removeFromParent()`, `insertIntoParent()`, `removeTree()` are duplicated near-verbatim.
**Fix:** Move to `domain.ts` as pure functions on `PageDocument`. Both modules import from one source.

### 7. Speculative Generality — TextNode dead fields (Low)
**File:** `domain.ts:150-156`
**Quote:** `paragraphSpacing`, `paragraphIndent`, `maxLines`, `textTruncation` are defined but not rendered in `CanvasNode.svelte` or editable in `Inspector.svelte`. Dead weight.
**Fix:** Verify dead. If confirmed, remove. If planned, mark with `// TODO`.

### 8. Middle Man — childIds() wrapper (Low)
**File:** `editor.svelte.ts:18-20`
**Quote:** `function childIds(node) { return node.type === "frame" || node.type === "group" ? node.childIds : []; }` — trivial delegation.
**Fix:** Move to domain.ts. Every consumer (EditorSession, CanvasNode, layer tree) should use the same helper.

## Compliance with Figmaboy Standards

Figmaboy has no documented CODING_STANDARDS.md or CONTRIBUTING.md. The codebase self-documents through consistency patterns:

| Convention | Compliance | Notes |
|------------|:---:|---|
| Svelte 5 runes only (`$state`, `$derived`, `$props`) | ✓ Full | No legacy stores anywhere |
| `$state` for local reactive, not Svelte stores | ✓ Full | Pattern used consistently in EditorSession and components |
| TypeScript strict mode | ✓ Full | `tsconfig.json` extends strict base |
| Pure functions for math/geometry | ✓ Full | `geometry.ts`, `text-layout.ts` are stateless |
| `svelte.ts` extension for rune files | ✓ Full | Only `editor.svelte.ts` uses this convention (correct) |
| Vitest for unit tests | ✓ Good | 8 test files, well-structured |
| Playwright for E2E | ✓ Good | 477-line comprehensive E2E spec |
| Tauri command pattern | ✓ Good | Clean Rust invocations with type safety |
| MCP pattern | ✓ Good | Consistent tool contract in `mcp/types.ts` |

## Test Quality

| Area | Coverage | Notes |
|------|:---:|---|
| EditorSession commands | Good | 272 lines of tests: add/delete/undo/redo, group/ungroup, rotation, alignment, copy/paste, clipboard validation |
| Canvas selection | Good | 112 lines: frame-first, drill-in, sibling scope, group boundaries, locked ancenstors, hidden subtrees |
| MCP operations | Good | 166 lines: batch operations, stale rejection, paint validation, centering, border radius, image placement |
| Geometry | Moderate | 66 lines: transforms, marquee overlap, polygon generation |
| Repository | Moderate | 60 lines: CRUD, trash/restore, revision guards, recovery |
| Document validation | Light | 32 lines: basic repair cases |
| Text layout | Light | 30 lines: wrapping, sizing |
| E2E | Good | 477 lines: full interaction suite (draw, select, marquee, paste, zoom, text edit, home screen) |

## E2E Test Gaps

- No Mac-specific zoom gesture test (native GTK GestureZoom is Linux-only)
- No SSH/reconnection test (not applicable — local-first app)
- No Tauri native dialog test (file import/export dialogs)
- No RPC timeout / bridge disconnection test
- No concurrent save race condition test

## Performance Notes

- `EditorCanvas` uses `requestAnimationFrame` batching for viewport commits — good
- `cloneDocument()` via `JSON.parse(JSON.stringify())` creates full document copies on every history snapshot — acceptable for design documents (typically < 1,000 nodes), but would be a bottleneck if node count exceeds 10,000
- `CanvasNode` is recursive with no virtualization — acceptable for design files but could freeze at 5,000+ visible nodes
- No observable perf issues in the current test suite
