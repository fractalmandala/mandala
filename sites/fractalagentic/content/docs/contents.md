## Contents

This is the indexed guide to Fractal Agentic. It explains what the plugin does, how to install it, how a delivery moves through the system, and where to go when you need a particular capability.

Read the guides in this order when you are new to the plugin:

1.  [Overview](https://fractal-agentic.vercel.app/docs/00-overview) — build the mental model.
2.  [Getting started](https://fractal-agentic.vercel.app/docs/01-getting-started) — install the plugin and run one delivery.
3.  [Install](https://fractal-agentic.vercel.app/docs/02-install) — choose a host or troubleshoot packaging details.
4.  [Auto-use mandate](https://fractal-agentic.vercel.app/docs/03-auto-use) — make the plugin available to every project session.
5.  [Domain bosses](https://fractal-agentic.vercel.app/docs/bosses) — choose one owner and read its authoritative playbook.
6.  [Orchestration](https://fractal-agentic.vercel.app/docs/orchestration) — understand capability lanes, verification, and review after selection.
7.  [Armory](https://fractal-agentic.vercel.app/docs/armory) — browse the skills, agents, and commands available to each boss.
8.  [Continuous wiki](https://fractal-agentic.vercel.app/docs/wiki) — add optional long-term project memory.

After that, use [Troubleshooting](https://fractal-agentic.vercel.app/docs/troubleshooting), the [Glossary](https://fractal-agentic.vercel.app/docs/glossary), and the reference guides as needed.

There are two kinds of index files in the package, and they serve different purposes.

### Human-facing Sections

These files live under `plugin/docs/`:

-   `docs/INDEX.md` is this guide and the root of the reading path.
-   `docs/bosses/INDEX.md`, `docs/orchestration/INDEX.md`, `docs/armory/INDEX.md`, and `docs/wiki/INDEX.md` introduce their sections.
-   The site publishes these hubs as `/docs/guide`, `/docs/bosses`, `/docs/orchestration`, `/docs/armory`, and `/docs/wiki`.

They are worth publishing because they explain how the pieces fit together. They are not inventories.

### Armory Inventories

These files live beside the assets they index:

-   [`skills/INDEX.md`](https://fractal-agentic.vercel.app/skills) → browse at `/skills`
-   [`agents/INDEX.md`](https://fractal-agentic.vercel.app/agents) → browse at `/agents`
-   [`commands/INDEX.md`](https://fractal-agentic.vercel.app/commands) → browse at `/commands`

They are the canonical lists of available assets. The website gives each inventory its own catalog route, so the docs sequence links to those routes instead of copying the lists into this guide. If an inventory and a narrative guide disagree, the live inventory wins; the owning nested boss playbook resolves domain mapping.

## Start Here

| If you want to… | Read |
| --- | --- |
| Understand the product shape | [Overview](https://fractal-agentic.vercel.app/docs/00-overview) |
| Install it on a host | [Install](https://fractal-agentic.vercel.app/docs/02-install) |
| Make a project load it automatically | [Auto-use mandate](https://fractal-agentic.vercel.app/docs/03-auto-use) |
| Run a feature, fix, or refactor through the delivery loop | [Runtime loop](https://fractal-agentic.vercel.app/docs/orchestration/runtime) |
| Decide which domain owns a task | [Domain bosses](https://fractal-agentic.vercel.app/docs/bosses) |
| Find a skill, agent, or command | [Armory](https://fractal-agentic.vercel.app/docs/armory) or the [live explorer](https://fractal-agentic.vercel.app/) |
| Add durable project knowledge | [Wiki setup](https://fractal-agentic.vercel.app/docs/wiki/setup) |
| Understand graceful failure | [Non-blocking policy](https://fractal-agentic.vercel.app/docs/progression) |

## Source of Truth

The package has a deliberate split:

| Asset | Role |
| --- | --- |
| [`SOUL.md`](https://fractal-agentic.vercel.app/docs/soul) | Portable identity and principles |
| [`AGENTS.md`](https://fractal-agentic.vercel.app/docs/agents) | Startup router: precedence, one-boss selection, stop-reading, and handoffs |
| `docs/bosses/<boss>/INDEX.md` | Authoritative mission, armory mapping, phases, verification, and handoffs for that boss |
| `plugin/docs/` | Dual guides and policy that ship with the plugin |
| `skills/`, `agents/`, `commands/` | Runtime assets and their live inventories |
| [`README.md`](https://fractal-agentic.vercel.app/docs/readme) | Package-level front door and install summary |

The [documentation ownership guide](https://fractal-agentic.vercel.app/docs/doc-ownership) explains which file to edit when the package changes. Put agent-required facts in `plugin/`, keep the router concise, keep each boss playbook self-contained, and let the site render the package rather than becoming a second source of truth.

## Optional Systems

The delivery kernel works without these additions:

-   [Hooks](https://fractal-agentic.vercel.app/docs/hooks) add host and project lifecycle automation.
-   [Self-improvement](https://fractal-agentic.vercel.app/docs/self-improvement) stores local observations and improvement proposals.
-   [Continuous wiki](https://fractal-agentic.vercel.app/docs/wiki) compounds project knowledge across sessions.
-   [Scheduled essays](https://fractal-agentic.vercel.app/docs/scheduled-essays) turn captured local knowledge into a validated post every 48 hours.

All four follow the same rule: they can improve a session, but they never gate product work. See [progression.md](https://fractal-agentic.vercel.app/docs/progression).