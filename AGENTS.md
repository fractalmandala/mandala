## Fractal Agentic plugin mandate (session bootstrap)

**On non-trivial tasks** (implementation, review, refactor, scaffold, multi-step plan),
**try** to detect the **Fractal Agentic** plugin and use its startup router +
orchestration guidance. Detection and pins are **best-effort** — they must **never** block the
user's project work.

**Project work always proceeds.** Missing plugin, missing `install-agents` files, or
missing spawn types → continue with `capability_mode: plugin_missing|degraded` and
`pins: unverified`. Never freeze for a "fresh task" or refuse to implement.
Policy: `<root>/docs/DEGRADATION.md` when the plugin is present.

### Detection (run first, soft)

1. If env `FRACTAL_AGENTIC_ROOT` is set and `$FRACTAL_AGENTIC_ROOT/plugin.json` exists, use that root.
   (If the env points at the monorepo checkout and `$FRACTAL_AGENTIC_ROOT/plugin/plugin.json`
   exists, use `$FRACTAL_AGENTIC_ROOT/plugin` instead.)
2. Otherwise search upward from the project / workspace root for the first directory that
   contains **all** of:
   - `plugin.json` with `"name": "fractal-agentic"` (or equivalent name field)
   - `AGENTS.md`
   - `docs/bosses/INDEX.md` and the seven `docs/bosses/<boss>/INDEX.md` playbooks
   - `skills/boss-orchestration/SKILL.md`
   - `commands/orchestrate.md`
3. In this repo, the plugin root is `packages/fractal-agentic/plugin` (canonical checkout).
   A personal copy also exists at `~/.agents/plugins/fractal-agentic`.
4. Optional shell probe (if the script is reachable):
   ```sh
   sh <FRACTAL_AGENTIC_ROOT>/scripts/resolve-plugin-root.sh
   ```
   Exit 0 + printed path ⇒ accessible. Non-zero ⇒ treat as missing.
5. **Accessible** means you can read `AGENTS.md`, `docs/bosses/INDEX.md`, the
   selected `docs/bosses/<boss>/INDEX.md`, and
   `skills/boss-orchestration/SKILL.md` from that root.
6. Prefer also reading `SOUL.md` when present (portable identity). Optional hooks under
   `hooks/` are **never** required for delivery.

If detection fails: state once *"Fractal Agentic not found; proceeding with project AGENTS only"*
and continue under this project's rules. Do not invent a fake plugin path. **Never refuse
the task** because the plugin is missing.

### When found — preferred use (non-blocking)

1. **Read** in progressive order:
   - `<root>/AGENTS.md` — startup router, precedence, trivial exemption, and one-boss selection
   - the selected `<root>/docs/bosses/<boss>/INDEX.md` — read exactly one in full; stop before loading other boss playbooks
   - `<root>/skills/boss-orchestration/SKILL.md` — only for non-trivial delivery and non-blocking preflight
   - `<root>/skills/boss-orchestration/references/capability-mode.md` — set mode once when runtime work needs it
   - `<root>/docs/DEGRADATION.md` — three layers (content / install / session)
2. **Set `capability_mode` once** (`pinned` | `pinned_partial` | `degraded` | `plugin_missing`)
   from the **session spawn catalog**, not from disk alone. Prefer any exposed
   `fractal_agentic_*` types; never require all three.
3. **Prefer** the plugin process:
   - Select exactly one domain boss via the router (Design / Code / Agent / Svelte /
     Creator / Workflow / Meta), then read only that nested playbook until a handoff.
   - For deliverables that change the repo: follow **boss-orchestration** contracts when
     practical (specs, verify evidence, ship|fix-first|rethink review).
   - Prefer plugin commands/skills when a mapped asset exists (`/orchestrate`,
     `/activate-boss-*`, `/quality-gate`, `/svelte-review`, …).
4. **Do not require** the user to tag `@fractal-agentic` after a successful detection.
5. **Stack defaults** from the router and selected boss playbook apply unless this
   project AGENTS.md overrides them.
6. **Project-local rules win** on conflicts for *this repo's* conventions; the plugin
   supplies process, armory, and delivery *guidance*.

### Capability pins (optional quality, never a gate)

If the host exposes custom agent types, **prefer**:

- `fractal_agentic_routine_implementer`
- `fractal_agentic_complex_implementer`
- `fractal_agentic_fresh_reviewer`

To improve pin quality later (user's choice, not a prerequisite for coding):

```sh
sh <root>/scripts/install-agents.sh
```

If types or templates are missing, **degrade immediately**:

1. Implement in the primary session and/or any available general / stack agents.
2. Review with domain agents (`svelte-reviewer`, `code-reviewer`, …) or structured
   primary self-review using ship|fix-first|rethink.
3. State once: *pins unverified* — then continue the user's work without asking them to
   open a new task first.

**Forbidden behaviors:** stopping the session, refusing implementation, or requiring
`install-agents.sh` / a fresh agent session/task before writing or reviewing project code.

### Trivial exemption

Single-sentence answers, pure explanation with no repo change, or "what is X?" questions
may skip orchestration entirely.

---

# Mandala monorepo

Monorepo for everything I work on - sites, apps, packages.

## Public Packages

**morphicons-svelte**
a porting of morphicons to svelte.
[![npm version](https://img.shields.io/npm/v/morphicons-svelte.svg)](https://www.npmjs.com/package/morphicons-svelte)

**svelte-animated-icon** and **@fractaldesign/svelte-icons**
thousands of iconsets animated in dozens of ways. a more than complete animated icons library for sveltekit.
[![npm version](https://img.shields.io/npm/v/svelte-animated-icon.svg)](https://www.npmjs.com/package/svelte-animated-icon)
[![npm version](https://img.shields.io/npm/v/@fractaldesign/svelte-icons.svg)](https://www.npmjs.com/package/@fractaldesign/svelte-icons)

**fractalsvelte**
an ongoing attempt to replicate shadcn-svelte but without tailwind dependencies. also a way to learn bits ui.
[![npm version](https://img.shields.io/npm/v/fractalsvelte.svg)](https://www.npmjs.com/package/fractalsvelte)

## Fractal Agentic

A must try package. The grand orchestration of 167 skills, 59 commands, 33 agents, 7 bosses all under 1 system that learns, grows, maintains a wiki and knows how to complete tasks well.
<a href="https://fractal-agentic.vercel.app/">Take a look!</a>

This is a constantly evolving monorepo. It is best to study any available AGENTS.md files inside the projects - `apps/` , `sites/` and `packages/` to get more information.  Some common monorepo features:

1. Sveltekit, Svelte 5, Tauri, and Typescript based stack.
2. Exclusive use of single-tab indented SASS styling (not SCSS, pure old SASS without braces or colons).

## Projects Registry

1. Apps
- Fractalengine - `apps/fractalengine` - new all-in-one app development. Current project.
- Fracta - `apps/fracta` - WIP notes app.
- Fractalknow - `apps/fractalknow` - experimental notes app.

2. Sites
- Fractaldesign - `sites/fractaldesign` - housed at [Fractaldesign](https://www.fractaldesign.in), a design and web dev blog and curation site.
- Fractalmandala - `sites/fractalmandala` - housed at [Fractalmandala](https://www.fractalmandala.in), my own blog and knowledge wiki.
- Fractaldharma - `sites/fractaldharma` - housed at [Fractaldharma](https://www.fractaldharma.in), a Sanskrit text corpus site.
- Fractalmem - `sites/fractalmem` - ongoing experimental work on a site and package for Sanskrit-based agent memory.

3. Packages
- Fractals Styler - `packages/fractals-styler` - a public npm package that scaffolds my prefered SASS styling and preset classes into any new project.
- Svelte Animated Icon - `packages/svelte-animated-icon` - a public npm package for using animated icons inside Sveltekit projects.
- Svelte Icons - `packages/svelte-icons` - combined library for various iconsets (private).
- Fractalsvelte - `packages/fractalsvelte` - WIP Sveltekit component library and its public site front-end.
- OKF Package - `packages/okfpackage` - WIP experiments with Google's open knowledge foundation.

## Learnings

If user asks to `capture this learning` or `document this error`, then create a new .md document in `docs/learnings` with following frontmatter:

```
---
title: //title the learning
description: //write a short grep-friendly description
category: learning
date: YYYY-MM-DD
---
```

And the use the `agent-self-evaluation` skill, write details of the mistake/error, what was learnt from it, and what not to do in the future.

Maintain an INDEX.md at the learnings folder with an up to date list of learnings, linked by relative path. 