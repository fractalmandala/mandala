# Design → Code — user guide

Apply an approved design package into monorepo **Svelte + indented SASS**.

**Skill:** `packages/fractal-agentic/skills/design-to-code/`  
**Product:** `preprojects/code-design-loop/`

## Flow

1. Extract with `code-to-design` (or redesign in Open Design).  
2. Write/edit `apply-intent.json` in the package (explicit tokens).  
3. Run apply (agent or script).  
4. Review git diff + `apply-report.md`.  
5. Optionally re-extract to close the loop.

## Run

```bash
node packages/fractal-agentic/skills/design-to-code/scripts/apply-intent.mjs \
  --package vendors/design-packages/fractaldharma-home
```

Dry-run:

```bash
node packages/fractal-agentic/skills/design-to-code/scripts/apply-intent.mjs \
  --package vendors/design-packages/fractaldharma-home \
  --dry-run
```

## Safety

- Path allowlists under `references/allowlists/`  
- No shared-base promote without `promoteToSharedBase: true`  
- Packages under `vendors/` stay gitignored artifacts  
