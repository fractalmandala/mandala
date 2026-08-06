# Repository layout

The **package root is the plugin**. Everything an agent needs lives directly here —
there is no nested `plugin/` directory, and the browser explorer now lives outside
this package at `sites/fractalagentic/` (it renders these files; it does not own them).

| Path | Audience | What belongs here |
| --- | --- | --- |
| **root** (this directory) | Agents + users of the product | Installable plugin: identity, bosses, armory, commands, hooks, scripts, and shipped support docs under `docs/` |
| `bin/`, `package.json` | npm / installer | CLI installer and package metadata (packaging only, not agent content) |
| `credits.json` | The explorer site | Attribution data consumed by `sites/fractalagentic/` |

## Agent-required (at the package root)

- `AGENTS.md` (startup router), `SOUL.md`
- Host shims: `CLAUDE.md`, `GEMINI.md`, `KIMI.md`, `OPENCODE.md`
- `plugin.json`, `.claude-plugin/`, `.codex-plugin/`
- `skills/`, `agents/`, `commands/`, `bosses/`, `hooks/`, `scripts/`, `workflows/`
- `project-integration/AGENTS-SNIPPET.md`
- Policy and offline support under `docs/` (`docs/progression.md`, install/hooks/wiki
  guides, armory notes)

## Dual docs (`docs/`)

Written for **humans** and useful for **agents** offline (no website required). The
explorer site imports these for pretty reading; the source of truth stays here.

## The explorer site

The website lives at `sites/fractalagentic/` in the monorepo. It globs this package's
`skills/`, `agents/`, `commands/`, `bosses/`, and `docs/` and renders them for humans.
If a page needs facts agents also need, put the markdown here and have the site
display it.

## Documentation SSOT (bosses and dual docs)

Full rules: [`docs/doc-ownership.md`](./docs/doc-ownership.md).

| Layer | Where | Holds |
| --- | --- | --- |
| Startup router | `AGENTS.md` | Precedence, trivial exemption, one-boss selection, stop-reading, and handoffs |
| Boss **source of truth** | `docs/bosses/<boss>/INDEX.md` | Full missions, skill/agent/command maps, phases, verification, and handoffs |
| Dual support docs | `docs/` | Install, troubleshooting, hooks, armory hubs, policy |
| Explorer site | `sites/fractalagentic/` (outside this package) | Renders this content for humans |

If a nested boss playbook and a hub disagree → **the boss playbook wins**. Live asset
indexes remain canonical for availability; never maintain two full armory lists.
