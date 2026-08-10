---
name: design-to-code
description: >
  Apply an approved Open Design / code-to-design package into monorepo Svelte +
  indented SASS with path allowlists and an apply report. Use for design→code in
  the bidirectional code-design-loop after extract/redesign. Triggers: "design to
  code", "apply design package", "land design tokens", "/design-to-code", or P2
  of preprojects/code-design-loop.
---

# Design → Code

Land **approved design package** changes into mandala product code.

**Product / tech:** `preprojects/code-design-loop/PRODUCT.md` + `TECH.md`  
**Inverse:** `code-to-design` (extract).  
**Not this:** redesign in Open Design (do that first); silent multi-app token clobber; force-push.

## Hard gates

1. **Allowlist only** — writes only under surface allowlist paths (see `references/allowlists/`).  
2. **Never** treat `vendors/design-packages/` as product source of truth for app runtime.  
3. **Shared-base tokens** need explicit `promoteToSharedBase: true` in intent; default is **surface-scoped** app/site SASS.  
4. **Indented SASS** — no braces/semicolons; no new in-component `<style>` where workspace forbids it.  
5. Emit **`apply-report.md`** in the design package (or worktree) listing files, tokens, refused paths.  
6. Do **not** commit unless the operator asks; leave a reviewable working-tree diff.

## Inputs

| Input | Required | Notes |
| --- | --- | --- |
| Design package dir | yes | e.g. `vendors/design-packages/fractaldharma-home` |
| `apply-intent.json` | yes for pilot | Explicit token/class/structure changes (not full freeform rewrite) |
| Surface allowlist | yes | `references/allowlists/<surface-id>.json` or package `meta.allowlist` |

### `apply-intent.json` shape

```json
{
  "surfaceId": "fractaldharma-home",
  "rationale": "P2 pilot: land missing --text-bs",
  "promoteToSharedBase": false,
  "tokens": [
    {
      "name": "--text-bs",
      "value": "1rem",
      "file": "sites/fractaldharma/src/lib/styles/_tokens.sass",
      "selectorHint": ":root"
    }
  ],
  "classes": [],
  "structure": []
}
```

Empty `tokens` / no intent → refuse apply (no silent full-file overwrite).

## Pipeline

1. Read `meta.json` + `evidence/contract.json` + `apply-intent.json`.  
2. Load allowlist for `surfaceId`; reject any path outside.  
3. For each token: patch existing SASS partial (edit existing only in P2 unless operator flag `allowCreatePartial`).  
4. Optionally sync package `tokens.css` to match applied values.  
5. Write `apply-report.md` under the package.  
6. Suggest verification: workspace check, re-run `code-to-design` for delta (P3).

Helper:

```bash
node packages/fractal-agentic/skills/design-to-code/scripts/apply-intent.mjs \
  --package vendors/design-packages/fractaldharma-home
```

## Verification

1. `git diff` only touches allowlisted paths.  
2. Apply report lists every change and refusal.  
3. SASS still indented (spot-check).  
4. Operator can open changed files and reject.

## Output to user

1. What applied (tokens/files)  
2. Path to `apply-report.md`  
3. Diff summary  
4. Next: re-extract / OD preview if they want loop close
