---
title: "Armory"
description: "Find the skills, agents, commands, and scripts that bosses can use. Live inventories stay beside the assets they index."
type: guide
---

# Armory

The armory is the set of reusable capabilities a boss can pull into a delivery: skills explain how to do a class of work, agents provide specialist perspectives, commands expose repeatable playbooks, and scripts handle installation or verification.

## Browse the armory

| Surface | Guide | Live inventory |
| --- | --- | --- |
| Skills | [Skills guide](./skills.md) | [`skills/INDEX.md`](../../skills/INDEX.md) · [Browse skills](/skills) |
| Agents | [Agents guide](./agents.md) | [`agents/INDEX.md`](../../agents/INDEX.md) · [Browse agents](/agents) |
| Commands | [Commands guide](./commands.md) | [`commands/INDEX.md`](../../commands/INDEX.md) · [Browse commands](/commands) |

The guide pages explain how each surface works. The `INDEX.md` files beside the assets are the canonical inventories, and the website publishes them as separate catalogs. This docs path intentionally links to those catalogs instead of copying their contents.

## How the pieces fit

```text
Boss mission
    │
    ├── skills     instructions and references for a class of work
    ├── agents     specialists, reviewers, and optional capability pins
    ├── commands   user-facing playbooks such as /orchestrate
    └── scripts    install, resolve, verify, and policy checks
```

The [startup router](../../AGENTS.md) selects a domain, and that domain's nested
[boss playbook](../bosses/INDEX.md) connects it to the armory. When a capability is
added or removed, update the live inventory and the owning boss playbook; do not
maintain a second full list in this guide.

## Package layout

```text
plugin/
  SOUL.md / AGENTS.md
  docs/bosses/<boss>/INDEX.md  authoritative selected-boss playbook
  docs/                  dual guides and policy
  skills/<id>/SKILL.md   vendored skill packages
  agents/<id>.md         specialist prompts
  commands/<name>.md     slash-command playbooks
  scripts/               install, resolve, verify, and policy tools
  hooks/                 optional session automation
  workflows/             optional review contracts
```

Skills are vendored into the plugin, so an install does not depend on runtime symlinks to another skill tree. Hooks and workflows are optional and never gate delivery.

## Shared and general pulls

Every boss may use the shared delivery layer:

- [`/orchestrate`](../../commands/orchestrate.md) with
  [`boss-orchestration`](../../skills/boss-orchestration/SKILL.md) — delivery runtime.
- [`/quality-gate`](../../commands/quality-gate.md),
  [`/security-scan`](../../commands/security-scan.md),
  [Code Reviewer](../../agents/code-reviewer.md), and
  [`/santa-loop`](../../commands/santa-loop.md) — shared release paths.
- [`llm-wiki`](../../skills/llm-wiki/SKILL.md) and
  [`/wiki-init`](../../commands/wiki-init.md) — optional continuous knowledge.
- [`/hooks-init`](../../commands/hooks-init.md),
  [`/review-fanout`](../../commands/review-fanout.md),
  [`/improve-init`](../../commands/improve-init.md), and
  [`/improve-status`](../../commands/improve-status.md) — optional systems that never
  gate delivery.

General utilities are not owned by a single boss:
[academic-research](../../skills/academic-research/SKILL.md),
[content-research-writer](../../skills/content-research-writer/SKILL.md),
[docs-writer](../../skills/docs-writer/SKILL.md),
[human-writing](../../skills/human-writing/SKILL.md),
[file-organizer](../../skills/file-organizer/SKILL.md), and
[visual-design](../../skills/visual-design/SKILL.md). Related content pulls include
[`deep-research`](../../skills/deep-research/SKILL.md),
[`article-writing`](../../skills/article-writing/SKILL.md),
[`content-engine`](../../skills/content-engine/SKILL.md),
[`brand-voice`](../../skills/brand-voice/SKILL.md), and
[`canvas-design`](../../skills/canvas-design/SKILL.md). The six named general-utility
skills are attributed to [ASI](https://github.com/plurigrid/asi) in `credits.json`.

All skills under `skills/` are local copies inside this package. They have no runtime
dependency on `agentic/skills`, `comparisionset`, `curated-curor`, or
`component-porter`; those names are historical import sources, not runtime paths.

## Read next

- New to the system: [Overview](../00-overview.md) → [Getting started](../01-getting-started.md)
- Ready to deliver: [Orchestration](../orchestration/INDEX.md)
- Looking for ownership: [Domain bosses](../bosses/INDEX.md)
- Editing package documentation: [Documentation ownership](../doc-ownership.md)
