---
description: Install optional Fractal Agentic hooks for this machine/project (profiles, host adapters). User-facing setup like /wiki-init — never required for delivery.
---

# /hooks-init

Interactive setup for **optional** session hooks (safety, config protection, SessionStart bootstrap).  
Same role as `/wiki-init` for the wiki: **users run this after install**, on their machines.

## Non-blocking

Hooks are **never** required for `/orchestrate`, pins, or product work. If the user declines, continue without hooks.

## Instructions

1. Confirm plugin root:
   ```sh
   sh <plugin>/scripts/resolve-plugin-root.sh
   ```
   Or use `FRACTAL_AGENTIC_ROOT`.

2. Ask one question at a time (defaults in parentheses):
   - **Profile** (`minimal` | `standard` | `strict`) — default **`minimal`**
     - minimal: destructive bash, `--no-verify`, config-protection, SessionStart  
     - standard: + Stop quality/console warns  
     - strict: + first-edit GateGuard (`FRACTAL_GATEGUARD=off` to disable)  
   - **Target** (`config` | `claude` | `cursor` | `project` | `all`) — default **`all`** if unsure  
     - `config` — only `~/.config/fractal-agentic/hooks.json` + `env.sh`  
     - `claude` — merge into `~/.claude/settings.json` when possible  
     - `cursor` — write project `.cursor/hooks.json`  
     - `project` — materialize absolute-path hooks under `.fractal-agentic/`  
     - `all` — config + claude + cursor + project  
   - **Project directory** (default: current workspace root)

3. Run:
   ```sh
   export FRACTAL_AGENTIC_ROOT=<plugin-root>
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" \
     --target <target> \
     --profile <profile> \
     --project-dir <project-root>
   ```
   If the user already has host hooks and merge is conservative, offer:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --target claude --force --profile <profile>
   ```

4. Tell the user to:
   - `source ~/.config/fractal-agentic/env.sh` (or add to shell rc) for GUI-unrelated shells  
   - Set the same env in **GUI agent apps** if they do not load zshrc  
   - **Restart** the agent host so hooks reload  

5. Verify:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-hooks.sh" --check --target <target> --project-dir <project-root>
   ```
   Or `/hooks-status`.

6. Point to docs: `hooks/README.md`, `docs/hooks.md`.  
   Optional multi-review: `/review-fanout` (agent playbook; no native Workflow engine required).

7. Remind: `FRACTAL_DISABLED_HOOKS`, `FRACTAL_HOOK_PROFILE`, `FRACTAL_GATEGUARD=off` for opt-outs.
