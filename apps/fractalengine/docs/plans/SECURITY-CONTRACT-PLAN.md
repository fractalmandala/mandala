---
id: security-contract-plan
title: Security Contract Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**

# Security Boundaries & Contract-Typed IPC — Two-Stream Execution Plan

**Repo:** `apps/fractalengine` (SvelteKit + Tauri 2.11, Svelte 5 runes, indented SASS)
**Goal:** Two related hardening tracks in one phase. (1) **Security boundaries**:
complete and — more importantly — make *structurally enforced* the secrets/CSP/
capability/sanitization posture, so the July-2026 audit class of findings (plaintext
credentials, injection-to-native paths) cannot silently regress. (2) **Contract-typed
IPC**: one `IpcApi` interface both `ipc.ts` and `ipc-mock.ts` must satisfy, plus
parity and behavioral contract tests, so mock maintenance stops being a documented
human obligation (AGENTS.md rule 7) and becomes a failing build.

**Current state — verified by inventory, do NOT redo what is done:**

| Area | State |
|---|---|
| CSP | ON and tight: `script-src 'self'`, `object-src 'none'`, `base-uri 'self'` (tauri.conf.json ~line 27). `img-src` allows broad `https:` — review candidate, not a gap. |
| Capabilities | Already split: `default.json` (main window: `core:default` + `window-state:default` only) and `browser-chrome.json`; the `browser-content` webview that loads arbitrary sites has NO capability grants — this isolation is deliberate and documented in the capability file itself. |
| Secrets | OS keychain (`keyring = "3"`) already stores provider API keys (`api-key-{provider}` entries, lib.rs ~1156/1257) and crypto key material (crypto.rs ~16). Workspace snapshots already strip `apiKey` from custom models. |
| Sanitization | DOMPurify in use at three call sites with three independent configs: `ai-elements/Response.svelte`, `ai-elements/Mermaid.svelte` (double-sanitizes SVG), `modules/designer/engine/codegen.ts`. |
| **Live finding** | `src/lib/components/VirtualList.svelte:116` renders `{@html renderItem(item, index)}` — a generic component that is an injection sink by construction; search-result snippets/titles flow through it today. |
| **IPC drift, already real** | `ipc.ts` exports 59 functions; `ipc-mock.ts` exports 56. The gap is unexplained until inventoried. This number is the whole argument for item 6. |

**What this phase therefore is:** close the small remaining gaps, centralize the
sanitization boundary, and convert every one of these postures into a **guard test**
that fails CI on regression. The threat model and each guard land in ADR-028.

**No Phase 0 this time.** Unlike prior feature phases, the contract (the `IpcApi`
interface) is *derived from existing code*, not invented — and the ownership sets
below are naturally disjoint. Both agents branch from the same clean `master` commit.

You are one of two agents. Operator assigns **Agent A (native & config guards)** or
**Agent B (frontend boundaries & IPC contract)**.

- Agent A: branch `security-native`.
- Agent B: branch `security-contract-frontend`.
- Phase 3 runs once after both merge.

### Hard rules (both streams)

- Zero behavioral change for legitimate flows; all existing Playwright specs pass
  unedited. Security tightening that breaks a real feature = STOP and report with the
  specific conflict; do not quietly loosen a boundary to make a test pass.
- No new npm dependencies (DOMPurify is already present). Rust: no new crates
  (keyring is already present).
- Do not attempt git-history rewrites for anything sensitive found in old commits —
  report findings; history surgery is an operator decision.
- Guard tests must name the violated boundary in their failure message.

### File-ownership manifest (disjoint)

**Stream A owns:** `src-tauri/**` (including `tauri.conf.json`, `capabilities/*`),
`src/lib/state/ide.svelte.ts` (secret-handling paths ONLY, if the A2 inventory finds
gaps), `tests/unit/security-config.test.ts` (new).

**Stream B owns:** `src/lib/ipc.ts` + `src/lib/ipc-mock.ts` (type-conformance
additions only — no signature changes), `src/lib/sanitizeHtml.ts` (new),
`src/lib/components/VirtualList.svelte`, `src/lib/components/ai-elements/
{Response,Mermaid}.svelte`, `src/lib/modules/designer/engine/codegen.ts`
(sanitizer-callsite migration only), `tests/unit/ipc-contract.test.ts` +
`tests/unit/html-boundary.test.ts` (new), `docs/**`, `AGENTS.md`.

---

## Stream A — Native & config guards (Agent A)

Branch `security-native`. Requires the Rust toolchain (`cargo check` gates).

### A1. Secrets inventory (mandatory first step, produce the table)

Enumerate every secret the app touches and where it rests: provider API keys
(keychain ✓ — verify all read/write paths go through the keyring entries and none
fall back to disk/localStorage), the password-database key material (crypto.rs —
verify the DB content on disk is ciphertext and the key never leaves the keychain),
AI custom-model credentials (snapshot-stripping ✓ — verify the strip covers every
persistence path: workspace save, ide undo snapshots via the engine, `ide:workspaces`
localStorage), `.env` provider values (dev-only by design — confirm they are never
persisted by the app), session/chat content (memory.db — plaintext by design; record
in ADR threat model, not a defect). For each row: storage location, at-rest
protection, and the code path. Anything resting in plaintext that is a credential →
fix by moving to the keychain with a one-time migration (read old location → write
keychain → delete old), following the existing `migrateLegacyApiKeys` pattern in the
kernel.

### A2. Close the gaps the inventory finds

Expected small: the keychain infrastructure exists. Any fix follows the existing
patterns in lib.rs/crypto.rs. If a gap requires a NEW IPC command, STOP and report —
gateway contract changes are operator decisions (the data-layer precedent).

### A3. CSP + capability review (tighten only with proof)

- `img-src https:` — determine what actually needs remote images (model marketplace
  thumbnails? favicon fetches?). If a finite host list works, tighten; if not,
  document why broad `https:` stays (images are low-risk under `script-src 'self'`).
- Confirm `connect-src` covers all legitimate runtime calls (AI provider endpoints
  are made from Rust, not the webview — verify, since that's why `connect-src` can
  stay narrow).
- Capabilities: re-verify `browser-content` has zero grants and that no permission in
  `default.json`/`browser-chrome.json` exceeds documented need. Do not add
  permissions.

### A4. `tests/unit/security-config.test.ts` — the config guards

Node-side (fs-reading) assertions, in the style of `style-contracts.test.ts`:
1. `tauri.conf.json` `security.csp` is non-null, contains `script-src 'self'` with no
   `unsafe-inline`/`unsafe-eval` in script-src, and `object-src 'none'`.
2. Every file in `src-tauri/capabilities/` parses; no capability grants
   `shell:allow-execute`-class or `fs:` broad-scope permissions; no capability lists
   the `browser-content` webview.
3. No tracked file under `static/` or `src-tauri/` matches credential-fixture
   patterns (case-insensitive `bitwarden|passwords.*\.json|\.pem|\.p12` — tune
   against the repo, then freeze; currently expected to pass).
4. `Cargo.toml` still lists `keyring` (removal = someone reverted the secrets story).

### A5. Verify and commit

`cargo check` && `cargo test` (in `src-tauri/`) → `pnpm check` → `npx vitest run` →
`npx playwright test` (unedited). Report includes the A1 secrets table verbatim.
Commit.

---

## Stream B — Frontend boundaries & IPC contract (Agent B)

Branch `security-contract-frontend`.

### B1. IPC drift inventory (mandatory first step)

Diff the export lists of `ipc.ts` and `ipc-mock.ts` (59 vs 56 at plan time). Classify
every gap: (a) genuinely missing mock → implement it, matching the mock's existing
conventions; (b) legitimately native-only (e.g. helpers like `isTauri` itself, or
Tauri-event plumbing with no browser analogue) → add to an explicit, commented
`NATIVE_ONLY` allowlist. No third category.

### B2. The `IpcApi` contract

In `ipc.ts`, derive and export `interface IpcApi` covering every gateway function's
exact signature (mechanical extraction — types already exist). Enforce conformance in
BOTH files without changing any call site, using a `satisfies` object at the bottom
of each:

```ts
// ipc.ts
const _ipcApiCheck = { listDirectory, readFile, /* …every gateway fn… */ } satisfies IpcApi;
// ipc-mock.ts
const _mockApiCheck = { listDirectory, readFile, /* …every fn except NATIVE_ONLY… */ } satisfies Omit<IpcApi, NativeOnlyKey>;
```

From now on, adding a gateway function without its mock (or an explicit allowlist
entry) is a **type error**, not a rule-7 obligation.

### B3. `tests/unit/ipc-contract.test.ts`

1. **Name parity**: parse both modules' exports (import them — the mock runs under
   vitest; ipc.ts imports Tauri APIs, so if importing it in Node is problematic,
   fall back to TS-AST/regex extraction of export names from source, as
   style-contracts does with fs) and assert: every `ipc.ts` export is mock-implemented
   or NATIVE_ONLY-listed, and the mock has no orphan exports.
2. **Behavioral contract vs the mock** (the executable half of rule 7): a shared spec
   exercising the mock's semantics — fs round-trips (write/read/rename-dir/delete),
   path-escape rejection (`normalizedMockPath` traversal), data-layer semantics
   (reindex-no-dup, AND-matching, clamps — extend the existing data-layer-mock test if
   overlap), bookmarks CRUD errors. Structure it as
   `runContractSuite(api: Partial<IpcApi>)` against the mock now; the suite's shape is
   what a future Tauri-driver harness would reuse against native (record that intent
   in the ADR — native behavioral parity remains Phase-3 manual this phase).

### B4. The sanitization boundary

1. Create `src/lib/sanitizeHtml.ts`: one DOMPurify wrapper exporting named profiles.
   Inventory the three existing configs FIRST and preserve each call site's effective
   behavior — this is centralization, not loosening/tightening:
   - `markdown` (Response's config), `svg` (Mermaid's), `imported` (codegen's), and a
     new strictest `inline` profile (text-level tags only — `b i em strong mark span`,
     no attributes, no URLs) for generic surfaces.
2. Migrate the three call sites to import their profile from the boundary file.
3. **Fix the VirtualList sink**: the component itself applies `sanitizeHtml.inline`
   to `renderItem`'s output before `{@html}` — a generic list must be a boundary by
   construction. Verify search-result highlighting still renders (its `«»` markers /
   highlight spans must survive the `inline` profile — adjust SearchOverlay's markup
   to profile-allowed tags if needed).
4. `tests/unit/html-boundary.test.ts`: fs-scan all `src/**/*.svelte` for `{@html` and
   assert every occurrence is in an ALLOWLIST of files that import from
   `$lib/sanitizeHtml` (the allowlist lives in the test, commented per entry). A new
   `{@html` anywhere else fails with "route it through sanitizeHtml — see ADR-028".

### B5. Docs & rules

ADR-028 (threat model summary: trust zones — app UI / AI output / imported design
HTML / future mail bodies as hostile-by-default; the guard tests as enforcement; the
keychain/capability/CSP posture from Stream A's table; native behavioral parity
deferred). Routing docs for `sanitizeHtml.ts` + updated docs for touched files; INDEX
regen. AGENTS.md: rule 7 gains "parity is enforced by `IpcApi` + `ipc-contract`
tests; NATIVE_ONLY additions require justification"; new rule 13: "**Hostile-HTML
Boundary**: any `{@html}` must render sanitized output via `$lib/sanitizeHtml`
profiles; `tests/unit/html-boundary.test.ts` enforces this." **Your commit is
incomplete without the docs deliverables — list them in your final report.**

### B6. Verify and commit

`pnpm check` (0/0 — the satisfies checks are the point) → `pnpm build` →
`npx vitest run` → `npx playwright test` (unedited) → browser smoke: AI chat renders
markdown + a mermaid block correctly; Search Everything highlights still render;
designer HTML import still works. Commit.

---

## Phase 3 — Integration & verification (run ONCE after merge)

1. Merge `security-native`, then `security-contract-frontend`. Conflicts = strayed
   agent.
2. `pnpm check` && `pnpm build` && `npx vitest run` && `cargo test` &&
   `npx playwright test` — green, existing specs unedited.
3. **Mutation checks, one per guard**: (a) add a dummy export to `ipc.ts` without a
   mock → ipc-contract test fails; (b) add a bare `{@html foo}` to any component →
   html-boundary test fails; (c) set `csp: null` locally → security-config test
   fails; (d) revert each.
4. Injection spot-check (browser): craft a note titled
   `<img src=x onerror=alert(1)>.md`, index it, run Search Everything — the title
   renders inert as text; same string through the AI chat response path renders
   inert.
5. `pnpm tauri dev` (operator): API-key save/load round-trips through the OS keychain
   (Keychain Access shows the entry; no plaintext file appears); password vault
   unlock works; browser template loads an external site with the content webview
   still isolated (no devtools IPC access from it); CSP intact in the packaged
   window (no console CSP violations during normal use of all six templates).

## Explicitly out of scope (do not improvise)

- Git-history purges; rotating any real credentials (operator tasks — report only).
- New IPC commands; running the behavioral contract suite against native (harness
  design noted in ADR, built when a Tauri e2e driver exists).
- Sandboxing/webview process isolation beyond existing capabilities; auto-updater
  signing; SettingsDialog work.
- Sanitizing TRUSTED app-authored static markup that never contains external data —
  the boundary is for content that crosses a trust zone, and the allowlist documents
  each judgment.
