# Document Serialization Decision

Date: 2026-07-31  
Scope: FractalKnow editor surfaces (`apps/fractalknow`)

## Decision

**Markdown (`.md`) is the canonical source of truth on disk and in Git.**

TipTap holds an in-memory ProseMirror JSON AST while the user edits. A bi-directional converter bridges the two layers. HTML is used only as paste/load transport — never as the durable document format.

This matches OpenKnowledge's dual-layer architecture:

```
┌──────────────────────────────────────────────────────────┐
│              Canonical Data (Disk / Git)                 │
│                     Markdown (.md)                       │
└────────────────────────────┬─────────────────────────────┘
                             │
               Bi-directional AST Converter
          (local port of the OK remark/PM pipeline)
                             │
┌────────────────────────────▼─────────────────────────────┐
│                 In-Memory Editor State                   │
│              TipTap / ProseMirror JSON AST               │
└──────────────────────────────────────────────────────────┘
```

## Implementation

| Layer | Module |
| --- | --- |
| Decision + converters | `src/lib/editor/serialization.ts` |
| TipTap extension bundle | `src/lib/editor/extensions.ts` |
| Paste (Markdown-first, HTML scrubbed via MD bridge) | `src/lib/editor/paste.ts` |
| Compatibility re-exports | `src/lib/components/editor/tiptap-markdown.ts` |
| Round-trip tests | `src/lib/editor/serialization.unit.test.ts` |

## Modes

- **Rich**: TipTap AST in memory; every update serializes to Markdown into the document store.
- **Source**: CodeMirror edits the Markdown buffer directly.
- **Preview**: Markdown → HTML (plus Mermaid rendering) via the same shared parse pipeline (`parseSharedMarkdown` in `src/lib/editor/serialization.ts`) the editor uses — one marked config (`SHARED_MARKED_CONFIG`, `gfm: true, breaks: false`).
- **Diff**: last-saved Markdown vs current buffer.

## Round-trip guarantees

Verified by `src/lib/editor/serialization.roundtrip.unit.test.ts` (parse→serialize→diff fixtures).

**Byte-faithful**: YAML frontmatter (carried through HTML/TipTap as a fenced code block with sentinel language `frontmatter`, re-emitted as raw `---` fences), task list state (`- [ ]` / `- [x]`), escaped punctuation (`\*`, `\_`, `` \` ``, `\[`), nested lists at marker-width indentation, multi-line/paragraph/nested blockquotes, fenced code (incl. backticks inside), inline HTML (as literal text), unicode/emoji, images and tables **at the HTML↔Markdown bridge level**.

**Stable-after-first-trip (intentional normalizations)**: code fence info strings collapse to their first word (marked keeps only the language class); tilde fences → backticks; autolinks `<https://…>` → `[https://…](https://…)`; intra-word underscores get escaped; unmatched brackets get escaped; unclosed fences gain a closing fence.

## Known limitations

- **StarterKit schema drops**: the rich editor schema has no Image, Table, or TaskList node. Images and tables survive the serialization bridge (and therefore paste/preview) but are dropped if the document passes through the *rich editor* schema parse. Task lists survive the editor as literal `[ ]` / `[x]` text, which re-parses as a task list. Adding `@tiptap/extension-image` / `-table` / `-task-list` is the follow-up if rich editing of those nodes is required.
- **Hard breaks**: trailing-double-space hard breaks collapse to plain newlines.
- **List item block content**: code blocks / multiple paragraphs inside a list item are flattened into the item's inline text.
- **Frontmatter edge**: a document opening with `---\n…\n---` is always treated as frontmatter (matching remark-frontmatter in the reference); a literal hr–hr opening must be written differently.

## Collaboration

Yjs + Hocuspocus provider (`src/lib/editor/collab.ts`) bind TipTap Collaboration / CollaborationCaret to the in-memory AST. Offline IndexedDB cache holds the Y.Doc when no collab URL is configured. A per-session Y.Doc `update` observer converts the fragment to Markdown headlessly (y-prosemirror → schema DOM serializer → MD bridge) and writes it into the document store, so updates landing on cached sessions whose editor is unmounted still reach persistence. Sessions are stopped when their document tab closes. Disk persistence still writes Markdown through the project filesystem bridge. There is no local conflict state: Yjs CRDTs merge edits automatically (the former `markCollabConflict` dead code was removed; the `conflict` status remains reserved for future server-reported divergence).
