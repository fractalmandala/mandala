# Design package layout

See monorepo `preprojects/code-design-loop/TECH.md`.

```text
vendors/design-packages/<surface-id>/   # gitignored
  DESIGN.md           # per-surface overlay
  tokens.css
  base-ref.json       # shared base id
  preview/index.html  # required
  evidence/contract.json  # version 2
  evidence/report.md
  LOSS.md
  meta.json
```

Shared base + per-surface overlays. Packages never committed.
