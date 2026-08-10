# Design loop delta — user guide

Re-extract tokens after apply and report what changed vs the extract baseline.

```bash
node packages/fractal-agentic/skills/design-loop-delta/scripts/delta.mjs \
  --package vendors/design-packages/<surface-id>
```

Outputs:

- `delta-report.md`
- `evidence/delta.json`
- `evidence/contract.baseline.json` / `contract.after.json`

Open Design workflow: `preprojects/code-design-loop/docs/OPEN-DESIGN-WORKFLOW.md`.
