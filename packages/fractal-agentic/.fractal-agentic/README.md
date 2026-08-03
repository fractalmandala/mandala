# Fractal Agentic project install

- **Hooks materialization:** `hooks.claude.json` (absolute paths for this machine)
- **Plugin root:** `/Users/amrit/fractal-agentic/plugin`
- **Profile:** `standard` (env: `FRACTAL_HOOK_PROFILE`)

Re-run:
```sh
sh "/Users/amrit/fractal-agentic/plugin/scripts/install-hooks.sh" --target project --project-dir "/Users/amrit/fractal-agentic" --profile standard
```

Optional review fan-out: see `workflows/review-fanout.workflow.md` and `/review-fanout`.
