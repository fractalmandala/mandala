# Code ↔ Design Loop

Bidirectional **code → design → code** for the mandala monorepo, using **[Open Design](https://github.com/nexu-io/open-design)** as the design host.

| Spec | Purpose |
| --- | --- |
| [PRODUCT.md](./PRODUCT.md) | User-visible behavior, invariants, non-goals |
| [TECH.md](./TECH.md) | Architecture, package layout, skills, phases, validation |

**Status:** P0–**P4** complete (multi-surface + shared base)

### Locked decisions

- **Shared base + per-surface overlays**  
- **Gitignored** surface packages; **committed** shared base under `design-systems/`  
- Host: **Open Design**

### Artifacts

| Kind | Path |
| --- | --- |
| Shared base | `preprojects/code-design-loop/design-systems/fractal-mandala/` |
| Surface 1 (L3) | `vendors/design-packages/fractaldharma-home/` |
| Surface 2 (L2) | `vendors/design-packages/fractalengine-appdock/` |

```bash
# regenerate shared base from monorepo SASS
node packages/fractal-agentic/skills/code-to-design/scripts/export-shared-base.mjs
```

Skills: `code-to-design` · `design-to-code` · `design-loop-delta`  
OD: [docs/OPEN-DESIGN-WORKFLOW.md](./docs/OPEN-DESIGN-WORKFLOW.md)
