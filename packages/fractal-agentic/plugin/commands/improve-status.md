---
description: Show self-improvement plane status (profile, data dirs, wiki link, eval counts).
---

# /improve-status

Report health of the optional self-improvement plane (like `/wiki-status` / `/hooks-status`).

## Instructions

1. Resolve plugin root (`FRACTAL_AGENTIC_ROOT` or resolve script).

2. Run:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-improve.sh" --check
   ```

3. Read if present:
   - `~/.config/fractal-agentic/self-improvement.json`
   - `~/.config/fractal-agentic/env.sh` (FRACTAL_IMPROVE_*)
   - Data root from config (default `${XDG_DATA_HOME:-~/.local/share}/fractal-agentic`)

4. Soft checks (do not fail the command on missing optional pieces):
   - Wiki: run soft resolve `skills/llm-wiki/scripts/wiki-resolve-root.sh` or env `FRACTAL_WIKI_ROOT`
   - Count files if cheap: `evals/*.json*` , instincts dirs
   - CL-v2: note if `${XDG_DATA_HOME:-~/.local/share}/ecc-homunculus` exists (bridge, not required)

5. Print a compact table:

   | Field | Value |
   | --- | --- |
   | profile | off / observe / full / missing |
   | config | path or missing |
   | data_root | path |
   | observations / evals / instincts | present + rough counts if easy |
   | wiki | linked path or not configured |
   | plugin_root | from config |
   | auto_merge into plugin | always false (Phase 1) |

6. If missing config: suggest `/improve-init`.  
   If profile is `off`: note manual `/learn` still works.  
   Never block product work based on this status.
