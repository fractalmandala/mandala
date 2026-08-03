# Fractal Agentic repository bootstrap

## Local project configuration

- **Language:** TypeScript
- **Package manager:** pnpm
- **Add-ons:** prettier, eslint, sveltekit-adapter, mdsvex

## Required plugin startup

This checkout packages the agent process under [`plugin/`](./plugin/). For any
non-trivial repository task, read the [plugin startup router](./plugin/AGENTS.md)
before choosing a domain or delivery path. It points to the single authoritative boss
playbook and the runtime only when they are needed.

Project-local instructions closer to the changed files take precedence over plugin
process guidance. Do not copy plugin inventories or boss playbooks into this file.

Useful entrypoints: [boss selection](./plugin/docs/bosses/INDEX.md),
[orchestration runtime](./plugin/skills/boss-orchestration/SKILL.md), and the live
[skills](./plugin/skills/INDEX.md), [agents](./plugin/agents/INDEX.md), and
[commands](./plugin/commands/INDEX.md) inventories.
