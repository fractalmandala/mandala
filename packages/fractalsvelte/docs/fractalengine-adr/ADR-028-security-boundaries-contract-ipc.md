---
id: ADR-028
title: Security Boundaries & Contract-Typed IPC
type: adr
tags: [security, ipc, sanitization, csp, capabilities, keychain, boundary]
summary: "Structural enforcement of the secrets/CSP/capability/sanitization posture introduced by Stream B: IpcApi contract, centralized sanitizeHtml boundary, guard tests, and threat-model trust zones."
relates_to: [ADR-004, ADR-027, src/lib/ipc.ts, src/lib/sanitizeHtml.ts, tests/unit/ipc-contract.test.ts, tests/unit/html-boundary.test.ts, tests/unit/security-config.test.ts]
status: accepted
updated: 2026-07-16
---


**Status:** Accepted

## Context

The July 2026 audit identified several classes of findings: plaintext credential
paths, injection-to-native surfaces, and gaps between the IPC gateway's browser
mock and the Tauri backend. Rather than fixing each finding ad-hoc, this ADR
centralises the security posture into structure that cannot silently regress.

The full execution plan is documented in
[SECURITY-CONTRACT-PLAN.md](../../SECURITY-CONTRACT-PLAN.md).

## Threat Model — Trust Zones

All content that crosses a trust zone must be sanitized. The zones are:

| Zone | Description | Examples | Sanitization |
|------|-------------|----------|--------------|
| **App UI** | FractalEngine's own components | Sidebar, header, VirtualList rows | `sanitizeHtml.inline` for generic surfaces; app-authored static markup is exempt |
| **AI output** | LLM responses and prompt completions | Chat messages, code blocks, Mermaid diagrams | `sanitizeHtml.markdown`, `sanitizeHtml.svg` (via Response.svelte, Mermaid.svelte) |
| **Imported HTML** | User-supplied design files | Designer HTML import | `sanitizeHtml.imported` (via codegen.ts) |
| **Hostile-by-default** | Future mail, external webhook payloads | Inline content from untrusted sources | Must use `sanitizeHtml.inline` or stricter |

## Decisions

### 1. `IpcApi` Contract Interface

The single IPC gateway (`src/lib/ipc.ts`) now exports an `IpcApi` interface that
lists every gateway function's exact signature. Both `ipc.ts` and `ipc-mock.ts`
enforce conformance via `satisfies`:

- `ipc.ts`: `const _ipcApiCheck: IpcApi = { ... } satisfies IpcApi` — adding a
  gateway function without covering the mock side is a **type error**.
- `ipc-mock.ts`: `const _mockApiCheck: Omit<IpcApi, NativeOnly> = { ... }` —
  the `NativeOnly` allowlist (`onAppCloseRequested`, `toggleWindowMaximize`,
  `setActiveTemplateMenu`) documents gateway functions that are legitimately
  Tauri-only (no browser analogue). Adding a new entry requires justification.

The plan had 59 functions in `ipc.ts` vs 56 in `ipc-mock.ts`. After this ADR:
the 2 missing mockable functions (`isTauri`, `templateIdToMenuId`) were
implemented; the 3 genuinely native-only functions are in `NativeOnly`; 2 orphan
mock helpers (`hello`, `subtract`) are documented demo content.

### 2. Centralized Sanitization Boundary (`src/lib/sanitizeHtml.ts`)

All DOMPurify usage moves to a single module exporting named profiles:

- **`markdown`** — AI response rendering (inlines, images, code blocks). Used by
  Response.svelte. No `<style>`, `<iframe>`, `<object>`, `<embed>`, `<form>`.
- **`svg`** — Mermaid diagram SVG (second layer after mermaid's strict mode).
  Used by Mermaid.svelte.
- **`imported`** — User-supplied design HTML. Used by codegen.ts. Forbids all
  dangerous tags.

A former **`inline`** profile constrained VirtualList's HTML-string rows; it was
removed when VirtualList moved to Svelte snippet rows (ADR-034), which eliminates
that `{@html}` sink entirely.

### 3. VirtualList Rows Without `{@html}`

`VirtualList.svelte` originally applied `sanitizeHtml.inline` to caller-supplied
`renderItem` HTML strings. ADR-034 replaced that API with a `row` snippet, so row
content is authored as compiled Svelte markup and never passes through `{@html}`.
The html-boundary guard test's allowlist shrank accordingly.

### 4. Guard Tests

Three guard tests enforce the security posture:

- **`tests/unit/ipc-contract.test.ts`** — (a) Name parity: every `ipc.ts` export
  has a mock implementation or is NATIVE_ONLY-listed; mock has no orphan exports.
  (b) Behavioral contract: fs round-trips, path-escape rejection, data-layer
  semantics (reindex-no-dup, AND matching, clamps), bookmarks CRUD errors.
- **`tests/unit/html-boundary.test.ts`** — Scans all `.svelte` files for `{@html}`
  and asserts every occurrence is in an explicit ALLOWLIST of files that import
  from `$lib/sanitizeHtml`. A new `{@html}` anywhere else fails with "route it
  through sanitizeHtml — see ADR-028".
- **`tests/unit/security-config.test.ts`** — (Stream A's) fs-reads taired.conf.json
  CSP and capability files; asserts `script-src 'self'`, no `unsafe-inline`/`unsafe-eval`,
  no shell/fs permissions for the browser webview.

### 5. AGENTS.md Rules

Rule 7 was amended: "parity is enforced by `IpcApi` + `ipc-contract` tests;
NATIVE_ONLY additions require justification."

New rule 13: "**Hostile-HTML Boundary**: any `{@html}` must render sanitized
output via `$lib/sanitizeHtml` profiles; `tests/unit/html-boundary.test.ts`
enforces this."

## Consequences

1. Adding a new IPC command now requires both a mock implementation AND an
   explicit NATIVE_ONLY entry if truly Tauri-only — it's a type error otherwise.
2. The sanitization boundary is centralized; new surfaces needing sanitization
   import a named profile rather than configuring DOMPurify inline.
3. VirtualList is now safe by construction as a generic component — caller
   HTML is constrained to inline text-level tags without attributes.
4. Guard tests provide regression coverage: a bare `{@html}` anywhere, a missing
   mock, or a CSP weakening will fail CI.
5. Native behavioral parity (running the `runContractSuite` against Tauri)
   remains a Phase-3 / manual step — the harness requires a Tauri e2e driver
   that does not yet exist.

## Related

- [ADR-004: Single IPC Gateway Module](./ADR-004-single-ipc-gateway-module.md)
- [ADR-027: Data Layer — In-Memory Mock Engine & Search Index](./ADR-027-data-layer-mock-engine.md)
- [SECURITY-CONTRACT-PLAN.md](../../SECURITY-CONTRACT-PLAN.md)
