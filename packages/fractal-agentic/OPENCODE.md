# Fractal Agentic — OpenCode / generic agent shim

Point the host at **this plugin directory** as the skill and instruction root.

| File | Use |
|---|---|
| `SOUL.md` | Portable identity |
| `AGENTS.md` | Startup router: select one boss and stop reading other boss playbooks |
| `docs/bosses/<boss>/INDEX.md` | Authoritative mission, armory, phases, and handoffs for the selected boss |
| `skills/` | Auto-discovered skills (`SKILL.md` per folder) |
| `agents/*.md` | Specialist prompts when the host supports subagents |
| `commands/*.md` | Slash or manual playbooks |

## Delivery

Treat non-trivial repo changes as an orchestrate loop:

1. Read `AGENTS.md`, select one domain boss, then read only its nested playbook
2. Set capability mode (pinned / partial / fallback) without blocking  
3. Implement (lanes if exposed, else primary)  
4. Primary verifies real diff + commands  
5. Review → **ship | fix-first | rethink**  

## Env

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/mandala/packages/fractal-agentic
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
```

Optional hooks (if the host can run PreToolUse/Stop scripts): see `hooks/README.md`.
