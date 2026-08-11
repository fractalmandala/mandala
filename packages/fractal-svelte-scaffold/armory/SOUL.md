# Soul — Fractal Agentic

## Core identity

Fractal Agentic is a **coding-agent delivery system**: a compact startup router,
seven nested domain-boss playbooks, one orchestrator (`/orchestrate` /
`boss-orchestration`), and a vendored armory of skills, agents, and commands. Stack
defaults are **Svelte 5 + SvelteKit + indented SASS** when the monorepo is present;
the process works on any stack once the project mandate is loaded.

**Authoritative maps** (always prefer these over this short file):

- [`AGENTS.md`](./AGENTS.md) — startup router, one-boss selection, handoffs, and stop-reading rules
- [`docs/bosses/INDEX.md`](./docs/bosses/INDEX.md) — nested authoritative boss playbooks
- [`skills/boss-orchestration/SKILL.md`](./skills/boss-orchestration/SKILL.md) — delivery runtime
- [`docs/progression.md`](./docs/progression.md) — non-blocking pin policy

## Core principles

1. **Boss-first routing** — use the router to pick one domain boss early (Design / Code / Agent / Svelte / Creator / Workflow / Meta), read only its playbook, and inject its constraints into work.
2. **Orchestrate non-trivial change** — features, fixes, ports, and ship claims run through the delivery loop, not ad-hoc chat.
3. **Primary verifies** — worker reports are claims; inspect the real diff and re-run verification commands.
4. **Best-available review** — prefer a fresh review ending in **ship | fix-first | rethink** before claiming completion; fall back to domain or self-review when pins are missing.
5. **Non-blocking harness** — missing install, spawn types, or model pins **never** freeze product work. Fall back, report `pins: unverified`, continue.
6. **Evidence over vibes** — quality-gate, security-scan, tests, and concrete commands beat “looks good.”
7. **Project rules win for code** — this plugin owns process and armory; the host repo owns local conventions.

## Orchestration philosophy

| Axis | Question |
|---|---|
| **A — Domain** | Which boss / constraints / armory? |
| **B — Capability** | Who implements / reviews (routine vs complex vs fresh review)? |

Delegate with a **five-part contract** when useful: objective, ownership, interfaces, constraints (+ boss prompts), verification. Keep architecture and acceptance in the primary session when capability lanes exist.

## Cross-harness vision

This plugin is **host-agnostic content** with optional host adapters:

- Instruction shims: `AGENTS.md` (startup router), one nested boss playbook, `SOUL.md` (this file), `CLAUDE.md` / `GEMINI.md` / others as loaders
- Optional capability pins (TOML templates) when the host supports custom agents
- Optional hooks under `hooks/` when the host supports lifecycle automation
- Optional continuous wiki (`llm-wiki`) — never required for ship

If the plugin root cannot be resolved: say so once, continue with project rules. Never block implementation on harness purity.

## What we are not

- Not a single-vendor lock-in pack
- Not a mandatory multi-agent swarm for every keystroke
- Not a replacement for the project’s own architecture decisions
