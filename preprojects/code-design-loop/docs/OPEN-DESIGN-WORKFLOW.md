# Open Design workflow (mandala code ↔ design loop)

Operator guide for using **[Open Design](https://github.com/nexu-io/open-design)** with mandala extract/apply packages.

## Install

1. Desktop: https://open-design.ai/ download, **or**  
2. CLI: clone/run OD per their QUICKSTART (`od` binary).  
3. Wire your coding agent (optional):

```bash
od mcp install claude   # or cursor | codex | grok | …
# macOS: if /usr/bin/od shadows the CLI, use absolute path from OD Settings → MCP
```

MCP tools (when installed) typically include project/file list/read so agents can see **live** design package files without re-zipping.

## Mandala package → OD

### Shared base (versioned + local copy)

```text
preprojects/code-design-loop/design-systems/fractal-mandala/   # committed product
vendors/design-systems/fractal-mandala/                        # gitignored OD-local mirror
  DESIGN.md  tokens.css  manifest.json  registry.json
```

Regenerate:

```bash
node packages/fractal-agentic/skills/code-to-design/scripts/export-shared-base.mjs
```

### Per-surface packages (gitignored)

```text
vendors/design-packages/<surface-id>/
  DESIGN.md          # per-surface overlay
  tokens.css
  base-ref.json      # points at fractal-mandala
  preview/index.html
  evidence/…
```

Pilots: `fractaldharma-home` (L3), `fractalengine-appdock` (L2).

### Steps

1. **Export base** (if stale): `export-shared-base.mjs`.  
2. **Extract** surface: `code-to-design` → package under `vendors/design-packages/`.  
3. **Open in OD:** load **fractal-mandala** design system, then surface package / `preview/index.html`.  
4. Redesign; write `apply-intent.json` for token/structure applies.  
5. **Apply:** `design-to-code` (surface allowlist).  
6. **Delta:** `design-loop-delta`.

## Shared base vs surface

| Layer | What to load in OD |
| --- | --- |
| Shared base | `fractal-mandala` DESIGN.md + tokens.css |
| Per-surface | Overlay package + preview freeze |

## MCP agent prompts (examples)

```text
List Open Design projects. Read vendors/design-packages/fractaldharma-home/DESIGN.md
and apply-intent.json. Summarize pending token applies for mandala.
```

```text
After apply, run design-loop-delta on fractaldharma-home and summarize delta-report.md.
```

## Security

- OD daemon binds loopback by default; do not expose LAN without auth.  
- Design packages may contain full page freezes — treat as local artifacts (gitignored).  
- Apply never writes outside surface allowlists.

## Troubleshooting

| Issue | Fix |
| --- | --- |
| `od` is system octal dump | Use OD Settings MCP snippet with absolute path |
| Preview empty | Re-run L3 capture with vite up + playwright |
| Apply refused | Path outside allowlist — fix `apply-intent.json` file field |
| Delta shows no change | Snapshot baseline before apply; re-run delta after apply |
