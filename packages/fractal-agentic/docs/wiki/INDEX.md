---
title: "Continuous wiki"
description: "An optional local, file-first knowledge base that preserves sources and compounds useful project knowledge across sessions."
type: guide
---

# Continuous wiki

The continuous wiki is an optional local knowledge base for a project or a user. Raw sources stay in place, the agent extracts structured pages into `wiki/`, and later sessions can query those pages instead of reconstructing the same context from scratch.

It is shipped as the [`llm-wiki`](../../skills/llm-wiki/SKILL.md) skill and operated with `/wiki-*` commands. The vault lives outside the plugin by default, so different tools can share it when they can resolve the same path.

## Read this section in order

| Page | Use it when |
| --- | --- |
| [Setup](./setup.md) | You want to create a vault and point tools at it |
| [Operations](./operations.md) | You want to capture, ingest, query, or lint knowledge |
| [Schema and frontmatter](./schema.md) | You are authoring or validating wiki pages |

The full implementation references ship with the plugin at `skills/llm-wiki/references/wiki-schema.md` and `skills/llm-wiki/references/config.md`.

## How knowledge moves

```text
Sources and notes → raw/ → /wiki-ingest → wiki/sources, entities, concepts
                                      │
                                      ▼
                              /wiki-query
                                      │
                                      ▼
                         optional durable synthesis
```

When configured, `/orchestrate` can append a delivery episode under `raw/fractal/`. That capture is best-effort; it does not automatically rewrite the structured wiki.

## Why keep raw sources

The raw layer preserves provenance. Ingest can update or replace structured pages while the original note, clip, PDF, or episode remains available for review. This makes contradictions easier to track and lets the wiki evolve without losing the source material.

## Ownership and boundaries

- **Agent Boss** owns product memory architecture and the integration with delivery.
- **Workflow Boss** owns personal knowledge habits and local user setup.
- The wiki is optional and local-first.
- A missing vault, failed write, or skipped capture never stops product delivery; see [the non-blocking policy](../progression.md).

Next: [Set up a vault](./setup.md).
