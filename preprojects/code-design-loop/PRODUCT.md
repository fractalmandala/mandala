# PRODUCT.md — Code ↔ Design Loop (Open Design hybrid)

**Status:** P0–**P4** pilots done (2026-08-10)  
**Updated:** 2026-08-10  
**Audience:** humans and agents who extract design from mandala code, redesign in Open Design, and land changes back as Svelte + indented SASS  
**Companion:** [TECH.md](./TECH.md)

---

## Summary

Operators can move **both ways** between mandala product code and design work:

1. **Code → design** — capture a real Svelte/SvelteKit surface into an Open Design–compatible design package (brand contract + previewable artifact + evidence), so critique and redesign use the product’s look, not an invented mock.  
2. **Design → code** — edit that package in Open Design (or agent-driven design skills), then **apply** approved changes into the monorepo as Svelte 5 + external indented SASS without silent overwrite of unrelated product code.

The loop is closed when re-extract after apply still matches the approved design within a declared loss budget.

---

## Problem

- One-way style mocks (agent-written HTML) are not design tools and cannot round-trip into mandala code.  
- Open Design / Qoder-class tools generate and iterate real design artifacts well, but do not know mandala’s Svelte + indented SASS stack or monorepo layout.  
- Designers and agents need **both** high-fidelity incoming capture and production-shaped outgoing apply — not two disconnected workflows.

---

## Goals

1. Bidirectional flow with a **shared design contract** as the only middle layer.  
2. **Open Design** as the primary design host (preview, design systems, agent studio).  
3. **Mandala monorepo** as the primary product-code host (apps, sites, packages).  
4. Explicit **loss budget** (what never round-trips perfectly).  
5. Apply lands as reviewable git changes, not silent rewrites.

## Non-goals (P0–P1)

1. Replacing Open Design’s desktop app or daemon with a Fractal-built studio.  
2. Pixel-perfect parity for paneforge, animated phosphor icons, live data panes, Tauri IPC.  
3. Full monorepo multi-app automation in P1 (one pilot surface first).  
4. Figma as required source of truth (optional later).  
5. Treating `svelte-style-canvas` L1 `visualHtml` as the design package truth.

---

## Personas

| Persona | Needs |
| --- | --- |
| **Operator** (you / design-capable agent) | Capture a page, redesign in OD, land SASS/Svelte PR |
| **Agent (code)** | Extract evidence, apply with monorepo conventions, run checks |
| **Agent (design)** | Work inside OD with DESIGN.md + project files |
| **Reviewer** | Diff apply PR; loss report; before/after screenshots |

---

## Behavior

### Shared contract and identity

1. Every surface in the loop has a stable **surface id** (kebab-case slug), e.g. `fractaldharma-home`, used as the design package name and re-extract key.  
2. The operator can always retrieve, for a surface id: source paths (Svelte + layouts + styles), design package path, fidelity level of last extract, and last apply commit/ref if any.  
3. The design contract is human- and agent-readable: brand/tokens narrative (**DESIGN.md** — shared base plus optional per-surface overlay), machine tokens (**tokens**), component/class inventory, region map, states, orphans/unresolved, and a **loss report**.  
4. Empty or label-only “region trees” are never accepted as a successful code→design extract. Success requires a **previewable artifact** that looks like the product UI at the declared fidelity.  
5. Confidence labels on evidence are one of: `observed` | `inferred` | `unresolved`. Invented CSS without marking `inferred`/`unresolved` is a product failure.

### Code → design (extract)

6. The operator names a **target** (component, `+page.svelte`, or route) and optional **layout chain**. Default scope is one page + direct layout parents unless they expand.  
7. Extract produces an Open Design–compatible **design package** containing at least:  
   - `DESIGN.md` (brand/visual contract for that surface or shared system)  
   - token/CSS assets usable by OD preview  
   - a **previewable primary file** (HTML or OD project entry that renders in OD’s sandbox)  
   - machine **evidence** (regions, classes, file:line, orphans)  
   - `LOSS.md` or equivalent loss section (what was approximated)  
8. Fidelity levels the product exposes:  
   - **L1** — source-derived (agent SASS/CSS subset); allowed only if marked and not claimed “live.”  
   - **L2** — compiled/extracted styles from the project toolchain.  
   - **L3** — live browser capture (computed styles / DOM snapshot from a running surface).  
   - **L4** — live route with app data (optional; may remain partial).  
   Default for “workable code→design” toward Open Design quality is **L3** when a dev server can run; otherwise L2 with explicit downgrade notice.  
9. When L3 is used, the stage shows the **captured real UI** (or a faithful static freeze of it), not a hand-authored label tree.  
10. Extract never writes into app `src/` as the package home. Per-surface packages live under **gitignored** `vendors/design-packages/<surface-id>/` (see TECH.md), not product routes and not the git index by default.  
11. Orphan classes (used in markup, no stylesheet hit) appear in the package report and remain visible after import into Open Design context (via evidence file or DESIGN.md appendix).  
12. Themes (e.g. light/dark) that exist as `class:` or store-driven root classes on the target are extractable as **named states** the operator can switch in the design host when the artifact supports it.  
13. Child components not expanded are listed as leaf regions with import path evidence; expand depth defaults to one level unless the operator asks for more.  
14. If extract fails (no styles found, dev server down for L3, invalid target path), the operator receives a clear failure with next action — not a silent degraded tree presented as success.

### Design host (Open Design)

15. The operator can open the design package in **Open Design** and see a sandboxed preview of the artifact.  
16. The operator can attach or select the **shared base** design system (mandala-wide tokens/brand) and the **per-surface** overlay so further generative edits stay on-brand while keeping page-specific context.  
17. Iteration in Open Design (prompt, inspect, edit files) updates the **design package files**, which remain the design-side source of truth until apply.  
18. The product does not require the operator to re-upload zips each turn when OD MCP/project file access is configured; live project files are preferred.  
19. Generative redesigns that leave the loss budget (e.g. new layout language conflicting with product chrome) must be flaggable before apply; the operator can still force apply with an explicit override note in the apply report.

### Design → code (apply)

20. Apply takes an **approved** design package (or a declared diff within it) and a **target surface** in the monorepo.  
21. Apply proposes changes only to agreed paths: typically external SASS/token sheets, and/or Svelte markup for the surface — matching monorepo conventions (**Svelte 5 runes**, **external indented SASS**, no new in-component style blocks where the workspace forbids them).  
22. Apply never force-pushes or commits without the operator’s normal git workflow. Default is a **branch + working tree diff** the operator can review.  
23. Apply produces an **apply report**: files touched, tokens/classes changed, loss items not applied, and suggested verification commands for that workspace.  
24. If design tokens conflict with shared package tokens used by multiple apps, apply either:  
   - scopes changes to the target app/site’s style entry, or  
   - requires an explicit “promote to shared package” choice — never silently changes shared libraries.  
25. Interactive behavior that is not style (navigation data, IPC, paneforge sizing, server load) is out of apply scope unless the operator explicitly includes a behavior change in the brief; default apply is **visual/style + static structure** only.  
26. After apply, the operator can run **re-extract** on the same surface id; the product reports a **delta** (classes/tokens/regions changed) so the loop can be closed.

### Round-trip invariants

27. Surface id is stable across extract → design edit → apply → re-extract.  
28. Round-trip is successful when, for non-lossy regions, visual and token deltas are within the declared loss budget and no unresolved orphans were introduced by apply without being listed.  
29. Lossy by default (documented, not bugs): animated third-party icons, resizable pane chrome, runtime-only data lists, Tauri-only surfaces without web preview, motion that depends on JS libraries not inlined in the package.  
30. The operator can always open: last design package preview (OD), last apply report, and monorepo file paths for the surface.

### Agent and skill surfaces

31. Operators may invoke the loop via coding agents using Fractal Agentic skills/commands (names fixed in TECH.md), without manually editing contract JSON.  
32. Agents must refuse to claim “Open Design parity” for L1-only extracts.  
33. Legacy `svelte-style-canvas` remains usable as a **partial evidence/forensics** step; it is not a substitute for a successful code→design package at L2+.

### Pilot scope (P1 behavior boundary)

34. First pilot surface: **`sites/fractaldharma` home** (`+page.svelte` + root layout), dark theme default.  
35. P1 success for the human: extract that package, open in Open Design with recognizable Dharmalib chrome, make one token or spacing change in design, apply back to fractaldharma SASS, re-extract shows the change.  
36. Other apps (shradhapp, fractalengine) are in-scope for the product vision but not required for P1 acceptance.

---

## Decisions (locked)

1. **Shared base + per-surface overlays** — monorepo-wide Fractal base design system (tokens / brand language) plus per-surface package overlays for page-specific inventory, loss, and preview freezes. Surfaces do not each redefine the full brand.  
2. **Gitignored design packages** — extract outputs live under `vendors/design-packages/<surface-id>/` (gitignored). They are local/runtime artifacts, not committed product source. Shared base design-system sources that are intentionally versioned (if any) are separate and called out in TECH.md; per-surface freezes are not committed by default.

## Open questions

1. **L3 capture host** — always local Playwright against `pnpm dev`, or optional Storybook island per app? (Recommend: Playwright first.)  
2. **Open Design install model** — operator-local desktop/MCP only vs optional vendored submodule for CI capture? (Recommend: local OD + skills in monorepo; no submodule in P1.)

---

## Glossary

| Term | Meaning |
| --- | --- |
| **Surface** | A named UI target (page/component + layout chain) |
| **Design package** | OD-compatible folder: DESIGN.md, assets, preview entry, evidence, loss |
| **Extract** | Code → design package |
| **Apply** | Design package → monorepo code changes |
| **Loss budget** | Declared approximations that do not block success |
| **Contract** | Shared middle: tokens + inventory + evidence + DESIGN.md |
