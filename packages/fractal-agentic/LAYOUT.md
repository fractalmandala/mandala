# Repository layout

Nothing agents need lives outside **`plugin/`**.

| Folder | Audience | What belongs here |
| --- | --- | --- |
| **`plugin/`** | Agents + users of the product | Installable package: identity, bosses, armory, commands, hooks, scripts, and shipped support docs under `plugin/docs/` |
| **`site/`** | Humans in a browser | Website/explorer. **Renders** files from `plugin/`; does not own agent source of truth |
| **root** (this directory) | Contributors / git clone | Front-door `README.md` (mirrors `plugin/README.md` with root-relative links), this file, `credits.json`, marketplace catalog (`.agents/plugins/`) |

## Agent-required (always inside `plugin/`)

- `AGENTS.md`, `SOUL.md`
- Host shims: `CLAUDE.md`, `GEMINI.md`, `KIMI.md`, `OPENCODE.md`
- `skills/`, `agents/`, `commands/`, `hooks/`, `scripts/`, `workflows/`
- `project-integration/AGENTS-SNIPPET.md`
- Policy and offline support: `docs/DEGRADATION.md`, `docs/troubleshooting.md`, install/hooks/wiki guides, armory notes

## Dual docs (`plugin/docs/`)

Written for **humans** and useful for **agents** offline (no website required).  
The site imports these for pretty reading. Source of truth remains under `plugin/`.

## Site-only

Marketing UI, chrome, credits pages, explorer UX. If a page needs facts agents also need, put the markdown in `plugin/` and have the site display it.

## Root-only

- `README.md` — how this repo is organized; where to install from
- `credits.json` — attribution for the explorer
- `.agents/plugins/marketplace.json` — catalog that points at `./plugin`

Do **not** put `AGENTS.md` / `SOUL.md` only at root.

## Documentation SSOT (bosses and dual docs)

Full rules: [`plugin/docs/doc-ownership.md`](./plugin/docs/doc-ownership.md).

| Layer | Where | Holds |
| --- | --- | --- |
| Startup router | `plugin/AGENTS.md` | Precedence, trivial exemption, one-boss selection, stop-reading, and handoffs |
| Boss **source of truth** | `plugin/docs/bosses/<boss>/INDEX.md` | Full missions, skill/agent/command maps, phases, verification, and handoffs |
| Dual support docs | `plugin/docs/` | Install, troubleshooting, hooks, armory hubs, policy |
| Website | `site/` | Renders `plugin/` content for humans |

If a nested boss playbook and a hub disagree → **the boss playbook wins**. Live asset
indexes remain canonical for availability; never maintain two full armory lists.
