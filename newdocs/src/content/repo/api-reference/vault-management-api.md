---
title: Vault Management API
description: **Referenced Files in This Document** `apps/fracta/src-tauri/src/vault.rs` `apps/fracta/src-tauri/src/frontmatter.rs` `apps/fracta/src-tauri/src/lib.rs` `apps/fracta/src-tauri/src/workspace.rs` `apps/…
type: item
---
<cite>
**Referenced Files in This Document**
- `apps/fracta/src-tauri/src/vault.rs`
- `apps/fracta/src-tauri/src/frontmatter.rs`
- `apps/fracta/src-tauri/src/lib.rs`
- `apps/fracta/src-tauri/src/workspace.rs`
- `apps/fracta/src/lib/markdown.ts`
- `apps/fracta/src-tauri/tauri.conf.json`
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)
10. [Appendices](#appendices)

## Introduction
This document describes the Vault Management API for handling markdown entries in a Tauri-based desktop application. The vault is a user-selected folder containing .md files, each representing an entry with YAML frontmatter metadata. The API exposes CRUD operations (create, read, update, delete, list), robust frontmatter parsing, safe path resolution to prevent traversal, and timestamp management. It also includes utilities for title derivation and excerpt generation used by the UI.

## Project Structure
The vault subsystem is implemented in Rust within the Tauri backend and exposed via Tauri commands to the Svelte frontend. Key modules:
- Vault core: file I/O, persistence, id validation, timestamps, listing, and deletion.
- Frontmatter parser: lightweight YAML-like parser for metadata fields and body separation.
- Tauri command layer: binds frontend calls to backend functions.
- Workspace module: shared path resolution and security checks used across features.
- Markdown utilities: TypeScript helpers for frontmatter splitting and HTML conversion.

```mermaid
graph TB
subgraph "Frontend"
FE["SvelteKit App"]
MD["markdown.ts"]
end
subgraph "Tauri Backend"
CMD["lib.rs<br/>Tauri Commands"]
VAULT["vault.rs<br/>Vault Core"]
FM["frontmatter.rs<br/>Frontmatter Parser"]
WS["workspace.rs<br/>Path Resolution & Security"]
end
FS["Filesystem (.md files)"]
FE --> CMD
CMD --> VAULT
VAULT --> FM
VAULT --> WS
VAULT --> FS
FE --> MD
```

**Diagram sources**
- `apps/fracta/src-tauri/src/lib.rs#L42-L96`
- `apps/fracta/src-tauri/src/vault.rs#L1-L127`
- `apps/fracta/src-tauri/src/frontmatter.rs#L145-L178`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`
- `apps/fracta/src/lib/markdown.ts#L30-L47`

**Section sources**
- `apps/fracta/src-tauri/src/lib.rs#L42-L96`
- `apps/fracta/src-tauri/src/vault.rs#L1-L127`
- `apps/fracta/src-tauri/src/frontmatter.rs#L145-L178`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`
- `apps/fracta/src/lib/markdown.ts#L30-L47`

## Core Components
- Entry: Full representation of a single markdown entry including id, title, category, tags, body, created_at, updated_at.
- EntrySummary: Lightweight summary for listing without body content; includes an excerpt preview.
- Vault: Stateful handle managing the selected vault directory and all entry operations.
- Frontmatter: Parser and serializer for YAML-like metadata blocks at the top of .md files.
- Tauri Commands: Thin wrappers exposing Vault methods over IPC.

Key responsibilities:
- Path safety and traversal prevention for ids and workspace paths.
- Timestamps derived from filesystem and persisted in frontmatter when available.
- Title derivation from body when no explicit title is provided.
- Efficient listing by reading only necessary fields and generating excerpts.

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L28-L52`
- `apps/fracta/src-tauri/src/frontmatter.rs#L10-L30`
- `apps/fracta/src-tauri/src/lib.rs#L66-L96`

## Architecture Overview
The API follows a layered architecture:
- Frontend invokes Tauri commands via IPC.
- Command handlers delegate to Vault methods.
- Vault validates inputs, resolves paths safely, reads/writes files, and uses the frontmatter module to parse or serialize documents.
- Workspace utilities enforce consistent path containment and security policies.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant CMD as "Tauri Command"
participant V as "Vault"
participant FM as "Frontmatter"
participant FS as "Filesystem"
FE->>CMD : create_entry()
CMD->>V : create()
V->>V : unique_id()
V->>FM : serialize(Document{meta, body})
V->>FS : write(id.md)
FS-->>V : ok
V-->>CMD : id
CMD-->>FE : id
FE->>CMD : write_entry(id, title, category, tags, body)
CMD->>V : write(id, title, category, tags, body)
V->>V : entry_path(id)
V->>FS : read(id.md)
FS-->>V : raw
V->>FM : parse(raw)
V->>V : derive_title if needed
V->>FM : serialize(Document)
V->>FS : write(id.md)
FS-->>V : ok
V-->>CMD : Entry
CMD-->>FE : Entry
```

**Diagram sources**
- `apps/fracta/src-tauri/src/lib.rs#L77-L91`
- `apps/fracta/src-tauri/src/vault.rs#L193-L267`
- `apps/fracta/src-tauri/src/frontmatter.rs#L210-L238`

## Detailed Component Analysis

### Data Models
- Entry: Contains id, title, category, tags, body, created_at, updated_at. Used for full read/write responses.
- EntrySummary: Subset of Entry fields plus excerpt; used for efficient listing.
- Meta: Frontmatter metadata fields: title, category, tags, created_at, updated_at.
- Document: Combines Meta and body string.

```mermaid
classDiagram
class Entry {
+string id
+string title
+string category
+string[] tags
+string body
+u64 created_at
+u64 updated_at
}
class EntrySummary {
+string id
+string title
+string category
+string[] tags
+u64 created_at
+u64 updated_at
+string excerpt
}
class Meta {
+string title
+string category
+string[] tags
+u64 created_at
+u64 updated_at
}
class Document {
+Meta meta
+string body
}
Entry --> Meta : "mirrors"
EntrySummary --> Meta : "mirrors"
Document --> Meta : "contains"
```

**Diagram sources**
- `apps/fracta/src-tauri/src/vault.rs#L28-L52`
- `apps/fracta/src-tauri/src/frontmatter.rs#L10-L30`

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L28-L52`
- `apps/fracta/src-tauri/src/frontmatter.rs#L10-L30`

### Frontmatter Parsing and Serialization
- Parser splits raw text into frontmatter block and body, tolerating BOM and CRLF.
- Supports scalar values with quotes, flow sequences for tags, and block sequences.
- Serializer writes minimal frontmatter, omitting empty optional fields and quoting scalars when required.
- Title derivation extracts the first meaningful line, strips heading markers and emphasis, and caps length with ellipsis.
- Auto-title detection recognizes legacy and current auto-generated titles to avoid overwriting custom titles.

```mermaid
flowchart TD
Start(["Parse Raw"]) --> Split["Split frontmatter vs body"]
Split --> HasFM{"Has frontmatter?"}
HasFM --> |No| ReturnBody["Return default Meta + body"]
HasFM --> |Yes| ParseKeys["Parse keys: title, category, tags,<br/>created_at, updated_at"]
ParseKeys --> TagsFlow{"tags format?"}
TagsFlow --> |Flow sequence| FlowTags["Split on commas outside quotes"]
TagsFlow --> |Block sequence| BlockTags["Read lines starting with '- '"]
TagsFlow --> |Bare value| SingleTag["Wrap as single-element array"]
FlowTags --> BuildMeta["Build Meta"]
BlockTags --> BuildMeta
SingleTag --> BuildMeta
BuildMeta --> Done(["Document {meta, body}"])
```

**Diagram sources**
- `apps/fracta/src-tauri/src/frontmatter.rs#L38-L64`
- `apps/fracta/src-tauri/src/frontmatter.rs#L117-L139`
- `apps/fracta/src-tauri/src/frontmatter.rs#L145-L178`

**Section sources**
- `apps/fracta/src-tauri/src/frontmatter.rs#L38-L64`
- `apps/fracta/src-tauri/src/frontmatter.rs#L117-L139`
- `apps/fracta/src-tauri/src/frontmatter.rs#L145-L178`
- `apps/fracta/src-tauri/src/frontmatter.rs#L210-L238`
- `apps/fracta/src-tauri/src/frontmatter.rs#L258-L290`

### Path Validation and Security
- Entry ids are validated to be bare file stems without separators, parent references, NUL characters, or dot-prefixes.
- Workspace paths are resolved relative to the vault root, rejecting absolute paths, traversal components, and symlinks escaping the root.
- All operations remain confined to the chosen vault directory.

```mermaid
flowchart TD
A["Input id/path"] --> ValidateId{"Is id valid?"}
ValidateId --> |No| Reject["Reject invalid id"]
ValidateId --> |Yes| Join["Join with vault dir + '.md'"]
Join --> Safe["Safe path inside vault"]
Safe --> Use["Use for read/write/delete"]
```

**Diagram sources**
- `apps/fracta/src-tauri/src/vault.rs#L115-L126`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L115-L126`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`

### Timestamp Management
- created_at and updated_at are stored in milliseconds since epoch.
- On read, updated_at is the maximum of frontmatter timestamp and filesystem modification time; created_at prefers frontmatter, else falls back to filesystem creation time or updated_at.
- On write, created_at is preserved from existing metadata or filesystem; updated_at is set to current time.

```mermaid
flowchart TD
RStart(["Read Entry"]) --> ReadRaw["Read file and metadata"]
ReadRaw --> ParseFM["Parse frontmatter"]
ParseFM --> UpdatedAt["updated_at = max(fm.updated_at, fs.modified)"]
ParseFM --> CreatedAt{"fm.created_at > 0?"}
CreatedAt --> |Yes| UseFM["created_at = fm.created_at"]
CreatedAt --> |No| Fallback["created_at = fs.created or updated_at"]
UseFM --> BuildEntry["Build Entry"]
Fallback --> BuildEntry
BuildEntry --> REnd(["Return Entry"])
```

**Diagram sources**
- `apps/fracta/src-tauri/src/vault.rs#L159-L189`
- `apps/fracta/src-tauri/src/vault.rs#L313-L332`

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L159-L189`
- `apps/fracta/src-tauri/src/vault.rs#L313-L332`

### Title Derivation and Metadata Handling
- If title appears auto-generated (empty or matches cleaned body or truncated version), it is replaced by a compact derived title.
- Category and tags are trimmed and filtered; empty tags are omitted from serialization.
- Excerpt is generated from the first non-empty line, stripping leading markdown heading markers and limiting length.

```mermaid
flowchart TD
WStart(["Write Entry"]) --> CheckTitle{"looks_like_auto_title(title, body)?"}
CheckTitle --> |Yes| Derive["derive_title(body)"]
CheckTitle --> |No| Keep["Keep provided title"]
Derive --> Normalize["Trim and sanitize"]
Keep --> Normalize
Normalize --> Serialize["Serialize frontmatter with category/tags"]
Serialize --> WEnd(["Save and return Entry"])
```

**Diagram sources**
- `apps/fracta/src-tauri/src/vault.rs#L212-L267`
- `apps/fracta/src-tauri/src/frontmatter.rs#L258-L290`
- `apps/fracta/src-tauri/src/vault.rs#L293-L301`

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L212-L267`
- `apps/fracta/src-tauri/src/frontmatter.rs#L258-L290`
- `apps/fracta/src-tauri/src/vault.rs#L293-L301`

### Tauri Command API Surface
Exposed commands for vault operations:
- vault_status: Returns configured status and path.
- pick_vault: Opens native folder picker and persists selection.
- list_entries: Returns Vec<EntrySummary>.
- read_entry: Returns Entry by id.
- create_entry: Creates new entry and returns id.
- write_entry: Updates entry fields and returns Entry.
- delete_entry: Deletes entry by id.

```mermaid
sequenceDiagram
participant FE as "Frontend"
participant CMD as "Tauri Commands"
participant V as "Vault"
FE->>CMD : list_entries()
CMD->>V : list()
V-->>CMD : Vec<EntrySummary>
CMD-->>FE : Vec<EntrySummary>
FE->>CMD : read_entry(id)
CMD->>V : read(id)
V-->>CMD : Entry
CMD-->>FE : Entry
FE->>CMD : create_entry()
CMD->>V : create()
V-->>CMD : String(id)
CMD-->>FE : String(id)
FE->>CMD : write_entry(id, title, category, tags, body)
CMD->>V : write(id, title, category, tags, body)
V-->>CMD : Entry
CMD-->>FE : Entry
FE->>CMD : delete_entry(id)
CMD->>V : delete(id)
V-->>CMD : Ok
CMD-->>FE : Ok
```

**Diagram sources**
- `apps/fracta/src-tauri/src/lib.rs#L42-L96`
- `apps/fracta/src-tauri/src/vault.rs#L128-L278`

**Section sources**
- `apps/fracta/src-tauri/src/lib.rs#L42-L96`
- `apps/fracta/src-tauri/src/vault.rs#L128-L278`

### Frontend Markdown Utilities
- splitFrontmatter: Parses YAML-like frontmatter into fields and body for presentation.
- splitMarkdownDocument: Returns frontmatter fields, body, and original prefix for editor integration.
- htmlToMarkdown: Converts editor HTML back to portable markdown using Turndown.

These utilities ensure the editor preserves YAML structure and handles Fracta-specific syntax safely.

**Section sources**
- `apps/fracta/src/lib/markdown.ts#L30-L47`
- `apps/fracta/src/lib/markdown.ts#L203-L207`

## Dependency Analysis
- lib.rs registers Tauri commands and manages state (Vault, AutoTag, GgufEngine).
- vault.rs depends on frontmatter.rs for parsing/serialization and std::fs for I/O.
- workspace.rs provides reusable path resolution and security checks used by other features.
- markdown.ts is independent frontend utility for markdown ↔ HTML conversions.

```mermaid
graph LR
LIB["lib.rs"] --> VAULT["vault.rs"]
VAULT --> FM["frontmatter.rs"]
VAULT --> WS["workspace.rs"]
FE["Frontend"] --> LIB
FE --> MD["markdown.ts"]
```

**Diagram sources**
- `apps/fracta/src-tauri/src/lib.rs#L1-L22`
- `apps/fracta/src-tauri/src/vault.rs#L1-L12`
- `apps/fracta/src-tauri/src/workspace.rs#L1-L18`

**Section sources**
- `apps/fracta/src-tauri/src/lib.rs#L1-L22`
- `apps/fracta/src-tauri/src/vault.rs#L1-L12`
- `apps/fracta/src-tauri/src/workspace.rs#L1-L18`

## Performance Considerations
- Listing entries avoids loading full bodies; only metadata and short excerpts are computed.
- Sorting by updated_at ensures newest-first ordering efficiently.
- Unique id generation uses base36 encoding of epoch millis with collision suffixing to minimize collisions.
- Filesystem operations are synchronous but bounded by small per-entry payloads; large vaults benefit from incremental updates and caching on the frontend.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Invalid entry id errors: Ensure ids contain no path separators, parent references, NUL characters, or dot-prefixes.
- Could not read/save entry: Verify vault folder is set and accessible; check permissions.
- JSON/CSV validation failures: For workspace writes, ensure JSON is valid and CSV has balanced quotes and consistent headers.
- Symlink traversal blocked: Paths must resolve within the vault root; remove or adjust symlinks that escape the root.
- Encoding issues: Only UTF-8, UTF-8 BOM, and UTF-16 encodings are supported for editing; other encodings are read-only.

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L115-L126`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`
- `apps/fracta/src-tauri/src/workspace.rs#L470-L512`

## Conclusion
The Vault Management API provides a secure, efficient, and developer-friendly interface for managing markdown entries with rich metadata. It enforces strict path safety, robust frontmatter parsing, and sensible defaults for titles and timestamps. The Tauri command layer cleanly exposes functionality to the frontend while maintaining strong isolation and control over filesystem access.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Reference Summary
- Create Entry
  - Input: None
  - Output: id (string)
  - Behavior: Generates unique id, writes initial frontmatter with timestamps, returns id.
- Read Entry
  - Input: id (string)
  - Output: Entry
  - Behavior: Reads file, parses frontmatter, computes timestamps, derives title if needed.
- Update Entry
  - Input: id, title, category, tags[], body
  - Output: Entry
  - Behavior: Validates id, preserves created_at, updates updated_at, serializes frontmatter.
- Delete Entry
  - Input: id (string)
  - Output: Ok
  - Behavior: Moves to OS trash or hard deletes if unavailable.
- List Entries
  - Input: None
  - Output: Vec<EntrySummary>
  - Behavior: Scans vault for .md files, parses frontmatter, generates excerpts, sorts by updated_at.

**Section sources**
- `apps/fracta/src-tauri/src/lib.rs#L66-L96`
- `apps/fracta/src-tauri/src/vault.rs#L128-L278`

### Security Measures
- Path traversal prevention for ids and workspace paths.
- Symlink containment checks to prevent escaping the vault root.
- CSP configuration restricts script and object sources.
- Input sanitization for tags and categories; trimming and filtering empty values.

**Section sources**
- `apps/fracta/src-tauri/src/vault.rs#L115-L126`
- `apps/fracta/src-tauri/src/workspace.rs#L143-L173`
- `apps/fracta/src-tauri/tauri.conf.json#L32-L34`