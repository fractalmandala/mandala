---
description: Enable the optional self-improvement plane for this machine (observe/eval/wiki compound). Like /wiki-init and /hooks-init — never required for delivery.
---

# /improve-init

Interactive setup for Fractal’s **self-improving installation** layer (Phase 1: config + data dirs).

Design: [docs/self-improvement.md](../docs/self-improvement.md).

## Non-blocking

If the user declines, continue product work. Learning never gates `/orchestrate`.

## Instructions

1. Resolve plugin root:
   ```sh
   sh <plugin>/scripts/resolve-plugin-root.sh
   ```
   Or `FRACTAL_AGENTIC_ROOT`.

2. Explain in one short paragraph:
   - Local observations/instincts/evals under XDG data `fractal-agentic/`
   - Profiles: `off` | `observe` | `full`
   - Evolved candidates never auto-merge into `plugin/skills` — promote is human/Meta
   - Pairs with `/wiki-init` for long memory and `/hooks-init` for session hooks

3. Ask one question at a time (defaults in parentheses):
   - **Profile** (`observe` recommended | `full` | `off`)
     - **off** — only manual `/learn`
     - **observe** — data plane ready; learn + instincts; observe hooks in Phase 2
     - **full** — also soft self-eval after non-trivial ship + wiki capture when vault exists

4. Run:
   ```sh
   export FRACTAL_AGENTIC_ROOT=<plugin-root>
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-improve.sh" --profile <profile>
   ```

5. Tell the user:
   ```sh
   source ~/.config/fractal-agentic/env.sh
   ```
   GUI hosts: set `FRACTAL_IMPROVE_PROFILE` and `FRACTAL_IMPROVE_DATA` if needed.

6. Verify with `/improve-status` or:
   ```sh
   sh "$FRACTAL_AGENTIC_ROOT/scripts/install-improve.sh" --check
   ```

7. Optional next steps (do not force):
   - `/wiki-init` if no vault
   - `/hooks-init` for safety hooks (separate from learning observe until Phase 2)
   - After hard tasks: use skill `agent-self-evaluation`
   - `/learn` to harvest session patterns

8. Ownership reminder:
   - **Workflow Boss** — install profile, personal learning
   - **Meta Boss** — promote into package / skill-health
