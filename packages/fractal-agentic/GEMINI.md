# Fractal Agentic — Gemini CLI shim

Load this project as a **plugin root** (directory containing `plugin.json`, `AGENTS.md`, `skills/`).

## Required reading order

1. [`SOUL.md`](./SOUL.md) — identity and non-blocking principles  
2. [`AGENTS.md`](./AGENTS.md) — startup router; select exactly one boss
3. The selected [`docs/bosses/<boss>/INDEX.md`](./docs/bosses/INDEX.md) — authoritative domain playbook
4. [`skills/boss-orchestration/SKILL.md`](./skills/boss-orchestration/SKILL.md) — only when delivering change sets

## Operating rules for this host

- Prefer **project-local** stack detection (Svelte / React / Vue / Rust / etc.) from manifests.
- Use **`/orchestrate` process** even when slash commands are not wired: select one
  boss → capability mode → implement → verify → ship|fix-first|rethink.
- Missing capability pins: implement in primary; report `pins: unverified`. Never refuse product work.
- Optional wiki: only if vault is configured; capture failures never fail delivery.

## Skills

Gemini CLI discovers skills under `skills/*/SKILL.md` when the project is on the skill path. Prefer description-driven activation; do not invent agent type names not present in the session.

## Related

- Install matrix: [`docs/02-install.md`](./docs/02-install.md)  
- Troubleshooting: [`docs/troubleshooting.md`](./docs/troubleshooting.md)  
