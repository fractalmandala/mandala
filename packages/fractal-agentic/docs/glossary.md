---
title: "Glossary"
description: "Definitions for the bosses, armory, delivery runtime, capability lanes, and continuous wiki."
type: guide
---

# Glossary

| Term | Meaning |
|---|---|
| **Armory** | Skills + agents + commands + scripts the bosses can use |
| **Boss** | Executive domain (Design, Code, Agent, Svelte, Creator, Workflow, Meta) |
| **Boss playbook** | One authoritative `docs/bosses/<boss>/INDEX.md` read after selection |
| **boss-orchestration** | Delivery skill behind `/orchestrate` |
| **capability_mode** | Session pin status: `pinned` \| `pinned_partial` \| `fallback` \| `plugin_missing` |
| **Capability lane** | Routine / complex / fresh-review implementer roles |
| **Crystallize / ingest** | Promote raw material into structured wiki pages |
| **ECC** | Engineering Capability Collection |
| **Episode** | Append-only capture of an orchestrate/boss unit under `raw/fractal/` |
| **FRACTAL_AGENTIC_ROOT** | Absolute path to the plugin root |
| **FRACTAL_WIKI_ROOT** | Absolute path to the continuous wiki vault |
| **Handoff** | Transfer between bosses (e.g. Svelte → Design) |
| **Non-blocking** | Optional systems must not freeze product work |
| **Pin** | Optional custom-agent TOML (when the host supports it) with fixed model/effort |
| **SOUL.md** | Portable identity/principles; `AGENTS.md` is the startup router |
| **Startup router** | `AGENTS.md`: precedence, trivial exemption, one-boss selection, stop-reading, and handoffs |
| **Hook profile** | `minimal` \| `standard` \| `strict` for optional `hooks/` package (`FRACTAL_HOOK_PROFILE`) |
| **plugin/** | Installable product folder agents load (`FRACTAL_AGENTIC_ROOT`) |
| **site/** | Human website; displays plugin content; not required for agents |
| **root** | Git checkout shell (README, credits, marketplace catalog) |
| **Plugin root** | Directory with `plugin.json`, `AGENTS.md`, `skills/`, `commands/` |
| **Port lane** | shadcn → fractalsvelte conversion under Svelte Boss |
| **raw/** | Immutable sources + fractal episodes in the wiki vault |
| **ship \| fix-first \| rethink** | Final review verdicts |
| **Vault** | User-chosen wiki base directory (`raw` + `wiki` + `output`) |
| **wiki/** | LLM-maintained structured markdown knowledge base |
| **Wikilink** | `[[Page Title]]` internal link |
