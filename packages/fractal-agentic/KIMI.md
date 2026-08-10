# Fractal Agentic — Kimi Code / Agent Skills shim

## What to load

| Surface | Path |
|---|---|
| Instructions | `AGENTS.md` (startup router), one selected `docs/bosses/<boss>/INDEX.md`, `SOUL.md` (identity) |
| Skills | `skills/*/SKILL.md` — native Agent Skills discovery when this directory is on the skill path |
| Commands | `commands/*.md` — adapt as prompts/macros if slash commands are unavailable |
| Agents | `agents/*.md` — specialist roles for manual or host subagent dispatch |

## Install notes

- Prefer pointing the host **project skills root** at this package directory, or copy selected skill folders into the host’s skills dir.
- Do not require vendor-specific plugin marketplaces for basic use: readable `AGENTS.md` + skills is enough.
- Capability pin TOML files under `agents/*.toml` are **optional** quality templates for hosts that support custom agents; install with `scripts/install-agents.sh` only when applicable.

## Delivery

Follow `AGENTS.md` → one boss playbook → `boss-orchestration`: non-blocking pins,
five-part contracts when delegating, primary verification, ship|fix-first|rethink review.

## Health

```sh
export FRACTAL_AGENTIC_ROOT=/absolute/path/to/mandala/packages/fractal-agentic
sh "$FRACTAL_AGENTIC_ROOT/scripts/resolve-plugin-root.sh"
sh "$FRACTAL_AGENTIC_ROOT/scripts/check-armory.sh"
```
