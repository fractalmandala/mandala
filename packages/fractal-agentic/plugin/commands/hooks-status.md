---
description: Check whether Fractal Agentic optional hooks are installed and which profile is active.
---

# /hooks-status

Report optional hooks install health (like `/wiki-status` for the vault).

## Instructions

1. Resolve plugin root (`FRACTAL_AGENTIC_ROOT` or `scripts/resolve-plugin-root.sh`).

2. Run checks:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target config
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target claude --project-dir .
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target cursor --project-dir .
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target project --project-dir .
   ```

3. Read if present:
   - `~/.config/fractal-agentic/hooks.json` — profile + plugin_root  
   - `~/.config/fractal-agentic/env.sh`  
   - Project `.fractal-agentic/hooks-installed.json` / `hooks.claude.json`  
   - `.cursor/hooks.json`  

4. Report a compact table:

   | Surface | Status |
   |---|---|
   | config | ok / missing |
   | claude settings | ok / side-file only / missing |
   | cursor | ok / missing |
   | project materialization | ok / missing |
   | profile | minimal/standard/strict / unknown |
   | FRACTAL_AGENTIC_ROOT | value or unset |

5. If anything missing and the user wants hooks: suggest `/hooks-init`.  
   If they do not care: **do not block work** — hooks are optional.
