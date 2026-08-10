---
task: code-design-loop
status: committed
host: grok-build
boss: design + meta
updated: 2026-08-10
---

# Handoff — Code ↔ Design Loop (P0–P4 complete)

## Done

| Phase | Result |
| --- | --- |
| P0 | Specs + locked decisions |
| P1 | L3 extract `fractaldharma-home` |
| P2 | Apply `--text-bs` to fractaldharma SASS |
| P3 | Delta closed pilot round-trip |
| P4 | Shared base **fractal-mandala** + second surface **fractalengine-appdock** |

### Shared base

```text
preprojects/code-design-loop/design-systems/fractal-mandala/  # commit this
vendors/design-systems/fractal-mandala/                       # gitignored mirror
```

```bash
node packages/fractal-agentic/skills/code-to-design/scripts/export-shared-base.mjs
# apps: fractaldharma (59 tokens) + fractalengine (102) → 147 unique names
```

### Surfaces

- `vendors/design-packages/fractaldharma-home` — L3, base-ref linked  
- `vendors/design-packages/fractalengine-appdock` — L2 mock, base-ref linked  
- Allowlist: `design-to-code/references/allowlists/fractalengine-appdock.json`

### Skills

- code-to-design (+ export-shared-base.mjs)  
- design-to-code  
- design-loop-delta  

### OD

`preprojects/code-design-loop/docs/OPEN-DESIGN-WORKFLOW.md`

## Remaining (optional)

- [ ] L3 capture for fractalengine-appdock (needs `pnpm tauri dev` / vite + dock open state)  
- [ ] Commit product skills/specs/design-systems on clean worktree  
- [ ] Wire OD MCP install for preferred agent  
